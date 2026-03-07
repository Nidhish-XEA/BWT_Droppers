"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, ChevronDown, ChevronUp, Shield, AlertTriangle, Activity, Clock } from "lucide-react";
import { fetchUsers, fetchReport } from "@/lib/api";

const fallbackUsers = [
    { username: "admin42", risk_score: 91, status: "High Risk", role: "admin", department: "IT Security", api_calls: 310, last_seen: "1 min ago" },
    { username: "dev_142", risk_score: 78, status: "High Risk", role: "developer", department: "Engineering", api_calls: 210, last_seen: "3 min ago" },
    { username: "bob", risk_score: 67, status: "Suspicious", role: "analyst", department: "Finance", api_calls: 189, last_seen: "5 min ago" },
    { username: "svc_bot", risk_score: 35, status: "Moderate", role: "service", department: "Automation", api_calls: 180, last_seen: "30 sec ago" },
    { username: "alice", risk_score: 12, status: "Normal", role: "engineer", department: "DevOps", api_calls: 23, last_seen: "2 min ago" },
    { username: "carol", risk_score: 5, status: "Normal", role: "manager", department: "HR", api_calls: 7, last_seen: "12 min ago" },
];

function RiskBar({ score }: { score: number }) {
    const color = score >= 80 ? "#ff3b3b" : score >= 50 ? "#ff7800" : score >= 20 ? "#ffaa00" : "#00ff9c";
    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8 }}
                />
            </div>
            <span className="text-xs font-mono font-bold" style={{ color }}>{score}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        "Normal": "badge-normal",
        "Moderate": "badge-moderate",
        "Suspicious": "badge-suspicious",
        "High Risk": "badge-high",
        "Critical": "badge-critical",
    };
    return <span className={`text-xs font-mono px-2 py-0.5 rounded ${map[status] || "badge-normal"}`}>{status}</span>;
}

function UserDetail({ username }: { username: string }) {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport(username)
            .then(setReport)
            .catch(() => setReport({
                username,
                risk_score: 78,
                status: "High Risk",
                ai_explanation: `**ShadowMind AI Analysis — ${username}**\n\nElevated risk behaviors detected. Multiple anomalous patterns observed including high API call volume and unusual access times. Security team review is advised.`,
                recommended_actions: [
                    "Increase monitoring frequency for this user",
                    "Review access permissions and apply least-privilege",
                    "Request manager verification of recent activity",
                ],
                event_timeline: [],
            }))
            .finally(() => setLoading(false));
    }, [username]);

    if (loading) return (
        <div className="p-6 flex items-center gap-3">
            <div className="w-4 h-4 border border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-text-muted text-xs">Loading analysis...</span>
        </div>
    );

    return (
        <div className="p-5 border-t border-border bg-panel/50">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-text-muted uppercase tracking-widest mb-3">AI Analysis</p>
                    <div className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap font-mono bg-bg rounded-lg p-3 border border-border">
                        {report?.ai_explanation || "No analysis available."}
                    </div>
                </div>
                <div>
                    <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Recommended Actions</p>
                    <ul className="space-y-2">
                        {(report?.recommended_actions || []).map((action: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
                                <Shield className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                                {action}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState(fallbackUsers);
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("all");

    useEffect(() => {
        fetchUsers()
            .then((d) => { if (d.users?.length) setUsers(d.users); })
            .catch(() => { });
    }, []);

    const filtered = users.filter((u) => {
        const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.department.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || u.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const statusCounts = {
        all: users.length,
        "Normal": users.filter((u) => u.status === "Normal").length,
        "Moderate": users.filter((u) => u.status === "Moderate").length,
        "Suspicious": users.filter((u) => u.status === "Suspicious").length,
        "High Risk": users.filter((u) => u.status === "High Risk").length,
    };

    return (
        <div className="min-h-screen bg-bg pt-20 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-white">User Monitoring</h1>
                    <p className="text-text-muted text-sm mt-1">Real-time risk assessment across all monitored identities</p>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-9 pr-4 py-2 bg-panel border border-border rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2">
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filterStatus === status
                                        ? "bg-accent/10 border-accent/30 text-accent"
                                        : "border-border text-text-muted hover:text-white hover:border-border/80"
                                    }`}
                            >
                                {status === "all" ? "All" : status} ({count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users table */}
                <div className="panel overflow-hidden">
                    <table className="w-full data-table">
                        <thead>
                            <tr>
                                <th className="text-left">User</th>
                                <th className="text-left">Department</th>
                                <th className="text-left">Role</th>
                                <th className="text-left">Risk Score</th>
                                <th className="text-left">Status</th>
                                <th className="text-left">API Calls</th>
                                <th className="text-left">Last Seen</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user, i) => (
                                <>
                                    <motion.tr
                                        key={user.username}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="cursor-pointer"
                                        onClick={() => setExpanded(expanded === user.username ? null : user.username)}
                                    >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold"
                                                    style={{
                                                        background: user.risk_score >= 50 ? "rgba(255,59,59,0.1)" : "rgba(0,255,156,0.1)",
                                                        borderColor: user.risk_score >= 50 ? "rgba(255,59,59,0.3)" : "rgba(0,255,156,0.2)",
                                                        color: user.risk_score >= 50 ? "#ff3b3b" : "#00ff9c",
                                                    }}
                                                >
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                                <span className="font-mono text-sm text-white">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="text-text-muted text-sm">{user.department}</td>
                                        <td className="text-text-muted text-sm capitalize">{user.role}</td>
                                        <td><RiskBar score={user.risk_score} /></td>
                                        <td><StatusBadge status={user.status} /></td>
                                        <td className="text-text-muted text-sm font-mono">{user.api_calls}/hr</td>
                                        <td>
                                            <div className="flex items-center gap-1 text-text-muted text-xs">
                                                <Clock className="w-3 h-3" />
                                                {user.last_seen}
                                            </div>
                                        </td>
                                        <td>
                                            {expanded === user.username ? (
                                                <ChevronUp className="w-4 h-4 text-text-muted" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-text-muted" />
                                            )}
                                        </td>
                                    </motion.tr>
                                    <AnimatePresence>
                                        {expanded === user.username && (
                                            <tr key={`${user.username}-detail`}>
                                                <td colSpan={8} className="p-0">
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                    >
                                                        <UserDetail username={user.username} />
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-text-muted text-sm">No users found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
