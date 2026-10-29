import React from "react";
import { Sparkles, Crown, ArrowRight, X, Shield, Lock, ExternalLink } from "lucide-react";
import { SubscriptionTier } from "../types";

export interface FeatureUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
  requiredTier?: "STARTER" | "PRO" | "ENTERPRISE";
  onUpgrade?: (tier: SubscriptionTier) => void;
  isDark?: boolean;
}

export const FeatureUpgradeModal: React.FC<FeatureUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureTitle = "Module Premium Sous Verrou",
  featureDescription = "Cette fonctionnalité avancée requiert un forfait actif pour votre organisation.",
  requiredTier = "PRO",
  onUpgrade,
  isDark = true,
}) => {
  if (!isOpen) return null;

  const handleSelectTier = (tier: SubscriptionTier) => {
    if (onUpgrade) {
      onUpgrade(tier);
    } else {
      localStorage.setItem("sensorium_subscription_tier", tier);
      localStorage.setItem("sensorium_user_tier", tier);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0c0f17] border border-indigo-500/30 p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow de fond */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête avec couronne */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Palier Requis : {requiredTier}
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {featureTitle}
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          {featureDescription}
        </p>

        {/* Mini Comparatif des Forfaits */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">Plan Pro</div>
              <div className="text-2xl font-extrabold text-white mt-1">99 €<span className="text-xs text-slate-400 font-normal">/m</span></div>
              <ul className="text-xs text-slate-300 space-y-1 mt-3">
                <li>✓ Copilote IA Gemini</li>
                <li>✓ Télécommande UEM &amp; OTA</li>
                <li>✓ Télémétrie Kafka Sub-seconde</li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectTier("pro")}
              className="mt-4 w-full py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              Passer en Pro
            </button>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">Plan Enterprise</div>
              <div className="text-2xl font-extrabold text-white mt-1">299 €<span className="text-xs text-slate-400 font-normal">/m</span></div>
              <ul className="text-xs text-slate-300 space-y-1 mt-3">
                <li>✓ Appliance Souveraine Sur-Site</li>
                <li>✓ Zero-Trust Matériel HSM</li>
                <li>✓ SLA 99.99% &amp; Support Dédié</li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectTier("enterprise")}
              className="mt-4 w-full py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white transition-opacity cursor-pointer"
            >
              Passer en Enterprise
            </button>
          </div>
        </div>

        {/* Liens de bas de modal */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
          <a
            href="/site/tarifs.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
          >
            <span>Voir la grille tarifaire complète</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => handleSelectTier("pro")}
            className="text-slate-400 hover:text-white underline cursor-pointer"
          >
            Activer l'essai 14 jours (Démo)
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureUpgradeModal;
