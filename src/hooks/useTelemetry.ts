/**
 * useTelemetry — React hook for real-time telemetry data
 * Connects to TelemetryAdapter and provides reactive state updates.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  TelemetryAdapter,
  TelemetryFrame,
  TelemetryAlert,
  ConnectionStatus,
  DataSourceConfig,
  SensorReading,
} from "../services/telemetry.adapter";

export interface TelemetryHookState {
  frame: TelemetryFrame | null;
  alerts: TelemetryAlert[];
  connection: ConnectionStatus | null;
  // Convenience derived metrics
  latestByCategory: Record<string, SensorReading[]>;
  kpis: {
    energyKwh: number;
    co2Tco2e: number;
    healthScore: number;
    activeAlerts: number;
    ingestionRps: number;
    edgeLatencyMs: number;
  };
  // Historical ring buffer (last 60 frames)
  history: TelemetryFrame[];
}

const HISTORY_SIZE = 60;

const EMPTY_STATE: TelemetryHookState = {
  frame: null,
  alerts: [],
  connection: null,
  latestByCategory: {},
  kpis: { energyKwh: 0, co2Tco2e: 0, healthScore: 100, activeAlerts: 0, ingestionRps: 0, edgeLatencyMs: 0 },
  history: [],
};

export function useTelemetry(config?: DataSourceConfig): TelemetryHookState & {
  reconfigure: (cfg: DataSourceConfig) => void;
  acknowledgeAlert: (alertId: string) => void;
} {
  const [state, setState] = useState<TelemetryHookState>(EMPTY_STATE);
  const historyRef = useRef<TelemetryFrame[]>([]);
  const alertsRef = useRef<TelemetryAlert[]>([]);
  const adapterRef = useRef<TelemetryAdapter | null>(null);

  useEffect(() => {
    const adapter = TelemetryAdapter.getInstance(config);
    adapterRef.current = adapter;
    adapter.start();

    const unsubFrame = adapter.onFrame((frame) => {
      // Update ring buffer
      historyRef.current = [...historyRef.current.slice(-(HISTORY_SIZE - 1)), frame];

      // Group readings by category
      const byCategory: Record<string, SensorReading[]> = {};
      for (const r of frame.readings) {
        if (!byCategory[r.category]) byCategory[r.category] = [];
        byCategory[r.category].push(r);
      }

      setState((prev) => ({
        ...prev,
        frame,
        latestByCategory: byCategory,
        history: historyRef.current,
        kpis: {
          energyKwh: frame.energyKwh,
          co2Tco2e: frame.co2Tco2e,
          healthScore: frame.healthScore,
          activeAlerts: frame.activeAlerts,
          ingestionRps: frame.ingestionRps,
          edgeLatencyMs: frame.edgeLatencyMs,
        },
      }));
    });

    const unsubAlert = adapter.onAlert((alert) => {
      alertsRef.current = [alert, ...alertsRef.current.slice(0, 49)]; // keep last 50
      setState((prev) => ({ ...prev, alerts: alertsRef.current }));
    });

    const unsubConn = adapter.onConnectionChange((connection) => {
      setState((prev) => ({ ...prev, connection }));
    });

    return () => {
      unsubFrame();
      unsubAlert();
      unsubConn();
      adapter.stop();
      TelemetryAdapter.resetInstance();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reconfigure = useCallback((cfg: DataSourceConfig) => {
    adapterRef.current?.reconfigure(cfg);
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    alertsRef.current = alertsRef.current.map((a) =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    );
    setState((prev) => ({ ...prev, alerts: alertsRef.current }));
  }, []);

  return { ...state, reconfigure, acknowledgeAlert };
}

export default useTelemetry;
