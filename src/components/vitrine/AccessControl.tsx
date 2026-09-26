import React from "react";
import { Lock, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { SubscriptionTier } from "../../types";

export interface AccessControlProps {
  children: React.ReactNode;
  requiredTier: SubscriptionTier;
  userTier?: SubscriptionTier;
  moduleName?: string;
  onUpgrade?: (tier: SubscriptionTier) => void;
  inline?: boolean;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  silver: 1, // Edge Explorer
  pro: 2,    // Sovereign Ops
  enterprise: 3 // Titan Sovereign
};

const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  free: "Free Community",
  silver: "Edge Explorer (Tier 02)",
  pro: "Sovereign Ops (Tiers 01-04)",
  enterprise: "Titan Sovereign (Full Stack + X1)"
};

export const AccessControl: React.FC<AccessControlProps> = ({
  children,
  requiredTier,
  userTier = "free",
  moduleName = "Module Haute Technologie",
  onUpgrade,
  inline = false
}) => {
  const currentLevel = TIER_LEVELS[userTier] ?? 0;
  const targetLevel = TIER_LEVELS[requiredTier] ?? 0;

  // Si l'utilisateur possède le niveau requis ou supérieur, accès autorisé
  if (currentLevel >= targetLevel) {
    return <>{children}</>;
  }

  // Paywall B2B avec effet glassmorphism & flou
  return (
    <div className="relative group overflow-hidden rounded-2xl">
      {/* Contenu flouté en arrière-plan */}
      <div className="filter blur-md pointer-events-none select-none opacity-40 transition-all duration-300">
        {children}
      </div>

      {/* Overlay Paywall B2B */}
      <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-gradient-to-b from-black/60 via-[#070709]/85 to-black/95 backdrop-blur-sm">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[#0d0d12]/95 border border-amber-500/30 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Accès Réservé • {TIER_DISPLAY_NAMES[requiredTier]}
            </span>
            <h4 className="text-lg font-bold text-white tracking-tight">
              {moduleName}
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Ce module d'infrastructure critique nécessite le niveau de souscription{" "}
              <strong className="text-white">{TIER_DISPLAY_NAMES[requiredTier]}</strong> ou supérieur.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-neutral-300 flex items-center justify-between">
            <span className="text-neutral-500">Votre statut actuel :</span>
            <span className="text-amber-400 font-semibold uppercase">{userTier}</span>
          </div>

          <button
            onClick={() => onUpgrade?.(requiredTier)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Débloquer ce palier ({TIER_DISPLAY_NAMES[requiredTier]})</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessControl;
