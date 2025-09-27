import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/common/Navbar";

const RootLayout: React.FC = () => {
    return (
        <div>
            <NavBar />
            <main style={{ padding: 16 }}>
                <Outlet />
            </main>
        </div>
    );
};

export default RootLayout;