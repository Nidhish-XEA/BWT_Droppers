"use client";
import { useEffect, useRef, useState } from "react";
import { WS_URL } from "./api";

export interface ThreatEvent {
    id: number;
    timestamp: string;
    event_type: string;
    description: string;
    severity: string;
    user: string;
}

export interface WSMessage {
    type: "new_events" | "security_score";
    events?: ThreatEvent[];
    score?: number;
    active_threats?: number;
}

export function useThreatWebSocket() {
    const [events, setEvents] = useState<ThreatEvent[]>([]);
    const [securityScore, setSecurityScore] = useState<number>(9.2);
    const [activeThreats, setActiveThreats] = useState<number>(0);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        let retryTimeout: NodeJS.Timeout;

        function connect() {
            try {
                const ws = new WebSocket(WS_URL);
                wsRef.current = ws;

                ws.onopen = () => setConnected(true);

                ws.onmessage = (e) => {
                    try {
                        const data: WSMessage = JSON.parse(e.data);
                        if (data.type === "new_events" && data.events) {
                            setEvents((prev) => [...prev, ...data.events!].slice(-50));
                        }
                        if (data.type === "security_score") {
                            if (data.score !== undefined) setSecurityScore(data.score);
                            if (data.active_threats !== undefined) setActiveThreats(data.active_threats);
                        }
                    } catch { }
                };

                ws.onclose = () => {
                    setConnected(false);
                    retryTimeout = setTimeout(connect, 3000);
                };

                ws.onerror = () => ws.close();
            } catch {
                retryTimeout = setTimeout(connect, 3000);
            }
        }

        connect();
        return () => {
            clearTimeout(retryTimeout);
            wsRef.current?.close();
        };
    }, []);

    return { events, securityScore, activeThreats, connected };
}
