import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

export interface LiveTelemetryData {
  cpu: number;
  ram: number;
  net: number;
  cpuPoints: string;
  ramPoints: string;
  netPoints: string;
  isOnline: boolean;
}

export function useLiveTelemetry() {
  const [telemetry, setTelemetry] = useState<LiveTelemetryData>({
    cpu: 28,
    ram: 62,
    net: 42,
    cpuPoints: "0,18 18,14 36,10 54,13 72,5",
    ramPoints: "0,16 18,12 36,17 54,9 72,5",
    netPoints: "0,18 18,16 36,9 54,13 72,3",
    isOnline: true
  });

  const [cpuHistory, setCpuHistory] = useState<number[]>([26, 28, 27, 30, 28]);
  const [ramHistory, setRamHistory] = useState<number[]>([61, 63, 62, 64, 62]);
  const [netHistory, setNetHistory] = useState<number[]>([39, 41, 44, 40, 42]);

  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io({
        path: "/socket.io",
        transports: ["websocket", "polling"],
        reconnectionDelay: 2000
      });

      socket.on("connect", () => {
        setTelemetry(prev => ({ ...prev, isOnline: true }));
      });

      socket.on("disconnect", () => {
        setTelemetry(prev => ({ ...prev, isOnline: false }));
      });

      socket.on("vision_live_telemetry", (data: { cpu: number; ram: number; net: number }) => {
        setCpuHistory(prev => {
          const next = [...prev.slice(1), data.cpu];
          return next;
        });
        setRamHistory(prev => {
          const next = [...prev.slice(1), data.ram];
          return next;
        });
        setNetHistory(prev => {
          const next = [...prev.slice(1), data.net];
          return next;
        });

        // Génération des coordonnées polyline SVG
        const pointsFromHistory = (arr: number[], min: number, max: number) => {
          return arr
            .map((val, idx) => {
              const x = Math.round((idx / (arr.length - 1)) * 72);
              const clamped = Math.max(min, Math.min(max, val));
              const normalized = (clamped - min) / (max - min || 1);
              const y = Math.round(18 - normalized * 14);
              return `${x},${y}`;
            })
            .join(" ");
        };

        setTelemetry(prev => ({
          ...prev,
          cpu: data.cpu,
          ram: data.ram,
          net: data.net,
          isOnline: true,
          cpuPoints: pointsFromHistory([...cpuHistory.slice(1), data.cpu], 15, 45),
          ramPoints: pointsFromHistory([...ramHistory.slice(1), data.ram], 50, 75),
          netPoints: pointsFromHistory([...netHistory.slice(1), data.net], 25, 55)
        }));
      });
    } catch (err) {
      console.warn("[useLiveTelemetry] WebSocket non joignable, mode autonome activé :", err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [cpuHistory, ramHistory, netHistory]);

  return telemetry;
}

