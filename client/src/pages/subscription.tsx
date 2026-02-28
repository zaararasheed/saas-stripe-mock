import React, { useState } from "react";
import { useAuth } from "../firebase/AuthProvider";

const SERVER_BASE = "http://localhost:3000";

type Plan = {
    id: string;
    name: string;
    priceLabel: string;
    key: string;
    popular?: boolean;
};

const PLANS: Plan[] = [
    {
        id: "price_1T3B7uGRYnCazCQ7XeprsLUv",
        name: "Basic",
        priceLabel: "$9 / month",
        key: "basic",
    },
    {
        id: "price_1T4BLoGRYnCazCQ7GIIUNv45",
        name: "Pro",
        priceLabel: "$29 / month",
        key: "pro",
        popular: true,
    },
];

const Subscription: React.FC = () => {
    const { user, subscribed, plan, cancelAtPeriodEnd } = useAuth();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    const handleSelectPlan = async (priceId: string) => {
        if (!user) return;

        setLoadingId(priceId);
        setMessage("");

        try {
            const response = await fetch(
                subscribed
                    ? SERVER_BASE + "/change-plan"
                    : SERVER_BASE + "/create-checkout-session",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(
                        subscribed
                            ? { userId: user.uid, newPriceId: priceId }
                            : { userId: user.uid, priceId }
                    ),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Action failed");
            }

            if (!subscribed) {
                window.location.href = data.url;
            } else {
                setMessage("Plan updated successfully.");
            }
        } catch {
            setMessage("Something went wrong.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleCancel = async () => {
        if (!user) return;

        setMessage("");

        try {
            const response = await fetch(SERVER_BASE + "/cancel-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.uid }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Cancel failed");
            }

            setMessage("Subscription will cancel at the end of billing period.");
        } catch {
            setMessage("Cancel failed.");
        }
    };

    return (
        <div className="page">
            <div className="card">
                <h1>Subscription Plans</h1>
                <p className="muted">
                    Current Plan: <strong>{plan.toUpperCase()}</strong>
                </p>

                {cancelAtPeriodEnd && (
                    <p style={{ color: "orange" }}>
                        Your subscription will end at the end of the billing period.
                    </p>
                )}

                <div className="plans-grid">
                    {PLANS.map((p) => {
                        const isCurrent = plan === p.key;

                        return (
                            <div
                                key={p.id}
                                className={`card plan-card ${
                                    isCurrent ? "current-plan" : ""
                                }`}
                            >
                                <div className="plan-top">
                                    <div>
                                        <div className="plan-name">{p.name}</div>
                                        <div className="plan-price">{p.priceLabel}</div>
                                    </div>

                                    {p.popular && (
                                        <span className="badge badge-pro">
                                            Most Popular
                                        </span>
                                    )}
                                </div>

                                <button
                                    className="btn primary"
                                    onClick={() => handleSelectPlan(p.id)}
                                    disabled={
                                        loadingId !== null ||
                                        isCurrent ||
                                        cancelAtPeriodEnd
                                    }
                                >
                                    {loadingId === p.id
                                        ? "Processing..."
                                        : isCurrent
                                            ? "Current Plan"
                                            : "Select"}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {subscribed && !cancelAtPeriodEnd && (
                    <button
                        className="btn danger"
                        style={{ marginTop: "20px" }}
                        onClick={handleCancel}
                    >
                        Cancel Subscription
                    </button>
                )}

                {message && (
                    <div className="message-card">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subscription;