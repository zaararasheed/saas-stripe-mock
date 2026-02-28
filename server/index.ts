import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

/* =======================================
   FIREBASE ADMIN (BUN SAFE)
======================================= */


admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
});

const db = admin.firestore();

/* =======================================
   WEBHOOK
======================================= */

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const signature = req.headers["stripe-signature"] as string;

        let event: Stripe.Event;

        try {
            event = await stripe.webhooks.constructEventAsync(
                req.body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET as string
            );
        } catch (err) {
            console.log("Webhook signature verification failed");
            return res.status(400).send("Webhook Error");
        }

        console.log("Event received:", event.type);

        try {
            let subscriptionId: string | null = null;
            let userId: string | null = null;

            // 1️⃣ Checkout completed
            if (event.type === "checkout.session.completed") {
                const session = event.data.object as any;
                subscriptionId = session.subscription ?? null;
                userId = session.metadata?.userId ?? null;
            }

            // 2️⃣ Invoice paid
            if (event.type === "invoice.paid") {
                const invoice = event.data.object as any;
                subscriptionId = invoice.subscription ?? null;
            }

            // 3️⃣ Subscription updated/deleted
            if (
                event.type === "customer.subscription.updated" ||
                event.type === "customer.subscription.deleted"
            ) {
                const subscription = event.data.object as any;
                subscriptionId = subscription.id ?? null;
            }

            if (!subscriptionId) {
                return res.json({ received: true });
            }

            // Always retrieve full subscription
            const subscription = (await stripe.subscriptions.retrieve(
                subscriptionId
            )) as any;

            // If userId not from metadata → find via stripeCustomerId
            if (!userId) {
                const snapshot = await db
                    .collection("users")
                    .where("stripeCustomerId", "==", subscription.customer)
                    .get();

                if (!snapshot.empty) {
                    userId = snapshot.docs[0].id;
                }
            }

            if (!userId) {
                console.log("User not found for subscription");
                return res.json({ received: true });
            }

            const priceId = subscription.items?.data?.[0]?.price?.id ?? null;

            let plan = "free";

            if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
                plan = "basic";
            }

            if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
                plan = "pro";
            }

            await db.collection("users").doc(userId).update({
                stripeSubscriptionId: subscription.id ?? null,
                stripeCustomerId: subscription.customer ?? null,
                subscribed: subscription.status === "active",
                subscriptionStatus: subscription.status ?? null,
                cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
                plan: plan,
                currentPeriodEnd: subscription.current_period_end ?? null,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log("User updated to:", plan);
        } catch (error) {
            console.log("Webhook processing error:", error);
        }

        res.json({ received: true });
    }
);

/* =======================================
   JSON PARSER
======================================= */

app.use(express.json());

app.get("/pro-analytics", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.split("Bearer ")[1];

        const decoded = await admin.auth().verifyIdToken(token);
        const userId = decoded.uid;

        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();

        if (!userData?.subscribed || userData?.plan !== "pro") {
            return res.status(403).json({ error: "Pro plan required" });
        }

        // Fake analytics data
        res.json({
            message: "Welcome to Pro Analytics!",
            metrics: {
                revenue: "$12,540",
                growth: "18%",
            },
        });
    } catch (error) {
        console.log("Pro analytics error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

/* =======================================
   CREATE CHECKOUT
======================================= */

app.post("/create-checkout-session", async (req, res) => {
    try {
        const { userId, priceId } = req.body;

        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        let customerId = userData?.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: userData?.email,
                metadata: { userId },
            });

            customerId = customer.id;

            await userDoc.ref.update({
                stripeCustomerId: customerId,
            });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            metadata: { userId },
            success_url: "http://localhost:5173/dashboard",
            cancel_url: "http://localhost:5173/subscription",
        });

        res.json({ url: session.url });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/cancel-subscription", async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }

        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const subscriptionId = userDoc.data()?.stripeSubscriptionId;

        if (!subscriptionId) {
            return res.status(400).json({ error: "No active subscription" });
        }

        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        res.json({ success: true });
    } catch (error: any) {
        console.log("Cancel error:", error);
        res.status(500).json({ error: "Cancel failed" });
    }
});

app.post("/change-plan", async (req, res) => {
    try {
        const { userId, newPriceId } = req.body;

        if (!userId || !newPriceId) {
            return res.status(400).json({ error: "Missing data" });
        }

        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const subscriptionId = userDoc.data()?.stripeSubscriptionId;

        if (!subscriptionId) {
            return res.status(400).json({ error: "No active subscription" });
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const itemId = subscription.items.data[0].id;

        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false,
            items: [
                {
                    id: itemId,
                    price: newPriceId,
                },
            ],
        });

        res.json({ success: true });
    } catch (error: any) {
        console.log("Change plan error:", error);
        res.status(500).json({ error: error.message });
    }
});

/* =======================================
   SERVER START
======================================= */

const PORT: number = Number(process.env.PORT) || 3000;

function startServer(): void {
    console.log("Backend running on port " + PORT);
}

app.listen(PORT, startServer);
