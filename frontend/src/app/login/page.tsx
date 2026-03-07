"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<any>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const data = await login(username, password);
            setResult(data);
            if (data.status === "success") {
                setTimeout(() => router.push("/dashboard"), 1200);
            }
        } catch {
            setError("Could not reach the backend. Make sure the FastAPI server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 cyber-grid-bg opacity-40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/3 filter blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-2xl font-black">
                        <span className="text-white">Shadow</span>
                        <span className="text-accent">Mind</span>
                    </h1>
                    <p className="text-text-muted text-sm mt-1">Secure platform access</p>
                </div>

                {/* Form */}
                <div className="panel-glow p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-text-muted uppercase tracking-widest mb-2 block">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="enter username"
                                required
                                className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-text-muted uppercase tracking-widest mb-2 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="enter password"
                                    required
                                    className="w-full px-4 py-3 pr-10 bg-bg border border-border rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 text-xs text-warn bg-warn/5 border border-warn/20 rounded-lg px-3 py-2">
                                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`rounded-lg px-3 py-3 border text-xs ${result.status === "success"
                                        ? "bg-accent/5 border-accent/20 text-accent"
                                        : "bg-danger/5 border-danger/20 text-danger"
                                    }`}
                            >
                                {result.status === "success" ? (
                                    <>
                                        ✓ Access granted — redirecting to dashboard...
                                        <br />
                                        <span className="text-text-muted">Risk score: {result.risk_score}/100</span>
                                    </>
                                ) : (
                                    <>
                                        ✗ Authentication failed
                                        <br />
                                        <span className="text-text-muted">Risk event logged. Risk score: {result.risk_score}/100</span>
                                    </>
                                )}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Lock className="w-4 h-4" />
                            )}
                            {loading ? "Authenticating..." : "Authenticate"}
                        </button>
                    </form>

                    {/* Demo credentials hint */}
                    <div className="mt-5 pt-4 border-t border-border">
                        <p className="text-xs text-text-muted mb-2">Demo credentials:</p>
                        <div className="space-y-1">
                            {[
                                { u: "alice", p: "secure123", note: "Normal user" },
                                { u: "employee", p: "password123", note: "Standard behavior" },
                                { u: "hacker", p: "pwned", note: "High risk user" },
                            ].map((cred) => (
                                <button
                                    key={cred.u}
                                    onClick={() => { setUsername(cred.u); setPassword(cred.p); }}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-bg hover:bg-panel border border-border hover:border-accent/20 transition-all text-left"
                                >
                                    <span className="text-xs font-mono text-text-muted">{cred.u} / {cred.p}</span>
                                    <span className="text-xs text-text-muted/50">{cred.note}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-text-muted mt-4">
                    All authentication attempts are monitored and logged by ShadowMind
                </p>
            </motion.div>
        </div>
    );
}
