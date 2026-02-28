import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { auth, db } from "./firebase-config";

import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";

import { doc, onSnapshot } from "firebase/firestore";

type AuthContextType = {
    user: any | null;
    loading: boolean;
    subscribed: boolean;
    plan: string;
    subscriptionStatus: string;
    cancelAtPeriodEnd: boolean;
    graceUntil: Date | null;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribed, setSubscribed] = useState(false);
    const [plan, setPlan] = useState("free");
    const [subscriptionStatus, setSubscriptionStatus] = useState("none");
    const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
    const [graceUntil, setGraceUntil] = useState<Date | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setSubscribed(false);
                setPlan("free");
                setSubscriptionStatus("none");
                setCancelAtPeriodEnd(false);
                setGraceUntil(null);
                setLoading(false);
                return;
            }

            const userRef = doc(db, "users", currentUser.uid);

            const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();

                    const status = data.subscriptionStatus ?? "none";
                    const planValue = data.plan ?? "free";
                    const cancelValue = data.cancelAtPeriodEnd ?? false;

                    const grace = data.graceUntil?.toDate
                        ? data.graceUntil.toDate()
                        : null;

                    const now = new Date();
                    const hasGrace = grace && now < grace;

                    const hasAccess =
                        status === "active" ||
                        status === "trialing" ||
                        hasGrace;

                    setSubscribed(hasAccess);
                    setPlan(planValue);
                    setSubscriptionStatus(status);
                    setCancelAtPeriodEnd(cancelValue);
                    setGraceUntil(grace);
                } else {
                    setSubscribed(false);
                    setPlan("free");
                    setSubscriptionStatus("none");
                    setCancelAtPeriodEnd(false);
                    setGraceUntil(null);
                }

                setLoading(false);
            });

            return () => unsubscribeSnapshot();
        });

        return () => unsubscribeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                subscribed,
                plan,
                subscriptionStatus,
                cancelAtPeriodEnd,
                graceUntil,
                login,
                loginWithGoogle,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};