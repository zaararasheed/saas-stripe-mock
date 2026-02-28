import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../firebase/AuthProvider";

const Header: React.FC = () => {
    const { user, logout, plan } = useAuth();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const planLabel =
        plan === "pro" ? "PRO" :
            plan === "basic" ? "BASIC" :
                "FREE";

    const planClass =
        plan === "pro" ? "badge badge-pro" :
            plan === "basic" ? "badge badge-basic" :
                "badge badge-free";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="header">
            <h2 className="header-title">Dashboard</h2>

            {user && (
                <div className="header-user" ref={dropdownRef}>
                    <span className={planClass}>{planLabel}</span>

                    <div
                        className="user-toggle"
                        onClick={() => setOpen(!open)}
                    >
                        {user.email}
                    </div>

                    {open && (
                        <div className="dropdown">
                            <button onClick={logout}>
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