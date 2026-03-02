import React, { useState } from "react";
import { useAuth } from "../firebase/AuthProvider";

const Header: React.FC = () => {
    const { user, logout, plan } = useAuth();
    const [open, setOpen] = useState(false);

    const planLabel =
        plan === "pro"
            ? "PRO"
            : plan === "basic"
                ? "BASIC"
                : "FREE";

    const planClass =
        plan === "pro"
            ? "badge badge-pro"
            : plan === "basic"
                ? "badge badge-basic"
                : "badge badge-free";

    return (
        <header className="header">
            <h2 className="header-title">Dashboard</h2>

            {user && (
                <div className="header-user">
                    <span className={planClass}>{planLabel}</span>

                    <div
                        className="user-toggle"
                        onClick={() => setOpen((prev) => !prev)}
                    >
                        {user.email}
                    </div>

                    {open && (
                        <div className="dropdown">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    await logout();
                                    setOpen(false);
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;