"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Cursor logic
    const cur = document.getElementById('cursor');
    const moveCursor = (e: MouseEvent) => {
      if (cur) {
        cur.style.left = e.clientX + 'px';
        cur.style.top  = e.clientY + 'px';
      }
    };
    document.addEventListener('mousemove', moveCursor);

    const handleEnter = () => cur?.classList.add('big');
    const handleLeave = () => cur?.classList.remove('big');

    const elements = document.querySelectorAll('button, a, .flow-step, .user-row, .tech-item, .feat-row');
    elements.forEach(el => {
      el.addEventListener('mouseenter', handleEnter);
      el.addEventListener('mouseleave', handleLeave);
    });

    // Hero reveal
    gsap.from('.hero-title .line span', {
      y: '110%', duration: 1.4, stagger: 0.1,
      ease: 'power4.out', delay: 0.3
    });
    gsap.from('.eyebrow-line, .eyebrow-text', {
      opacity: 0, x: -20, duration: 1,
      ease: 'power3.out', delay: 0.2, stagger: 0.1
    });
    gsap.from('.hero-desc, .hero-right', {
      opacity: 0, y: 30, duration: 1,
      stagger: 0.12, ease: 'power3.out', delay: 0.9
    });

    // Parallax hero title
    gsap.to('.hero .hero-title', {
      y: -100, ease: 'none',
      scrollTrigger: {
        trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true
      }
    });
    gsap.to('.hero-glow', {
      y: -60, ease: 'none',
      scrollTrigger: {
        trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true
      }
    });

    // Fade up elements
    gsap.utils.toArray('.fade-up').forEach((el: any) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    // Concept title
    gsap.from('.concept-title', {
      y: 60, opacity: 0, duration: 1.1,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.concept-title', start: 'top 80%' }
    });

    // Flow steps stagger
    gsap.from('.flow-step', {
      x: -30, opacity: 0, stagger: 0.1, duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.flow', start: 'top 80%' }
    });

    // Feat rows
    gsap.utils.toArray('.feat-row').forEach((row: any) => {
      gsap.from(row.querySelector('.feat-title'), {
        x: 40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 78%' }
      });
      gsap.from(row.querySelector('.feat-desc'), {
        x: 40, opacity: 0, duration: 1, delay: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 78%' }
      });
      gsap.from(row.querySelector('.feat-chips'), {
        y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 78%' }
      });
    });

    // Risk bars
    gsap.utils.toArray('.score-bar').forEach((bar: any) => {
      gsap.to(bar, {
        width: bar.dataset.w + '%', duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: bar, start: 'top 85%' }
      });
    });

    // User rows stagger
    gsap.from('.user-row', {
      x: -40, opacity: 0, stagger: 0.08, duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.risk-users', start: 'top 80%' }
    });

    // CTA clip lines
    gsap.from('.cta-title .clip-line span', {
      y: '105%', stagger: 0.1, duration: 1.2,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.cta-title', start: 'top 80%' }
    });

    // Manifesto
    gsap.from('.manifesto-quote', {
      y: 80, opacity: 0, duration: 1.3,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.manifesto', start: 'top 70%' }
    });

    // Tech grid
    gsap.from('.tech-item', {
      y: 40, opacity: 0, stagger: 0.08, duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.tech-grid', start: 'top 80%' }
    });

    // Sandbox title
    gsap.from('.sandbox-title', {
      y: 60, opacity: 0, duration: 1.1,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.sandbox-title', start: 'top 80%' }
    });

    // Risk section title
    gsap.from('.risk-title', {
      y: 60, opacity: 0, duration: 1.2,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.risk-title', start: 'top 80%' }
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      elements.forEach(el => {
        el.removeEventListener('mouseenter', handleEnter);
        el.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, { scope: container });

  return (
    <div ref={container} className="landing-container">
      <div id="cursor" className="landing-cursor"></div>
      <div className="landing-overlay"></div>

      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">SHADOW<em>MIND</em></div>
        <div className="landing-nav-links">
          <Link className="landing-nav-link" href="/dashboard">Dashboard</Link>
          <Link className="landing-nav-link" href="/users">Live Users</Link>
          <Link className="landing-nav-link" href="/intelligence">Risk Engine</Link>
          <Link className="landing-nav-link" href="/report">Reports</Link>
          <Link className="landing-nav-badge" href="/login">SECURE LOGIN</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-glow"></div>

        <div className="hero-eyebrow">
          <div className="eyebrow-line"></div>
          <div className="eyebrow-text">Adaptive Insider Threat Detection System</div>
        </div>

        <div className="hero-title-wrap">
          <h1 className="hero-title">
            <div className="line"><span>SHADOW</span></div>
            <div className="line"><span className="outline">MIND</span></div>
            <div className="line"><span className="purple-stroke">///</span></div>
          </h1>
        </div>

        <div className="hero-bottom">
          <p className="hero-desc">
            Insider threats don&apos;t get blocked. They get trapped — in a deception environment designed to profile, study, and neutralize them while the real system stays untouched.
          </p>
          <div className="hero-right">
            <div className="hero-counter">001 / 007</div>
            <Link href="/dashboard" className="landing-btn primary">View Dashboard</Link>
            <Link href="/intelligence" className="landing-btn">Security Engine</Link>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker">
          <div className="t-item"><span className="t-sep">—</span> <b>ANOMALY DETECTION</b> <span className="t-sep">—</span> BEHAVIORAL PROFILING <span className="t-sep">—</span> <b>DECEPTION SANDBOX</b> <span className="t-sep">—</span> RISK SCORING <span className="t-sep">—</span> <b>ATTACKER CLASSIFICATION</b> <span className="t-sep">—</span> HONEYPOT <span className="t-sep">—</span> <b>INSIDER THREAT</b> <span className="t-sep">—</span> REAL-TIME MONITORING <span className="t-sep">—</span></div>
          <div className="t-item"><span className="t-sep">—</span> <b>ANOMALY DETECTION</b> <span className="t-sep">—</span> BEHAVIORAL PROFILING <span className="t-sep">—</span> <b>DECEPTION SANDBOX</b> <span className="t-sep">—</span> RISK SCORING <span className="t-sep">—</span> <b>ATTACKER CLASSIFICATION</b> <span className="t-sep">—</span> HONEYPOT <span className="t-sep">—</span> <b>INSIDER THREAT</b> <span className="t-sep">—</span> REAL-TIME MONITORING <span className="t-sep">—</span></div>
        </div>
      </div>

      {/* CORE CONCEPT */}
      <section className="concept">
        <div className="concept-left">
          <div className="sec-tag">002 / 007 — CORE CONCEPT</div>
          <div className="concept-title fade-up">
            Don&apos;t Block.<br/>
            <span className="hl">Deceive.</span><br/>
            Learn.
          </div>
          <p className="concept-body fade-up">
            Traditional security blocks threats at the perimeter. ShadowMind lets them in — into a controlled deception environment that looks real, feels real, but isn&apos;t. Every move the attacker makes is logged, profiled, and used to build a precise behavioral fingerprint.
            <br/><br/>
            The real system stays untouched. The attacker stays unaware. You gain intelligence.
          </p>
        </div>
        <div className="concept-right fade-up">
          <div className="sec-tag" style={{ marginBottom: '20px' }}>THREAT FLOW</div>
          <div className="flow">
            <div className="flow-step">
              <span className="flow-n">01</span>
              <span className="flow-icon">👁️</span>
              <div className="flow-info">
                <div className="flow-label">Activity Monitoring</div>
                <div className="flow-sub">REAL-TIME BEHAVIORAL BASELINE</div>
              </div>
              <span className="flow-status" style={{ color: 'var(--green)', borderColor: 'rgba(57,217,138,0.3)' }}>ACTIVE</span>
            </div>
            <div className="flow-step">
              <span className="flow-n">02</span>
              <span className="flow-icon">⚠️</span>
              <div className="flow-info">
                <div className="flow-label">Anomaly Detected</div>
                <div className="flow-sub">DEVIATION FROM BASELINE</div>
              </div>
              <span className="flow-status" style={{ color: '#ffd740', borderColor: 'rgba(255,215,64,0.3)' }}>FLAGGED</span>
            </div>
            <div className="flow-step">
              <span className="flow-n">03</span>
              <span className="flow-icon">🎯</span>
              <div className="flow-info">
                <div className="flow-label">Risk Score Computed</div>
                <div className="flow-sub">THREAT LEVEL ASSESSMENT</div>
              </div>
              <span className="flow-status" style={{ color: 'var(--purple)', borderColor: 'rgba(155,93,229,0.3)' }}>SCORING</span>
            </div>
            <div className="flow-step">
              <span className="flow-n">04</span>
              <span className="flow-icon">🕳️</span>
              <div className="flow-info">
                <div className="flow-label">Routed to Sandbox</div>
                <div className="flow-sub">DECEPTION ENVIRONMENT ACTIVATED</div>
              </div>
              <span className="flow-status" style={{ color: 'var(--red)', borderColor: 'rgba(255,45,85,0.3)' }}>TRAPPED</span>
            </div>
            <div className="flow-step">
              <span className="flow-n">05</span>
              <span className="flow-icon">🧠</span>
              <div className="flow-info">
                <div className="flow-label">Behavioral Intelligence</div>
                <div className="flow-sub">ATTACKER PROFILE BUILT</div>
              </div>
              <span className="flow-status" style={{ color: 'var(--green)', borderColor: 'rgba(57,217,138,0.3)' }}>LEARNING</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="feat-row">
          <div className="feat-left">
            <div className="sec-tag">003 / 007</div>
            <div className="feat-idx">01</div>
          </div>
          <div className="feat-right">
            <div className="feat-tag">REAL-TIME MONITORING</div>
            <div className="feat-title">Continuous<br/>Behavioral Watch</div>
            <p className="feat-desc">ShadowMind tracks every user action continuously — file access, network calls, authentication attempts, command execution. A baseline is built. Any deviation triggers evaluation.</p>
            <div className="feat-chips">
              <span className="chip purple">KEYSTROKE PATTERNS</span>
              <span className="chip purple">FILE ACCESS LOGS</span>
              <span className="chip">NETWORK ACTIVITY</span>
              <span className="chip">AUTH EVENTS</span>
              <span className="chip">COMMAND HISTORY</span>
            </div>
          </div>
        </div>

        <div className="feat-row">
          <div className="feat-left">
            <div className="feat-idx">02</div>
          </div>
          <div className="feat-right">
            <div className="feat-tag">ATTACKER CLASSIFICATION</div>
            <div className="feat-title">Know Who<br/>You&apos;re Dealing With</div>
            <p className="feat-desc">The classification engine reads behavioral fingerprints and predicts attacker skill level — script kiddie, advanced persistent threat, or something in between. Response is calibrated accordingly.</p>
            <div className="feat-chips">
              <span className="chip purple">SKILL PROFILING</span>
              <span className="chip purple">BEHAVIORAL FINGERPRINT</span>
              <span className="chip">PATTERN MATCHING</span>
              <span className="chip">ML CLASSIFICATION</span>
            </div>
          </div>
        </div>

        <div className="feat-row">
          <div className="feat-left">
            <div className="feat-idx">03</div>
          </div>
          <div className="feat-right">
            <div className="feat-tag">DECEPTION SANDBOX</div>
            <div className="feat-title">A Prison That<br/>Looks Like Freedom</div>
            <p className="feat-desc">High-risk users are silently routed to a sandboxed mirror of the real environment. They interact with fake data, fake services, fake responses — while every action is captured in full fidelity.</p>
            <div className="feat-chips">
              <span className="chip purple">DOCKER ISOLATION</span>
              <span className="chip purple">HONEYPOT SERVICES</span>
              <span className="chip">FAKE DATA INJECTION</span>
              <span className="chip">TRANSPARENT PROXY</span>
              <span className="chip">FULL CAPTURE</span>
            </div>
          </div>
        </div>

        <div className="feat-row">
          <div className="feat-left">
            <div className="feat-idx">04</div>
          </div>
          <div className="feat-right">
            <div className="feat-tag">CODE SECURITY SCANNING</div>
            <div className="feat-title">Repos Scanned.<br/>Threats Surfaced.</div>
            <p className="feat-desc">Clone any repository into a Docker sandbox. Bandit, dependency checkers, and custom fuzzers run in isolation. Real risk scores. Real findings. Zero exposure to live systems.</p>
            <div className="feat-chips">
              <span className="chip purple">BANDIT</span>
              <span className="chip purple">DEPENDENCY CHECK</span>
              <span className="chip">CUSTOM FUZZERS</span>
              <span className="chip">DOCKER SANDBOX</span>
              <span className="chip">RISK SCORING</span>
            </div>
          </div>
        </div>
      </section>

      {/* BIG MARQUEE */}
      <div className="big-marquee">
        <div className="bm-inner">
          <span className="bm-item">DETECT</span>
          <span className="bm-item lit">DECEIVE</span>
          <span className="bm-item purple-lit">PROFILE</span>
          <span className="bm-item">CONTAIN</span>
          <span className="bm-item lit">LEARN</span>
          <span className="bm-item purple-lit">NEUTRALIZE</span>
          <span className="bm-item">DETECT</span>
          <span className="bm-item lit">DECEIVE</span>
          <span className="bm-item purple-lit">PROFILE</span>
          <span className="bm-item">CONTAIN</span>
          <span className="bm-item lit">LEARN</span>
          <span className="bm-item purple-lit">NEUTRALIZE</span>
        </div>
      </div>

      {/* SANDBOX TERMINAL */}
      <section className="sandbox">
        <div className="sec-tag" style={{ marginBottom: '40px' }}>004 / 007 — SANDBOX ENGINE</div>
        <div className="sandbox-header">
          <div className="sandbox-title">
            The<br/>
            Deception<br/>
            <span className="stroke">Layer</span>
          </div>
          <div className="sandbox-body">
            When a user crosses the risk threshold, ShadowMind silently pivots their session into an isolated deception environment. The transition is invisible. The environment looks identical. The attacker has no idea they are now inside a trap — and everything they do becomes intelligence.
            <br/><br/>
            Built on Docker. Managed by FastAPI. Logged to SQLite. Visualized in real-time on your dashboard.
          </div>
        </div>
        <div className="terminal fade-up">
          <div className="term-title">SHADOWMIND — SANDBOX RUNTIME LOG</div>
          <div className="term-line"><span className="term-prompt">›</span><span className="term-cmd">shadowmind scan --user kaze --baseline 72h</span></div>
          <div className="term-out">Fetching baseline for user: kaze (72h window)</div>
          <div className="term-out">Actions analyzed: 4,218 &nbsp;|&nbsp; Baseline confidence: 97.3%</div>
          <div className="term-line"><span className="term-prompt">›</span><span className="term-cmd">shadowmind monitor --live</span></div>
          <div className="term-out">Monitoring active... anomaly threshold: 0.78</div>
          <div className="term-warn">⚠ ANOMALY — /etc/passwd accessed outside work hours [score: 0.81]</div>
          <div className="term-warn">⚠ ANOMALY — SSH lateral movement attempt [score: 0.89]</div>
          <div className="term-alert">✗ CRITICAL — risk score exceeded threshold [0.89 &gt; 0.78]</div>
          <div className="term-purple">⟳ Routing user session to deception sandbox...</div>
          <div className="term-purple">⟳ Injecting fake /etc/passwd — 247 synthetic entries</div>
          <div className="term-purple">⟳ Honeypot SSH service active on port 2222</div>
          <div className="term-ok">✓ SANDBOX ACTIVE — user kaze now isolated</div>
          <div className="term-ok">✓ All actions captured. Real system untouched.</div>
          <div className="term-line"><span className="term-prompt">›</span><span className="cursor-blink-raw"></span></div>
        </div>
      </section>

      {/* RISK SCORES */}
      <section className="risk-section">
        <div className="sec-tag" style={{ marginBottom: '40px' }}>005 / 007 — LIVE RISK ENGINE</div>
        <div className="risk-title">
          Who&apos;s Being<br/>
          Watched<br/>
          <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>Right Now</span>
        </div>
        <div className="risk-users">
          <div className="user-row">
            <span className="user-idx">01</span>
            <span className="user-name">dev_arjun</span>
            <div className="score-bar-wrap"><div className="score-bar" style={{ width: '0%', background: 'var(--red)' }} data-w="89"></div></div>
            <span className="score-val" style={{ color: 'var(--red)' }}>89</span>
            <span className="risk-badge" style={{ color: 'var(--red)', borderColor: 'rgba(255,45,85,0.4)' }}>SANDBOXED</span>
          </div>
          <div className="user-row">
            <span className="user-idx">02</span>
            <span className="user-name">intern_priya</span>
            <div className="score-bar-wrap"><div className="score-bar" style={{ width: '0%', background: '#ffd740' }} data-w="67"></div></div>
            <span className="score-val" style={{ color: '#ffd740' }}>67</span>
            <span className="risk-badge" style={{ color: '#ffd740', borderColor: 'rgba(255,215,64,0.4)' }}>FLAGGED</span>
          </div>
          <div className="user-row">
            <span className="user-idx">03</span>
            <span className="user-name">sysadmin_rk</span>
            <div className="score-bar-wrap"><div className="score-bar" style={{ width: '0%', background: '#ff8c42' }} data-w="54"></div></div>
            <span className="score-val" style={{ color: '#ff8c42' }}>54</span>
            <span className="risk-badge" style={{ color: '#ff8c42', borderColor: 'rgba(255,140,66,0.4)' }}>WATCHING</span>
          </div>
          <div className="user-row">
            <span className="user-idx">04</span>
            <span className="user-name">analyst_meera</span>
            <div className="score-bar-wrap"><div className="score-bar" style={{ width: '0%', background: 'var(--green)' }} data-w="18"></div></div>
            <span className="score-val" style={{ color: 'var(--green)' }}>18</span>
            <span className="risk-badge" style={{ color: 'var(--green)', borderColor: 'rgba(57,217,138,0.3)' }}>NORMAL</span>
          </div>
          <div className="user-row">
            <span className="user-idx">05</span>
            <span className="user-name">backend_kaze</span>
            <div className="score-bar-wrap"><div className="score-bar" style={{ width: '0%', background: 'var(--green)' }} data-w="11"></div></div>
            <span className="score-val" style={{ color: 'var(--green)' }}>11</span>
            <span className="risk-badge" style={{ color: 'var(--green)', borderColor: 'rgba(57,217,138,0.3)' }}>NORMAL</span>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="manifesto-glow"></div>
        <div className="sec-tag" style={{ marginBottom: '48px' }}>006 / 007 — PHILOSOPHY</div>
        <div className="manifesto-quote fade-up">
          <span className="fade">The threat is already</span> inside.<br/>
          The question is whether<br/>
          you <span className="hl">know it</span> — <span className="fade">or they do.</span>
        </div>
        <p className="manifesto-sub">
          ShadowMind was built on one belief: blocking is reactive. Deception is intelligence. The attacker who thinks they&apos;re winning is the most valuable asset you have.
        </p>
      </section>

      {/* TECH STACK */}
      <section className="tech-section">
        <div className="sec-tag">TECH STACK</div>
        <div className="tech-grid">
          <div className="tech-item fade-up">
            <div className="tech-icon">⚡</div>
            <div className="tech-name">FastAPI</div>
            <div className="tech-role">BACKEND ENGINE</div>
            <div className="tech-desc">Async Python API powering the monitoring, scoring, and sandbox routing pipelines.</div>
          </div>
          <div className="tech-item fade-up">
            <div className="tech-icon">⚛</div>
            <div className="tech-name">Next.js</div>
            <div className="tech-role">FRONTEND</div>
            <div className="tech-desc">React-based dashboard for real-time threat visualization, user risk scores, and sandbox status.</div>
          </div>
          <div className="tech-item fade-up">
            <div className="tech-icon">🐳</div>
            <div className="tech-name">Docker</div>
            <div className="tech-role">SANDBOX ISOLATION</div>
            <div className="tech-desc">Every deception environment is containerized. Full isolation. Clean teardown. No contamination.</div>
          </div>
          <div className="tech-item fade-up">
            <div className="tech-icon">🗄</div>
            <div className="tech-name">SQLite</div>
            <div className="tech-role">PERSISTENCE</div>
            <div className="tech-desc">Lightweight, fast, and portable. All behavioral logs, risk scores, and events stored locally.</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-bg-text">SM</div>
        <div className="cta-tag">007 / 007 — GET STARTED</div>
        <div className="cta-title">
          <div className="clip-line"><span>Let Them</span></div>
          <div className="clip-line"><span className="purple">Think</span></div>
          <div className="clip-line"><span className="stroke">They Won.</span></div>
        </div>
        <div className="cta-btns">
          <Link href="/login" className="landing-btn primary">Authenticate to System</Link>
          <Link href="/dashboard" className="landing-btn">View Dashboard →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-logo">SHADOW<em>MIND</em> — INSIDER THREAT DETECTION</div>
        <div className="footer-copy">© 2026 — ALL RIGHTS RESERVED</div>
        <div className="footer-links">
          <Link href="#">GITHUB</Link>
          <Link href="#">DOCS</Link>
          <Link href="#">PRIVACY</Link>
          <Link href="#">CONTACT</Link>
        </div>
      </footer>
    </div>
  );
}
