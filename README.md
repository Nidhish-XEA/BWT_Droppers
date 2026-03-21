<div align="center">
  <div style="width: 120px; height: 120px; background: rgba(155,93,229,0.1); border: 1px solid rgba(155,93,229,0.3); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#9b5de5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  </div>
  
  <h1 style="font-size: 2.5rem; margin-bottom: 0;">SHADOW<span style="color: #9b5de5;">MIND</span></h1>
  <p style="font-size: 1.2rem; margin-top: 10px; color: #a1a1aa;">
    <strong>Adaptive Insider Threat Detection & Deception Engine</strong>
  </p>

  <p>
    <strong><a href="https://shadow-mind-epix6xjgp-nidhish1016-3054s-projects.vercel.app/" target="_blank">🔴 View Live Demo</a></strong>
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

## 🧩 The Problem
Traditional cybersecurity systems focus entirely on perimeter defense, blocking external threats but remaining blind to abnormal behavior from trusted internal users. Insider threats bypass firewalls by design, leading to severe, undetected data breaches or system tampering until it is too late.

## 🚀 The Solution
**ShadowMind** is an intelligent security platform that monitors internal user activity in real-time. Instead of aggressively blocking suspicious users—which alerts them you are onto them—ShadowMind silently isolates them into a controlled **deception sandbox**. 

Inside the sandbox, the attacker thinks they are successfully navigating the real environment, but they are interacting with synthetic data and honeypot services. Meanwhile, ShadowMind captures a complete behavioral fingerprint of their tactics.

> *Don't block threats. Trap them, study them, and neutralize them.*

---

## 🔍 Core Features

- **Continuous Behavioral Watch:** Tracks file access, API bursts, abnormal login times, and network anomalies to establish baseline behaviors.
- **Deception Sandboxing:** Pivot high-risk user sessions seamlessly into isolated Docker environments filled with fake data.
- **Attacker Classification & Profiling:** Identify whether a threat originates from an automated script, a compromised regular employee account, or a highly-skilled APT.
- **Live Spatial Threat Visualization:** Custom SOC telemetry dashboard powered by Next.js, Framer Motion, and GSAP. 
- **Code Security Pipeline:** Clone repositories into secure sandboxes and run actual `Bandit`, custom fuzzers, and dependency checkers to surface real infrastructure vulnerabilities.

---

## 🛠 Tech Stack

#### The Interface (Frontend)
- **Framework:** Next.js (React)
- **Styling:** TailwindCSS + Custom CSS
- **Animations:** GSAP (ScrollTrigger) & Framer Motion
- **Icons & Visualization:** Lucide React, Recharts, Cyber-grid geometries

#### The Engine (Backend)
- **API Server:** FastAPI (Python)
- **Threat Persistence:** SQLite
- **Environment Isolation:** Docker (Dynamic Honneypot routing)

---

## 🏗️ Architecture Flow

1. **Activity Logger:** Captures real-time session events (file access, shell commands, auth events, and API calls).
2. **Behavior Analysis Engine:** Computes a deviation score against historical baseline norms using statistical models.
3. **Risk Scoring Matrix:** Ranks the probability of the threat. Normal operations persist. Suspicious behavior is flagged. Critical behavior issues a trap protocol.
4. **Deception Sandbox (The Trap):** Instantiates a `docker-compose` environment mirroring production services and transparently tunnels the attacker inside.
5. **Dashboard:** SOC Analysts watch the threat unfold live with deep intelligence reports.

---

## ⚡ Getting Started

### Prerequisites
- Node.js `^18.0.0`
- Python `^3.10.0`
- Docker & Docker Compose (for the Sandbox features)

### Running Locally

**1. Clone the repository**
```bash
git clone https://github.com/Nidhish-XEA/ShadowMind.git
cd ShadowMind
```

**2. Start the FastAPI Detection Engine (Backend)**
```bash
cd backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
python app.py
```

**3. Start the C2 Dashboard (Frontend)**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the SOC Dashboard.

---

<div align="center">
  <p><i>The threat is already inside. The question is whether you know it — or they do.</i></p>
  <p>&copy; 2026 ShadowMind AI Security Platform.</p>
</div>
