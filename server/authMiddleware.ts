import type { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
    };
}

export const verifyFirebaseToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split("Bearer ")[1];

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = { uid: decoded.uid };
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
};

export const requireProPlan = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const uid = req.user?.uid;

    if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
        return res.status(403).json({ error: "User not found" });
    }

    const data = userDoc.data();

    if (data?.plan !== "pro") {
        return res.status(403).json({ error: "Pro plan required" });
    }

    next();
};