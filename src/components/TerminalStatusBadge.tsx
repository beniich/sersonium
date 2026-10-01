import React, { useState } from "react";
import { Cpu, Cloud, CheckCircle2, RefreshCw, Zap, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useTerminalConnection } from "../services/connectionManager";

export default function TerminalStatusBadge() {
  const { mode, status, hostname, npuTops, latencyMs, firmwareVersion, recheck, isLocalHardware } = useTerminalConnection();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualCheck = async () => {
    setIsRefreshing(true);
    await recheck();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="relative">
      {/* Pill Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer border shadow-xs ${
          isLocalHardware
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-emerald-950/20"
            : "bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/15"
        }`}
        title="État de détection du Terminal Physique Silicium X1"
      >
        <span className="relative flex h-2 w-2">
          {isLocalHardware && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isLocalHardware ? "bg-emerald-400" : "bg-blue-400"}`}></span>
        </span>

        {isLocalHardware ? (
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">Silicium X1</span>
            <span className="hidden sm:inline text-emerald-400/80">({hostname || "sensorium.local"})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Mode Cloud Hybride</span>
          </div>
        )}

        {latencyMs !== undefined && (
          <span className="text-[10px] opacity-75 font-mono">
            {latencyMs}ms
          </span>
        )}

        {isOpen ? <ChevronUp className="w-3 h-3 opacity-60" /> : <ChevronDown className="w-3 h-3 opacity-60" />}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0e0e14] border border-white/[0.1] shadow-2xl p-4 z-50 text-left space-y-3 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isLocalHardware ? "Terminal Edge Physique" : "Passerelle Cloud"}
              </span>
            </div>
            <button
              onClick={handleManualCheck}
              className={`p-1 text-neutral-400 hover:text-white rounded-lg transition-colors ${isRefreshing ? "animate-spin text-emerald-400" : ""}`}
              title="Scanner à nouveau le port USB et mDNS"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono text-neutral-300">
            <div className="flex justify-between">
              <span className="text-neutral-500">Mode :</span>
              <span className={`font-semibold ${isLocalHardware ? "text-emerald-400" : "text-blue-400"}`}>
                {isLocalHardware ? "SOUVERAIN LOCAL (Air-Gap)" : "HYBRIDE CLOUD"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Adresse Découverte :</span>
              <span className="text-white font-medium">{hostname}</span>
            </div>

            {isLocalHardware && (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Accélérateur NPU :</span>
                  <span className="text-emerald-400 font-bold">{npuTops} TOPS INT4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Protocole :</span>
                  <span className="text-white">Ethernet USB (mDNS / RNDIS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Firmware :</span>
                  <span className="text-neutral-300">{firmwareVersion}</span>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span className="text-neutral-500">Latence Mesurée :</span>
              <span className="text-white font-bold">{latencyMs} ms</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.08] text-[10px] text-neutral-400">
            {isLocalHardware ? (
              <p className="text-emerald-400/90 leading-tight">
                🔒 Inférence & télémétrie traitées physiquement sur le boîtier. Zéro donnée transmise au cloud.
              </p>
            ) : (
              <p className="leading-tight">
                💡 Branchez votre terminal Sensorium en USB-C pour basculer automatiquement en mode matériel souverain.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
