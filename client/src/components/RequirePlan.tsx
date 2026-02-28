import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthProvider";

type Props = {
    children: React.ReactNode;
    requiredPlan: "basic" | "pro";
};

const RequirePlan: React.FC<Props> = ({ children, requiredPlan }) => {
    const { user, loading, plan } = useAuth();

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredPlan === "pro" && plan !== "pro") {
        return <Navigate to="/subscription" replace />;
    }

    return <>{children}</>;
};

export default RequirePlan;