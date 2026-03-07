"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";
import { BarChart3, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { fetchIntelligence } from "@/lib/api";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="panel px-3 py-2 text-xs">
                <p className="text-text-muted">{label}</p>
                <p className="text-accent font-bold">{payload[0].value} events</p>
            </div>
        );
    }
    return null;
};

// Simulated heatmap data (hour x day)
const heatmapData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    Mon: Math.round(Math.random() * 8),
    Tue: Math.round(Math.random() * 10),
    Wed: Math.round(Math.random() * 6),
    Thu: hour >= 10 && hour <= 12 ? Math.round(Math.random() * 20 + 10) : Math.round(Math.random() * 5),
    Fri: Math.round(Math.random() * 7),
}));

const radarData = [
    { metric: "API Burst", value: 85 },
    { metric: "Login Anomaly", value: 60 },
    { metric: "File Access", value: 40 },
    { metric: "DB Probe", value: 75 },
    { metric: "Off-Hours", value: 30 },
    { metric: "Trap Hits", value: 95 },
];

export default function IntelligencePage() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchIntelligence().catch(() => {
            setData({
                anomaly_timeline: [
                    { hour: "09:00", count: 4 },
                    { hour: "09:30", count: 7 },
                    { hour: "10:00", count: 28 },
                    { hour: "10:30", count: 19 },
                    { hour: "11:00", count: 11 },
                    { hour: "11:30", count: 6 },
                    { hour: "12:00", count: 3 },
                ],
                deviation_by_user: [
                    { user: "admin42", score: 91 },
                    { user: "dev_142", score: 78 },
                    { user: "bob", score: 67 },
                    { user: "svc_bot", score: 35 },
                    { user: "alice", score: 12 },
                    { user: "carol", score: 5 },
                ],
                total_events: 47,
                critical_count: 2,
                high_count: 8,
                warn_count: 15,
            });
        }).then((d) => { if (d) setData(d); });
    }, []);

    if (!data) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center pt-16">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const barColor = (count: number) =>
        count >= 20 ? "#ff3b3b" : count >= 10 ? "#ffaa00" : "#00ff9c";

    return (
        <div className="min-h-screen bg-bg pt-20 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-white">Threat Intelligence</h1>
                    <p className="text-text-muted text-sm mt-1">Analytics, behavioral deviation, and attack pattern analysis</p>
                </div>

                {/* Summary KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Events", value: data.total_events, color: "#e6edf3" },
                        { label: "Critical", value: data.critical_count, color: "#ff3b3b" },
                        { label: "High", value: data.high_count, color: "#ff7800" },
                        { label: "Warning", value: data.warn_count, color: "#ffaa00" },
                    ].map((k, i) => (
                        <motion.div
                            key={k.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="panel p-4 text-center"
                        >
                            <p className="text-2xl font-black" style={{ color: k.color }}>{k.value}</p>
                            <p className="text-text-muted text-xs mt-1">{k.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    {/* Anomaly Timeline Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="panel p-5"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <TrendingUp className="w-4 h-4 text-accent" />
                            <h3 className="text-sm font-semibold text-white">Anomaly Frequency</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={data.anomaly_timeline} barSize={18}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,39,51,0.8)" vertical={false} />
                                <XAxis dataKey="hour" tick={{ fill: "#7d8693", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#7d8693", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {data.anomaly_timeline.map((entry: any, i: number) => (
                                        <Cell key={i} fill={barColor(entry.count)} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* User Behavioral Deviation */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="panel p-5"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <AlertTriangle className="w-4 h-4 text-danger" />
                            <h3 className="text-sm font-semibold text-white">Behavioral Deviation by User</h3>
                        </div>
                        <div className="space-y-3">
                            {data.deviation_by_user.map((u: any) => (
                                <div key={u.user}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-mono text-white">{u.user}</span>
                                        <span
                                            className="text-xs font-bold"
                                            style={{ color: u.score >= 80 ? "#ff3b3b" : u.score >= 50 ? "#ff7800" : u.score >= 20 ? "#ffaa00" : "#00ff9c" }}
                                        >
                                            {u.score}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-border overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{
                                                background: u.score >= 80 ? "#ff3b3b" : u.score >= 50 ? "#ff7800" : u.score >= 20 ? "#ffaa00" : "#00ff9c",
                                            }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${u.score}%` }}
                                            transition={{ duration: 0.8, delay: 0.4 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Attack Vector Radar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="panel p-5"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <Zap className="w-4 h-4 text-warn" />
                            <h3 className="text-sm font-semibold text-white">Attack Vector Analysis</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(30,39,51,0.8)" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: "#7d8693", fontSize: 10 }} />
                                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                                <Radar name="Score" dataKey="value" stroke="#00ff9c" fill="#00ff9c" fillOpacity={0.1} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Attack Timeline Events */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="panel p-5"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <BarChart3 className="w-4 h-4 text-accent" />
                            <h3 className="text-sm font-semibold text-white">Attack Reconstruction</h3>
                        </div>
                        <div className="relative pl-4 border-l border-border space-y-4">
                            {[
                                { time: "09:58", event: "Abnormal login time", severity: "HIGH", user: "admin42" },
                                { time: "10:02", event: "API call burst initiated", severity: "HIGH", user: "dev_142" },
                                { time: "10:04", event: "Decoy endpoint accessed", severity: "CRITICAL", user: "admin42" },
                                { time: "10:06", event: "Bulk file download started", severity: "WARN", user: "bob" },
                                { time: "10:07", event: "DB schema enumeration", severity: "HIGH", user: "bob" },
                                { time: "10:09", event: "Honeypot table queried", severity: "CRITICAL", user: "bob" },
                            ].map((ev, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.08 }}
                                    className="flex items-start gap-3"
                                >
                                    <div
                                        className="absolute -left-1.5 w-3 h-3 rounded-full border-2 border-bg"
                                        style={{
                                            background: ev.severity === "CRITICAL" ? "#ff3b3b" : ev.severity === "HIGH" ? "#ff7800" : "#ffaa00"
                                        }}
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-text-muted">{ev.time}</span>
                                            <span className="text-xs font-mono text-white">{ev.user}</span>
                                        </div>
                                        <p className="text-xs text-text-muted">{ev.event}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
