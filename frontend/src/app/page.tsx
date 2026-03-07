"use client";
import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Shield, Eye, Zap, Brain, Activity, ChevronRight, Terminal, AlertTriangle } from "lucide-react";

// ─── Animated Cyber Grid Background ─────────────────────────────────────────
function CyberGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; opacity: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = "rgba(0,255,156,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,156,${p.opacity})`;
        ctx.fill();
      });

      // Connect nearby particles
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,255,156,${0.1 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

// ─── Live Threat Feed Ticker ─────────────────────────────────────────────────
const tickerItems = [
  "⚠ HIGH RISK: dev_142 — API burst detected (210 calls/hr)",
  "🔴 CRITICAL: admin42 — Deception trap triggered",
  "⚠ WARN: bob — Unusual database access pattern",
  "ℹ MONITOR: svc_bot — Automated behavior confirmed",
  "🔴 CRITICAL: Unknown — 14 failed login attempts",
];

function ThreatTicker() {
  return (
    <div className="w-full border-t border-b border-border py-2 overflow-hidden bg-panel/40 backdrop-blur-sm">
      <motion.div
        animate={{ x: [0, -2000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 whitespace-nowrap"
      >
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <span key={i} className="text-xs font-mono text-text-muted shrink-0">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Feature Card ────────────────────────────────────────────────────────────
const features = [
  {
    icon: Activity,
    title: "Behavioral Threat Detection",
    description:
      "Monitor login time anomalies, API request bursts, unusual file downloads, and suspicious access patterns in real-time.",
    detail: "User dev_142 — 210 API calls/hr vs baseline 20/hr",
    color: "accent",
    delay: 0,
  },
  {
    icon: Eye,
    title: "Deception Traps",
    description:
      "Deploy fake credentials, endpoints, and database tables. Any interaction immediately triggers a critical alert.",
    detail: "CRITICAL: /admin/credentials accessed",
    color: "danger",
    delay: 0.1,
  },
  {
    icon: Brain,
    title: "AI Security Analyst",
    description:
      "Natural language threat explanations. Understand exactly what happened, why it's suspicious, and what to do next.",
    detail: "Automated script or compromised account suspected",
    color: "accent",
    delay: 0.2,
  },
  {
    icon: Zap,
    title: "Threat Timeline",
    description:
      "Chronological attack reconstruction. Track how an incident unfolded from first anomaly to critical breach.",
    detail: "10:04 → 10:07 — 4 escalation events",
    color: "warn",
    delay: 0.3,
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const Icon = feature.icon;
  const colorMap = { accent: "#00ff9c", danger: "#ff3b3b", warn: "#ffaa00" };
  const color = colorMap[feature.color as keyof typeof colorMap];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: feature.delay }}
      className="panel p-6 group hover:border-accent/20 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 cursor-default"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
      <p className="text-text-muted text-sm leading-relaxed mb-4">{feature.description}</p>
      <div
        className="text-xs font-mono px-3 py-2 rounded-md"
        style={{ background: `${color}08`, color, border: `1px solid ${color}20` }}
      >
        {feature.detail}
      </div>
    </motion.div>
  );
}

// ─── Live Network Visualization ───────────────────────────────────────────────
const nodes = [
  { id: "alice", x: 50, y: 30, status: "normal", label: "alice" },
  { id: "bob", x: 78, y: 22, status: "suspicious", label: "bob" },
  { id: "admin42", x: 65, y: 60, status: "critical", label: "admin42" },
  { id: "dev_142", x: 30, y: 65, status: "high", label: "dev_142" },
  { id: "carol", x: 15, y: 40, status: "normal", label: "carol" },
  { id: "svc_bot", x: 55, y: 85, status: "moderate", label: "svc_bot" },
  { id: "server1", x: 50, y: 50, status: "normal", label: "core" },
];

const edges = [
  ["carol", "server1"], ["alice", "server1"], ["bob", "server1"],
  ["admin42", "server1"], ["dev_142", "server1"], ["svc_bot", "server1"],
  ["bob", "admin42"],
];

function NetworkViz() {
  const statusColors = {
    normal: "#00ff9c",
    moderate: "#ffaa00",
    suspicious: "#ff7800",
    high: "#ff5500",
    critical: "#ff3b3b",
  };

  return (
    <div className="w-full aspect-video max-w-2xl mx-auto relative">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Edges */}
        {edges.map(([a, b], i) => {
          const na = nodes.find((n) => n.id === a)!;
          const nb = nodes.find((n) => n.id === b)!;
          const isSuspicious = na.status !== "normal" || nb.status !== "normal";
          return (
            <motion.line
              key={i}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={isSuspicious ? "#ff3b3b" : "#00ff9c"}
              strokeWidth={isSuspicious ? 0.3 : 0.2}
              strokeOpacity={isSuspicious ? 0.6 : 0.25}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
            />
          );
        })}
        {/* Nodes */}
        {nodes.map((node, i) => {
          const color = statusColors[node.status as keyof typeof statusColors];
          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x} cy={node.y} r={node.id === "server1" ? 3 : 2}
                fill={color}
                fillOpacity={0.85}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              />
              {node.status === "critical" && (
                <motion.circle
                  cx={node.x} cy={node.y} r={4}
                  fill="none"
                  stroke="#ff3b3b"
                  strokeWidth={0.3}
                  animate={{ r: [3, 6], opacity: [0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <text x={node.x + 3} y={node.y - 2} fontSize={2.5} fill={color} fillOpacity={0.8}>
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-text-muted capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const stats = [
  { label: "Threats Detected Today", value: "47", color: "#ff3b3b" },
  { label: "Security Score", value: "7.4/10", color: "#00ff9c" },
  { label: "Active Monitors", value: "6", color: "#00d4ff" },
  { label: "Traps Triggered", value: "2", color: "#ffaa00" },
];

// ─── Main Landing Page ───────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef(null);

  return (
    <div className="bg-bg min-h-screen overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <CyberGrid />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 filter blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-mono mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI-POWERED SECURITY INTELLIGENCE
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-4 leading-none"
          >
            <span className="text-white">Shadow</span>
            <span className="gradient-text">Mind</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl font-semibold text-text-muted mb-3"
          >
            AI Security Intelligence Platform
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-base md:text-lg text-text-muted/60 font-light mb-10 max-w-xl mx-auto"
          >
            Detect hidden threats before they become attacks. ShadowMind watches the shadows of your system.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4" />
              Start Monitoring
            </Link>
            <Link
              href="/intelligence"
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-muted hover:text-white hover:border-white/20 transition-all duration-300 text-sm"
            >
              View Intelligence
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Terminal preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 panel max-w-xl mx-auto text-left p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="text-text-muted text-xs font-mono ml-2">shadowmind — threat analysis</span>
            </div>
            <div className="font-mono text-xs space-y-1.5">
              <p><span className="text-text-muted">$</span> <span className="text-accent">analyze</span> <span className="text-white">dev_142</span></p>
              <p className="text-text-muted">→ Baseline: 20 API calls/hr</p>
              <p className="text-text-muted">→ Current: <span className="text-yellow-400">210 API calls/hr</span></p>
              <p className="text-text-muted">→ Deviation: <span className="text-red-400">+950%</span></p>
              <p><span className="text-red-400 font-bold">⚠ RISK LEVEL: HIGH</span> <span className="text-text-muted cursor-blink" /></p>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-text-muted">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-accent/50 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Threat Ticker ── */}
      <ThreatTicker />

      {/* ── Stats ── */}
      <section className="relative py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="panel p-5 text-center"
            >
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-text-muted text-xs mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-accent text-xs font-mono uppercase tracking-widest mb-3"
          >
            Core Capabilities
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white"
          >
            Security that sees{" "}
            <span className="gradient-text">everything</span>
          </motion.h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* ── Live Visualization ── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-accent text-xs font-mono uppercase tracking-widest mb-3"
            >
              Live Security Map
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-black text-white mb-4"
            >
              Watch the{" "}
              <span className="gradient-text-danger">shadows</span>
              {" "}move
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-text-muted leading-relaxed mb-6"
            >
              ShadowMind maps every connection between users and systems. Nodes glow red when anomalous behavior is detected — giving your SOC team instant spatial awareness of threats.
            </motion.p>
            <div className="space-y-3">
              {[
                { label: "admin42", status: "CRITICAL", detail: "Deception trap triggered" },
                { label: "dev_142", status: "HIGH", detail: "210 API calls/hr" },
                { label: "bob", status: "SUSPICIOUS", detail: "Unusual DB access" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between panel px-4 py-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-danger" />
                    <span className="text-sm font-mono text-white">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-danger font-semibold">{item.status}</span>
                    <p className="text-xs text-text-muted">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="panel-glow p-4"
          >
            <NetworkViz />
          </motion.div>
        </div>
      </section>

      {/* ── Security Score Section ── */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="panel-glow p-12 relative overflow-hidden">
            <div className="absolute inset-0 cyber-grid-bg opacity-30" />
            <div className="relative z-10">
              <p className="text-accent text-xs font-mono uppercase tracking-widest mb-4">Platform Security Score</p>
              <div className="text-8xl font-black gradient-text mb-2">7.4</div>
              <p className="text-text-muted mb-8">out of 10 — Active monitoring across all systems</p>
              <div className="grid sm:grid-cols-3 gap-4 text-left">
                {[
                  { issue: "Abnormal login behavior", severity: "HIGH" },
                  { issue: "Suspicious file access", severity: "WARN" },
                  { issue: "High API request burst", severity: "CRITICAL" },
                ].map((item) => (
                  <div key={item.issue} className="panel px-4 py-3 flex items-center gap-3">
                    <span
                      className={`text-xs font-mono font-bold ${item.severity === "CRITICAL" ? "text-danger" : item.severity === "HIGH" ? "text-orange-400" : "text-warn"
                        }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-xs text-text-muted">{item.issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Stop threats <span className="gradient-text">before they strike</span>
          </h2>
          <p className="text-text-muted mb-8">
            Start monitoring your systems with AI-powered behavioral detection.
          </p>
          <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Open Command Center
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-accent" />
            <span className="font-bold">
              <span className="text-white">Shadow</span><span className="text-accent">Mind</span>
            </span>
          </div>
          <p className="text-text-muted text-xs">
            © 2026 ShadowMind AI Security Platform. All systems monitored.
          </p>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
