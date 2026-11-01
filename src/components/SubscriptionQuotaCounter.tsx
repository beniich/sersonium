import React, { useState } from "react";
import { 
  Zap, 
  Crown, 
  Cpu, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpRight, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Sliders,
  CheckCircle2,
  X
} from "lucide-react";
import { SubscriptionTier, GlobalState } from "../types";
import { useSubscriptionQuota } from "../hooks/useSubscriptionQuota";
import SubscriptionPricingModal from "./SubscriptionPricingModal";

export interface SubscriptionQuotaCounterProps {
  variant?: "card" | "pill" | "banner";
  state?: GlobalState;
  onOpenPricing?: () => void;
  className?: string;
  showSimulateButtons?: boolean;
}

export const SubscriptionQuotaCounter: React.FC<SubscriptionQuotaCounterProps> = ({
  variant = "card",
  state,
  onOpenPricing,
  className = "",
  showSimulateButtons = true,
}) => {
  const currentTier: SubscriptionTier = state?.subscriptionTier || "free";
  const quota = useSubscriptionQuota(currentTier);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);

  const handleOpenPricing = () => {
    if (onOpenPricing) {
      onOpenPricing();
    } else {
      setIsPricingModalOpen(true);
    }
  };

  const handleSimulateInference = () => {
    const result = quota.consumeTokens(350, "GEMINI_COPILOT_QUERY");
    if (result.success) {
      setLastActionToast("-350 jetons IA déduits (Requête Gemini)");
    } else {
      setLastActionToast("⚠️ Quota mensuel épuisé ! Veuillez upgrader votre forfait.");
    }
    setTimeout(() => setLastActionToast(null), 3000);
  };

  const handleSimulateApiCall = () => {
    quota.recordApiCall(5);
    setLastActionToast("+5 requêtes API télémétrie enregistrées");
    setTimeout(() => setLastActionToast(null), 3000);
  };

  const handleReset = () => {
    quota.resetQuotas();
    setLastActionToast("Quotas réinitialisés aux valeurs nominales");
    setTimeout(() => setLastActionToast(null), 2500);
  };

  // Helper format numbers
  const formatNum = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return num.toLocaleString();
  };

  // Color progress bar depending on percentage
  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "from-rose-500 to-red-600";
    if (percent >= 75) return "from-amber-500 to-orange-500";
    return "from-emerald-500 to-teal-400";
  };

  // ─────────────────────────────────────────────────────────────
  // VARIANT: PILL (Header / Compact Nav)
  // ─────────────────────────────────────────────────────────────
  if (variant === "pill") {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
            quota.isNearLimit 
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.2)]" 
              : "bg-slate-100 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.1] hover:bg-slate-200 dark:hover:bg-white/[0.08]"
          }`}
          title="Consulter vos quotas d'abonnement et de tokens IA"
        >
          {/* Tier Badge */}
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${quota.config.badgeBg} ${quota.config.badgeColor} border ${quota.config.borderClass}`}>
            {quota.tier.toUpperCase()}
          </span>

          {/* Mini Progress Pill */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Zap className={`w-3.5 h-3.5 ${quota.isNearLimit ? "text-rose-400 animate-pulse" : "text-orange-400"}`} />
            <span className="text-[11px] font-bold text-slate-800 dark:text-neutral-200">
              {formatNum(quota.monthlyTokensUsed)} / {formatNum(quota.monthlyTokensLimit)}
            </span>
            <span className={`text-[10px] font-bold ${quota.isNearLimit ? "text-rose-400" : "text-slate-400 dark:text-neutral-500"}`}>
              ({quota.monthlyTokensPercent}%)
            </span>
          </div>

          {/* Visual Mini Gauge Ring */}
          <div className="w-4 h-4 relative flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-300 dark:text-white/10"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={quota.isNearLimit ? "text-rose-500" : "text-orange-500"}
                strokeDasharray={`${quota.monthlyTokensPercent}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </button>

        {/* Dropdown Popover */}
        {isPopoverOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsPopoverOpen(false)} 
            />
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Compteur Quotas • Forfait {quota.config.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono">
                      Cycle mensuel — Reset dans {quota.daysUntilReset} jours
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPopoverOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar in Popover */}
              <div className="space-y-3 py-3 border-b border-slate-200 dark:border-white/10 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-500 dark:text-neutral-400 pb-1">
                    <span>Jetons IA Gemini :</span>
                    <strong className="text-slate-900 dark:text-white">{quota.monthlyTokensUsed.toLocaleString()} / {quota.monthlyTokensLimit.toLocaleString()}</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getProgressColor(quota.monthlyTokensPercent)} transition-all duration-500`}
                      style={{ width: `${quota.monthlyTokensPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase">Inférences 24h</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatNum(quota.dailyTokensUsed)} / {formatNum(quota.dailyTokensLimit)}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase">Débit API</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {quota.requestsInWindow} / {quota.requestsLimit} req/min
                    </div>
                  </div>
                </div>
              </div>

              {/* Popover Actions */}
              <div className="pt-3 flex items-center justify-between gap-2">
                <button
                  onClick={handleSimulateInference}
                  className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  title="Consommer 350 jetons en direct"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Test -350</span>
                </button>

                <button
                  onClick={() => {
                    setIsPopoverOpen(false);
                    handleOpenPricing();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto"
                >
                  <span>Changer de Plan</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Pricing Modal */}
        {state && (
          <SubscriptionPricingModal
            isOpen={isPricingModalOpen}
            onClose={() => setIsPricingModalOpen(false)}
            state={state}
            isDark={true}
          />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VARIANT: CARD (Dashboard / Overview / Settings Widget)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className={`relative p-5 sm:p-6 rounded-2xl bg-white/95 dark:bg-[#0d0f18]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg space-y-5 transition-all ${className}`}>
      
      {/* Toast Notification */}
      {lastActionToast && (
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-orange-500/90 text-white text-xs font-mono font-medium shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 z-30">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{lastActionToast}</span>
        </div>
      )}

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Compteur de Quotas &amp; Consommation IA
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase ${quota.config.badgeBg} ${quota.config.badgeColor} border ${quota.config.borderClass}`}>
                {quota.config.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Supervision en temps réel des budgets de requêtes, inférences Gemini et appels API.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenPricing}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Recharger / Changer d'Offre</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      {/* Main Big Gauge: Monthly AI Tokens */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-neutral-300">
              Quota Mensuel Jetons IA (Gemini 3.8 Flash) :
            </span>
            {quota.isNearLimit && (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-3 h-3" />
                <span>Attention Seuil &gt; 80%</span>
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            <span>{quota.monthlyTokensUsed.toLocaleString()}</span>
            <span className="text-slate-400 dark:text-neutral-500 text-xs">/ {quota.monthlyTokensLimit.toLocaleString()} tokens</span>
            <span className={`text-xs ml-1.5 font-extrabold ${quota.isNearLimit ? "text-rose-500" : "text-orange-400"}`}>
              ({quota.monthlyTokensPercent}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden p-0.5 border border-slate-300 dark:border-white/5">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(quota.monthlyTokensPercent)} transition-all duration-700 shadow-sm`}
            style={{ width: `${quota.monthlyTokensPercent}%` }}
          />
        </div>

        {/* Sub-metrics row */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 pt-1">
          <div className="flex items-center gap-1">
            <span className="text-emerald-500 font-bold">{quota.monthlyTokensRemaining.toLocaleString()} tokens</span>
            <span>restants avant blocage</span>
          </div>
          <div className="text-slate-400">
            Réinitialisation automatique dans <strong className="text-slate-700 dark:text-neutral-200">{quota.daysUntilReset} jours</strong> (1er du mois)
          </div>
        </div>
      </div>

      {/* 3 Secondary Quota Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        
        {/* 1. Daily Inferences */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-neutral-400 uppercase text-[10px] font-bold">
              Inférences Journalières
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-[11px]">
              {quota.dailyTokensPercent}%
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">
            {formatNum(quota.dailyTokensUsed)} <span className="text-xs text-slate-400 font-normal">/ {formatNum(quota.dailyTokensLimit)}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getProgressColor(quota.dailyTokensPercent)}`}
              style={{ width: `${quota.dailyTokensPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block">Fenêtre glissante 24 heures</span>
        </div>

        {/* 2. Rate Limit (req/min) */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-neutral-400 uppercase text-[10px] font-bold">
              Débit API &amp; Télémétrie
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-[11px]">
              {quota.requestsPercent}%
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">
            {quota.requestsInWindow} <span className="text-xs text-slate-400 font-normal">/ {quota.requestsLimit} req/min</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getProgressColor(quota.requestsPercent)}`}
              style={{ width: `${quota.requestsPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block">Protection anti-DDoS / WAF active</span>
        </div>

        {/* 3. Entitlements & Features */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-neutral-400 uppercase text-[10px] font-bold">
              Modules &amp; Entitlements
            </span>
            <span className="font-bold text-emerald-400 text-[11px]">
              {quota.entitlementsLimit === -1 ? "ILLIMITÉ" : `${quota.entitlementsPercent}%`}
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">
            {quota.entitlementsUsed.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ {quota.entitlementsLimit === -1 ? "∞" : formatNum(quota.entitlementsLimit)}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{ width: quota.entitlementsLimit === -1 ? "100%" : `${quota.entitlementsPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block">Jumeau 3D, UEM, AIOps, Kafka</span>
        </div>

      </div>

      {/* Simulator Actions Bar (Optional) */}
      {showSimulateButtons && (
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-200 dark:border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
              Banc de test temps réel :
            </span>
            <button
              onClick={handleSimulateInference}
              className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/25 font-semibold font-mono flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simuler Inférence (-350 jetons)</span>
            </button>

            <button
              onClick={handleSimulateApiCall}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 font-semibold font-mono flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>+5 Requêtes API</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
            title="Réinitialiser les compteurs aux valeurs nominales"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      )}

      {/* Embedded Pricing Modal */}
      {state && (
        <SubscriptionPricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          state={state}
          isDark={true}
        />
      )}
    </div>
  );
};

export default SubscriptionQuotaCounter;
