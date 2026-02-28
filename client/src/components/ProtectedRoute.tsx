import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthProvider";
import type { ReactNode } from "react";

type Props = {
    children?: ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({ children }: Props) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
