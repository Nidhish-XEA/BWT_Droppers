import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f14",
        panel: "#121821",
        accent: "#00ff9c",
        danger: "#ff3b3b",
        warn: "#ffaa00",
        "text-primary": "#e6edf3",
        "text-muted": "#7d8693",
        border: "#1e2733",
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "scan-line": "scanLine 4s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px 2px rgba(0,255,156,0.3)" },
          "50%": { boxShadow: "0 0 20px 6px rgba(0,255,156,0.6)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(rgba(0,255,156,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,156,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        "cyber-grid": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
