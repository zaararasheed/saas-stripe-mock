import React from "react";
import { useAuth } from "../firebase/AuthProvider";

type Props = {
    children: React.ReactNode;
};

const ProFeature: React.FC<Props> = ({ children }) => {
    const { plan } = useAuth();

    if (plan !== "pro") {
        return (
            <div style={{
                background: "#f8d7da",
                padding: "15px",
                marginTop: "15px"
            }}>
                This feature is available for Pro users only.
            </div>
        );
    }

    return <>{children}</>;
};

export default ProFeature;