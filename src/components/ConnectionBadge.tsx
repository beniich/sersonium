import React, { useEffect, useState } from "react";
import { connectionManager, ConnectionState } from "../services/connectionManager";
import { Activity, WifiOff, RefreshCw } from "lucide-react";

export const ConnectionBadge: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [state, setState] = useState<ConnectionState>(connectionManager.getState());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    connectionManager.onStateChange = (newState) => {
      setState(newState);
    };
  }, []);

  const handleManualSync = async () => {
    if (state.isOnline && state.pendingSyncCount > 0) {
      setIsSyncing(true);
      await connectionManager.flushQueuedActions();
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  const isLive = state.mode === "LIVE";

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
      isLive 
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
        : "bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse"
    } ${className}`}>
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? "bg-emerald-400" : "bg-rose-500"}`}></span>
      </span>

      {isLive ? (
        <span className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>LIVE CLOUD</span>
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          <span>MODE SIMULATION</span>
        </span>
      )}

      {state.pendingSyncCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={!isLive || isSyncing}
          className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 cursor-pointer hover:bg-amber-500/30"
          title={`${state.pendingSyncCount} action(s) stockée(s) hors-ligne en attente de synchronisation`}
        >
          <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{state.pendingSyncCount} en attente</span>
        </button>
      )}
    </div>
  );
};

export default ConnectionBadge;
