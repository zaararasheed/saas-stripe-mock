import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

/**
 * Create subscription and safely extract client_secret if available.
 */
export async function createSubscription(
    customerId: string,
    priceId: string
): Promise<{ subscription: Stripe.Subscription; clientSecret?: string | null }> {
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
    });

    let clientSecret: string | null | undefined = null;
    const latestInvoice = subscription.latest_invoice; // string | Stripe.Invoice | null

    // Normalize logic: if latestInvoice is an object -> try to get payment_intent.
    if (latestInvoice && typeof latestInvoice !== "string") {
        // The types in this Stripe version may not declare payment_intent on Invoice.
        // Use a safe runtime access + narrowing:
        const maybePI = (latestInvoice as any)?.payment_intent; // unknown

        if (maybePI && typeof maybePI !== "string") {
            // payment_intent is an object
            clientSecret = (maybePI as Stripe.PaymentIntent).client_secret ?? null;
        } else if (typeof maybePI === "string") {
            // payment_intent is an id string -> retrieve it
            try {
                const pi = await stripe.paymentIntents.retrieve(maybePI);
                clientSecret = (pi as Stripe.PaymentIntent).client_secret ?? null;
            } catch (err) {
                console.error("Failed to retrieve PaymentIntent by id:", err);
                clientSecret = null;
            }
        } else {
            clientSecret = null;
        }
    } else if (typeof latestInvoice === "string") {
        // latestInvoice is an invoice id -> fetch invoice expanded
        try {
            const invoice = await stripe.invoices.retrieve(latestInvoice, { expand: ["payment_intent"] });
            const pi = (invoice as any)?.payment_intent;
            if (pi && typeof pi !== "string") {
                clientSecret = (pi as Stripe.PaymentIntent).client_secret ?? null;
            } else if (typeof pi === "string") {
                const realPI = await stripe.paymentIntents.retrieve(pi);
                clientSecret = (realPI as Stripe.PaymentIntent).client_secret ?? null;
            } else {
                clientSecret = null;
            }
        } catch (err) {
            console.error("Failed to retrieve invoice by id:", err);
            clientSecret = null;
        }
    } else {
        clientSecret = null;
    }

    return { subscription, clientSecret };
}

export default stripe;
