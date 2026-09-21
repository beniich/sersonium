import React, { useState } from "react";
import { 
  Check, 
  X, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Zap, 
  Cpu, 
  TrendingDown, 
  FileText, 
  Globe, 
  Lock,
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { useLanguage } from "../App";
import { GlobalState, SubscriptionTier } from "../types";
import { logAuditEvent } from "../hooks/useGlobalState";
import PayPalSmartButton from "./PayPalSmartButton";

interface SubscriptionPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GlobalState;
  onUpgradeSuccess?: (tier: SubscriptionTier) => void;
  isDark: boolean;
}

export default function SubscriptionPricingModal({
  isOpen,
  onClose,
  state,
  onUpgradeSuccess,
  isDark
}: SubscriptionPricingModalProps) {
  const { language } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");

  const currentTier: SubscriptionTier = state.subscriptionTier || "free";

  if (!isOpen) return null;

  const handlePayPalSuccess = async (details: { subscriptionId: string; planId: string }) => {
    setTransactionId(details.subscriptionId);
    setPaymentSuccess(true);
    
    // Determine tier from planId
    const newTier = details.planId === "P-2PN232575Y225210YNKY3QZQ" ? "pro" : "silver";
    localStorage.setItem("sensorium_subscription_tier", newTier);
    if (onUpgradeSuccess) {
      onUpgradeSuccess(newTier);
    }

    await logAuditEvent(
      "SUBSCRIPTION_UPGRADED_PAYPAL",
      `Subscription upgraded to ${newTier.toUpperCase()} via PayPal Subscription (ID: ${details.subscriptionId})`
    );
  };

  const handleDowngrade = async () => {
    localStorage.setItem("sensorium_subscription_tier", "free");
    if (onUpgradeSuccess) {
      onUpgradeSuccess("free");
    }
    await logAuditEvent("SUBSCRIPTION_DOWNGRADED", "Subscription switched to FREE plan");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.1] rounded-3xl shadow-2xl w-full max-w-4xl p-6 sm:p-8 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentSuccess ? (
          /* Payment Success View */
          <div className="text-center py-8 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {language === "fr" ? "Félicitations ! Vous êtes Membre Pro" : "Congratulations! You are now a Pro Member"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
                {language === "fr" 
                  ? "Votre paiement PayPal a été validé. Toutes les fonctionnalités professionnelles sont immédiatement déverrouillées."
                  : "Your PayPal payment has been confirmed. All pro features and AI analytics are now unlocked."}
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-xs font-mono space-y-1 text-slate-600 dark:text-neutral-300">
              <div className="flex justify-between">
                <span>Transaction Order ID:</span>
                <span className="font-bold text-orange-500">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Statut :</span>
                <span className="text-emerald-500 font-bold">COMPLETED / CAPTURED</span>
              </div>
              <div className="flex justify-between">
                <span>Rôle Utilisateur :</span>
                <span className="text-amber-500 font-bold">PRO (Enterprise)</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  setPaymentSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
              >
                {language === "fr" ? "Accéder au Tableau de Bord Pro" : "Go to Pro Dashboard"}
              </button>
            </div>
          </div>
        ) : (
          /* Pricing Comparison View */
          <div className="space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold">
                <Crown className="w-3.5 h-3.5" />
                <span>{language === "fr" ? "OFFRE & TARIFICATION PROFESSIONNELLE" : "PROFESSIONAL PRICING PLANS"}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {language === "fr" ? "Choisissez la puissance adaptée à votre infrastructure" : "Choose the power tailored to your infrastructure"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
                {language === "fr" 
                  ? "Passez au niveau supérieur avec l'IA de maintenance prédictive par régression linéaire, les exports exécutifs et le monitoring continu."
                  : "Supercharge your operations with linear regression predictive maintenance, executive PDF exports, and continuous streaming."}
              </p>

              {/* Billing Cycle Switcher */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] mt-2">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    billingCycle === "monthly" 
                      ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-2xs" 
                      : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {language === "fr" ? "Mensuel" : "Monthly"}
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    billingCycle === "yearly" 
                      ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-2xs" 
                      : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{language === "fr" ? "Annuel" : "Yearly"}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    -15%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Carte LITE (Gratuit) */}
              <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                currentTier === "free"
                  ? "bg-slate-50/80 dark:bg-white/[0.02] border-slate-300 dark:border-white/20 ring-1 ring-slate-300 dark:ring-white/20"
                  : "bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/[0.07]"
              }`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Plan Lite</h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                        {language === "fr" ? "Pour découverte et monitoring basique" : "For discovery and basic surveillance"}
                      </p>
                    </div>
                    {currentTier === "free" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-neutral-300 font-bold">
                        {language === "fr" ? "PLAN ACTUEL" : "CURRENT PLAN"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">0€</span>
                    <span className="text-xs text-slate-500 dark:text-neutral-400">
                      /{language === "fr" ? "mois" : "month"}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-600 dark:text-neutral-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{language === "fr" ? "Supervision Edge & Télémétrie de base" : "Edge supervision & basic telemetry"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{language === "fr" ? "Jusqu'à 3 Ordres de Travail CAFM" : "Up to 3 CAFM Work Orders"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{language === "fr" ? "Mode Hors-Ligne & PWA Cache" : "Offline mode & PWA cache"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-neutral-500">
                      <X className="w-4 h-4 text-slate-300 dark:text-neutral-600 shrink-0" />
                      <span>{language === "fr" ? "Maintenance Prédictive IA (Régression Linéaire)" : "Predictive Maintenance AI (Linear Regression)"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-neutral-500">
                      <X className="w-4 h-4 text-slate-300 dark:text-neutral-600 shrink-0" />
                      <span>{language === "fr" ? "Exports PDF A4 Stratégiques & CSV Illimités" : "Strategic PDF A4 & Unlimited CSV Exports"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-neutral-500">
                      <X className="w-4 h-4 text-slate-300 dark:text-neutral-600 shrink-0" />
                      <span>{language === "fr" ? "Streaming Kafka Haute Fréquence" : "High-Frequency Kafka Streaming"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  {currentTier === "free" ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-neutral-500 font-semibold rounded-xl text-xs text-center cursor-default"
                    >
                      {language === "fr" ? "Plan Actif" : "Active Plan"}
                    </button>
                  ) : (
                    <button
                      onClick={handleDowngrade}
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-neutral-200 font-medium rounded-xl text-xs text-center transition-colors cursor-pointer"
                    >
                      {language === "fr" ? "Repasser au plan Lite" : "Switch back to Lite"}
                    </button>
                  )}
                </div>
              </div>

              {/* Carte PRO (Payant / Populaire) */}
              <div className={`p-6 rounded-2xl border relative flex flex-col justify-between transition-all ${
                currentTier === "pro"
                  ? "bg-amber-500/[0.03] dark:bg-amber-500/[0.05] border-amber-500/50 ring-2 ring-amber-500/30 shadow-lg shadow-orange-500/5"
                  : "bg-gradient-to-b from-orange-500/[0.04] to-transparent dark:from-orange-500/[0.08] border-orange-500/30 hover:border-orange-500/60 shadow-lg"
              }`}>
                {/* Popular Badge */}
                <div className="absolute -top-3 right-6">
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{language === "fr" ? "RECOMMANDÉ / PRO" : "RECOMMENDED"}</span>
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Plan Pro Enterprise</h3>
                        <Crown className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                        {language === "fr" ? "Pour les entreprises et équipes de maintenance" : "For enterprise teams & continuous operations"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {billingCycle === "yearly" ? "499€" : "49€"}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-neutral-400">
                      /{billingCycle === "yearly" ? (language === "fr" ? "an" : "year") : (language === "fr" ? "mois" : "month")}
                    </span>
                    {billingCycle === "yearly" && (
                      <span className="ml-2 text-[10px] font-mono text-emerald-500 font-bold">
                        (41.5€/mois)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-700 dark:text-neutral-200 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-500 shrink-0" />
                      <span><strong>{language === "fr" ? "Maintenance Prédictive IA :" : "Predictive Maintenance AI:"}</strong> {language === "fr" ? "Calcul Régression Linéaire & TTF" : "Linear Regression & TTF Forecast"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-500 shrink-0" />
                      <span><strong>{language === "fr" ? "Rapports Stratégiques :" : "Executive Reports:"}</strong> {language === "fr" ? "Générateur PDF A4 & Export CSV" : "PDF A4 & CSV Export"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{language === "fr" ? "Streaming Kafka & Télémétrie Haute Fréquence" : "Kafka Streaming & High-Frequency Telemetry"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{language === "fr" ? "Floor Plan Interactif 2D & Google Maps 3D" : "Interactive 2D Floor Plan & Google Maps 3D"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{language === "fr" ? "Mitigation WAF & Anti-DDoS Automatisée" : "Automated WAF & Anti-DDoS Mitigation"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{language === "fr" ? "Support Ingénieur Dédié 24/7 (SLA 99.99%)" : "24/7 Dedicated Engineer Support (SLA 99.99%)"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-2">
                  {currentTier === "pro" ? (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === "fr" ? "Abonnement Pro Actif" : "Pro Subscription Active"}</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                      <PayPalSmartButton
                        planId="P-2PN232575Y225210YNKY3QZQ"
                        onSuccess={handlePayPalSuccess}
                        isDark={isDark}
                      />
                    </div>
                  )}
                  <p className="text-[10px] text-center text-slate-400 dark:text-neutral-500">
                    {language === "fr" ? "Paiement sécurisé crypté SSL via PayPal SDK. Annulation possible à tout moment." : "Secure SSL encrypted payment via PayPal SDK. Cancel anytime."}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
