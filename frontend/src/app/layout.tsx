import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { LenisProvider } from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "ShadowMind — AI Security Intelligence Platform",
  description: "Detect hidden threats before they become attacks. AI-powered behavioral threat detection, deception traps, and real-time security intelligence.",
  keywords: "cybersecurity, threat detection, AI security, behavioral analysis, SOC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary antialiased min-h-screen">
        <LenisProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}
