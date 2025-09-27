import React from "react";
import { Link, NavLink } from "react-router-dom";

const NavBar: React.FC = () => {
    const linkStyle: React.CSSProperties = { marginRight: 12 };
    const active: React.CSSProperties = { textDecoration: "underline" };

    return (
        <nav style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
            <Link to="/" style={{ fontWeight: 700 }}>BookClub</Link>
            <NavLink to="/" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>Home</NavLink>
            <NavLink to="/discover" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>Discover</NavLink>
            <NavLink to="/user" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>User</NavLink>
            <NavLink to="/club" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? active : {}) })}>Club</NavLink>
        </nav>
    );
};

export default NavBar;