import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthProvider";
import type { ReactNode } from "react";

export default function PublicRoute({
                                        children,
                                    }: {
    children: ReactNode;
}) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    // If user is already logged in → redirect to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}