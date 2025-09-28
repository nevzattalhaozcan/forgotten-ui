import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../lib/auth";

const NavBar: React.FC = () => {
    const nav = useNavigate();
    const [authed, setAuthed] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        const onStorage = () => setAuthed(!!localStorage.getItem("token"));
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const linkStyle: React.CSSProperties = { marginRight: 12 };
    const active: React.CSSProperties = { textDecoration: "underline" };

    return (
        <nav style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
            <Link to="/" style={{ fontWeight: 700 }}>BookClub</Link>
            <NavLink to="/" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>Home</NavLink>
            <NavLink to="/discover" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>Discover</NavLink>
            <NavLink to="/user" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>User</NavLink>
            <NavLink to="/club" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>Club</NavLink>

            <div style={{ marginLeft: "auto" }}>
                {!authed ? (
                    <NavLink to="/login" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>
                        Login
                    </NavLink>
                ) : (
                    <button
                        className="btn"
                        onClick={() => {
                            logout();
                            setAuthed(false);
                            nav("/login");
                        }}
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
