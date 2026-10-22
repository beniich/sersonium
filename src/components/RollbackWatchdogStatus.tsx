import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  AlertOctagon,
  Activity
} from "lucide-react";

interface RollbackWatchdogStatusProps {
  initialSeconds?: number;
  initialTemp?: number;
  targetTemp?: number;
  onRollbackTriggered?: (reason: string) => void;
  onSuccessCompleted?: () => void;
  onDismiss?: () => void;
}

export const RollbackWatchdogStatus: React.FC<RollbackWatchdogStatusProps> = ({
  initialSeconds = 300,
  initialTemp = 92.4,
  targetTemp = 76.5,
  onRollbackTriggered,
  onSuccessCompleted,
  onDismiss
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [currentTemp, setCurrentTemp] = useState(initialTemp);
  const [isRollbackExecuted, setIsRollbackExecuted] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    if (isRollbackExecuted || isResolved) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResolved(true);
          onSuccessCompleted?.();
          return 0;
        }
        return prev - 1;
      });

      // Simulation de la baisse thermique progressive suite à la remédiation
      setCurrentTemp((prev) => {
        if (prev <= targetTemp) return prev;
        const drop = +(Math.random() * 0.4 + 0.1).toFixed(1);
        const nextTemp = +(prev - drop).toFixed(1);
        if (nextTemp <= 78.0 && !isResolved) {
          // Baisse sous le seuil d'alerte atteinte
        }
        return Math.max(targetTemp, nextTemp);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRollbackExecuted, isResolved, targetTemp, onSuccessCompleted]);

  const handleManualRollback = () => {
    setIsRollbackExecuted(true);
    onRollbackTriggered?.("Déclenché manuellement par l'opérateur (Procédure d'urgence DORA)");
  };

  const handleForceSuccess = () => {
    setIsResolved(true);
    onSuccessCompleted?.();
  };

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / initialSeconds) * 100));
  const isOptimal = currentTemp <= 80.0;

  if (isResolved) {
    return (
      <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between animate-in fade-in">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">
              Remédiation Conclue avec Succès • Incident Clôturé
            </p>
            <p className="text-[11px] font-mono text-emerald-400">
              Température Rack B stabilisée à {currentTemp}°C (&lt; seuil 85°C) • Registre DORA certifié immuable.
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-2.5 py-1 rounded text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium transition-colors"
          >
            Fermer
          </button>
        )}
      </div>
    );
  }

  if (isRollbackExecuted) {
    return (
      <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 flex items-center justify-between animate-in shake">
        <div className="flex items-center gap-2.5">
          <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">
              🚨 Rollback Automatique Exécuté • Restauration de l&#39;État Antérieur
            </p>
            <p className="text-[11px] font-mono text-red-300">
              Ancien ingress-routing.yaml réappliqué • Isolation préventive Rack B en cours • Alerte DORA transmise.
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-2.5 py-1 rounded text-[11px] bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium transition-colors"
          >
            Fermer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 text-slate-200 shadow-lg space-y-2.5 animate-in slide-in-from-top-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                RollbackWatchdog Actif
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Fenêtre de Sécurité : {secondsRemaining}s
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Surveillance continue de la trajectoire thermique du cluster post-remédiation
            </p>
          </div>
        </div>

        {/* Télémétrie en direct et Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-slate-700 font-mono text-xs">
            <TrendingDown className={`w-3.5 h-3.5 ${isOptimal ? "text-emerald-400" : "text-amber-400"}`} />
            <span className="text-slate-400">Rack B:</span>
            <span className={`font-bold ${isOptimal ? "text-emerald-400" : "text-amber-300"}`}>
              {currentTemp}°C
            </span>
            <span className="text-[10px] text-slate-500">(-{+(initialTemp - currentTemp).toFixed(1)}°C)</span>
          </div>

          <button
            onClick={handleManualRollback}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold transition-colors cursor-pointer"
            title="Annuler immédiatement le correctif et restaurer le routage précédent"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Rollback Immédiat</span>
          </button>

          <button
            onClick={handleForceSuccess}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-colors cursor-pointer"
            title="Valider la stabilisation et clôturer la surveillance"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Clôturer</span>
          </button>
        </div>
      </div>

      {/* Barre de progression de la fenêtre de 300 secondes */}
      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default RollbackWatchdogStatus;
