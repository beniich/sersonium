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
  RefreshCw, 
  HelpCircle, 
  Activity, 
  Sliders, 
  Layers, 
  Database, 
  Users, 
  ShieldAlert,
  Server,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";
import { useLanguage } from "../App";
import { GlobalState, SubscriptionTier } from "../types";
import { logAuditEvent } from "../hooks/useGlobalState";
import PayPalSmartButton from "../components/PayPalSmartButton";

interface PricingPageProps {
  state: GlobalState;
  isDark: boolean;
  onUpgradeTier?: (tier: SubscriptionTier) => void;
  onSelectTab?: (id: string) => void;
}

interface FeatureComparisonRow {
  name: string;
  description: string;
  category: "core" | "ai" | "telemetry" | "security" | "storage" | "governance";
  lite: boolean | string;
  pro: boolean | string;
  isHighlight?: boolean;
}

export default function PricingPage({
  state,
  isDark,
  onUpgradeTier,
  onSelectTab
}: PricingPageProps) {
  const { language } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  const [payPalPaymentSuccess, setPayPalPaymentSuccess] = useState(false);
  const [payPalTxId, setPayPalTxId] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [customOrderNote, setCustomOrderNote] = useState("");

  const currentTier: SubscriptionTier = state?.subscriptionTier || "free";
  const isSilver = currentTier === "silver";
  const isPro = currentTier === "pro";
  const isEnterprise = currentTier === "enterprise";

  const handlePayPalSuccess = async (details: { subscriptionId: string; planId: string }) => {
    setPayPalTxId(details.subscriptionId);
    setPayPalPaymentSuccess(true);
    
    // Determine which plan was bought based on planId
    const newTier: SubscriptionTier =
      details.planId === "P-2PN232575Y225210YNKY3QZQ" ? "enterprise"
      : details.planId === "P-44Y462991D576054FNKY3PKI" ? "pro"
      : "silver";

    // Update local storage and app state
    if (typeof window !== "undefined") {
      localStorage.setItem("sensorium_subscription_tier", newTier);
    }
    if (state) {
      state.subscriptionTier = newTier;
    }
    if (onUpgradeTier) {
      onUpgradeTier(newTier);
    }

    await logAuditEvent(
      "PAYPAL_SUBSCRIPTION_SUCCESS",
      `Subscription upgraded to ${newTier.toUpperCase()} Plan via PayPal Subscription (ID: ${details.subscriptionId})`
    );
  };

  const handleDowngrade = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sensorium_subscription_tier", "free");
    }
    if (state) {
      state.subscriptionTier = "free";
    }
    if (onUpgradeTier) {
      onUpgradeTier("free");
    }
    await logAuditEvent("SUBSCRIPTION_DOWNGRADED_FREE", "Subscription reverted to FREE Tier.");
  };

  const comparisonFeatures: FeatureComparisonRow[] = [
    // Core & Edge
    {
      name: language === "fr" ? "Supervision Edge & NÅ“uds DistribuÃ©s" : "Distributed Edge Nodes Monitoring",
      description: language === "fr" ? "TÃ©lÃ©mÃ©trie CPU, RAM, bande passante & latence Anycast" : "CPU, RAM, bandwidth & Anycast latency metrics",
      category: "core",
      lite: language === "fr" ? "Jusqu'Ã  3 nÅ“uds" : "Up to 3 nodes",
      pro: language === "fr" ? "NÅ“uds illimitÃ©s" : "Unlimited fleet nodes"
    },
    {
      name: language === "fr" ? "Gestion des Ordres de Travail (GMAO / CAFM)" : "Work Orders Management (CMMS / CAFM)",
      description: language === "fr" ? "Attribution des tickets d'intervention et suivi des statuts" : "Work order dispatching & resolution tracking",
      category: "core",
      lite: language === "fr" ? "3 tickets max" : "3 active tickets max",
      pro: language === "fr" ? "Tickets & historique illimitÃ©s" : "Unlimited tickets & history"
    },
    {
      name: language === "fr" ? "PWA & Mode Hors-Ligne RÃ©silient" : "PWA & Resilient Offline Cache",
      description: language === "fr" ? "Stockage local IndexedDB & synchronisation automatique" : "IndexedDB caching & background reconnect sync",
      category: "core",
      lite: true,
      pro: true
    },

    // AI & Analytics
    {
      name: language === "fr" ? "Maintenance PrÃ©dictive IA (RÃ©gression LinÃ©aire)" : "Predictive Maintenance AI (Linear Regression)",
      description: language === "fr" ? "ModÃ¨le y = mx + b pour calculer la dÃ©gradation et estimer le TTF (jours avant panne)" : "Mathematical model calculating wear slope & Time-To-Failure (TTF)",
      category: "ai",
      lite: false,
      pro: true,
      isHighlight: true
    },
    {
      name: language === "fr" ? "PrÃ©vision d'Anomalie SMART & PUE Ã‰nergÃ©tique" : "SMART Disk Wear & PUE Energy Anomaly Forecast",
      description: language === "fr" ? "DÃ©tection prÃ©coce d'usure des disques NVMe et surconsommation CVC" : "Early NVMe wear detection & HVAC energy overshoot alerts",
      category: "ai",
      lite: false,
      pro: true,
      isHighlight: true
    },
    {
      name: language === "fr" ? "Assistant IA Grounding & TÃ©lÃ©mÃ©trie" : "AI Grounding Assistant & Telemetry Query",
      description: language === "fr" ? "Questions en langage naturel sur l'Ã©tat de l'infrastructure" : "Natural language interrogation of fleet telemetry",
      category: "ai",
      lite: language === "fr" ? "RequÃªtes limitÃ©es" : "Limited queries",
      pro: language === "fr" ? "RequÃªtes illimitÃ©es (Gemini Pro)" : "Unlimited queries (Gemini Pro)"
    },

    // Telemetry & Streaming
    {
      name: language === "fr" ? "Streaming Kafka Haute FrÃ©quence" : "High-Frequency Kafka Event Streaming",
      description: language === "fr" ? "Topics Kafka temps rÃ©el, inspection d'offsets et schÃ©ma Avro" : "Real-time Kafka topics, partition offsets & Avro schemas",
      category: "telemetry",
      lite: false,
      pro: true
    },
    {
      name: language === "fr" ? "FrÃ©quence de RafraÃ®chissement TÃ©lÃ©mÃ©trie" : "Telemetry Refresh Sampling Rate",
      description: language === "fr" ? "Intervalle d'Ã©chantillonnage des mÃ©triques capteurs" : "Polling & websocket sample rate",
      category: "telemetry",
      lite: "10s",
      pro: "1s (Temps RÃ©el)"
    },

    // Security & WAF
    {
      name: language === "fr" ? "Mitigation DDoS Layer 7 & RÃ¨gles WAF" : "Layer 7 DDoS Mitigation & WAF Rules",
      description: language === "fr" ? "Filtrage d'attaques volumÃ©triques et blocage automatisÃ©" : "Volumetric attack defense & automated rule triggering",
      category: "security",
      lite: language === "fr" ? "Protection basique" : "Basic protection",
      pro: language === "fr" ? "Mitigation avancÃ©e <3ms" : "Advanced mitigation <3ms"
    },
    {
      name: language === "fr" ? "Chiffrement FIPS 140-3 & Audit Logs Immuables" : "FIPS 140-3 Encryption & Immutable Audit Logs",
      description: language === "fr" ? "Journalisation cryptographique des accÃ¨s et modifications" : "Cryptographic tamper-proof logging of all actions",
      category: "security",
      lite: language === "fr" ? "24h de rÃ©tention" : "24h retention",
      pro: language === "fr" ? "RÃ©tention illimitÃ©e & Export" : "Unlimited retention & Export"
    },

    // Storage & Governance
    {
      name: language === "fr" ? "Exports StratÃ©giques PDF A4 & Tableurs CSV" : "Strategic Executive PDF A4 & CSV Spreadsheets",
      description: language === "fr" ? "Rapports d'audit prÃªts pour la direction et commissaires aux comptes" : "Board-ready audit reports with charts & metrics",
      category: "governance",
      lite: false,
      pro: true,
      isHighlight: true
    },
    {
      name: language === "fr" ? "Support Technique & SLA DisponibilitÃ©" : "Technical Support & Availability SLA",
      description: language === "fr" ? "Temps de rÃ©ponse garanti pour les infrastructures critiques" : "Guaranteed response time for critical infrastructure",
      category: "governance",
      lite: "CommunautÃ© / 48h",
      pro: "DÃ©diÃ© 24/7 / SLA 99.99%"
    }
  ];

  const faqs = [
    {
      q: language === "fr" ? "Comment fonctionne la facturation PayPal ?" : "How does PayPal billing work?",
      a: language === "fr" 
        ? "Le paiement est opÃ©rÃ© de maniÃ¨re totalement sÃ©curisÃ©e via l'API PayPal. Vous pouvez payer par compte PayPal ou carte bancaire. Les abonnements sont renouvelÃ©s automatiquement chaque mois ou chaque annÃ©e selon votre choix."
        : "Payment is securely processed via the PayPal API SDK. You can pay using your PayPal balance or credit card. Subscriptions renew automatically monthly or annually based on your selection."
    },
    {
      q: language === "fr" ? "Puis-je changer ou rÃ©silier mon abonnement Ã  tout moment ?" : "Can I switch or cancel my plan anytime?",
      a: language === "fr"
        ? "Oui, vous pouvez passer du plan Pro au plan Lite en un clic sans frais ni pÃ©nalitÃ©. Vos donnÃ©es restent conservÃ©es en toute sÃ©curitÃ©."
        : "Yes, you can upgrade, downgrade, or cancel anytime with zero cancellation fees. Your telemetry data remains safely intact."
    },
    {
      q: language === "fr" ? "La maintenance prÃ©dictive par rÃ©gression linÃ©aire est-elle incluse dans le plan Lite ?" : "Is linear regression predictive maintenance included in the Lite plan?",
      a: language === "fr"
        ? "Le plan Lite offre la tÃ©lÃ©mÃ©trie de base et la dÃ©tection de seuils simples. Le modÃ¨le mathÃ©matique de rÃ©gression linÃ©aire avancÃ©e et le calcul du TTF (Time To Failure) nÃ©cessitent le plan Pro."
        : "The Lite plan includes standard threshold alerts. Advanced mathematical linear regression modeling and Time-To-Failure (TTF) forecasting are exclusive to the Pro plan."
    }
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold tracking-wide">
          <Crown className="w-4 h-4" />
          <span>{language === "fr" ? "TARIFICATION & PLANS D'ABONNEMENT" : "SUBSCRIPTION TIERS & PRICING"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {language === "fr" ? "La puissance industrielle Ã  la mesure de vos besoins" : "Enterprise Performance Sized for Your Scale"}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto">
          {language === "fr"
            ? "DÃ©ployez votre supervision Edge avec le plan Lite gratuit, ou dÃ©bloquez l'IA de rÃ©gression linÃ©aire, les exports exÃ©cutifs et le streaming Kafka avec le plan Pro."
            : "Supercharge your Edge operations with the Free Lite plan, or unlock linear regression predictive AI, executive PDF exports, and Kafka streaming with Pro."}
        </p>

        {/* Billing Cycle Switcher */}
        <div className="pt-3 flex justify-center">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] shadow-xs">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "monthly" 
                  ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {language === "fr" ? "Facturation Mensuelle" : "Monthly Billing"}
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                billingCycle === "yearly" 
                  ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{language === "fr" ? "Facturation Annuelle" : "Annual Billing"}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold">
                {language === "fr" ? "2 MOIS OFFERTS" : "-15% OFF"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid â€” 1 col â†’ 2 cols (md) â†’ 4 cols (xl) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">

        {/* â”€â”€ FREE CARD â”€â”€ */}
        <div className={`rounded-3xl p-6 flex flex-col justify-between border transition-all duration-200 ${
          currentTier === "free"
            ? "bg-white dark:bg-[#111114] border-slate-300 dark:border-white/20 shadow-md ring-1 ring-slate-300 dark:ring-white/20"
            : "bg-white dark:bg-[#0c0c0e] border-slate-200 dark:border-white/[0.07] shadow-xs"
        }`}>
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {language === "fr" ? "DÃ‰COUVERTE" : "STARTER"}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Free</h3>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  {language === "fr" ? "L'essentiel pour dÃ©buter." : "The essentials to get started."}
                </p>
              </div>
              {currentTier === "free" && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/[0.1]">
                  {language === "fr" ? "ACTUEL" : "ACTIVE"}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">0â‚¬</span>
              <span className="text-[11px] text-slate-400">/{language === "fr" ? "mois" : "month"}</span>
            </div>
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-[11px]">
              {[
                language === "fr" ? "1 Organisation maximum" : "1 Organization max",
                language === "fr" ? "AccÃ¨s limitÃ© aux tableaux de bord" : "Limited dashboard access",
                language === "fr" ? "DonnÃ©es mises Ã  jour toutes les heures" : "Hourly data refresh",
                language === "fr" ? "Support communautaire" : "Community support",
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-600 dark:text-neutral-400">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6">
            {currentTier === "free" ? (
              <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-neutral-400 text-xs font-bold text-center border border-slate-200 dark:border-white/[0.06]">
                {language === "fr" ? "Plan actuel" : "Current Plan"}
              </div>
            ) : (
              <button onClick={handleDowngrade} className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-neutral-200 text-xs font-bold text-center transition-colors cursor-pointer border border-slate-200 dark:border-white/[0.08]">
                {language === "fr" ? "Passer au Free" : "Switch to Free"}
              </button>
            )}
          </div>
        </div>

        {/* â”€â”€ SILVER CARD â”€â”€ */}
        <div className={`rounded-3xl p-6 flex flex-col justify-between border transition-all duration-200 ${
          currentTier === "silver"
            ? "bg-slate-50 dark:bg-slate-900/80 border-slate-400 dark:border-slate-500 shadow-lg ring-1 ring-slate-400"
            : "bg-white dark:bg-[#0c0c0e] border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/20 shadow-xs"
        }`}>
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-wider">
                  {language === "fr" ? "PILOTAGE OPTIMISÃ‰" : "PROFESSIONALS"}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Silver</h3>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  {language === "fr" ? "Le pilotage optimisÃ©." : "Optimized operations monitoring."}
                </p>
              </div>
              {currentTier === "silver" && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {language === "fr" ? "ACTUEL" : "ACTIVE"}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">36â‚¬</span>
              <span className="text-[11px] text-slate-400">/{language === "fr" ? "mois" : "month"}</span>
            </div>
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-[11px]">
              {[
                language === "fr" ? "Jusqu'Ã  3 Organisations" : "Up to 3 Organizations",
                language === "fr" ? "Streaming Kafka en temps rÃ©el" : "Real-time Kafka streaming",
                language === "fr" ? "Rapports carbone mensuels" : "Monthly carbon reports",
                language === "fr" ? "Support par email" : "Email support",
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-neutral-300">
                  <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 space-y-2">
            {currentTier === "silver" ? (
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === "fr" ? "Abonnement Silver Actif" : "Silver Plan Active"}</span>
              </div>
            ) : payPalPaymentSuccess ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === "fr" ? "Paiement validÃ© !" : "Payment confirmed!"}</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                <PayPalSmartButton planId="P-0RJ6785234422590FNKY3NXI" onSuccess={handlePayPalSuccess} isDark={isDark} />
              </div>
            )}
          </div>
        </div>

        {/* â”€â”€ PRO CARD â­ Most Popular â”€â”€ */}
        <div className={`rounded-3xl p-6 flex flex-col justify-between border relative transition-all duration-200 ${
          currentTier === "pro"
            ? "bg-gradient-to-b from-amber-500/[0.08] to-transparent border-amber-500/50 shadow-xl ring-2 ring-amber-500/30"
            : "bg-gradient-to-b from-orange-500/[0.05] to-transparent border-orange-500/40 hover:border-orange-500/70 shadow-lg"
        }`}>
          {/* Most Popular Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="px-3.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3 h-3" />
              <span>{language === "fr" ? "LE PLUS POPULAIRE" : "MOST POPULAR"}</span>
            </span>
          </div>
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-wider">
                  {language === "fr" ? "PUISSANCE INDUSTRIELLE" : "INDUSTRIAL POWER"}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pro</h3>
                  <Crown className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  {language === "fr" ? "La puissance industrielle." : "Full industrial power."}
                </p>
              </div>
              {currentTier === "pro" && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {language === "fr" ? "ACTUEL" : "ACTIVE"}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">420â‚¬</span>
              <span className="text-[11px] text-slate-400">/{language === "fr" ? "mois" : "month"}</span>
            </div>
            <div className="space-y-2.5 pt-3 border-t border-orange-500/10 text-[11px]">
              {[
                language === "fr" ? "Jusqu'Ã  15 Organisations" : "Up to 15 Organizations",
                language === "fr" ? "SÃ©curitÃ© ZTNA (Zero Trust)" : "ZTNA Zero Trust Security",
                language === "fr" ? "Analyses prÃ©dictives & alertes IA" : "Predictive analytics & AI alerts",
                language === "fr" ? "Exports CSV / JSON avancÃ©s" : "Advanced CSV / JSON exports",
                language === "fr" ? "Support prioritaire" : "Priority support",
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-800 dark:text-neutral-100 font-medium">
                  <Check className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 space-y-2">
            {currentTier === "pro" ? (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === "fr" ? "Abonnement Pro Actif" : "Pro Plan Active"}</span>
              </div>
            ) : payPalPaymentSuccess ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === "fr" ? "Paiement validÃ© !" : "Payment confirmed!"}</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                <PayPalSmartButton planId="P-44Y462991D576054FNKY3PKI" onSuccess={handlePayPalSuccess} isDark={isDark} />
              </div>
            )}
            <p className="text-[10px] text-center text-slate-400">{language === "fr" ? "RÃ©siliation en 1 clic. Aucune pÃ©nalitÃ©." : "Cancel anytime. No penalty."}</p>
          </div>
        </div>

        {/* â”€â”€ ENTERPRISE CARD â”€â”€ */}
        <div className={`rounded-3xl p-6 flex flex-col justify-between border relative transition-all duration-200 ${
          currentTier === "enterprise"
            ? "bg-gradient-to-b from-violet-500/[0.08] to-transparent border-violet-500/50 shadow-xl ring-2 ring-violet-500/30"
            : "bg-gradient-to-b from-violet-500/[0.03] to-transparent border-violet-500/20 hover:border-violet-500/50 shadow-md"
        }`}>
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-violet-500 uppercase tracking-wider">
                  {language === "fr" ? "CONTRÃ”LE TOTAL" : "TOTAL CONTROL"}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Enterprise</h3>
                  <Server className="w-4 h-4 text-violet-500" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  {language === "fr" ? "Le contrÃ´le total et sÃ©curisÃ©." : "Total control & security."}
                </p>
              </div>
              {currentTier === "enterprise" && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  {language === "fr" ? "ACTUEL" : "ACTIVE"}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">1 200â‚¬</span>
              <span className="text-[11px] text-slate-400">/{language === "fr" ? "mois" : "month"}</span>
            </div>
            <div className="space-y-2.5 pt-3 border-t border-violet-500/10 text-[11px]">
              {[
                language === "fr" ? "Organisations & utilisateurs illimitÃ©s" : "Unlimited orgs & users",
                language === "fr" ? "Infrastructure dÃ©diÃ©e On-Premise" : "Dedicated On-Premise infrastructure",
                language === "fr" ? "Audit de sÃ©curitÃ© trimestriel" : "Quarterly security audit",
                language === "fr" ? "AccÃ¨s API complet & non limitÃ©" : "Full & unlimited API access",
                language === "fr" ? "Gestionnaire de compte dÃ©diÃ© 24/7" : "Dedicated account manager 24/7",
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-800 dark:text-neutral-100 font-medium">
                  <Check className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 space-y-2">
            {currentTier === "enterprise" ? (
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-600 dark:text-violet-400 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === "fr" ? "Abonnement Enterprise Actif" : "Enterprise Plan Active"}</span>
              </div>
            ) : payPalPaymentSuccess ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === "fr" ? "Paiement validÃ© !" : "Payment confirmed!"}</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                <PayPalSmartButton planId="P-2PN232575Y225210YNKY3QZQ" onSuccess={handlePayPalSuccess} isDark={isDark} />
              </div>
            )}
          </div>
        </div>

      </div>


      {/* Comprehensive Feature Comparison Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              <span>{language === "fr" ? "Tableau Comparatif DÃ©taillÃ© des FonctionnalitÃ©s" : "Detailed Feature Comparison Matrix"}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              {language === "fr" ? "Comparez point par point les capacitÃ©s des formules Lite et Pro." : "Compare capabilities across engineering, AI and governance tiers."}
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-neutral-300 self-start sm:self-auto">
            {comparisonFeatures.length} {language === "fr" ? "critÃ¨res analysÃ©s" : "criteria analyzed"}
          </span>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-neutral-400 font-mono text-[11px]">
                <th className="py-3 px-4 w-1/2">{language === "fr" ? "FonctionnalitÃ© & Module" : "Feature & Module"}</th>
                <th className="py-3 px-4 text-center w-1/4">{language === "fr" ? "Plan Lite (Gratuit)" : "Lite Plan (Free)"}</th>
                <th className="py-3 px-4 text-center w-1/4 text-orange-500 font-bold">{language === "fr" ? "Plan Pro Entreprise" : "Pro Enterprise Plan"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {comparisonFeatures.map((row, idx) => (
                <tr 
                  key={idx}
                  className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${
                    row.isHighlight ? "bg-orange-500/[0.02] dark:bg-orange-500/[0.04]" : ""
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{row.name}</span>
                      {row.isHighlight && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold">
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-neutral-400 mt-0.5">
                      {row.description}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {typeof row.lite === "boolean" ? (
                      row.lite ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 dark:text-neutral-600 mx-auto" />
                      )
                    ) : (
                      <span className="font-medium text-slate-600 dark:text-neutral-400">{row.lite}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    {typeof row.pro === "boolean" ? (
                      row.pro ? (
                        <Check className="w-4 h-4 text-orange-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 dark:text-neutral-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-orange-600 dark:text-orange-400">{row.pro}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          <span>{language === "fr" ? "Questions FrÃ©quentes (FAQ)" : "Frequently Asked Questions"}</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {activeFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {activeFaq === i && (
                <div className="px-4 pb-4 text-xs text-slate-600 dark:text-neutral-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Strip */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {language === "fr" ? "Besoin d'un dÃ©ploiement sur-mesure ou On-Premise ?" : "Need a custom Dedicated or On-Premise deployment?"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            {language === "fr" ? "Nos architectes conÃ§oivent vos passerelles IoT et modÃ¨les de rÃ©gression dÃ©diÃ©s." : "Our systems architects assist with custom ISO/FIPS sovereign integrations."}
          </p>
        </div>
        <button
          onClick={() => {
            if (onSelectTab) {
              onSelectTab("inf-6");
            }
          }}
          className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <span>{language === "fr" ? "Tester la Maintenance IA" : "Explore Predictive AI"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
