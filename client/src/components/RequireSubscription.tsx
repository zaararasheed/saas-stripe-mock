import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthProvider";
import type { ReactNode } from "react";

type Props = {
    children?: ReactNode;
};

const RequireSubscription: React.FC<Props> = ({ children }) => {
    const { subscribed, loading } = useAuth();

    console.log(
        "RequireSubscription → subscribed:",
        subscribed,
        "loading:",
        loading
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!subscribed) {
        return <Navigate to="/subscription" replace />;
    }

    return <>{children}</>;
};

export default RequireSubscription;