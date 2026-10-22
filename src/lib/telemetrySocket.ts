/**
 * telemetrySocket.ts
 * Singleton Socket.IO client partage pour les flux de telemetrie Kafka -> WebSocket.
 * Tous les composants LiveStreamRenderer partagent une seule connexion.
 */
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_WS_URL) ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

let _socket: Socket | null = null;

/** Retourne (ou cree) l'instance unique du socket SENSORIUM telemetry. */
export function getTelemetrySocket(): Socket {
  if (!_socket || !_socket.connected) {
    _socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    _socket.on("connect", () => {
      console.info(`[TelemetrySocket] Connected: ${_socket?.id}`);
    });
    _socket.on("disconnect", (reason: string) => {
      console.warn(`[TelemetrySocket] Disconnected: ${reason}`);
    });
    _socket.on("connect_error", (err: Error) => {
      console.warn(`[TelemetrySocket] Connection error (simulation mode): ${err.message}`);
    });
  }
  return _socket;
}

/** Fermeture propre. */
export function disconnectTelemetrySocket(): void {
  _socket?.disconnect();
  _socket = null;
}
