import React, { useEffect, useState } from "react";
import { 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  ArrowRight, 
  Check, 
  X, 
  Cpu, 
  Activity, 
  Lock, 
  CornerDownLeft, 
  Radio, 
  FileCode2,
  Sparkles
} from "lucide-react";

export interface SelfHealingIncident {
  eventId: string;
  timestamp: string;
  sourceStream: string;
  severity: "CRITICAL" | "HIGH" | "WARNING";
  currentTemp: number;
  thresholdTemp: number;
  targetComponent: string;
  proposedRedirectPercent: number;
  alternateTarget: string;
  alternateAvailableCapacity: number;
  alternateThermalMargin: number;
  confidenceScore: number;
  originalWeight: number;
  newWeightOriginal: number;
  newWeightAlternate: number;
}

interface SelfHealingModalProps {
  isOpen: boolean;
  incident?: SelfHealingIncident | null;
  onApprove: (incident: SelfHealingIncident) => void;
  onReject: () => void;
}

export const DEFAULT_INCIDENT: SelfHealingIncident = {
  eventId: "evt_sh_20261022_0042",
  timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
  sourceStream: "telemetry.rackB.thermal",
  severity: "CRITICAL",
  currentTemp: 92.4,
  thresholdTemp: 90.0,
  targetComponent: "rack_b_load_balancer",
  proposedRedirectPercent: 40,
  alternateTarget: "rack_a",
  alternateAvailableCapacity: 45,
  alternateThermalMargin: 18.2,
  confidenceScore: 96,
  originalWeight: 100,
  newWeightOriginal: 60,
  newWeightAlternate: 40
};

export const SelfHealingModal: React.FC<SelfHealingModalProps> = ({
  isOpen,
  incident = DEFAULT_INCIDENT,
  onApprove,
  onReject
}) => {
  const inc = incident || DEFAULT_INCIDENT;
  const [isDeploying, setIsDeploying] = useState(false);

  // Gestion des raccourcis clavier [ESC] et [CTRL+ENTER]
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onReject();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsDeploying(true);
        onApprove(inc);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, inc, onApprove, onReject]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl rounded-2xl bg-[#090D14] border border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.25)] overflow-hidden flex flex-col text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* En-tête d'alerte critique */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-red-950/80 via-red-900/60 to-slate-900 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-wide uppercase text-white flex items-center gap-1.5">
                  Remédiation Autonome : Anomalie Critique Détectée
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/30 text-red-300 border border-red-500/40">
                  Rack B &gt; {inc.thresholdTemp}°C
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Événement: <span className="text-red-300">{inc.eventId}</span> • Source: {inc.sourceStream} • DORA Pilier III
              </p>
            </div>
          </div>
          <button
            onClick={onReject}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fermer [Échap]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps principal */}
        <div className="p-5 space-y-4 max-h-[calc(85vh-140px)] overflow-y-auto custom-scrollbar text-xs">
          
          {/* Analyse IA et Solution Proposée */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white text-xs">
                [Analyse IA Sensorium Neural Core] : Surcharge thermique active ({inc.currentTemp}°C)
              </p>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Le bloc serveurs Rack B dépasse le seuil nominal de {inc.thresholdTemp}°C. 
                <strong className="text-orange-300"> Solution calculée :</strong> Redirection immédiate de{" "}
                <span className="text-emerald-400 font-bold font-mono">{inc.proposedRedirectPercent}%</span> du flux de charge vers le{" "}
                <strong className="text-white uppercase font-mono">{inc.alternateTarget}</strong> (Capacité disponible :{" "}
                <span className="text-emerald-400 font-mono">{inc.alternateAvailableCapacity}%</span>, Marge thermique :{" "}
                <span className="text-emerald-400 font-mono">+{inc.alternateThermalMargin}°C</span>).
              </p>
            </div>
          </div>

          {/* Grille Pre-flight Check (Simulation d'Impact) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Pre-Flight Check (Simulation Prédictive)
              </span>
              <span className="text-emerald-400 font-mono text-[10px]">
                Indice de Confiance IA : {inc.confidenceScore}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-mono text-slate-400">Impact Rack A :</span>
                  <span className="font-bold text-emerald-400">Stable (+1.2°C prévus)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "38%" }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Marge de sécurité résiduelle : 17.0°C</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-mono text-slate-400">Risque Opérationnel :</span>
                  <span className="font-bold text-amber-400">Faible (Zéro Déconnexion)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: "12%" }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Bascule progressive Anycast en 400ms</span>
              </div>
            </div>
          </div>

          {/* Correctif Proposé : Diff YAML avec numéros de lignes et code couleur exact */}
          <div className="rounded-xl border border-slate-800 bg-[#06080C] overflow-hidden">
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-200 font-bold">ingress-routing.yaml</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 text-[10px]">IA-Generated Patch</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Anycast Weighted Mesh</span>
            </div>

            <pre className="p-3 font-mono text-[11px] leading-relaxed overflow-x-auto text-slate-400 select-none bg-black/40 space-y-0.5">
              <div><span className="text-slate-600 inline-block w-6 text-right mr-3">01</span>apiVersion: networking.sensorium.io/v1alpha1</div>
              <div><span className="text-slate-600 inline-block w-6 text-right mr-3">02</span>kind: IngressTrafficDispatch</div>
              <div><span className="text-slate-600 inline-block w-6 text-right mr-3">03</span>metadata:</div>
              <div><span className="text-slate-600 inline-block w-6 text-right mr-3">04</span>  name: {inc.targetComponent}</div>
              <div><span className="text-slate-600 inline-block w-6 text-right mr-3">05</span>spec:</div>
              <div><span className="text-slate-600 inline-block w-6 text-right mr-3">06</span>  routingTargets:</div>
              <div className="bg-red-950/40 text-red-300 w-full px-2 py-0.5 rounded-xs border-l-2 border-red-500 flex items-center">
                <span className="text-red-400 font-bold mr-2">-</span>
                <span className="text-slate-600 inline-block w-6 text-right mr-3">07</span>
                <span>    - target: rack_b</span>
              </div>
              <div className="bg-red-950/40 text-red-300 w-full px-2 py-0.5 rounded-xs border-l-2 border-red-500 flex items-center">
                <span className="text-red-400 font-bold mr-2">-</span>
                <span className="text-slate-600 inline-block w-6 text-right mr-3">08</span>
                <span>      weight: {inc.originalWeight}</span>
              </div>
              <div className="bg-emerald-950/40 text-emerald-300 w-full px-2 py-0.5 rounded-xs border-l-2 border-emerald-500 flex items-center">
                <span className="text-emerald-400 font-bold mr-2">+</span>
                <span className="text-slate-600 inline-block w-6 text-right mr-3">07</span>
                <span>    - target: rack_b</span>
              </div>
              <div className="bg-emerald-950/40 text-emerald-300 w-full px-2 py-0.5 rounded-xs border-l-2 border-emerald-500 flex items-center">
                <span className="text-emerald-400 font-bold mr-2">+</span>
                <span className="text-slate-600 inline-block w-6 text-right mr-3">08</span>
                <span>      weight: {inc.newWeightOriginal}</span>
              </div>
              <div className="bg-emerald-950/40 text-emerald-300 w-full px-2 py-0.5 rounded-xs border-l-2 border-emerald-500 flex items-center">
                <span className="text-emerald-400 font-bold mr-2">+</span>
                <span className="text-slate-600 inline-block w-6 text-right mr-3">09</span>
                <span>    - target: {inc.alternateTarget}</span>
              </div>
              <div className="bg-emerald-950/40 text-emerald-300 w-full px-2 py-0.5 rounded-xs border-l-2 border-emerald-500 flex items-center">
                <span className="text-emerald-400 font-bold mr-2">+</span>
                <span className="text-slate-600 inline-block w-6 text-right mr-3">10</span>
                <span>      weight: {inc.newWeightAlternate}</span>
              </div>
            </pre>
          </div>

          {/* Note de Conformité DORA / HSM */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Garantie de Conformité DORA :</strong> Signature immuable requise. Le déploiement injectera le jeton matériel HSM-Enclave pour l&#39;audit de résilience et enclenchera le <strong>RollbackWatchdog (fenêtre de 300s)</strong>.
            </span>
          </div>

        </div>

        {/* Pied de page et Boutons d'action avec gestion des raccourcis */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Échap</span>
            <span>Rejeter</span>
            <span className="text-slate-600">•</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Ctrl+Entrée</span>
            <span>Approuver</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onReject}
              disabled={isDeploying}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Rejeter le correctif</span>
            </button>

            <button
              onClick={() => {
                setIsDeploying(true);
                onApprove(inc);
              }}
              disabled={isDeploying}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:brightness-110 text-white font-bold tracking-wide shadow-[0_4px_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50 text-[11px] flex items-center justify-center gap-1.5 border border-orange-400/30 cursor-pointer"
            >
              {isDeploying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Déploiement en cours...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approuver &amp; Déployer</span>
                  <span className="hidden sm:inline-flex items-center text-[10px] font-mono px-1 py-0.5 rounded bg-black/30 border border-white/20">
                    ↵
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SelfHealingModal;
