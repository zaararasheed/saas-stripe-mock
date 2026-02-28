import React, { useEffect, useState } from "react";
import { useAuth } from "../firebase/AuthProvider";
import { getAuth } from "firebase/auth";

const AnimatedNumber = ({ value, prefix = "", suffix = "" }: any) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 800;
        const increment = value / (duration / 16);

        const counter = setInterval(() => {
            start += increment;
            if (start >= value) {
                setDisplay(value);
                clearInterval(counter);
            } else {
                setDisplay(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(counter);
    }, [value]);

    return (
        <span>
            {prefix}
            {display.toLocaleString()}
            {suffix}
        </span>
    );
};

const SkeletonCard = () => (
    <div className="card stat-card skeleton" />
);

const Dashboard = () => {
    const { plan, user, subscribed, loading } = useAuth();

    const [analytics, setAnalytics] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(false);

    const isPro = plan === "pro" && subscribed === true;

    useEffect(() => {
        if (loading) return;

        const fetchProData = async () => {
            if (!isPro) {
                setAnalytics(null);
                setError("Upgrade to Pro to unlock advanced analytics.");
                return;
            }

            try {
                setFetching(true);
                setError(null);

                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (!currentUser) return;

                const token = await currentUser.getIdToken(true);

                const res = await fetch("http://localhost:3000/pro-analytics", {
                    headers: { Authorization: "Bearer " + token },
                });

                if (!res.ok) throw new Error();

                const data = await res.json();
                setAnalytics(data);
            } catch {
                setAnalytics(null);
                setError("Unable to load analytics.");
            } finally {
                setFetching(false);
            }
        };

        fetchProData();
    }, [isPro, loading]);

    return (
        <div className="page">
            <div className="card">
                <h1>Dashboard</h1>
                <p className="muted">Signed in as {user?.email}</p>
                <p>
                    Current Plan: <strong>{plan.toUpperCase()}</strong>
                </p>
            </div>

            <div className="stats">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        <div className="card stat-card hover-elevate">
                            <div className="stat-title">Total Revenue</div>
                            <div className="stat-value">
                                <AnimatedNumber value={8420} prefix="$" />
                            </div>
                            <div className="stat-delta">+12% this month</div>
                        </div>

                        <div className="card stat-card hover-elevate">
                            <div className="stat-title">Active Users</div>
                            <div className="stat-value">
                                <AnimatedNumber value={1204} />
                            </div>
                            <div className="stat-delta">+4.2%</div>
                        </div>

                        <div className="card stat-card hover-elevate">
                            <div className="stat-title">Conversion Rate</div>
                            <div className="stat-value">
                                <AnimatedNumber value={5} suffix="%" />
                            </div>
                            <div className="stat-delta">Stable</div>
                        </div>
                    </>
                )}
            </div>

            <div className="card">
                <h2>Pro Analytics</h2>

                {loading && <p className="muted">Checking subscription...</p>}
                {fetching && <p className="muted">Loading analytics...</p>}

                {analytics && (
                    <div className="card" style={{ marginTop: "16px" }}>
                        <p>{analytics.message}</p>
                        <p>Revenue: {analytics.metrics.revenue}</p>
                        <p>Growth: {analytics.metrics.growth}</p>
                    </div>
                )}

                {!analytics && error && !loading && (
                    <div className="card" style={{ marginTop: "16px" }}>
                        <p className="muted">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;