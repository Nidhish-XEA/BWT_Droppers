"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Shield, AlertTriangle, Activity, Users, Zap, RefreshCw,
    Database
} from "lucide-react";
import { fetchDashboardData, simulateEvent } from "@/lib/api";
import { useThreatWebSocket } from "@/lib/ws";

// ─── Security Score Ring ─────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
    const r = 52;
    const circ = 2 * Math.PI * r;
    const pct = score / 10;
    const color = score >= 7 ? "#00ff9c" : score >= 4 ? "#ffaa00" : "#ff3b3b";

    return (
        <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <motion.circle
                        cx="80" cy="80" r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ - pct * circ }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-3xl font-black"
                        style={{ color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {score.toFixed(1)}
                    </motion.span>
                    <span className="text-xs text-text-muted">/ 10</span>
                </div>
            </div>
        </div>
    );
}

// ─── Severity Badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
    const map: Record<string, string> = {
        CRITICAL: "text-red-400 bg-red-400/10 border-red-400/30",
        HIGH: "text-orange-400 bg-orange-400/10 border-orange-400/30",
        WARN: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
        INFO: "text-text-muted bg-white/5 border-border",
    };
    return (
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${map[severity] || map.INFO}`}>
            {severity}
        </span>
    );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        "Normal": "badge-normal",
        "Moderate": "badge-moderate",
        "Suspicious": "badge-suspicious",
        "High Risk": "badge-high",
        "Critical": "badge-critical",
    };
    return (
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${map[status] || "badge-normal"}`}>
            {status}
        </span>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState<string | null>(null);
    const { events: wsEvents, securityScore: wsScore, activeThreats, connected } = useThreatWebSocket();

    const loadData = async () => {
        try {
            const d = await fetchDashboardData();
            setData(d);
        } catch {
            // Backend not running — use seeded data
            setData({
                security_score: 7.4,
                active_threats: 3,
                monitored_users_count: 6,
                threat_timeline: [
                    { id: 1, timestamp: "10:04", event_type: "DECEPTION_TRAP", description: "admin42 triggered decoy endpoint", severity: "CRITICAL", user: "admin42" },
                    { id: 2, timestamp: "10:06", event_type: "API_BURST", description: "dev_142 — 210 API calls/hr", severity: "HIGH", user: "dev_142" },
                    { id: 3, timestamp: "10:09", event_type: "LOGIN_ANOMALY", description: "Multiple failed logins from unknown", severity: "WARN", user: "unknown" },
                ],
                deception_traps: [
                    { id: 1, timestamp: "10:04", trap_name: "/admin/credentials", triggered_by: "admin42", details: "Decoy credential file accessed", alert_level: "CRITICAL" },
                ],
                risk_reasons: ["High API burst detected", "Deception trap triggered", "Off-hours access pattern"],
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleSimulate = async (type: string) => {
        setSimulating(type);
        try { await simulateEvent(type); } catch { }
        setTimeout(() => { setSimulating(null); loadData(); }, 1000);
    };

    const timeline = [...(wsEvents || []), ...(data?.threat_timeline || [])].slice(-20);
    const score = wsScore !== 9.2 ? wsScore : (data?.security_score || 7.4);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center pt-16">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-muted text-sm">Initializing security feed...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg pt-20 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-white">Security Command Center</h1>
                        <p className="text-text-muted text-sm mt-1">Real-time threat monitoring dashboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 text-xs ${connected ? "text-accent" : "text-text-muted"}`}>
                            <span className={`w-2 h-2 rounded-full ${connected ? "bg-accent animate-pulse" : "bg-text-muted"}`} />
                            {connected ? "LIVE" : "OFFLINE"}
                        </div>
                        <button onClick={loadData} className="p-2 panel rounded-lg hover:border-accent/30 transition-all">
                            <RefreshCw className="w-4 h-4 text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Top KPI row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Security Score", value: `${score.toFixed(1)}/10`, icon: Shield, color: "#00ff9c", sub: "Platform-wide" },
                        { label: "Active Threats", value: activeThreats || data?.active_threats || 3, icon: AlertTriangle, color: "#ff3b3b", sub: "Requiring action" },
                        { label: "Monitored Users", value: data?.monitored_users_count || 6, icon: Users, color: "#00d4ff", sub: "All sessions" },
                        { label: "Trap Activations", value: data?.deception_traps?.length || 2, icon: Zap, color: "#ffaa00", sub: "Today" },
                    ].map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="panel p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-text-muted text-xs">{kpi.label}</span>
                                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                            </div>
                            <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
                            <p className="text-text-muted text-xs mt-1">{kpi.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Score + Reasons */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="panel-glow p-6 text-center"
                        >
                            <p className="text-xs text-text-muted uppercase tracking-widest mb-4">Platform Security Score</p>
                            <ScoreRing score={score} />
                            <p className="text-text-muted text-xs mt-4">
                                {score >= 7 ? "Systems performing well" : score >= 4 ? "Elevated threat activity" : "Critical — immediate action required"}
                            </p>
                        </motion.div>

                        {/* Risk breakdown */}
                        <div className="panel p-4">
                            <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Detected Issues</p>
                            <div className="space-y-2">
                                {(data?.risk_reasons || ["No issues detected"]).map((r: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2 text-xs">
                                        <AlertTriangle className="w-3 h-3 text-danger shrink-0 mt-0.5" />
                                        <span className="text-text-muted">{r}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Simulate buttons */}
                        <div className="panel p-4">
                            <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Simulate Threat</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { type: "api_burst", label: "API Burst" },
                                    { type: "login_fail", label: "Login Attack" },
                                    { type: "trap", label: "Trap Hit" },
                                    { type: "file", label: "File Exfil" },
                                ].map((btn) => (
                                    <button
                                        key={btn.type}
                                        onClick={() => handleSimulate(btn.type)}
                                        disabled={simulating === btn.type}
                                        className="text-xs py-2 px-3 rounded-lg border border-border text-text-muted hover:text-danger hover:border-danger/40 transition-all disabled:opacity-50"
                                    >
                                        {simulating === btn.type ? "..." : btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center: Threat Timeline */}
                    <div className="panel p-4">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-text-muted uppercase tracking-widest">Threat Timeline</p>
                            <Activity className="w-4 h-4 text-text-muted" />
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                            {timeline.length === 0 ? (
                                <p className="text-text-muted text-sm text-center py-8">No events yet</p>
                            ) : (
                                [...timeline].reverse().map((ev: any, i: number) => (
                                    <motion.div
                                        key={`${ev.id}-${i}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex gap-3 items-start"
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-mono text-text-muted whitespace-nowrap">{ev.timestamp}</span>
                                            {i < timeline.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                                        </div>
                                        <div className="flex-1 pb-3 border-b border-border/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <SeverityBadge severity={ev.severity} />
                                                <span className="text-xs font-mono text-text-muted">{ev.event_type}</span>
                                            </div>
                                            <p className="text-xs text-white leading-relaxed">{ev.description}</p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Deception Traps + User Risks */}
                    <div className="space-y-4">
                        <div className="panel p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Database className="w-4 h-4 text-danger" />
                                <p className="text-xs text-text-muted uppercase tracking-widest">Deception Trap Log</p>
                            </div>
                            <div className="space-y-3">
                                {(data?.deception_traps || []).map((trap: any) => (
                                    <div key={trap.id} className="border border-danger/20 rounded-lg p-3 bg-danger/5">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-mono text-danger font-bold">CRITICAL</span>
                                            <span className="text-xs text-text-muted font-mono">{trap.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-white mb-1">{trap.trap_name}</p>
                                        <p className="text-xs text-text-muted">{trap.details}</p>
                                        <p className="text-xs text-danger/60 mt-1">Triggered by: {trap.triggered_by}</p>
                                    </div>
                                ))}
                                {(!data?.deception_traps?.length) && (
                                    <p className="text-text-muted text-xs text-center py-6">No traps triggered</p>
                                )}
                            </div>
                        </div>

                        <div className="panel p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-4 h-4 text-accent" />
                                <p className="text-xs text-text-muted uppercase tracking-widest">User Risk Overview</p>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { user: "admin42", status: "Critical", score: 91 },
                                    { user: "dev_142", status: "High Risk", score: 78 },
                                    { user: "bob", status: "Suspicious", score: 67 },
                                    { user: "svc_bot", status: "Moderate", score: 35 },
                                    { user: "alice", status: "Normal", score: 12 },
                                    { user: "carol", status: "Normal", score: 5 },
                                ].map((u) => (
                                    <div key={u.user} className="flex items-center justify-between py-2 border-b border-border/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-panel border border-border flex items-center justify-center text-xs text-text-muted">
                                                {u.user[0].toUpperCase()}
                                            </div>
                                            <span className="text-xs font-mono text-white">{u.user}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1 rounded-full bg-border overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${u.score}%`,
                                                        background: u.score >= 80 ? "#ff3b3b" : u.score >= 50 ? "#ff7800" : u.score >= 20 ? "#ffaa00" : "#00ff9c"
                                                    }}
                                                />
                                            </div>
                                            <RiskBadge status={u.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
