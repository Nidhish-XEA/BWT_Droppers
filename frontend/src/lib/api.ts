const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchDashboardData() {
    const res = await fetch(`${API_BASE}/api/dashboard-data`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard data");
    return res.json();
}

export async function fetchUsers() {
    const res = await fetch(`${API_BASE}/api/users`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export async function fetchThreats() {
    const res = await fetch(`${API_BASE}/api/threats`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch threats");
    return res.json();
}

export async function fetchIntelligence() {
    const res = await fetch(`${API_BASE}/api/intelligence`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch intelligence");
    return res.json();
}

export async function fetchReport(username: string) {
    const res = await fetch(`${API_BASE}/api/report/${username}`, {
        credentials: "include",
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch report");
    return res.json();
}

export async function login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    return res.json();
}

export async function simulateEvent(eventType: string) {
    const res = await fetch(`${API_BASE}/api/simulate/${eventType}`, {
        method: "POST",
        credentials: "include",
    });
    return res.json();
}

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_BASE.replace("http://", "ws://").replace("https://", "wss://") + "/ws/threats";
