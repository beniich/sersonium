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

  const currentTier: SubscriptionTier = state?.subscriptionTier || "lite";
  const isPro = currentTier === "pro";

  const handlePayPalSuccess = async (details: { orderId: string; amount: number; cycle: string }) => {
    setPayPalTxId(details.orderId);
    setPayPalPaymentSuccess(true);
    
    // Update local storage and app state
    if (typeof window !== "undefined") {
      localStorage.setItem("sensorium_subscription_tier", "pro");
    }
    if (state) {
      state.subscriptionTier = "pro";
    }
    if (onUpgradeTier) {
      onUpgradeTier("pro");
    }

    await logAuditEvent(
      "PAYPAL_SUBSCRIPTION_SUCCESS",
      `Subscription upgraded to PRO Plan via PayPal Live Gateway (Capture ID: ${details.orderId}, ${details.cycle === "yearly" ? "499€/year" : "49€/month"})`
    );
  };

  const handleDowngrade = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sensorium_subscription_tier", "lite");
    }
    if (state) {
      state.subscriptionTier = "lite";
    }
    if (onUpgradeTier) {
      onUpgradeTier("lite");
    }
    await logAuditEvent("SUBSCRIPTION_DOWNGRADED_LITE", "Subscription reverted to LITE Tier.");
  };

  const comparisonFeatures: FeatureComparisonRow[] = [
    // Core & Edge
    {
      name: language === "fr" ? "Supervision Edge & Nœuds Distribués" : "Distributed Edge Nodes Monitoring",
      description: language === "fr" ? "Télémétrie CPU, RAM, bande passante & latence Anycast" : "CPU, RAM, bandwidth & Anycast latency metrics",
      category: "core",
      lite: language === "fr" ? "Jusqu'à 3 nœuds" : "Up to 3 nodes",
      pro: language === "fr" ? "Nœuds illimités" : "Unlimited fleet nodes"
    },
    {
      name: language === "fr" ? "Gestion des Ordres de Travail (GMAO / CAFM)" : "Work Orders Management (CMMS / CAFM)",
      description: language === "fr" ? "Attribution des tickets d'intervention et suivi des statuts" : "Work order dispatching & resolution tracking",
      category: "core",
      lite: language === "fr" ? "3 tickets max" : "3 active tickets max",
      pro: language === "fr" ? "Tickets & historique illimités" : "Unlimited tickets & history"
    },
    {
      name: language === "fr" ? "PWA & Mode Hors-Ligne Résilient" : "PWA & Resilient Offline Cache",
      description: language === "fr" ? "Stockage local IndexedDB & synchronisation automatique" : "IndexedDB caching & background reconnect sync",
      category: "core",
      lite: true,
      pro: true
    },

    // AI & Analytics
    {
      name: language === "fr" ? "Maintenance Prédictive IA (Régression Linéaire)" : "Predictive Maintenance AI (Linear Regression)",
      description: language === "fr" ? "Modèle y = mx + b pour calculer la dégradation et estimer le TTF (jours avant panne)" : "Mathematical model calculating wear slope & Time-To-Failure (TTF)",
      category: "ai",
      lite: false,
      pro: true,
      isHighlight: true
    },
    {
      name: language === "fr" ? "Prévision d'Anomalie SMART & PUE Énergétique" : "SMART Disk Wear & PUE Energy Anomaly Forecast",
      description: language === "fr" ? "Détection précoce d'usure des disques NVMe et surconsommation CVC" : "Early NVMe wear detection & HVAC energy overshoot alerts",
      category: "ai",
      lite: false,
      pro: true,
      isHighlight: true
    },
    {
      name: language === "fr" ? "Assistant IA Grounding & Télémétrie" : "AI Grounding Assistant & Telemetry Query",
      description: language === "fr" ? "Questions en langage naturel sur l'état de l'infrastructure" : "Natural language interrogation of fleet telemetry",
      category: "ai",
      lite: language === "fr" ? "Requêtes limitées" : "Limited queries",
      pro: language === "fr" ? "Requêtes illimitées (Gemini Pro)" : "Unlimited queries (Gemini Pro)"
    },

    // Telemetry & Streaming
    {
      name: language === "fr" ? "Streaming Kafka Haute Fréquence" : "High-Frequency Kafka Event Streaming",
      description: language === "fr" ? "Topics Kafka temps réel, inspection d'offsets et schéma Avro" : "Real-time Kafka topics, partition offsets & Avro schemas",
      category: "telemetry",
      lite: false,
      pro: true
    },
    {
      name: language === "fr" ? "Fréquence de Rafraîchissement Télémétrie" : "Telemetry Refresh Sampling Rate",
      description: language === "fr" ? "Intervalle d'échantillonnage des métriques capteurs" : "Polling & websocket sample rate",
      category: "telemetry",
      lite: "10s",
      pro: "1s (Temps Réel)"
    },

    // Security & WAF
    {
      name: language === "fr" ? "Mitigation DDoS Layer 7 & Règles WAF" : "Layer 7 DDoS Mitigation & WAF Rules",
      description: language === "fr" ? "Filtrage d'attaques volumétriques et blocage automatisé" : "Volumetric attack defense & automated rule triggering",
      category: "security",
      lite: language === "fr" ? "Protection basique" : "Basic protection",
      pro: language === "fr" ? "Mitigation avancée <3ms" : "Advanced mitigation <3ms"
    },
    {
      name: language === "fr" ? "Chiffrement FIPS 140-3 & Audit Logs Immuables" : "FIPS 140-3 Encryption & Immutable Audit Logs",
      description: language === "fr" ? "Journalisation cryptographique des accès et modifications" : "Cryptographic tamper-proof logging of all actions",
      category: "security",
      lite: language === "fr" ? "24h de rétention" : "24h retention",
      pro: language === "fr" ? "Rétention illimitée & Export" : "Unlimited retention & Export"
    },

    // Storage & Governance
    {
      name: language === "fr" ? "Exports Stratégiques PDF A4 & Tableurs CSV" : "Strategic Executive PDF A4 & CSV Spreadsheets",
      description: language === "fr" ? "Rapports d'audit prêts pour la direction et commissaires aux comptes" : "Board-ready audit reports with charts & metrics",
      category: "governance",
      lite: false,
      pro: true,
      isHighlight: true
    },
    {
      name: language === "fr" ? "Support Technique & SLA Disponibilité" : "Technical Support & Availability SLA",
      description: language === "fr" ? "Temps de réponse garanti pour les infrastructures critiques" : "Guaranteed response time for critical infrastructure",
      category: "governance",
      lite: "Communauté / 48h",
      pro: "Dédié 24/7 / SLA 99.99%"
    }
  ];

  const faqs = [
    {
      q: language === "fr" ? "Comment fonctionne la facturation PayPal ?" : "How does PayPal billing work?",
      a: language === "fr" 
        ? "Le paiement est opéré de manière totalement sécurisée via l'API PayPal. Vous pouvez payer par compte PayPal ou carte bancaire. Les abonnements sont renouvelés automatiquement chaque mois ou chaque année selon votre choix."
        : "Payment is securely processed via the PayPal API SDK. You can pay using your PayPal balance or credit card. Subscriptions renew automatically monthly or annually based on your selection."
    },
    {
      q: language === "fr" ? "Puis-je changer ou résilier mon abonnement à tout moment ?" : "Can I switch or cancel my plan anytime?",
      a: language === "fr"
        ? "Oui, vous pouvez passer du plan Pro au plan Lite en un clic sans frais ni pénalité. Vos données restent conservées en toute sécurité."
        : "Yes, you can upgrade, downgrade, or cancel anytime with zero cancellation fees. Your telemetry data remains safely intact."
    },
    {
      q: language === "fr" ? "La maintenance prédictive par régression linéaire est-elle incluse dans le plan Lite ?" : "Is linear regression predictive maintenance included in the Lite plan?",
      a: language === "fr"
        ? "Le plan Lite offre la télémétrie de base et la détection de seuils simples. Le modèle mathématique de régression linéaire avancée et le calcul du TTF (Time To Failure) nécessitent le plan Pro."
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
          {language === "fr" ? "La puissance industrielle à la mesure de vos besoins" : "Enterprise Performance Sized for Your Scale"}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto">
          {language === "fr"
            ? "Déployez votre supervision Edge avec le plan Lite gratuit, ou débloquez l'IA de régression linéaire, les exports exécutifs et le streaming Kafka avec le plan Pro."
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

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* LITE CARD (Free) */}
        <div className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between border transition-all duration-200 ${
          currentTier === "lite"
            ? "bg-white dark:bg-[#111114] border-slate-300 dark:border-white/20 shadow-md ring-1 ring-slate-300 dark:ring-white/20"
            : "bg-white dark:bg-[#0c0c0e] border-slate-200 dark:border-white/[0.07] shadow-xs"
        }`}>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {language === "fr" ? "DÉCOUVERTE & PROTOTYPAGE" : "DEVELOPER & PILOT"}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Plan Lite</h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  {language === "fr" ? "Idéal pour évaluer la plateforme et superviser un site pilote." : "Ideal for discovering SENSORIUM and monitoring a pilot edge node."}
                </p>
              </div>
              {currentTier === "lite" && (
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/[0.1]">
                  {language === "fr" ? "ACTUEL" : "ACTIVE"}
                </span>
              )}
            </div>

            {/* Price tag */}
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">0€</span>
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                /{language === "fr" ? "mois (Gratuit à vie)" : "month (Free forever)"}
              </span>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/[0.06] text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-neutral-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{language === "fr" ? "Supervision Edge jusqu'à 3 nœuds" : "Edge supervision up to 3 nodes"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-neutral-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{language === "fr" ? "GMAO basique (jusqu'à 3 ordres de travail)" : "Basic CMMS (up to 3 active work orders)"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-neutral-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{language === "fr" ? "Application PWA & cache hors-ligne" : "PWA Progressive Web App with offline cache"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400 dark:text-neutral-500 line-through">
                <X className="w-4 h-4 text-slate-300 dark:text-neutral-600 shrink-0" />
                <span>{language === "fr" ? "Maintenance Prédictive IA (Régression Linéaire)" : "Predictive Maintenance AI (Linear Regression)"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400 dark:text-neutral-500 line-through">
                <X className="w-4 h-4 text-slate-300 dark:text-neutral-600 shrink-0" />
                <span>{language === "fr" ? "Générateur de Rapports PDF A4 & Export CSV" : "Strategic Executive PDF A4 & CSV Generator"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400 dark:text-neutral-500 line-through">
                <X className="w-4 h-4 text-slate-300 dark:text-neutral-600 shrink-0" />
                <span>{language === "fr" ? "Streaming Kafka & Télémétrie 1s" : "Kafka Event Streaming & 1s Telemetry"}</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            {currentTier === "lite" ? (
              <div className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-neutral-400 text-xs font-bold text-center border border-slate-200 dark:border-white/[0.06]">
                {language === "fr" ? "Formule actuellement active" : "Currently Active Tier"}
              </div>
            ) : (
              <button
                onClick={handleDowngrade}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-neutral-200 text-xs font-bold text-center transition-colors cursor-pointer border border-slate-200 dark:border-white/[0.08]"
              >
                {language === "fr" ? "Repasser au plan Lite" : "Downgrade to Lite"}
              </button>
            )}
          </div>
        </div>

        {/* PRO CARD (Paid / Enterprise) */}
        <div className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between border relative transition-all duration-200 ${
          currentTier === "pro"
            ? "bg-gradient-to-b from-amber-500/[0.06] to-transparent dark:from-amber-500/[0.09] border-amber-500/50 shadow-xl ring-2 ring-amber-500/30"
            : "bg-gradient-to-b from-orange-500/[0.05] to-transparent dark:from-orange-500/[0.08] border-orange-500/40 hover:border-orange-500/70 shadow-lg"
        }`}>
          {/* Top highlight badge */}
          <div className="absolute -top-3.5 right-8">
            <span className="px-3.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "fr" ? "RECOMMANDÉ ENTREPRISE" : "ENTERPRISE CHOICE"}</span>
            </span>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold text-orange-500 uppercase tracking-wider">
                  {language === "fr" ? "MISSION CRITIQUE & SOUVERAINETÉ" : "MISSION CRITICAL & AI"}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Plan Pro Enterprise</h3>
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  {language === "fr" 
                    ? "Pour les équipes de gestion d'actifs, exploitants de datacenters et infrastructures sensibles."
                    : "For critical infrastructure operators, asset management teams and datacenters."}
                </p>
              </div>
            </div>

            {/* Price tag */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                {billingCycle === "yearly" ? "499€" : "49€"}
              </span>
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                /{billingCycle === "yearly" ? (language === "fr" ? "an (soit 41.5€/mois)" : "year (41.5€/mo)") : (language === "fr" ? "mois" : "month")}
              </span>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/[0.06] text-xs">
              <div className="flex items-center gap-2.5 text-slate-800 dark:text-neutral-100 font-semibold">
                <Check className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{language === "fr" ? "Maintenance Prédictive IA (Modèle de Régression Linéaire)" : "Predictive Maintenance AI (Linear Regression Engine)"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-800 dark:text-neutral-100 font-semibold">
                <Check className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{language === "fr" ? "Générateur PDF A4 Stratégique & Exports CSV Illimités" : "Strategic Executive PDF A4 & Unlimited CSV Exports"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-800 dark:text-neutral-100 font-semibold">
                <Check className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{language === "fr" ? "Streaming Événements Kafka & Télémétrie 1s" : "Kafka Event Streaming & 1s Real-Time Polling"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-800 dark:text-neutral-100">
                <Check className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{language === "fr" ? "Mitigation DDoS L7 & Pare-feu Anycast <3ms" : "Layer 7 DDoS Mitigation & Anycast Firewall <3ms"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-800 dark:text-neutral-100">
                <Check className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{language === "fr" ? "Support Ingénieur Dédié 24/7 (SLA 99.99%)" : "24/7 Dedicated Engineer Support (SLA 99.99%)"}</span>
              </div>
            </div>
          </div>

          {/* PayPal Integration Container */}
          <div className="pt-8 space-y-3">
            {isPro ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === "fr" ? "Abonnement Pro Actif sur ce compte" : "Pro Plan Active on this Account"}</span>
              </div>
            ) : payPalPaymentSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs text-center space-y-1">
                <div className="font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === "fr" ? "Paiement Validé avec Succès !" : "Payment Confirmed Successfully!"}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">ID: {payPalTxId}</div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* PayPal Smart Payment Buttons Placeholder / Interactive Flow */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <PayPalSmartButton
                    billingCycle={billingCycle}
                    onSuccess={handlePayPalSuccess}
                    isDark={isDark}
                  />
                </div>

                <p className="text-[10px] text-center text-slate-400 dark:text-neutral-500">
                  {language === "fr" ? "Transaction chiffrée. Résiliation en 1 clic sans frais." : "Encrypted transaction. 1-click instant cancellation."}
                </p>
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
              <span>{language === "fr" ? "Tableau Comparatif Détaillé des Fonctionnalités" : "Detailed Feature Comparison Matrix"}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              {language === "fr" ? "Comparez point par point les capacités des formules Lite et Pro." : "Compare capabilities across engineering, AI and governance tiers."}
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-neutral-300 self-start sm:self-auto">
            {comparisonFeatures.length} {language === "fr" ? "critères analysés" : "criteria analyzed"}
          </span>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-neutral-400 font-mono text-[11px]">
                <th className="py-3 px-4 w-1/2">{language === "fr" ? "Fonctionnalité & Module" : "Feature & Module"}</th>
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
          <span>{language === "fr" ? "Questions Fréquentes (FAQ)" : "Frequently Asked Questions"}</span>
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
            {language === "fr" ? "Besoin d'un déploiement sur-mesure ou On-Premise ?" : "Need a custom Dedicated or On-Premise deployment?"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            {language === "fr" ? "Nos architectes conçoivent vos passerelles IoT et modèles de régression dédiés." : "Our systems architects assist with custom ISO/FIPS sovereign integrations."}
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
