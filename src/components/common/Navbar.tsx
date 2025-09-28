import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../lib/auth";

const NavBar: React.FC = () => {
    const nav = useNavigate();
    const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onStorage = () => setAuthed(!!localStorage.getItem("token"));
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (isMobileMenuOpen && !target.closest('nav')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Close mobile menu when route changes
    const handleNavClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="flex items-center space-x-2 font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                    >
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                        </svg>
                        <span>BookClub</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => 
                                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive 
                                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink 
                            to="/discover" 
                            className={({ isActive }) => 
                                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive 
                                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`
                            }
                        >
                            Discover
                        </NavLink>
                        {authed && (
                            <>
                                <NavLink 
                                    to="/user" 
                                    className={({ isActive }) => 
                                        `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            isActive 
                                                ? "bg-blue-50 text-blue-700 shadow-sm" 
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        }`
                                    }
                                >
                                    Profile
                                </NavLink>
                                <NavLink 
                                    to="/my-clubs" 
                                    className={({ isActive }) => 
                                        `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            isActive 
                                                ? "bg-blue-50 text-blue-700 shadow-sm" 
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        }`
                                    }
                                >
                                    My Clubs
                                </NavLink>
                            </>
                        )}
                    </div>

                    {/* Auth Section - Desktop */}
                    <div className="hidden md:flex items-center space-x-3">
                        {!authed ? (
                            <div className="flex items-center space-x-2">
                                <NavLink 
                                    to="/login" 
                                    className="btn-ghost btn-sm"
                                >
                                    Sign In
                                </NavLink>
                                <NavLink 
                                    to="/register" 
                                    className="btn btn-sm"
                                >
                                    Join Now
                                </NavLink>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                {/* Notifications */}
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </button>

                                {/* User Menu */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                                        U
                                    </div>
                                    <button
                                        className="btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            logout();
                                            setAuthed(false);
                                            nav("/login");
                                        }}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-200"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-sm">
                        <div className="px-4 py-3 space-y-1">
                            {/* Navigation Links */}
                            <NavLink 
                                to="/" 
                                onClick={handleNavClick}
                                className={({ isActive }) => 
                                    `block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                                        isActive 
                                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`
                                }
                            >
                                Home
                            </NavLink>
                            <NavLink 
                                to="/discover" 
                                onClick={handleNavClick}
                                className={({ isActive }) => 
                                    `block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                                        isActive 
                                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`
                                }
                            >
                                Discover
                            </NavLink>
                            {authed && (
                                <>
                                    <NavLink 
                                        to="/user" 
                                        onClick={handleNavClick}
                                        className={({ isActive }) => 
                                            `block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                                                isActive 
                                                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`
                                        }
                                    >
                                        Profile
                                    </NavLink>
                                    <NavLink 
                                        to="/my-clubs" 
                                        onClick={handleNavClick}
                                        className={({ isActive }) => 
                                            `block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                                                isActive 
                                                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`
                                        }
                                    >
                                        My Clubs
                                    </NavLink>
                                </>
                            )}
                            
                            {/* Auth Section - Mobile */}
                            <div className="pt-3 border-t border-slate-200/60 mt-3">
                                {!authed ? (
                                    <div className="space-y-2">
                                        <NavLink 
                                            to="/login" 
                                            onClick={handleNavClick}
                                            className="block w-full text-center btn-ghost"
                                        >
                                            Sign In
                                        </NavLink>
                                        <NavLink 
                                            to="/register" 
                                            onClick={handleNavClick}
                                            className="block w-full text-center btn"
                                        >
                                            Join Now
                                        </NavLink>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* User Info */}
                                        <div className="flex items-center space-x-3 px-4 py-2 bg-slate-50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                                                U
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    User Profile
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Member
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="space-y-2">
                                            <button className="w-full text-center p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all duration-200 flex items-center justify-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                                Notifications
                                            </button>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setAuthed(false);
                                                    setIsMobileMenuOpen(false);
                                                    nav("/login");
                                                }}
                                                className="w-full text-center p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center justify-center font-medium"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
