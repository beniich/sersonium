import React, { useState, useEffect } from "react";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { FeatureUpgradeModal } from "./FeatureUpgradeModal";
import { SubscriptionTier } from "../types";

export interface FeatureGateProps {
  children: React.ReactNode;
  requiredTier?: "STARTER" | "PRO" | "ENTERPRISE";
  featureTitle?: string;
  featureDescription?: string;
  onUpgrade?: (tier: SubscriptionTier) => void;
  isDark?: boolean;
  /** Passer le tier depuis le state global React pour une réactivité immédiate */
  currentSubscriptionTier?: SubscriptionTier;
}

const TIER_RANK: Record<string, number> = {
  FREE: 0,
  STARTER: 1,
  SILVER: 1,   // "silver" est un alias de STARTER dans l'UI
  PRO: 2,
  ENTERPRISE: 3,
};

/** Lit le tier depuis localStorage de façon sûre. Retourne "FREE" par défaut. */
function readLocalTier(): string {
  if (typeof localStorage === "undefined") return "FREE";
  const stored =
    localStorage.getItem("sensorium_subscription_tier") ||
    localStorage.getItem("sensorium_user_tier") ||
    "free";
  return stored.toUpperCase();
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  requiredTier = "PRO",
  featureTitle = "Module Réservé",
  featureDescription = "Ce module est réservé aux abonnements actifs de niveau supérieur.",
  onUpgrade,
  isDark = true,
  currentSubscriptionTier,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // État réactif du tier : priorité au prop React (mis à jour par onUpgradeTier),
  // fallback sur localStorage pour la persistance entre pages.
  const [localTierKey, setLocalTierKey] = useState<string>(readLocalTier);

  // BUG-03 CORRIGÉ : Écoute des événements SENSORIUM + storage (cross-tab)
  // Suppression du polling setInterval — les events custom sont instantanés
  useEffect(() => {
    const sync = () => setLocalTierKey(readLocalTier());
    window.addEventListener("storage", sync);
    window.addEventListener("sensorium:quota_updated", sync);
    window.addEventListener("sensorium:subscription_changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("sensorium:quota_updated", sync);
      window.removeEventListener("sensorium:subscription_changed", sync);
    };
  }, []);

  // Détermine le rang effectif : le prop React est prioritaire
  const effectiveTierKey = currentSubscriptionTier
    ? currentSubscriptionTier.toUpperCase()
    : localTierKey;

  const userRank = TIER_RANK[effectiveTierKey] ?? 0;   // ← fallback 0 = FREE (pas 1)
  const requiredRank = TIER_RANK[requiredTier] ?? 2;

  // Si le palier est suffisant, on affiche directement le contenu
  if (userRank >= requiredRank) {
    return <>{children}</>;
  }

  // Sinon, on affiche le placeholder élégant avec invitation à la mise à niveau
  return (
    <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 backdrop-blur-xs">
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Lock className="w-7 h-7 text-amber-400" />
        </div>

        <div className="space-y-2 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Crown className="w-3.5 h-3.5" />
            <span>Niveau Requis : {requiredTier}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {featureTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {featureDescription}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
        >
          <span>Déverrouiller avec le Forfait {requiredTier}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <FeatureUpgradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        featureTitle={featureTitle}
        featureDescription={featureDescription}
        requiredTier={requiredTier}
        onUpgrade={(tier) => {
          setLocalTierKey(tier.toUpperCase());
          if (onUpgrade) onUpgrade(tier);
        }}
        isDark={isDark}
      />
    </div>
  );
};

export default FeatureGate;
