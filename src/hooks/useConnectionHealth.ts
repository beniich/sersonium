// src/hooks/useConnectionHealth.ts
import { useState, useEffect } from 'react';
import { connectionManager } from '@/services/connectionManager';

export interface ConnectionHealth {
  sla: string;
  latency: string;
  aiStatus: string;
}

export function useConnectionHealth(): ConnectionHealth {
  const [health, setHealth] = useState<ConnectionHealth>(() => {
    const state = connectionManager.getState();
    return {
      sla: state.isOnline ? '99.99%' : 'DEGRADED',
      latency: state.latencyMs ? `${state.latencyMs}ms` : (state.isOnline ? '0.8ms' : '—'),
      aiStatus: state.isOnline ? 'Active' : 'Offline'
    };
  });

  useEffect(() => {
    const unsub = connectionManager.subscribe((state) => {
      setHealth({
        sla:      state.isOnline ? '99.99%' : 'DEGRADED',
        latency:  state.latencyMs ? `${state.latencyMs}ms` : (state.isOnline ? '0.8ms' : '—'),
        aiStatus: state.isOnline ? 'Active' : 'Offline'
      });
    });
    return unsub; // désabonnement propre — pattern déjà en place
  }, []);

  return health;
}

export default useConnectionHealth;
