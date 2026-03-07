"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Activity, Users, BarChart3, FileText, Lock, Menu, X, Zap } from "lucide-react";

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/intelligence", label: "Intelligence", icon: BarChart3 },
    { href: "/users", label: "Users", icon: Users },
    { href: "/report", label: "Report", icon: FileText },
];

export function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    const isLanding = pathname === "/";

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || !isLanding
                    ? "bg-bg/80 backdrop-blur-xl border-b border-border"
                    : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:border-accent/60 transition-all duration-300">
                                <Shield className="w-4 h-4 text-accent" />
                            </div>
                            <div className="absolute inset-0 rounded-lg bg-accent/20 filter blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <span className="font-bold text-lg tracking-wider">
                            <span className="text-white">Shadow</span>
                            <span className="text-accent">Mind</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ href, label, icon: Icon }) => {
                            const active = pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
                                            ? "text-accent bg-accent/10 border border-accent/20"
                                            : "text-text-muted hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right section */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
                            <span>LIVE</span>
                        </div>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 btn-primary text-xs"
                        >
                            <Lock className="w-3 h-3" />
                            Secure Login
                        </Link>
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden text-text-muted hover:text-white transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-panel border-t border-border"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {navLinks.map(({ href, label, icon: Icon }) => {
                                const active = pathname.startsWith(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
                                                ? "text-accent bg-accent/10"
                                                : "text-text-muted hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </Link>
                                );
                            })}
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 btn-primary w-full justify-center mt-2"
                            >
                                <Lock className="w-3 h-3" />
                                Secure Login
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
