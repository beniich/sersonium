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
  ExternalLink,
  Briefcase,
  FileSpreadsheet,
  Smartphone,
  Gauge,
  Radio,
  Sliders,
  Award
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
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string>("");

  // Current active tier from global state (free, silver, pro, enterprise)
  const currentTier: SubscriptionTier = state?.subscriptionTier || "free";

  const handlePayPalSuccess = async (details: { subscriptionId: string; planId: string }) => {
    setIsVerifyingPayment(true);
    setVerificationStep(language === "fr" ? "Vérification cryptographique du jeton PayPal..." : "Cryptographic verification of PayPal token...");
    setPayPalTxId(details.subscriptionId);
    
    // Determine which plan was bought based on planId
    const newTier: SubscriptionTier =
      details.planId === "P-2PN232575Y225210YNKY3QZQ" ? "enterprise"
      : details.planId === "P-44Y462991D576054FNKY3PKI" ? "pro"
      : "silver";

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setVerificationStep(language === "fr" ? `Activation des privilèges ${newTier.toUpperCase()}...` : `Activating ${newTier.toUpperCase()} privileges...`);
      await new Promise(resolve => setTimeout(resolve, 800));

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
        `Subscription verified & upgraded to ${newTier.toUpperCase()} Plan (Transaction: ${details.subscriptionId})`
      );

      setPayPalPaymentSuccess(true);
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setIsVerifyingPayment(false);
    }
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
    {
      name: language === "fr" ? "Périmètre Bâtiments & Parcs" : "Monitored Facilities & Assets",
      description: language === "fr" ? "Nombre de bâtiments et sites supervisés simultanément" : "Number of facilities monitored simultaneously",
      category: "core",
      lite: language === "fr" ? "1 Bâtiment (1 tenant)" : "1 Facility (1 tenant)",
      pro: language === "fr" ? "10 Bâtiments (3 tenants)" : "10 Facilities (3 tenants)",
      enterprise: language === "fr" ? "Illimité (Multi-tenant illimité)" : "Unlimited (Multi-tenant pool)",
      isHighlight: true
    },
    {
      name: language === "fr" ? "Jumeau Numérique 3D Spatial" : "3D Spatial Digital Twin",
      description: language === "fr" ? "Moteur de rendu Three.js WebGL avec gradients thermiques" : "Three.js WebGL engine with thermal gradients",
      category: "core",
      lite: language === "fr" ? "Plans 2D interactifs" : "Interactive 2D Floorplans",
      pro: language === "fr" ? "Jumeau 3D Three.js complet" : "Full 3D Three.js Twin",
      enterprise: language === "fr" ? "BIM IFC 4.3 + Jumeau Immersif" : "BIM IFC 4.3 + Immersive Twin",
      isHighlight: true
    },
    {
      name: language === "fr" ? "Gestion des Terminaux & Passerelles (UEM)" : "Unified Endpoint Management (UEM)",
      description: language === "fr" ? "Supervision des automates, passerelles BACnet/Modbus et sondes" : "BMS gateways, BACnet/Modbus controllers and sensors",
      category: "telemetry",
      lite: language === "fr" ? "Passerelles standards" : "Standard Gateways",
      pro: language === "fr" ? "UEM complet + MAJ OTA" : "Full UEM + OTA Updates",
      enterprise: language === "fr" ? "UEM Zero-Trust + mTLS matériel" : "Zero-Trust UEM + Hardware mTLS"
    },
    {
      name: language === "fr" ? "Remédiation AIOps Prédictive" : "Predictive AIOps Remediation",
      description: language === "fr" ? "Détection d'anomalies thermodynamiques et arrêt de surconsommation" : "Thermodynamic anomaly detection & automated curtailment",
      category: "ai",
      lite: language === "fr" ? "Alertes de seuils simples" : "Basic Threshold Alerts",
      pro: language === "fr" ? "AIOps temps réel < 1,5 s" : "Real-time AIOps < 1.5s",
      enterprise: language === "fr" ? "Moteur IA dédié sur-mesure" : "Custom Dedicated AI Pool",
      isHighlight: true
    },
    {
      name: language === "fr" ? "Conformité DORA & Registre NIS2" : "DORA Compliance & NIS2 Register",
      description: language === "fr" ? "Score de résilience opérationnelle, tests ICT et journal d'audit" : "Operational resilience score, ICT tests & audit trails",
      category: "governance",
      lite: language === "fr" ? "Score indicatif" : "Indicative Score",
      pro: language === "fr" ? "DORA natif + Export PDF" : "Native DORA + PDF Export",
      enterprise: language === "fr" ? "DORA, NIS2 & Certification ACPR" : "DORA, NIS2 & Regulatory Audit"
    },
    {
      name: language === "fr" ? "Décret Tertiaire, BACS & CSRD" : "Tertiary Decree, BACS & CSRD",
      description: language === "fr" ? "Exports automatisés prêts pour la plateforme OPERAT ADEME" : "Automated reporting ready for OPERAT and CSRD filings",
      category: "governance",
      lite: language === "fr" ? "Export tableur annuel" : "Annual Spreadsheet Export",
      pro: language === "fr" ? "BACS Classe A + CSRD en 1 clic" : "BACS Class A + 1-Click CSRD",
      enterprise: language === "fr" ? "Audit opposable tiers agréé" : "Certified Opposable Ledger"
    },
    {
      name: language === "fr" ? "Utilisateurs & Gestion des Rôles (RBAC)" : "User Seats & RBAC Privileges",
      description: language === "fr" ? "Niveaux d'accès pour directeurs, techniciens CVC et auditeurs" : "Access levels for executives, facility teams and auditors",
      category: "security",
      lite: language === "fr" ? "5 Utilisateurs" : "5 User Seats",
      pro: language === "fr" ? "25 Utilisateurs" : "25 User Seats",
      enterprise: language === "fr" ? "Utilisateurs illimités" : "Unlimited User Seats"
    },
    {
      name: language === "fr" ? "Hébergement & Souveraineté Numérique" : "Hosting & Digital Sovereignty",
      description: language === "fr" ? "Isolation géographique et immunité contre le CLOUD Act US" : "Geographic isolation and US CLOUD Act immunity",
      category: "security",
      lite: language === "fr" ? "Cloud Souverain UE (Paris/Francfort)" : "EU Sovereign Cloud",
      pro: language === "fr" ? "Cloud Souverain Dédié UE" : "Dedicated EU Sovereign Cloud",
      enterprise: language === "fr" ? "On-Premise / SecNumCloud / HDS" : "On-Premise / SecNumCloud / HDS",
      isHighlight: true
    },
    {
      name: language === "fr" ? "Garantie de Disponibilité SLA & Support" : "Availability SLA & Support Contract",
      description: language === "fr" ? "Engagement contractuel de disponibilité et temps de prise en charge" : "Contractual availability uptime and incident response",
      category: "governance",
      lite: language === "fr" ? "Support Standard 48h" : "Standard Support 48h",
      pro: language === "fr" ? "Support Prioritaire 12h / SLA 99,9%" : "Priority Support 12h / 99.9% SLA",
      enterprise: language === "fr" ? "Support Dédié 24/7 / SLA 99,99%" : "Dedicated 24/7 / 99.99% SLA"
    }
  ];

  const addOnModules = [
    {
      title: language === "fr" ? "Conformité CSRD & Taxonomie UE" : "CSRD & EU Taxonomy Compliance",
      price: "+150 €",
      period: language === "fr" ? "/mois" : "/mo",
      desc: language === "fr" 
        ? "Génération continue du bilan carbone Scopes 1, 2, 3, intégration automatique OPERAT ADEME et tableaux de bord extra-financiers."
        : "Continuous Scopes 1, 2, 3 carbon accounting, ADEME OPERAT integration, and executive ESG dashboards.",
      icon: Award
    },
    {
      title: language === "fr" ? "Jumeau 3D Spatial Avancé" : "Advanced 3D Spatial Digital Twin",
      price: "+200 €",
      period: language === "fr" ? "/mois" : "/mo",
      desc: language === "fr" 
        ? "Import direct des maquettes BIM IFC 4.3 / Revit, rendu WebGL à 60 FPS et calques thermiques dynamiques étage par étage."
        : "Direct BIM IFC 4.3 / Revit import, 60 FPS WebGL rendering, and dynamic floor-by-floor thermal overlays.",
      icon: Layers
    },
    {
      title: language === "fr" ? "Moteur AIOps Prédictif CVC & Froid" : "Predictive AIOps HVAC & Chiller Engine",
      price: "+250 €",
      period: language === "fr" ? "/mois" : "/mo",
      desc: language === "fr" 
        ? "Détection prédictive des anomalies mécaniques par signature vibratoire et thermique avant panne franche, remédiation < 1,5s."
        : "Predictive mechanical failure detection via vibration/thermal signatures before breakdown, <1.5s remediation.",
      icon: Zap
    },
    {
      title: language === "fr" ? "Sécurité Zero-Trust & Vault FIPS" : "Zero-Trust Security & FIPS Vault",
      price: "+100 €",
      period: language === "fr" ? "/mois" : "/mo",
      desc: language === "fr" 
        ? "Passerelles mTLS matériel, isolation physique stricte, certificats rotatifs et coffre-fort cryptographique FIPS 140-3."
        : "Hardware mTLS gateways, strict physical isolation, rotating certs, and FIPS 140-3 cryptographic vault.",
      icon: ShieldAlert
    },
    {
      title: language === "fr" ? "Technicien Mobile Terrain (PWA)" : "Field Technician Mobile App (PWA)",
      price: "+80 €",
      period: language === "fr" ? "/mois" : "/mo",
      desc: language === "fr" 
        ? "Application progressive optimisée pour interventions hors-ligne, scan QR/NFC des équipements et validation des ordres de travail."
        : "Offline-optimized PWA for field technicians, equipment QR/NFC scanning, and digital work order sign-off.",
      icon: Smartphone
    }
  ];

  const payPerUseReports = [
    {
      title: language === "fr" ? "Bilan Réglementaire CSRD Annuel" : "Annual Statutory CSRD Ledger",
      price: "699 €",
      badge: language === "fr" ? "À la demande" : "Pay-per-use",
      desc: language === "fr" 
        ? "Audit carbone certifié et consolidé prêt pour la signature des commissaires aux comptes."
        : "Certified consolidated carbon ledger ready for statutory auditor sign-off.",
      icon: FileSpreadsheet
    },
    {
      title: language === "fr" ? "Rapport d'Audit Annuel DORA" : "Annual DORA Operational Resilience Audit",
      price: "499 €",
      badge: language === "fr" ? "Obligation 2025" : "2025 Mandate",
      desc: language === "fr" 
        ? "Dossier technique complet de résilience TIC opposable aux autorités bancaires et d'assurance (ACPR/EBA)."
        : "Comprehensive ICT resilience package for financial regulators (EBA/ACPR inspection).",
      icon: ShieldCheck
    },
    {
      title: language === "fr" ? "Diagnostic Conformité ISO 27001" : "ISO 27001 Compliance Assessment",
      price: "299 €",
      badge: language === "fr" ? "Audit Flash" : "Flash Audit",
      desc: language === "fr" 
        ? "Cartographie exhaustive des vulnérabilités d'infrastructure et matrice de conformité Zero-Trust."
        : "Full infrastructure vulnerability mapping and Zero-Trust compliance scoring matrix.",
      icon: FileText
    }
  ];

  const proServices = [
    {
      title: language === "fr" ? "Pack Déploiement Clé en Main" : "Turnkey Deployment Package",
      price: "15 000 €",
      type: language === "fr" ? "Forfaitaire" : "Fixed Fee",
      desc: language === "fr" 
        ? "Audit sur site, raccordement non-intrusif aux armoires GTB, modélisation du jumeau 3D initial et formation de vos équipes."
        : "On-site audit, non-intrusive BMS connection, initial 3D digital twin modeling, and facility team onboarding."
    },
    {
      title: language === "fr" ? "Régie d'Intégration Systèmes GTB/BMS" : "Systems Integration Engineering",
      price: "1 200 €",
      type: language === "fr" ? "/ jour homme" : "/ day rate",
      desc: language === "fr" 
        ? "Intervention d'ingénieurs spécialistes en protocoles industriels (BACnet, Modbus, KNX, LonWorks, Siemens, Schneider)."
        : "Specialist engineering in industrial building protocols (BACnet, Modbus, KNX, LonWorks, Siemens Desigo)."
    }
  ];

  const faqs = [
    {
      q: language === "fr" ? "Pourquoi choisir SENSORIUM plutôt qu'une GTB ou un CAFM traditionnel ?" : "Why choose SENSORIUM over traditional BMS or CAFM software?",
      a: language === "fr" 
        ? "SENSORIUM fusionne en une stack souveraine unique ce qui nécessite d'habitude 4 outils séparés : le CAFM technique, la gestion des équipements (UEM), la sécurité Zero-Trust et la conformité réglementaire (DORA, Décret Tertiaire, CSRD). Notre jumeau 3D et notre remédiation AIOps < 1,5s génèrent un ROI mesuré moyen de 18 400 €/an par bâtiment."
        : "SENSORIUM unifies what typically requires 4 separate vendors: CAFM, UEM endpoint management, Zero-Trust security, and statutory ESG/DORA compliance into a single sovereign stack. Our 3D twin and <1.5s AIOps remediation deliver an average measured ROI of €18,400/year per facility."
    },
    {
      q: language === "fr" ? "Comment s'effectue le paiement et la facturation ?" : "How does billing and payment work?",
      a: language === "fr" 
        ? "Les abonnements Lite et Pro se règlent par carte bancaire ou prélèvement via la passerelle certifiée PayPal. La facturation annuelle accorde immédiatement une remise de 20%. Pour le forfait Enterprise, la facturation s'effectue par bon de commande (PO) et virement bancaire sous 30 jours."
        : "Lite and Pro subscriptions are securely paid via credit card or PayPal gateway. Annual billing includes an immediate 20% discount. Enterprise plans are invoiced via corporate Purchase Orders (PO) with standard net 30 terms."
    },
    {
      q: language === "fr" ? "Un remplacement matériel ou des travaux physiques sont-ils nécessaires ?" : "Is hardware replacement or civil works required?",
      a: language === "fr" 
        ? "Non. SENSORIUM est conçu sur un paradigme logiciel pur (SaaS souverain & Edge léger). Nous exploitons vos automates, compteurs et sous-compteurs existants via plus de 80 protocoles industriels gérés nativement (BACnet, Modbus, KNX, MQTT, LoRaWAN)."
        : "No. SENSORIUM operates as a pure software platform. We interface with your existing meters and BMS controllers across 80+ supported industrial protocols (BACnet, Modbus, KNX, MQTT, LoRaWAN) with zero civil works."
    },
    {
      q: language === "fr" ? "Proposez-vous un déploiement On-Premise ou Cloud Souverain (SecNumCloud / HDS) ?" : "Do you offer On-Premise or Sovereign Cloud (SecNumCloud / HDS) deployments?",
      a: language === "fr" 
        ? "Oui. Notre offre Enterprise permet l'installation directe au sein de vos datacenters privés, environnements air-gapped étanches ou clouds souverains européens (conformité NIS2, DORA, FIPS 140-3 et RGPD strict sans exposition au CLOUD Act US)."
        : "Yes. Our Enterprise plan enables direct deployment in private on-premise datacenters, air-gapped facilities, or certified European sovereign clouds (NIS2, DORA, FIPS 140-3, and zero CLOUD Act exposure)."
    }
  ];

  return (
    <div className="relative w-full -mx-4 sm:-mx-6 lg:-mx-8 -my-6 px-4 sm:px-8 lg:px-12 py-8 bg-[#0b0f17] text-[#f1f5f9] min-h-screen overflow-hidden selection:bg-[#f97316] selection:text-white">
      
      {/* Ambient background glows matching SENSORIUM sovereign orange & slate theme */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[550px] h-[550px] bg-[#f97316]/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#ea580c]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-[#f97316]/5 rounded-full blur-[130px]" />

        {/* Technical dot matrix overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(249, 115, 22, 0.25) 1px, transparent 1px)`,
            backgroundSize: "28px 28px"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto pt-4 space-y-5 flex flex-col items-center">
          
          {/* Sovereign Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1e293b]/80 backdrop-blur-md rounded-full border border-[#f97316]/30 text-[#f97316] text-xs font-semibold uppercase tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.9)] animate-pulse" />
            <span>{language === "fr" ? "TARIFICATION SOUVERAINE B2B" : "SOVEREIGN B2B PRICING"}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {language === "fr" ? "Supervision Industrielle & CAFM." : "Industrial Supervision & CAFM."}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] via-[#fb923c] to-[#fdba74]">
              {language === "fr" ? "Conformité DORA & Énergie." : "DORA & ESG Compliance."}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {language === "fr"
              ? "Plateforme SaaS souveraine combinant Jumeau 3D, IoT haute vélocité (1,4 M req/s), remédiation AIOps < 1,5s et audits CSRD opposables. 14 jours d'essai sans engagement."
              : "Sovereign SaaS platform uniting 3D Digital Twin, high-frequency IoT (1.4M req/s), <1.5s AIOps remediation, and certified DORA/CSRD compliance. 14-day free trial."}
          </p>

          {/* Billing Cycle Switcher with 20% discount */}
          <div className="pt-2">
            <div className="relative inline-flex items-center p-1 bg-[#1e293b]/90 backdrop-blur-lg rounded-full border border-slate-700 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`relative z-10 px-6 py-2 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                  billingCycle === "monthly" ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {language === "fr" ? "Facturation Mensuelle" : "Monthly Billing"}
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`relative z-10 px-6 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 cursor-pointer ${
                  billingCycle === "yearly" ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>{language === "fr" ? "Facturation Annuelle" : "Annual Billing"}</span>
                <span className="text-[10px] text-[#f97316] bg-[#f97316]/15 border border-[#f97316]/30 px-2 py-0.5 rounded-full font-bold">
                  {language === "fr" ? "-20%" : "Save 20%"}
                </span>
              </button>

              {/* Sliding Background Pill */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#f97316] rounded-full transition-transform duration-300 ease-out shadow-md pointer-events-none ${
                  billingCycle === "yearly" ? "translate-x-full" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>

        {/* 3 Core SaaS Tiers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {/* 1. TIER LITE */}
          <div className={`relative bg-[#111827]/80 backdrop-blur-xl rounded-3xl p-7 flex flex-col justify-between border transition-all duration-300 hover:bg-[#111827] hover:-translate-y-1 ${
            currentTier === "silver"
              ? "border-[#f97316] shadow-[0_0_30px_rgba(249,115,22,0.2)] ring-1 ring-[#f97316]"
              : "border-slate-800"
          }`}>
            <div className="space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {language === "fr" ? "PME & PROJETS PILOTES" : "SMB & POC"}
                  </div>
                  <h3 className="text-2xl font-bold text-white">Tier Lite</h3>
                  <p className="text-xs text-slate-400 mt-1.5 min-h-[32px]">
                    {language === "fr" ? "Supervision essentielle pour 1 bâtiment et flotte IoT standard." : "Essential facility monitoring for 1 asset and IoT fleet."}
                  </p>
                </div>
                {currentTier === "silver" && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40">
                    {language === "fr" ? "ACTUEL" : "ACTIVE"}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-4xl font-extrabold text-white">
                  {billingCycle === "monthly" ? "149 €" : "119 €"}
                </span>
                <span className="text-sm text-slate-400 font-medium">/{language === "fr" ? "mois" : "mo"}</span>
              </div>

              {/* Action Button */}
              {currentTier === "silver" ? (
                <div className="w-full py-3 px-4 rounded-xl bg-slate-800/80 text-[#f97316] text-xs font-bold text-center border border-[#f97316]/30">
                  {language === "fr" ? "Forfait Actuel" : "Current Plan"}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handlePayPalSuccess({ subscriptionId: "mock_lite_tx_" + Date.now(), planId: "P-44Y462991D576054FNKY3PKI" })}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{language === "fr" ? "Démarrer l'Essai Lite" : "Start Lite Trial"}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <div className="p-2 rounded-xl bg-[#0b0f17]/80 border border-slate-800">
                    <PayPalSmartButton 
                      planId="P-44Y462991D576054FNKY3PKI" 
                      onSuccess={handlePayPalSuccess} 
                      isDark={true} 
                    />
                  </div>
                </div>
              )}

              {/* Features List */}
              <ul className="space-y-3 pt-5 border-t border-slate-800 text-xs">
                <li className="flex items-start gap-2.5 text-slate-300">
                  <Check className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>1 Bâtiment</strong> {language === "fr" ? "(1 Tenant isolé)" : "(1 isolated tenant)"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-300">
                  <Check className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>5 Utilisateurs</strong> {language === "fr" ? "avec rôles RBAC standards" : "with standard RBAC roles"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-300">
                  <Check className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Dashboard CAFM & Télémétrie IoT basique" : "CAFM Dashboard & Basic IoT Telemetry"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-300">
                  <Check className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Plans d'étage 2D interactifs" : "Interactive 2D Floorplans"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-500">
                  <X className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Jumeau Numérique 3D Three.js" : "Three.js 3D Digital Twin"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-500">
                  <X className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <span>{language === "fr" ? "Conformité DORA & Audit opposable" : "DORA Compliance & Opposable Audit"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 2. TIER PRO (Featured & Highlighted) */}
          <div className={`relative bg-[#1e293b]/90 backdrop-blur-2xl rounded-3xl p-7 xl:p-8 flex flex-col justify-between border-2 border-[#f97316] shadow-[0_0_40px_rgba(249,115,22,0.25)] z-20 group transform lg:-translate-y-2 ${
            currentTier === "pro" ? "ring-2 ring-[#fb923c]" : ""
          }`}>
            {/* "Most Popular" floating badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-extrabold text-[11px] px-4 py-1 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)] whitespace-nowrap uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "fr" ? "LE PLUS POPULAIRE (ETI)" : "MOST POPULAR (MID-MARKET)"}</span>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-start pt-2">
                <div>
                  <div className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-[#fb923c] mb-1">
                    {language === "fr" ? "STANDARD INDUSTRIEL" : "ENTERPRISE STANDARD"}
                  </div>
                  <h3 className="text-3xl font-extrabold text-white">Tier Pro</h3>
                  <p className="text-xs text-slate-300 mt-1.5 min-h-[32px]">
                    {language === "fr" ? "La suite complète : Jumeau 3D, UEM, DORA et AIOps temps réel." : "Full suite: 3D Twin, UEM, DORA and real-time AIOps."}
                  </p>
                </div>
                {currentTier === "pro" && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/50">
                    {language === "fr" ? "ACTUEL" : "ACTIVE"}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-5xl font-black text-white">
                  {billingCycle === "monthly" ? "699 €" : "559 €"}
                </span>
                <span className="text-sm text-slate-300 font-medium">/{language === "fr" ? "mois" : "mo"}</span>
              </div>

              {/* Action Button / PayPal Gateway */}
              <div className="space-y-2 pt-1">
                {currentTier === "pro" ? (
                  <div className="w-full py-3 px-4 rounded-xl bg-[#f97316]/20 text-[#f97316] text-xs font-bold text-center border border-[#f97316]/50 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === "fr" ? "Abonnement Pro Actif" : "Pro Plan Active"}</span>
                  </div>
                ) : isVerifyingPayment ? (
                  <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-200 text-xs font-mono flex flex-col items-center justify-center gap-2 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#f97316]" />
                    <span className="text-[11px] text-center font-sans font-medium">{verificationStep}</span>
                  </div>
                ) : payPalPaymentSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{language === "fr" ? "Abonnement Validé & Actif !" : "Subscription Confirmed & Active!"}</span>
                    </div>
                    {payPalTxId && (
                      <span className="text-[10px] font-mono text-emerald-400/80">ID: {payPalTxId.slice(0, 20)}</span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handlePayPalSuccess({ subscriptionId: "mock_pro_tx_" + Date.now(), planId: "P-44Y462991D576054FNKY3PKI" })}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white text-xs font-bold tracking-wide transition-all shadow-[0_0_25px_rgba(249,115,22,0.4)] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>{language === "fr" ? "Démarrer l'Essai Pro (14 jours)" : "Start Pro 14-Day Trial"}</span>
                    </button>
                    
                    <div className="p-2 rounded-xl bg-[#0b0f17]/90 border border-slate-700">
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
              <ul className="space-y-3 pt-5 border-t border-slate-700 text-xs">
                <li className="flex items-start gap-2.5 text-white font-medium">
                  <CheckCircle className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>10 Bâtiments</strong> {language === "fr" ? "(3 Tenants isolés)" : "(3 isolated tenants)"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-white font-medium">
                  <CheckCircle className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>25 Utilisateurs</strong> {language === "fr" ? "+ rôles directeurs, CVC & ESG" : "+ manager, HVAC & ESG roles"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-white font-medium">
                  <CheckCircle className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>Jumeau Numérique 3D Three.js</strong> {language === "fr" ? "complet avec calques" : "full with thermal layers"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-white font-medium">
                  <CheckCircle className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>Gestion UEM</strong> {language === "fr" ? "+ ingestion 1,4 M req/s" : "+ 1.4M req/s ingestion"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-white font-medium">
                  <CheckCircle className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>Conformité DORA</strong> {language === "fr" ? "& rapports CSRD en 1 clic" : "& 1-click CSRD reports"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-white font-medium">
                  <CheckCircle className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>AIOps Prédictif</strong> {language === "fr" ? "(remédiation pannes < 1,5s)" : "(<1.5s fault remediation)"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. TIER ENTERPRISE */}
          <div className={`relative bg-[#111827]/80 backdrop-blur-xl rounded-3xl p-7 flex flex-col justify-between border transition-all duration-300 hover:bg-[#111827] hover:-translate-y-1 ${
            currentTier === "enterprise"
              ? "border-[#f97316] shadow-[0_0_30px_rgba(249,115,22,0.2)] ring-1 ring-[#f97316]"
              : "border-slate-800"
          }`}>
            <div className="space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {language === "fr" ? "GRANDS COMPTES & SANTÉ" : "LARGE ENTERPRISE & GOV"}
                  </div>
                  <h3 className="text-2xl font-bold text-white">Tier Enterprise</h3>
                  <p className="text-xs text-slate-400 mt-1.5 min-h-[32px]">
                    {language === "fr" ? "Déploiement souverain sur-mesure, On-Premise & SLA 99,99%." : "Sovereign on-premise appliance & 99.99% SLA."}
                  </p>
                </div>
                {currentTier === "enterprise" && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/40">
                    {language === "fr" ? "ACTUEL" : "ACTIVE"}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-3xl font-extrabold text-white">
                  {language === "fr" ? "Sur devis" : "Custom Quote"}
                </span>
                <span className="text-xs text-slate-400 font-medium">({language === "fr" ? "dès 2 500 €/m" : "from €2,500/mo"})</span>
              </div>

              {/* Action Button */}
              {currentTier === "enterprise" ? (
                <div className="w-full py-3 px-4 rounded-xl bg-slate-800/80 text-[#f97316] text-xs font-bold text-center border border-[#f97316]/30">
                  {language === "fr" ? "Forfait Actuel" : "Current Plan"}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectTab) onSelectTab("inf-6");
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-transparent hover:bg-[#f97316]/10 text-[#f97316] text-xs font-bold transition-all border border-[#f97316]/60 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <Briefcase className="w-4 h-4 text-[#f97316]" />
                    <span>{language === "fr" ? "Contacter la Direction Commerciale" : "Contact Enterprise Sales"}</span>
                  </button>
                  <div className="p-2 rounded-xl bg-[#0b0f17]/80 border border-slate-800">
                    <PayPalSmartButton 
                      planId="P-2PN232575Y225210YNKY3QZQ" 
                      onSuccess={handlePayPalSuccess} 
                      isDark={true} 
                    />
                  </div>
                </div>
              )}

              {/* Features List */}
              <ul className="space-y-3 pt-5 border-t border-slate-800 text-xs">
                <li className="flex items-start gap-2.5 text-slate-300">
                  <Check className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>Multi-tenant illimité</strong> {language === "fr" ? "& parcs illimités" : "& unlimited assets"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-300">
                  <Check className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>On-Premise / SecNumCloud / HDS</strong> {language === "fr" ? "(zéro cloud US)" : "(zero US cloud)"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-300">
                  <Check className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>SSO SAML / Okta / Azure AD</strong> {language === "fr" ? "& FIPS 140-3" : "& FIPS 140-3"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-300">
                  <Check className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>SLA 99,99% garanti</strong> {language === "fr" ? "avec astreinte 24/7" : "with 24/7 on-call engineers"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-300">
                  <Check className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
                  <span><strong>Licence OEM / Marque Blanche</strong> {language === "fr" ? "pour intégrateurs" : "for integrators"}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Section 2 : Modules Complémentaires (Add-ons Pay-per-Feature) */}
        <div className="space-y-6 pt-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#f97316] uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              <span>{language === "fr" ? "MODULES COMPLÉMENTAIRES (ADD-ONS)" : "ADD-ON MODULES (PAY-PER-FEATURE)"}</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {language === "fr" ? "Activez les Capacités Avancées à la Carte" : "Unlock Advanced Capabilities On-Demand"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === "fr"
                ? "Modules déployables en 1 clic sur vos instances Lite, Pro ou Enterprise avec facturation mensuelle ajustée."
                : "1-click deployable add-on modules to enhance your Lite, Pro or Enterprise clusters with flexible monthly billing."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOnModules.map((addon, i) => {
              const IconComp = addon.icon;
              return (
                <div 
                  key={i}
                  className="p-6 rounded-2xl bg-[#111827]/70 border border-slate-800 hover:border-[#f97316]/50 transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-[#f97316]">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-white">{addon.price}</span>
                        <span className="text-xs text-slate-400">{addon.period}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white">{addon.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{addon.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectTab) onSelectTab("inf-6");
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-[#f97316]/20 hover:text-[#f97316] text-xs font-semibold text-slate-300 transition-colors border border-slate-700 hover:border-[#f97316]/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{language === "fr" ? "Activer ce Module" : "Activate Module"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3 : Rapports à la Demande & Services Professionnels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          
          {/* Rapports Pay-per-Use */}
          <div className="p-7 rounded-3xl bg-[#111827]/70 border border-slate-800 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#f97316] uppercase tracking-wider mb-1">
                <FileText className="w-4 h-4" />
                <span>{language === "fr" ? "RAPPORTS À LA DEMANDE (PAY-PER-USE)" : "ON-DEMAND AUDITS (PAY-PER-USE)"}</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {language === "fr" ? "Livrables Réglementaires sans Abonnement" : "Compliance Reports without Subscription"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === "fr"
                  ? "Idéal pour répondre aux urgences d'audit CSRD, DORA ou ISO 27001 avec certification opposable immédiate."
                  : "Ideal for immediate statutory CSRD, DORA, or ISO 27001 compliance deadlines."}
              </p>
            </div>

            <div className="space-y-4">
              {payPerUseReports.map((report, i) => {
                const IconComp = report.icon;
                return (
                  <div key={i} className="p-4 rounded-xl bg-[#0b0f17]/80 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-[#f97316] shrink-0 mt-0.5">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{report.title}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f97316]/15 text-[#f97316] font-bold">
                            {report.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{report.desc}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-bold text-white">{report.price}</div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectTab) onSelectTab("inf-6");
                        }}
                        className="text-[11px] font-semibold text-[#f97316] hover:underline cursor-pointer"
                      >
                        {language === "fr" ? "Commander" : "Order"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Services Professionnels & Intégration */}
          <div className="p-7 rounded-3xl bg-[#111827]/70 border border-slate-800 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#f97316] uppercase tracking-wider mb-1">
                <Briefcase className="w-4 h-4" />
                <span>{language === "fr" ? "SERVICES PROFESSIONNELS & INTÉGRATION" : "PROFESSIONAL SERVICES & INTEGRATION"}</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {language === "fr" ? "Accompagnement Technique & Intégration Terrain" : "Expert Deployment & Field Engineering"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === "fr"
                  ? "Nos directeurs de mission thermique et ingénieurs GTB interviennent directement sur vos infrastructures."
                  : "Senior building engineers and BMS protocol specialists deployed directly to your facilities."}
              </p>
            </div>

            <div className="space-y-4">
              {proServices.map((service, i) => (
                <div key={i} className="p-5 rounded-xl bg-[#0b0f17]/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{service.title}</h4>
                    <div className="text-right">
                      <span className="text-base font-bold text-[#f97316]">{service.price}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1">{service.type}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{service.desc}</p>
                </div>
              ))}

              <div className="p-4 rounded-xl bg-[#f97316]/5 border border-[#f97316]/20 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-300">
                  {language === "fr" ? "Vous êtes un intégrateur ou une ESN ?" : "Are you an integrator or engineering firm?"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectTab) onSelectTab("inf-6");
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#f97316] text-white text-xs font-bold hover:bg-[#ea580c] transition-colors cursor-pointer shrink-0"
                >
                  {language === "fr" ? "Programme Partenaires OEM" : "OEM Partner Program"}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Comparison Matrix */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111827]/70 backdrop-blur-xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#f97316]" />
                <span>{language === "fr" ? "Matrice Détaillée des Fonctionnalités par Forfait" : "Detailed Feature Comparison Matrix"}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === "fr" ? "Comparatif exhaustif des quotas IoT, jumeaux 3D, sécurité Zero-Trust et audits." : "Exhaustive comparison across IoT quotas, 3D twins, Zero-Trust security and audits."}
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-[#f97316] border border-[#f97316]/30 self-start sm:self-auto">
              {comparisonFeatures.length} {language === "fr" ? "critères certifiés" : "certified criteria"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4 w-2/5">{language === "fr" ? "Fonctionnalité & Module" : "Feature & Capability"}</th>
                  <th className="py-3 px-3 text-center">{language === "fr" ? "Lite (149€)" : "Lite (€149)"}</th>
                  <th className="py-3 px-3 text-center text-[#f97316] font-bold">{language === "fr" ? "Pro (699€ - Populaire)" : "Pro (€699 - Popular)"}</th>
                  <th className="py-3 px-3 text-center">{language === "fr" ? "Enterprise" : "Enterprise"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {comparisonFeatures.map((row, idx) => (
                  <tr 
                    key={idx}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      row.isHighlight ? "bg-[#f97316]/[0.03]" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{row.name}</span>
                        {row.isHighlight && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#f97316]/20 text-[#f97316] font-bold">
                            KEY
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {row.description}
                      </div>
                    </td>

                    {/* Lite */}
                    <td className="py-3.5 px-3 text-center text-slate-300">
                      {typeof row.lite === "boolean" ? (
                        row.lite ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span>{row.lite}</span>
                      )}
                    </td>

                    {/* Pro */}
                    <td className="py-3.5 px-3 text-center font-bold text-white bg-[#f97316]/5 border-x border-[#f97316]/10">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <CheckCircle className="w-4 h-4 text-[#f97316] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-[#f97316]">{row.pro}</span>
                      )}
                    </td>

                    {/* Enterprise */}
                    <td className="py-3.5 px-3 text-center text-slate-200 font-medium">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? (
                          <Check className="w-4 h-4 text-[#f97316] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-white font-medium">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Frequently Asked Questions Accordion */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111827]/70 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-[#f97316]" />
            <span>{language === "fr" ? "Questions Fréquentes sur la Monétisation" : "Frequently Asked Questions"}</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="rounded-2xl border border-slate-800 overflow-hidden bg-[#0b0f17]/60"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-white flex justify-between items-center hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {activeFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-[#f97316]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {activeFaq === i && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Bottom Banner */}
        <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-r from-slate-900 via-[#111827] to-[#1e293b] border border-[#f97316]/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#f97316] mb-1">
              <Building2 className="w-4 h-4" />
              <span>{language === "fr" ? "DÉPLOIEMENT ON-PREMISE & SOUVERAIN" : "ON-PREMISE & SOVEREIGN CLOUD"}</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {language === "fr" ? "Besoin d'un déploiement dédié ou d'un accord-cadre ?" : "Need a custom Enterprise deployment or framework contract?"}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              {language === "fr" 
                ? "Nos architectes conçoivent vos passerelles Edge privées, modèles neuronaux dédiés et intégrations FIPS 140-3 sous accord de confidentialité (NDA)." 
                : "Our systems architects design private sovereign clusters, dedicated neural models, and FIPS 140-3 integrations under NDA."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onSelectTab) {
                onSelectTab("inf-6");
              }
            }}
            className="px-6 py-3 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.35)] transition-all shrink-0 cursor-pointer"
          >
            <span>{language === "fr" ? "Planifier un Entretien Exécutif" : "Schedule Executive Consultation"}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Footer info bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 border-t border-slate-800 pt-6">
          <div>© {new Date().getFullYear()} SENSORIUM Sovereign CAFM & Smart Infrastructure. {language === "fr" ? "Tous droits réservés." : "All rights reserved."}</div>
          <div className="flex items-center gap-6">
            <a href="/site/regles.html" className="hover:text-[#f97316] transition-colors cursor-pointer">
              {language === "fr" ? "Politique de Confidentialité" : "Privacy Policy"}
            </a>
            <a href="/site/conditions.html" className="hover:text-[#f97316] transition-colors cursor-pointer">
              {language === "fr" ? "Conditions Générales (CGU)" : "Terms of Service"}
            </a>
            <a href="/site/securite.html" className="hover:text-[#f97316] transition-colors cursor-pointer">
              {language === "fr" ? "Sécurité & Souveraineté" : "Security Whitepaper"}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
