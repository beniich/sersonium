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
  Layers, 
  Database, 
  Users, 
  ShieldAlert,
  Server,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Info,
  Building2,
  CheckCircle,
  ExternalLink
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
  starter: boolean | string;
  pro: boolean | string;
  team: boolean | string;
  enterprise: boolean | string;
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
  const [payPalPaymentSuccess, setPayPalPaymentSuccess] = useState(false);
  const [payPalTxId, setPayPalTxId] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Current active tier from global state (free, silver, pro, enterprise)
  const currentTier: SubscriptionTier = state?.subscriptionTier || "free";

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
      name: language === "fr" ? "Supervision Edge & Nœuds Distribués" : "Distributed Edge Nodes Monitoring",
      description: language === "fr" ? "Télémétrie CPU, RAM, bande passante & latence Anycast" : "CPU, RAM, bandwidth & Anycast latency metrics",
      category: "core",
      starter: language === "fr" ? "Jusqu'à 3 nœuds" : "Up to 3 nodes",
      pro: language === "fr" ? "15 nœuds" : "15 nodes",
      team: language === "fr" ? "50 nœuds" : "50 nodes",
      enterprise: language === "fr" ? "Nœuds illimités" : "Unlimited nodes"
    },
    {
      name: language === "fr" ? "Interactions & Requêtes IA" : "AI Inferences & Interactions",
      description: language === "fr" ? "Requêtes d'inférence sensorielles et LLM" : "Sensory telemetry & LLM inference queries",
      category: "ai",
      starter: "1,000 / mo",
      pro: language === "fr" ? "Illimité" : "Unlimited",
      team: language === "fr" ? "Illimité + prioritaire" : "Unlimited + Priority",
      enterprise: language === "fr" ? "Dédié sur-mesure" : "Custom dedicated pool",
      isHighlight: true
    },
    {
      name: language === "fr" ? "Gestion des Ordres de Travail (GMAO / CAFM)" : "Work Orders Management (CMMS / CAFM)",
      description: language === "fr" ? "Attribution des tickets d'intervention et suivi des statuts" : "Work order dispatching & resolution tracking",
      category: "core",
      starter: language === "fr" ? "5 flux actifs" : "5 custom workflows",
      pro: language === "fr" ? "50 flux actifs" : "50 custom workflows",
      team: language === "fr" ? "Flux illimités" : "Unlimited workflows",
      enterprise: language === "fr" ? "Workflows illimités & Custom" : "Unlimited & Custom Automations"
    },
    {
      name: language === "fr" ? "Maintenance Prédictive IA (Régression Linéaire)" : "Predictive Maintenance AI (Linear Regression)",
      description: language === "fr" ? "Modèle y = mx + b pour calculer la dégradation et estimer le TTF" : "Mathematical model calculating wear slope & Time-To-Failure (TTF)",
      category: "ai",
      starter: false,
      pro: true,
      team: true,
      enterprise: true,
      isHighlight: true
    },
    {
      name: language === "fr" ? "Prévision d'Anomalie SMART & PUE Énergétique" : "SMART Disk Wear & PUE Energy Anomaly Forecast",
      description: language === "fr" ? "Détection précoce d'usure des disques NVMe et surconsommation CVC" : "Early NVMe wear detection & HVAC energy overshoot alerts",
      category: "ai",
      starter: false,
      pro: true,
      team: true,
      enterprise: true,
      isHighlight: true
    },
    {
      name: language === "fr" ? "Streaming Kafka & Événements Temps Réel" : "High-Frequency Kafka Event Streaming",
      description: language === "fr" ? "Topics Kafka temps réel, inspection d'offsets et schéma Avro" : "Real-time Kafka topics, partition offsets & Avro schemas",
      category: "telemetry",
      starter: false,
      pro: true,
      team: true,
      enterprise: true
    },
    {
      name: language === "fr" ? "Mitigation DDoS Layer 7 & Règles WAF" : "Layer 7 DDoS Mitigation & WAF Rules",
      description: language === "fr" ? "Filtrage d'attaques volumétriques et blocage automatisé" : "Volumetric attack defense & automated rule triggering",
      category: "security",
      starter: language === "fr" ? "Protection basique" : "Standard",
      pro: language === "fr" ? "Mitigation avancée <3ms" : "Advanced <3ms",
      team: language === "fr" ? "Haute priorité & Bot Mgmt" : "High Priority & Bot Mgmt",
      enterprise: language === "fr" ? "SLA 100% & WAF sur-mesure" : "100% SLA & Custom Rules"
    },
    {
      name: language === "fr" ? "Sécurité ZTNA & Authentification SSO" : "Zero Trust (ZTNA) & Enterprise SSO",
      description: language === "fr" ? "Politiques contextuelles d'accès et fédération Google / Okta / SAML" : "Zero-trust policies, posture checks & Google / SAML SSO",
      category: "security",
      starter: false,
      pro: language === "fr" ? "Accès ZTNA de base" : "ZTNA Baseline",
      team: language === "fr" ? "Google SSO + 15 sièges" : "Google SSO + 15 Seats",
      enterprise: language === "fr" ? "SAML / Okta / On-Premise" : "Full SAML / Okta / On-Premise"
    },
    {
      name: language === "fr" ? "Exports Stratégiques PDF A4 & Tableurs CSV" : "Strategic Executive PDF A4 & CSV Spreadsheets",
      description: language === "fr" ? "Rapports d'audit prêts pour la direction et commissaires aux comptes" : "Board-ready audit reports with charts & metrics",
      category: "governance",
      starter: false,
      pro: true,
      team: true,
      enterprise: true
    },
    {
      name: language === "fr" ? "Support Technique & SLA Disponibilité" : "Technical Support & Availability SLA",
      description: language === "fr" ? "Temps de réponse garanti pour les infrastructures critiques" : "Guaranteed response time for critical infrastructure",
      category: "governance",
      starter: language === "fr" ? "Communauté / 48h" : "Community / 48h",
      pro: language === "fr" ? "Support prioritaire 12h" : "Priority Support 12h",
      team: language === "fr" ? "Support dédié 4h" : "Dedicated Support 4h",
      enterprise: language === "fr" ? "Dédié 24/7 / SLA 99.99%" : "Dedicated 24/7 / 99.99% SLA"
    }
  ];

  const faqs = [
    {
      q: language === "fr" ? "Comment fonctionne la facturation mensuelle et annuelle ?" : "How does monthly and annual billing work?",
      a: language === "fr" 
        ? "Le paiement est opéré en toute sécurité via l'API PayPal Live ou carte bancaire. En sélectionnant la facturation annuelle, vous bénéficiez immédiatement de 20% de remise sur tous nos forfaits libre-service."
        : "Payments are securely processed through the PayPal Live Gateway and major credit cards. Choosing annual billing grants an instant 20% discount across all self-serve tiers."
    },
    {
      q: language === "fr" ? "Puis-je changer ou résilier mon abonnement à tout moment ?" : "Can I switch or cancel my plan anytime?",
      a: language === "fr"
        ? "Absolument. Vous pouvez passer d'un niveau à l'autre ou revenir au forfait gratuit en un clic, sans frais ni pénalité. Vos configurations de nœuds et données restent intégralement préservées."
        : "Absolutely. You can upgrade, downgrade to Starter, or cancel anytime with zero fees. All telemetry, node profiles, and historical logs remain securely saved."
    },
    {
      q: language === "fr" ? "Qu'est-ce qui est inclus dans l'essai gratuit de 14 jours ?" : "What is included in the 14-day free trial?",
      a: language === "fr"
        ? "L'essai gratuit vous donne un accès sans restriction aux fonctionnalités du forfait sélectionné (y compris les inférences IA illimitées et les flux télémétriques), sans carte bancaire requise."
        : "The 14-day free trial unlocks full access to the selected plan's capabilities, including unlimited AI processing and real-time Kafka streams, with no credit card required."
    },
    {
      q: language === "fr" ? "Proposez-vous un déploiement On-Premise ou Cloud Souverain ?" : "Do you offer On-Premise or Sovereign deployments?",
      a: language === "fr"
        ? "Oui, notre offre Enterprise permet le déploiement direct dans vos datacenters, architectures air-gapped, ou clouds souverains conformes aux exigences FIPS 140-3 et RGPD/SecNumCloud."
        : "Yes, our Enterprise plan supports on-premise appliances, air-gapped facilities, and sovereign clouds compliant with FIPS 140-3 and European security directives."
    }
  ];

  return (
    <div className="relative w-full -mx-4 sm:-mx-6 lg:-mx-8 -my-6 px-4 sm:px-8 lg:px-12 py-8 bg-[#151024] text-[#e8defb] min-h-screen overflow-hidden selection:bg-[#ecd7ff] selection:text-[#29074a]">
      
      {/* Ambient background glows matching BizOS VitalAI design */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Abstract organic SVG wave */}
        <svg className="w-full h-full absolute inset-0 text-[#ecd7ff] opacity-25" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path className="opacity-15" d="M0,45 Q25,18 50,45 T100,45 L100,100 L0,100 Z" fill="currentColor" />
          <path className="opacity-10" d="M0,60 Q35,80 60,35 T100,55 L100,100 L0,100 Z" fill="currentColor" />
        </svg>

        {/* Ambient colored glowing orbs */}
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-[#ecd7ff]/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[420px] h-[420px] bg-[#ffb2bb]/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-1/3 w-[360px] h-[360px] bg-[#604283]/20 rounded-full blur-[120px]" />

        {/* Perspective grid overlay */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(236, 215, 255, 0.15) 1px, transparent 1px)`,
            backgroundSize: "32px 32px"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto pt-4 space-y-5 flex flex-col items-center">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2c273c]/70 backdrop-blur-md rounded-full border border-[#ecd7ff]/20 text-[#ecd7ff] text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(216,180,254,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#ffb2bb] shadow-[0_0_8px_rgba(255,178,187,0.9)] animate-pulse" />
            <span>{language === "fr" ? "TARIFICATION TRANSPARENTE" : "TRANSPARENT PRICING"}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#e8defb] leading-tight">
            {language === "fr" ? "Développez votre intelligence." : "Scale your intelligence."}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ecd7ff] via-[#d8b4fe] to-[#ffb2bb]">
              {language === "fr" ? "En toute prévisibilité." : "Predictably."}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#cdc3d0] max-w-2xl leading-relaxed">
            {language === "fr"
              ? "Choisissez le forfait VitalAI adapté à votre charge cognitive. Des opérateurs indépendants aux réseaux distribués mondiaux. 14 jours d'essai sans engagement."
              : "Choose the VitalAI tier that matches your cognitive load. From solo founders to global enterprise meshes. Start your 14-day free trial today."}
          </p>

          {/* Billing Cycle Switcher with animated pill */}
          <div className="pt-2">
            <div className="relative inline-flex items-center p-1 bg-[#2c273c]/70 backdrop-blur-lg rounded-full border border-[#4a454f]/50 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`relative z-10 px-6 py-2 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                  billingCycle === "monthly" ? "text-[#e8defb]" : "text-[#cdc3d0] hover:text-[#e8defb]"
                }`}
              >
                {language === "fr" ? "Mensuel" : "Monthly"}
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`relative z-10 px-6 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 cursor-pointer ${
                  billingCycle === "yearly" ? "text-[#e8defb]" : "text-[#cdc3d0] hover:text-[#e8defb]"
                }`}
              >
                <span>{language === "fr" ? "Annuel" : "Annually"}</span>
                <span className="text-[10px] text-[#ffb2bb] bg-[#ffb2bb]/15 border border-[#ffb2bb]/20 px-2 py-0.5 rounded-full font-bold">
                  {language === "fr" ? "-20%" : "Save 20%"}
                </span>
              </button>

              {/* Sliding Background Pill */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#3c364c] rounded-full transition-transform duration-300 ease-out shadow-sm pointer-events-none ${
                  billingCycle === "yearly" ? "translate-x-full" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>

        {/* 4-Tier Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-end">

          {/* 1. STARTER PLAN */}
          <div className={`relative bg-[#221c31]/70 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 hover:bg-[#221c31]/90 hover:-translate-y-1 ${
            currentTier === "free"
              ? "border-[#ecd7ff]/50 shadow-[0_0_25px_rgba(216,180,254,0.15)] ring-1 ring-[#ecd7ff]/30"
              : "border-[#4a454f]/30"
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#e8defb]">Starter</h3>
                  <p className="text-xs text-[#cdc3d0] mt-1 h-8">
                    {language === "fr" ? "Outils IA essentiels pour créateurs solos." : "Essential AI tools for solo operators."}
                  </p>
                </div>
                {currentTier === "free" && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3c364c] text-[#ecd7ff] border border-[#ecd7ff]/20">
                    {language === "fr" ? "ACTUEL" : "ACTIVE"}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl font-bold text-[#e8defb]">
                  {billingCycle === "monthly" ? "$29" : "$24"}
                </span>
                <span className="text-sm text-[#cdc3d0]">/{language === "fr" ? "mois" : "mo"}</span>
              </div>

              {/* Action Button */}
              {currentTier === "free" ? (
                <div className="w-full py-2.5 px-4 rounded-full bg-[#3c364c]/70 text-[#ecd7ff] text-xs font-semibold text-center border border-[#4a454f]/40">
                  {language === "fr" ? "Forfait Actuel" : "Current Plan"}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDowngrade}
                  className="w-full py-2.5 px-4 rounded-full bg-[#3c364c] hover:bg-[#373147] text-[#e8defb] text-xs font-semibold transition-all border border-[#4a454f]/60 cursor-pointer shadow-sm"
                >
                  {language === "fr" ? "Passer au Starter" : "Start Free Trial"}
                </button>
              )}

              {/* Features List */}
              <ul className="space-y-3 pt-4 border-t border-[#4a454f]/30 text-xs">
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "1 000 interactions IA / mois" : "1,000 AI interactions/mo"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Vitesse de calcul standard" : "Standard processing speed"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "5 flux de travail personnalisés" : "5 Custom workflows"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#968e9a]">
                  <X className="w-4 h-4 text-[#968e9a] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Analyses prédictives avancées" : "Advanced Analytics"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 2. PRO PLAN (Featured & Highlighted) */}
          <div className={`relative bg-[#1e1548]/80 backdrop-blur-2xl rounded-2xl p-6 xl:p-7 flex flex-col justify-between transform xl:scale-105 shadow-[0_0_50px_rgba(216,180,254,0.22)] z-20 group border-2 border-[#ecd7ff]/60 transition-all duration-300 hover:border-[#ecd7ff] ${
            currentTier === "pro" ? "ring-2 ring-[#ffb2bb]/60" : ""
          }`}>
            {/* "Most Popular" floating pill */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#29074a] font-bold text-[11px] px-4 py-1 rounded-full shadow-[0_0_20px_rgba(216,180,254,0.5)] whitespace-nowrap uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "fr" ? "LE PLUS POPULAIRE" : "MOST POPULAR"}</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start pt-2">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#ecd7ff]">Pro</h3>
                  <p className="text-xs text-[#cdc3d0] mt-1 h-8">
                    {language === "fr" ? "Cognition avancée pour équipes en forte croissance." : "Advanced cognition for growing teams."}
                  </p>
                </div>
                {currentTier === "pro" && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ffb2bb]/20 text-[#ffb2bb] border border-[#ffb2bb]/30">
                    {language === "fr" ? "ACTUEL" : "ACTIVE"}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-4xl font-extrabold text-[#e8defb]">
                  {billingCycle === "monthly" ? "$79" : "$64"}
                </span>
                <span className="text-sm text-[#cdc3d0]">/{language === "fr" ? "mois" : "mo"}</span>
              </div>

              {/* Action Button / PayPal Smart Gateway */}
              <div className="space-y-2 pt-1">
                {currentTier === "pro" ? (
                  <div className="w-full py-2.5 px-4 rounded-full bg-[#ffb2bb]/20 text-[#ffb2bb] text-xs font-bold text-center border border-[#ffb2bb]/40 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === "fr" ? "Abonnement Pro Actif" : "Pro Plan Active"}</span>
                  </div>
                ) : payPalPaymentSuccess ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === "fr" ? "Paiement validé !" : "Payment confirmed!"}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handlePayPalSuccess({ subscriptionId: "mock_pro_tx_" + Date.now(), planId: "P-44Y462991D576054FNKY3PKI" })}
                      className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#ecd7ff] via-[#d8b4fe] to-[#ffb2bb] text-[#29074a] text-xs font-bold tracking-wide hover:opacity-95 transition-all shadow-[0_0_20px_rgba(216,180,254,0.4)] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#29074a]" />
                      <span>{language === "fr" ? "Démarrer l'essai gratuit" : "Start Free Trial"}</span>
                    </button>
                    
                    {/* Live PayPal Smart Button embedded */}
                    <div className="p-2 rounded-xl bg-[#151024]/60 border border-[#ecd7ff]/20">
                      <PayPalSmartButton 
                        planId="P-44Y462991D576054FNKY3PKI" 
                        onSuccess={handlePayPalSuccess} 
                        isDark={true} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-3 pt-3 border-t border-[#ecd7ff]/20 text-xs">
                <li className="flex items-start gap-2.5 text-[#e8defb] font-medium">
                  <CheckCircle className="w-4 h-4 text-[#ffb2bb] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Interactions IA illimitées" : "Unlimited AI interactions"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#e8defb] font-medium">
                  <CheckCircle className="w-4 h-4 text-[#ffb2bb] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Vitesse de traitement prioritaire" : "Priority processing speed"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#e8defb] font-medium">
                  <CheckCircle className="w-4 h-4 text-[#ffb2bb] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "50 flux de travail configurables" : "50 Custom workflows"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#e8defb] font-medium">
                  <CheckCircle className="w-4 h-4 text-[#ffb2bb] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Dashboard d'analyses prédictives" : "Advanced Analytics Dashboard"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. TEAM PLAN */}
          <div className={`relative bg-[#221c31]/70 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 hover:bg-[#221c31]/90 hover:-translate-y-1 ${
            currentTier === "silver"
              ? "border-[#ecd7ff]/50 shadow-[0_0_25px_rgba(216,180,254,0.15)] ring-1 ring-[#ecd7ff]/30"
              : "border-[#4a454f]/30"
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#e8defb]">Team</h3>
                  <p className="text-xs text-[#cdc3d0] mt-1 h-8">
                    {language === "fr" ? "IA collaborative pour départements et équipes." : "Collaborative AI for departments."}
                  </p>
                </div>
                {currentTier === "silver" && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3c364c] text-[#ecd7ff] border border-[#ecd7ff]/20">
                    {language === "fr" ? "ACTUEL" : "ACTIVE"}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-4xl font-bold text-[#e8defb]">
                  {billingCycle === "monthly" ? "$199" : "$159"}
                </span>
                <span className="text-sm text-[#cdc3d0]">/{language === "fr" ? "mois" : "mo"}</span>
              </div>

              {/* Action Button */}
              {currentTier === "silver" ? (
                <div className="w-full py-2.5 px-4 rounded-full bg-[#3c364c]/70 text-[#ecd7ff] text-xs font-semibold text-center border border-[#4a454f]/40">
                  {language === "fr" ? "Forfait Actuel" : "Current Plan"}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handlePayPalSuccess({ subscriptionId: "mock_team_tx_" + Date.now(), planId: "P-0RJ6785234422590FNKY3NXI" })}
                    className="w-full py-2.5 px-4 rounded-full bg-[#3c364c] hover:bg-[#373147] text-[#e8defb] text-xs font-semibold transition-all border border-[#4a454f]/60 cursor-pointer shadow-sm"
                  >
                    {language === "fr" ? "Démarrer l'essai Team" : "Start Free Trial"}
                  </button>
                  <div className="p-2 rounded-xl bg-[#151024]/60 border border-[#4a454f]/30">
                    <PayPalSmartButton 
                      planId="P-0RJ6785234422590FNKY3NXI" 
                      onSuccess={handlePayPalSuccess} 
                      isDark={true} 
                    />
                  </div>
                </div>
              )}

              {/* Features List */}
              <ul className="space-y-3 pt-4 border-t border-[#4a454f]/30 text-xs">
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Tout ce qui est inclus dans Pro" : "Everything in Pro"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Jusqu'à 15 collaborateurs" : "Up to 15 Team Members"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Bases de connaissances partagées" : "Shared knowledge bases"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Entraînement de modèles sur-mesure" : "Custom model training"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 4. ENTERPRISE PLAN */}
          <div className={`relative bg-[#100b1f]/70 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 hover:bg-[#100b1f]/90 ${
            currentTier === "enterprise"
              ? "border-[#ecd7ff]/60 shadow-[0_0_25px_rgba(216,180,254,0.2)] ring-1 ring-[#ecd7ff]/40"
              : "border-[#4a454f]/20"
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#e8defb]">Enterprise</h3>
                  <p className="text-xs text-[#cdc3d0] mt-1 h-8">
                    {language === "fr" ? "Infrastructure dédiée & support souverain." : "Dedicated infrastructure & support."}
                  </p>
                </div>
                {currentTier === "enterprise" && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3c364c] text-[#ecd7ff] border border-[#ecd7ff]/20">
                    {language === "fr" ? "ACTUEL" : "ACTIVE"}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 pt-2 h-[48px] items-end">
                <span className="text-3xl font-bold text-[#e8defb]">
                  {language === "fr" ? "Sur-mesure" : "Custom"}
                </span>
              </div>

              {/* Action Button */}
              {currentTier === "enterprise" ? (
                <div className="w-full py-2.5 px-4 rounded-full bg-[#3c364c]/70 text-[#ecd7ff] text-xs font-semibold text-center border border-[#4a454f]/40">
                  {language === "fr" ? "Forfait Actuel" : "Current Plan"}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectTab) onSelectTab("inf-6");
                    }}
                    className="w-full py-2.5 px-4 rounded-full bg-transparent hover:bg-[#ecd7ff]/10 text-[#ecd7ff] text-xs font-semibold transition-all border border-[#ecd7ff]/50 cursor-pointer shadow-sm"
                  >
                    {language === "fr" ? "Contacter les Ventes" : "Contact Sales"}
                  </button>
                  <div className="p-2 rounded-xl bg-[#151024]/60 border border-[#4a454f]/30">
                    <PayPalSmartButton 
                      planId="P-2PN232575Y225210YNKY3QZQ" 
                      onSuccess={handlePayPalSuccess} 
                      isDark={true} 
                    />
                  </div>
                </div>
              )}

              {/* Features List */}
              <ul className="space-y-3 pt-4 border-t border-[#4a454f]/30 text-xs">
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Account manager dédié 24/7" : "Dedicated account manager"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Single Sign-On (SSO SAML / Okta)" : "Single Sign-On (SSO)"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Déploiements On-Premise & Air-gap" : "On-premise deployment options"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#cdc3d0]">
                  <Check className="w-4 h-4 text-[#ecd7ff] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Support téléphonique prioritaire 24/7" : "24/7 Phone Support"}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Reassurance Banner */}
        <div className="max-w-xl mx-auto text-center flex items-center justify-center gap-2 text-xs text-[#cdc3d0] bg-[#221c31]/40 py-2.5 px-6 rounded-full backdrop-blur-md border border-[#4a454f]/20 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#ffb2bb] shrink-0" />
          <span>
            {language === "fr"
              ? "Essai gratuit de 14 jours sur tous les forfaits. Aucune carte bancaire requise."
              : "14-day free trial on all self-serve plans. No credit card required."}
          </span>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#221c31]/50 backdrop-blur-xl border border-[#4a454f]/30 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4a454f]/30 pb-5">
            <div>
              <h2 className="text-xl font-bold text-[#e8defb] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#ecd7ff]" />
                <span>{language === "fr" ? "Matrice Comparative Détaillée des Fonctionnalités" : "Detailed Feature Comparison Matrix"}</span>
              </h2>
              <p className="text-xs text-[#cdc3d0] mt-1">
                {language === "fr" ? "Examinez les capacités de calcul, IA, sécurité et gouvernance par niveau." : "Compare capabilities across engineering, AI and governance tiers."}
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#3c364c]/70 text-[#ecd7ff] border border-[#ecd7ff]/20 self-start sm:self-auto">
              {comparisonFeatures.length} {language === "fr" ? "critères analysés" : "criteria analyzed"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#4a454f]/40 text-[#cdc3d0] font-mono text-[11px]">
                  <th className="py-3 px-4 w-2/5">{language === "fr" ? "Fonctionnalité & Module" : "Feature & Module"}</th>
                  <th className="py-3 px-3 text-center">{language === "fr" ? "Starter" : "Starter"}</th>
                  <th className="py-3 px-3 text-center text-[#ffb2bb] font-bold">{language === "fr" ? "Pro (Populaire)" : "Pro (Popular)"}</th>
                  <th className="py-3 px-3 text-center">{language === "fr" ? "Team" : "Team"}</th>
                  <th className="py-3 px-3 text-center">{language === "fr" ? "Enterprise" : "Enterprise"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4a454f]/20">
                {comparisonFeatures.map((row, idx) => (
                  <tr 
                    key={idx}
                    className={`hover:bg-[#3c364c]/30 transition-colors ${
                      row.isHighlight ? "bg-[#ecd7ff]/[0.03]" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#e8defb] flex items-center gap-2">
                        <span>{row.name}</span>
                        {row.isHighlight && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#ffb2bb]/20 text-[#ffb2bb] font-bold">
                            KEY
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#cdc3d0] mt-0.5">
                        {row.description}
                      </div>
                    </td>

                    {/* Starter */}
                    <td className="py-3.5 px-3 text-center">
                      {typeof row.starter === "boolean" ? (
                        row.starter ? (
                          <Check className="w-4 h-4 text-[#ecd7ff] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[#968e9a] mx-auto" />
                        )
                      ) : (
                        <span className="text-[#cdc3d0]">{row.starter}</span>
                      )}
                    </td>

                    {/* Pro */}
                    <td className="py-3.5 px-3 text-center font-bold bg-[#1e1548]/30">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <CheckCircle className="w-4 h-4 text-[#ffb2bb] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[#968e9a] mx-auto" />
                        )
                      ) : (
                        <span className="text-[#ffb2bb]">{row.pro}</span>
                      )}
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-3 text-center">
                      {typeof row.team === "boolean" ? (
                        row.team ? (
                          <Check className="w-4 h-4 text-[#ecd7ff] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[#968e9a] mx-auto" />
                        )
                      ) : (
                        <span className="text-[#cdc3d0]">{row.team}</span>
                      )}
                    </td>

                    {/* Enterprise */}
                    <td className="py-3.5 px-3 text-center">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? (
                          <Check className="w-4 h-4 text-[#ecd7ff] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[#968e9a] mx-auto" />
                        )
                      ) : (
                        <span className="text-[#ecd7ff] font-medium">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Frequently Asked Questions Accordion */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#221c31]/50 backdrop-blur-xl border border-[#4a454f]/30 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-[#e8defb] flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-[#ecd7ff]" />
            <span>{language === "fr" ? "Questions Fréquentes (FAQ)" : "Frequently Asked Questions"}</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="rounded-2xl border border-[#4a454f]/30 overflow-hidden bg-[#151024]/40"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-[#e8defb] flex justify-between items-center hover:bg-[#3c364c]/30 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {activeFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-[#ecd7ff]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#cdc3d0]" />
                  )}
                </button>
                {activeFaq === i && (
                  <div className="px-4 pb-4 text-xs text-[#cdc3d0] leading-relaxed border-t border-[#4a454f]/20 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Bottom Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#2c273c]/90 via-[#221c31]/90 to-[#100b1f]/90 border border-[#ecd7ff]/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#ffb2bb] mb-1">
              <Building2 className="w-4 h-4" />
              <span>{language === "fr" ? "DÉPLOIEMENT HYBRIDE & SOUVERAIN" : "HYBRID & SOVEREIGN DEPLOYMENT"}</span>
            </div>
            <h3 className="text-xl font-bold text-[#e8defb]">
              {language === "fr" ? "Besoin d'un déploiement sur-mesure ou On-Premise ?" : "Need a custom Dedicated or On-Premise deployment?"}
            </h3>
            <p className="text-xs text-[#cdc3d0] max-w-xl">
              {language === "fr" 
                ? "Nos architectes conçoivent vos passerelles Edge privées, modèles neuronaux dédiés et intégrations FIPS 140-3." 
                : "Our systems architects assist with custom sovereign clusters, private model fine-tuning, and FIPS 140-3 compliance."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onSelectTab) {
                onSelectTab("inf-6");
              }
            }}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#29074a] font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:opacity-90 transition-all shrink-0 cursor-pointer"
          >
            <span>{language === "fr" ? "Explorer la Maintenance IA" : "Explore Predictive AI"}</span>
            <ArrowRight className="w-4 h-4 text-[#29074a]" />
          </button>
        </div>

        {/* Footer info bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#cdc3d0] border-t border-[#4a454f]/30 pt-6">
          <div>© {new Date().getFullYear()} BizOS VitalAI Operating System. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#ecd7ff] transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#ecd7ff] transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#ecd7ff] transition-colors cursor-pointer">Security Whitepaper</span>
          </div>
        </div>

      </div>
    </div>
  );
}
