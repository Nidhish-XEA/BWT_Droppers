"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Shield, AlertTriangle, Clock, ChevronRight, Users } from "lucide-react";
import { fetchUsers, fetchReport } from "@/lib/api";
import Link from "next/link";

const fallbackUsers = [
    { username: "admin42", status: "High Risk" },
    { username: "dev_142", status: "High Risk" },
    { username: "bob", status: "Suspicious" },
    { username: "svc_bot", status: "Moderate" },
    { username: "alice", status: "Normal" },
    { username: "carol", status: "Normal" },
];

export default function ReportPage() {
    const [users, setUsers] = useState(fallbackUsers);
    const [selected, setSelected] = useState("admin42");
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers()
            .then((d) => { if (d.users?.length) setUsers(d.users); })
            .catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchReport(selected)
            .then(setReport)
            .catch(() => {
                const u = users.find((x) => x.username === selected);
                const risk = selected === "admin42" ? 91 : selected === "dev_142" ? 78 : selected === "bob" ? 67 : 15;
                setReport({
                    username: selected,
                    risk_score: risk,
                    status: u?.status || "Unknown",
                    role: "Developer",
                    department: "Engineering",
                    ai_explanation: `**ShadowMind AI Analysis — ${selected}**\n\nRisk Score: **${risk}/100** (${risk >= 80 ? "Critical" : risk >= 50 ? "High" : "Low"} deviation)\n\n${risk >= 50
                            ? `The user is exhibiting behavior significantly outside their established baseline. Multiple threat signals converged including high API call volume and access to restricted endpoints. This pattern is consistent with a compromised account or malicious insider activity.\n\nImmediate security team review is recommended. Shadow containment has been activated.`
                            : `The user's activity is within normal parameters. No significant anomalies detected. Continuous monitoring is active as part of standard protocol.`
                        }`,
                    recommended_actions:
                        risk >= 80
                            ? [
                                "Immediately revoke user credentials and terminate active sessions",
                                "Escalate to incident response team",
                                "Preserve forensic evidence (logs, network captures)",
                                "Notify CISO and legal team",
                                "Conduct full access audit of the past 30 days",
                            ]
                            : risk >= 50
                                ? [
                                    "Increase monitoring frequency for this user",
                                    "Request manager verification of recent activity",
                                    "Review access permissions and apply least-privilege",
                                    "Schedule security awareness interview",
                                ]
                                : ["Continue standard monitoring protocols", "Review quarterly access audit"],
                    event_timeline: risk >= 50 ? [
                        { timestamp: "09:58", event_type: "LOGIN_ANOMALY", description: "Abnormal login time detected", severity: "HIGH" },
                        { timestamp: "10:02", event_type: "API_BURST", description: "API call burst: 210/hr vs baseline 20/hr", severity: "HIGH" },
                        { timestamp: "10:04", event_type: "DECEPTION_TRAP", description: "Decoy endpoint accessed", severity: "CRITICAL" },
                    ] : [],
                });
            })
            .finally(() => setLoading(false));
    }, [selected]);

    const riskColor = !report ? "#00ff9c" : report.risk_score >= 80 ? "#ff3b3b" : report.risk_score >= 50 ? "#ff7800" : report.risk_score >= 20 ? "#ffaa00" : "#00ff9c";

    return (
        <div className="min-h-screen bg-bg pt-20 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-white">Security Report</h1>
                    <p className="text-text-muted text-sm mt-1">Detailed incident analysis with AI-generated insights</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* User sidebar */}
                    <div className="panel p-3">
                        <p className="text-xs text-text-muted uppercase tracking-widest px-3 py-2 mb-1">Select User</p>
                        {users.map((u) => (
                            <button
                                key={u.username}
                                onClick={() => setSelected(u.username)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${selected === u.username
                                        ? "bg-accent/10 text-accent border border-accent/20"
                                        : "text-text-muted hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <span className="font-mono">{u.username}</span>
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        ))}
                    </div>

                    {/* Report main content */}
                    <div className="lg:col-span-3 space-y-4">
                        {loading ? (
                            <div className="panel p-12 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : report ? (
                            <>
                                {/* Summary header */}
                                <motion.div
                                    key={selected}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="panel p-6"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Incident Report</p>
                                            <h2 className="text-2xl font-black text-white font-mono">{report.username}</h2>
                                            <p className="text-text-muted text-sm">{report.role} · {report.department}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-text-muted mb-1">Risk Score</p>
                                            <p className="text-4xl font-black" style={{ color: riskColor }}>{report.risk_score}</p>
                                            <p className="text-xs text-text-muted">/ 100</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 h-2 rounded-full bg-border overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: riskColor }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${report.risk_score}%` }}
                                            transition={{ duration: 1 }}
                                        />
                                    </div>
                                </motion.div>

                                {/* AI Explanation */}
                                <motion.div
                                    key={`${selected}-ai`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="panel p-5"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Shield className="w-4 h-4 text-accent" />
                                        <p className="text-sm font-semibold text-white">AI Security Analysis</p>
                                    </div>
                                    <div className="bg-bg rounded-lg p-4 border border-border font-mono text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
                                        {report.ai_explanation}
                                    </div>
                                </motion.div>

                                {/* Event Timeline */}
                                {report.event_timeline?.length > 0 && (
                                    <motion.div
                                        key={`${selected}-timeline`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="panel p-5"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <Clock className="w-4 h-4 text-warn" />
                                            <p className="text-sm font-semibold text-white">Event Timeline</p>
                                        </div>
                                        <div className="relative pl-4 border-l border-border space-y-4">
                                            {report.event_timeline.map((ev: any, i: number) => (
                                                <div key={i} className="relative">
                                                    <div
                                                        className="absolute -left-5 w-2 h-2 rounded-full border border-bg"
                                                        style={{
                                                            background: ev.severity === "CRITICAL" ? "#ff3b3b" : ev.severity === "HIGH" ? "#ff7800" : "#ffaa00"
                                                        }}
                                                    />
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-xs font-mono text-text-muted">{ev.timestamp}</span>
                                                        <span
                                                            className="text-xs font-mono font-bold"
                                                            style={{ color: ev.severity === "CRITICAL" ? "#ff3b3b" : ev.severity === "HIGH" ? "#ff7800" : "#ffaa00" }}
                                                        >
                                                            {ev.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-white">{ev.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Recommended Actions */}
                                <motion.div
                                    key={`${selected}-actions`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="panel p-5"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertTriangle className="w-4 h-4 text-danger" />
                                        <p className="text-sm font-semibold text-white">Recommended Actions</p>
                                    </div>
                                    <ol className="space-y-3">
                                        {report.recommended_actions.map((action: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span
                                                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0"
                                                    style={{
                                                        background: `${riskColor}15`,
                                                        color: riskColor,
                                                        border: `1px solid ${riskColor}30`,
                                                    }}
                                                >
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm text-text-muted leading-relaxed">{action}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </motion.div>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
