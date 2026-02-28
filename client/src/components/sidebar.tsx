import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="logo">⚡</div>
                <div>
                    <div className="brand-title">SaaS Mock</div>
                    <div className="brand-sub">Stripe-powered</div>
                </div>
            </div>

            <nav className="nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/subscription"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Subscription
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <small>© {new Date().getFullYear()} Zaara</small>
            </div>
        </aside>
    );
};

export default Sidebar;