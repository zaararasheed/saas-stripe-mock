import React from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import type { ReactNode } from "react";

type Props = {
    children?: ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
    return (
        <div className="app-root">
            <Sidebar />
            <div className="main-column">
                <Header />
                <div className="main-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;