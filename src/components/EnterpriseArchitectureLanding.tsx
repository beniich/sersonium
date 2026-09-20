import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "motion/react";
import { 
  Building2, 
  Server, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Database, 
  Network, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  Zap, 
  Workflow, 
  Boxes, 
  ChevronRight,
  Lock,
  Globe2,
  HardDrive,
  FileCheck2,
  Eye,
  LogIn,
  Sliders,
  Sparkles,
  Play,
  Check,
  ChevronDown,
  ExternalLink,
  Shield,
  Gauge,
  Leaf,
  Radio,
  Clock,
  Compass,
  Laptop,
  Smartphone,
  Flame,
  Tablet,
  Monitor,
  MousePointerClick,
  RefreshCw,
  ZoomIn,
  Info,
  Maximize2,
  BellRing,
  Fingerprint,
  ChevronUp
} from "lucide-react";
import LacazaLogo from "./LacazaLogo";
import { GlobalState } from "../types";

// High-resolution hardware & infrastructure photography
import processorMacroImg from "../assets/images/lacaza_processor_macro_1789592138531.jpg";
import edgeNodeImg from "../assets/images/lacaza_premium_edge_node_1789592125126.jpg";
import waterResistImg from "../assets/images/lacaza_water_resistance_1789592152234.jpg";
import quantumEdgeImg from "../assets/images/quantum_edge_core_1789568592988.jpg";
import planetaryMeshImg from "../assets/images/planetary_edge_mesh_1789568609265.jpg";

// Photorealistic multi-device mockups
import studioMockupImg from "../assets/images/lacaza_studio_mockup_1789685187663.jpg";
import mobileMockupImg from "../assets/images/lacaza_mobile_mockup_1789685199548.jpg";
import tabletMockupImg from "../assets/images/lacaza_tablet_mockup_1789685210155.jpg";

interface EnterpriseArchitectureLandingProps {
  onSignIn?: () => void;
  onEnterDashboard?: () => void;
  state?: GlobalState;
}

// 5 Architectural Tiers Definition (Apple Keynote Style)
interface ArchTier {
  id: string;
  tierNumber: number;
  name: string;
  code: string;
  subtitle: string;
  tagline: string;
  accent: string;
  badge: string;
  description: string;
  components: { name: string; type: string; status: string; metric: string }[];
  protocols: string[];
  specs: { label: string; value: string }[];
  keynoteHighlight: string;
}

const ARCH_TIERS: ArchTier[] = [
  {
    id: "tier-5",
    tierNumber: 5,
    name: "Cockpit Métier & Portails d'Exploitation",
    code: "PRESENTATION & GOVERNANCE LAYER",
    subtitle: "Consoles unifiées CAFM/ITSM, ERP Connectors & Mobilité Technicien",
    tagline: "Une interface unifiée pour décider en millisecondes.",
    accent: "#f59e0b",
    badge: "FRONT & GOVERNANCE",
    description: "Point d'entrée unique pour les directions immobilières, les DSI, les techniciens de maintenance et les occupants. Interface unifiée fusionnant les processus ITIL v4 et la gestion de patrimoine ISO 55001.",
    keynoteHighlight: "Temps de chargement < 80ms avec 10 000+ sessions actives.",
    components: [
      { name: "Tableau de Bord Exécutif", type: "Cockpit Unifié", status: "Opérationnel", metric: "100% KPI Synchronisés" },
      { name: "GMAO & Ordres de Travail", type: "CAFM Mobile", status: "Actif", metric: "SLA 99.8% Respecté" },
      { name: "Portail ITSM & Helpdesk", type: "ITIL v4", status: "Temps réel", metric: "< 15 min Résolution P1" },
      { name: "Connecteurs ERP (SAP / Oracle)", type: "API Gateway", status: "Connecté", metric: "Synchronisation mTLS" }
    ],
    protocols: ["GraphQL", "REST API v2", "OAuth 2.0 / SAML", "WebSockets Secure"],
    specs: [
      { label: "Temps de réponse UI", value: "< 80 ms" },
      { label: "Utilisateurs simultanés", value: "10 000+" },
      { label: "Rôle Based Access (RBAC)", value: "Granularité Zone/Bâtiment" }
    ]
  },
  {
    id: "tier-4",
    tierNumber: 4,
    name: "Moteur d'IA & Maintenance Prédictive",
    code: "INTELLIGENCE & AUTOMATION ENGINE",
    subtitle: "Analytique prescriptive, détection d'anomalies CVC & routage automatique",
    tagline: "Anticipez les pannes 14 jours avant leur survenue.",
    accent: "#a855f7",
    badge: "AI PREDICTIVE ENGINE",
    description: "Algorithmes heuristiques d'apprentissage continu corrélant les données météorologiques, l'occupation réelle des espaces et les métriques des serveurs pour anticiper les pannes et minimiser la facture énergétique.",
    keynoteHighlight: "-42% sur la consommation énergétique CVC grâce à l'IA.",
    components: [
      { name: "Module Régulation CVC Prédictive", type: "Machine Learning", status: "Optimisé", metric: "-42% Consommation kWh" },
      { name: "Détecteur de Dérive Équipements", type: "Analyse Vibratoire/Amp", status: "En surveillance", metric: "Zéro arrêt non planifié" },
      { name: "Routage Dynamique des Tickets", type: "Moteur IA NLP", status: "Automatique", metric: "Qualification en 1.2s" },
      { name: "Optimiseur d'Espace Flex-Office", type: "Algorithme Heuristique", status: "Actif", metric: "Taux de foisonnement 1.3" }
    ],
    protocols: ["gRPC Streaming", "Python Core Models", "TensorFlow Serving", "Prometheus Metrics"],
    specs: [
      { label: "Précision d'anticipation", value: "96.4%" },
      { label: "Fenêtre prédictive", value: "J-14 avant défaillance" },
      { label: "Calcul d'empreinte CSRD", value: "Bilan Carbone temps réel" }
    ]
  },
  {
    id: "tier-3",
    tierNumber: 3,
    name: "Bus d'Événements & Data Mesh (Télémétrie)",
    code: "REAL-TIME STREAMING & TELEMETRY MESH",
    subtitle: "Pipelines Kafka résilients, ingestion IoT haute fréquence & corrélation",
    tagline: "144 000 événements par seconde. Zéro compromis.",
    accent: "#f97316",
    badge: "EVENT-DRIVEN BACKBONE",
    description: "Colonne vertébrale de communication asynchrone capable d'ingérer plus de 144 000 événements par seconde provenant des automates du bâtiment, des agents IT et des sondes réseaux sans aucune perte de paquet.",
    keynoteHighlight: "Latence d'ingestion inférieure à 4 millisecondes.",
    components: [
      { name: "Cluster Kafka Dédié", type: "Distributed Event Log", status: "Haute Disponibilité", metric: "144k msg/seconde" },
      { name: "Broker MQTT IoT", type: "Telemetry Gateway", status: "En ligne", metric: "48 000 capteurs appairés" },
      { name: "Moteur de Corrélation d'Alertes", type: "Stream Processing", status: "Actif", metric: "Déduplication 94%" },
      { name: "Data Lakehouse Distribué", type: "Stockage NVMe", status: "Sync Multi-Régions", metric: "Rétention 5 ans certifiée" }
    ],
    protocols: ["Apache Kafka 3.6", "MQTT v5.0", "WebSockets TLS 1.3", "BACnet/IP Gateway"],
    specs: [
      { label: "Latence d'ingestion", value: "< 4 ms" },
      { label: "Débit réseau backbone", value: "144 Tbps Anycast" },
      { label: "Résilience nœuds", value: "Redondance Triple Site" }
    ]
  },
  {
    id: "tier-2",
    tierNumber: 2,
    name: "Systèmes IT d'Entreprise & CMDB",
    code: "IT INFRASTRUCTURE & SERVICE MANAGEMENT",
    subtitle: "Parcs machines, baies serveurs, réseau SD-WAN & gouvernance des actifs",
    tagline: "L'inventaire exhaustif de chaque composant de votre réseau.",
    accent: "#0071e3",
    badge: "ITSM & CMDB CORE",
    description: "Inventaire exhaustif et dynamique de l'ensemble du patrimoine informatique : postes de travail, serveurs de virtualisation, switches de distribution, firewalls et liaisons WAN interconnectées avec la cartographie physique.",
    keynoteHighlight: "Cartographie en graphe dynamique de 14 850 actifs IT.",
    components: [
      { name: "Base CMDB Automatisée", type: "IT Asset Discovery", status: "Découverte active", metric: "14 850 actifs audités" },
      { name: "Supervision Baies & Hyperviseurs", type: "Nœuds Bare-Metal / K8s", status: "100% Opérationnel", metric: "CPU 38% • RAM 52%" },
      { name: "Réseau Anycast BGP & Zero-Trust", type: "SD-WAN Mesh", status: "Filtrage L7 Actif", metric: "Protection anti-DDoS" },
      { name: "Gestionnaire de Certificats & IAM", type: "PKI / Active Directory", status: "Sécurisé", metric: "Renouvellement auto" }
    ],
    protocols: ["SNMP v3", "SSH / WinRM", "OpenID Connect", "WMI", "TLS 1.3", "BGP Anycast"],
    specs: [
      { label: "Disponibilité Système", value: "99.999% Uptime" },
      { label: "Conformité de configuration", value: "100% Validée ISO 27001" },
      { label: "Cartographie de dépendance", value: "Automatique en graphe" }
    ]
  },
  {
    id: "tier-1",
    tierNumber: 1,
    name: "Bâtiments & Infrastructures Physiques (CAFM / GTB)",
    code: "SMART PHYSICAL INFRASTRUCTURE & BMS",
    subtitle: "Jumeaux numériques 3D, GTB/GTC, génie climatique (CVC) & capteurs IoT",
    tagline: "Le monde physique numérisé au millimètre près.",
    accent: "#10b981",
    badge: "PHYSICAL ASSETS & BMS",
    description: "La couche physique qui numérise l'espace : modélisation BIM des étages, automates programmables industriels, groupes froids, centrales de traitement d'air (CTA), compteurs divisionnaires et contrôle d'accès sécurisé.",
    keynoteHighlight: "Supervision de 320 000 m² avec un PUE Datacenter de 1.12.",
    components: [
      { name: "Jumeau Numérique Bâtiment (BIM)", type: "Modélisation 3D", status: "Calibré", metric: "42 Sites modélisés" },
      { name: "Supervision GTB / CVC Industrielle", type: "Automates DDC", status: "Régulation optimale", metric: "PUE Datacenter 1.12" },
      { name: "Réseau de Capteurs d'Ambiance", type: "LoRaWAN & Zigbee", status: "Connecté", metric: "CO2, Temp, Présence" },
      { name: "Contrôle d'Accès Physique & Vidéo", type: "Badges NFC & Portiques", status: "Zero-Trust Physique", metric: "Audit des flux temps réel" }
    ],
    protocols: ["BACnet / IP & MSTP", "Modbus TCP/RTU", "KNX", "DALI-2", "M-Bus", "LoRaWAN"],
    specs: [
      { label: "Surfaces supervisées", value: "320 000 m²" },
      { label: "Efficacité Énergétique", value: "Conforme Décret Tertiaire" },
      { label: "PUE Moyen Datacenters", value: "1.12 (Classe Mondiale)" }
    ]
  }
];

// Interactive Blueprint Zones
interface BlueprintZone {
  id: string;
  name: string;
  level: string;
  category: "Datacenter" | "Tertiaire" | "Technique" | "Réseau" | "Sécurité";
  status: "Optimisé" | "Nominal" | "Surveillance";
  temp: string;
  power: string;
  devices: number;
  workOrders: number;
  highlight: string;
  icon: any;
}

const BLUEPRINT_ZONES: BlueprintZone[] = [
  {
    id: "zone-dc",
    name: "Datacenter Principal (Salle Blanche N+1)",
    level: "Sous-sol -1 • Zone Alpha",
    category: "Datacenter",
    status: "Optimisé",
    temp: "19.8 °C",
    power: "42 kW (PUE 1.12)",
    devices: 184,
    workOrders: 0,
    highlight: "Baies serveurs isolées en confinement allée froide, onduleurs modulaires 2N et détection optique précoce d'incendie (VESDA).",
    icon: Server
  },
  {
    id: "zone-cvc",
    name: "Centrale de Traitement d'Air & Chaufferie (CVC)",
    level: "Niveau Technique • Toiture R+5",
    category: "Technique",
    status: "Nominal",
    temp: "21.2 °C",
    power: "18.5 kW",
    devices: 32,
    workOrders: 1,
    highlight: "Régulation thermique asservie aux prévisions météo et à l'occupation réelle des bureaux. Vannes de débit d'air modulées par IA.",
    icon: Zap
  },
  {
    id: "zone-office",
    name: "Plateau Collaboratif & Flex-Office",
    level: "Étage R+2 • Aile Ouest",
    category: "Tertiaire",
    status: "Optimisé",
    temp: "22.1 °C",
    power: "4.8 kW",
    devices: 94,
    workOrders: 0,
    highlight: "Qualité d'air contrôlée (480 ppm CO2), éclairage biodynamique DALI et réservation dynamique des postes de travail connectés à l'Active Directory.",
    icon: Building2
  },
  {
    id: "zone-net",
    name: "Nœud d'Interconnexion Edge & Télécom",
    level: "Local Réseau • RDC",
    category: "Réseau",
    status: "Nominal",
    temp: "20.4 °C",
    power: "3.2 kW",
    devices: 46,
    workOrders: 0,
    highlight: "Arrivées fibre redondées multi-opérateurs, routeurs BGP Anycast et commutateurs d'accès 100G PoE++ alimentant les points d'accès Wi-Fi 7.",
    icon: Network
  },
  {
    id: "zone-sec",
    name: "Poste Central de Sécurité & Contrôle d'Accès",
    level: "Hall d'Accueil • RDC",
    category: "Sécurité",
    status: "Optimisé",
    temp: "21.0 °C",
    power: "1.8 kW",
    devices: 28,
    workOrders: 0,
    highlight: "Portiques biométriques et badges NFC cryptés, intégration ZTNA avec l'annuaire d'entreprise pour la synchronisation immédiate des droits d'accès.",
    icon: Lock
  }
];

export const EnterpriseArchitectureLanding: React.FC<EnterpriseArchitectureLandingProps> = ({
  onSignIn = () => {},
  onEnterDashboard = () => {},
  state
}) => {
  const [activeTierId, setActiveTierId] = useState<string>("tier-5");
  const [selectedZone, setSelectedZone] = useState<BlueprintZone>(BLUEPRINT_ZONES[0]);
  const [activeConsoleView, setActiveConsoleView] = useState<"building" | "servers" | "carbon">("building");
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);

  // New Interactive Multi-Device Mockups State
  const [activeDevice, setActiveDevice] = useState<"studio" | "ipad" | "iphone" | "hardware">("studio");
  const [deviceOverlayMode, setDeviceOverlayMode] = useState<"telemetry" | "heatmap" | "tickets" | "silicon">("telemetry");
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentTier = ARCH_TIERS.find(t => t.id === activeTierId) || ARCH_TIERS[0];

  const totalNodes = state?.nodes?.length || 42;
  const totalTickets = state?.workOrders?.length || 18;
  const totalBuckets = state?.buckets?.length || 8;

  // Global Smooth Scroll Tracker
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  // 3D Perspective Roll on Scroll for Hero Mockup
  const heroRotateX = useTransform(scrollYProgress, [0, 0.2], [0, 10]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.94]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -35]);

  // Differential Parallax for Floating Glass Badges
  const badgeFloatLeft = useTransform(scrollYProgress, [0, 0.35], [0, -60]);
  const badgeFloatRight = useTransform(scrollYProgress, [0, 0.35], [0, 50]);

  // Auto-scroll story index
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStoryIndex(prev => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const stories = [
    {
      title: "Puce M-Telemetry v5",
      subtitle: "Ingestion Kafka à 144k msg/seconde",
      description: "Architecture de traitement streaming haute fréquence gravée pour l'ultra-basse latence.",
      image: processorMacroImg,
      badge: "MOTEUR PROCESSEUR"
    },
    {
      title: "Châssis Titane Durci IP68",
      subtitle: "Résilience thermique de -40°C à +85°C",
      description: "Boîtier aluminium anodisé avec dissipation passive brevetée pour datacenters extrêmes.",
      image: waterResistImg,
      badge: "HARDWARE TITANE"
    },
    {
      title: "Nœuds Edge Distribués",
      subtitle: "42 Sites interconnectés en Anycast BGP",
      description: "Synchronisation globale de la CMDB et du jumeau BIM avec tolérance aux pannes triples.",
      image: edgeNodeImg,
      badge: "BACKBONE 144 TBPS"
    },
    {
      title: "Mesh Planétaire Post-Quantique",
      subtitle: "Chiffrement mTLS 1.3 de bout en bout",
      description: "Routage décentralisé éliminant tout point individuel de défaillance réseau.",
      image: planetaryMeshImg,
      badge: "ZERO-TRUST NATIVE"
    }
  ];

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans antialiased selection:bg-[#0071e3] selection:text-white relative overflow-x-hidden"
    >
      {/* Scroll Progress Bar at very top */}
      <motion.div 
        style={{ scaleX: smoothProgress } as any}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2997ff] via-[#a855f7] to-[#30d158] origin-left z-[60] shadow-[0_0_12px_rgba(41,151,255,0.8)]"
      />

      {/* Subtle Apple-style physical grain overlay across the entire canvas */}
      <div className="fixed inset-0 apple-grain-overlay opacity-30 pointer-events-none z-30" />
      
      {/* 1. APPLE ULTRA-SLIM TOP NAVIGATION (44px) */}
      <nav className="sticky top-0 z-50 w-full bg-[#000000]/80 backdrop-blur-md border-b border-white/[0.12] transition-colors">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-8 h-11 flex items-center justify-between text-[12px] text-[#d2d2d7] font-normal tracking-tight">
          
          <a href="#" className="text-white hover:text-white/80 transition-colors flex items-center gap-2">
            <LacazaLogo size="sm" showPanelBadge={false} showText={false} />
            <span className="font-semibold text-white tracking-tight text-[13px]">LACAZA</span>
          </a>

          <div className="hidden md:flex items-center gap-7">
            <a href="#vision" className="hover:text-white text-[#d2d2d7] transition-colors">Vision</a>
            <a href="#highlights" className="hover:text-white text-[#d2d2d7] transition-colors">Points forts</a>
            <a href="#devices" className="hover:text-white text-[#2997ff] font-semibold transition-colors flex items-center gap-1">
              <span>Écosystème 3D</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#2997ff]/20 text-[#2997ff] font-mono">NEW</span>
            </a>
            <a href="#tiers" className="hover:text-white text-[#d2d2d7] transition-colors">Architecture 5-Tiers</a>
            <a href="#bento" className="hover:text-white text-[#d2d2d7] transition-colors">Bento Pro</a>
            <a href="#blueprint" className="hover:text-white text-[#d2d2d7] transition-colors">Jumeau Numérique</a>
            <a href="#specs" className="hover:text-white text-[#d2d2d7] transition-colors">Spécifications</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="text-xs text-[#d2d2d7] hover:text-white transition-colors hidden sm:block"
            >
              Connexion
            </button>
            <button
              onClick={onEnterDashboard}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-medium px-3 py-1 rounded-full transition-all shadow-sm active:scale-95"
            >
              Cockpit
            </button>
          </div>
        </div>
      </nav>

      {/* 2. APPLE SECONDARY RIBBON / SUB-NAV (52px) */}
      <div className="sticky top-11 z-40 w-full bg-[#161617]/90 backdrop-blur-xl border-b border-white/[0.12]">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-8 h-12 flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold text-white tracking-tight">LACAZA Architecture</span>
            <span className="hidden sm:inline-block text-[11px] text-[#d2d2d7] px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.12]">
              Pro v5.0 Ultra
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-normal">
            <a href="#devices" className="text-[#2997ff] font-medium hover:underline flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5" />
              <span>Maquettes 3D</span>
            </a>
            <a href="#tiers" className="hidden lg:block text-[#d2d2d7] hover:text-white transition-colors">5 Tiers</a>
            <a href="#blueprint" className="hidden lg:block text-[#d2d2d7] hover:text-white transition-colors">CAD 3D</a>
            <a href="#comparison" className="hidden sm:block text-[#d2d2d7] hover:text-white transition-colors">Comparer</a>
            
            <button
              onClick={onEnterDashboard}
              className="bg-[#2997ff] hover:bg-[#0077ed] text-white font-medium text-xs px-3.5 py-1 rounded-full transition-all flex items-center gap-1 active:scale-95 shadow-sm"
            >
              <span>Ouvrir la Console</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. APPLE HERO KEYNOTE SECTION WITH 3D PERSPECTIVE SCROLL & PARALLAX FLOATING CARDS */}
      <section id="vision" className="relative pt-16 sm:pt-24 pb-20 overflow-hidden text-center perspective-1200">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-gradient-to-b from-[#0071e3]/20 via-[#a855f7]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-[1024px] mx-auto px-4 sm:px-8 relative z-10">
          
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="text-xs font-semibold tracking-wider uppercase text-[#2997ff] px-3 py-1 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/30 backdrop-blur-md">
              Plateforme d'Architecture CAFM & ITSM
            </span>
          </motion.div>

          {/* Monumental Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.035em] text-[#f5f5f7] leading-[1.04] mb-6 max-w-4xl mx-auto"
          >
            Titanesque. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#e2e8f0] to-[#94a3b8]">
              Du bâtiment au silicium.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-2xl text-[#d2d2d7] font-normal leading-relaxed max-w-2xl mx-auto mb-10 tracking-tight"
          >
            La convergence absolue de la gestion technique de bâtiment (GTB/BMS) et de la gouvernance informatique (ITSM/CMDB) dans un écosystème d'observabilité en temps réel.
          </motion.p>

          {/* Apple Action Buttons Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16 text-[14px]"
          >
            <button
              onClick={onEnterDashboard}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium px-6 py-3 rounded-full transition-all shadow-lg shadow-[#0071e3]/30 flex items-center gap-2 active:scale-98 cursor-pointer"
            >
              <span>Lancer le Cockpit Opérationnel</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#devices"
              className="bg-[#1d1d1f] hover:bg-[#2d2d2f] text-[#f5f5f7] border border-white/15 font-normal px-6 py-3 rounded-full transition-all flex items-center gap-2"
            >
              <span>Voir les Maquettes 3D</span>
              <Monitor className="w-4 h-4 text-[#2997ff]" />
            </a>

            <a
              href="/story-reels.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2997ff] hover:underline flex items-center gap-1.5 px-3 py-3 font-medium"
            >
              <span>Regarder le Keynote Mobile</span>
              <span className="text-xs">›</span>
            </a>
          </motion.div>

          {/* Floating Glass Parallax Badges flanking the Hero */}
          <div className="relative max-w-[1040px] mx-auto">
            {/* Left Parallax Floating Glass Card */}
            <motion.div 
              style={{ y: badgeFloatLeft }}
              className="hidden xl:flex absolute -left-12 top-24 z-20 flex-col gap-2 p-4 rounded-2xl glass-specular-card max-w-[210px] text-left shadow-2xl pointer-events-none"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-[#30d158] uppercase">KAFKA CLUSTER</span>
              </div>
              <div className="text-lg font-mono font-semibold text-white">144k msg/s</div>
              <p className="text-[10px] text-[#cbd5e1] leading-tight">Latence d'ingestion &lt; 3.8ms sur 48k sondes</p>
            </motion.div>

            {/* Right Parallax Floating Glass Card */}
            <motion.div 
              style={{ y: badgeFloatRight }}
              className="hidden xl:flex absolute -right-12 top-48 z-20 flex-col gap-2 p-4 rounded-2xl glass-specular-card max-w-[210px] text-left shadow-2xl pointer-events-none"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2997ff]" />
                <span className="text-[10px] font-mono font-bold text-[#2997ff] uppercase">ZERO-TRUST</span>
              </div>
              <div className="text-lg font-mono font-semibold text-white">mTLS 1.3</div>
              <p className="text-[10px] text-[#cbd5e1] leading-tight">Enclave sécurisée HSM post-quantique</p>
            </motion.div>

            {/* Apple Hero Hardware Frame with Scroll Tilt & Photorealistic Glass */}
            <motion.div
              style={{ 
                rotateX: heroRotateX,
                scale: heroScale,
                y: heroY,
                transformStyle: "preserve-3d"
              } as any}
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
              className="relative mx-auto rounded-[32px] sm:rounded-[40px] p-2.5 sm:p-3.5 bg-gradient-to-b from-white/25 via-white/10 to-white/[0.03] border border-white/25 shadow-[0_50px_140px_-20px_rgba(0,113,227,0.4)] overflow-hidden preserve-3d"
            >
              {/* Studio Display Screen Glass Surface */}
              <div className="rounded-[26px] sm:rounded-[34px] bg-[#0c0d10] border border-black/80 overflow-hidden relative">
                
                {/* Top Window Bar */}
                <div className="h-10 px-5 bg-[#161618]/90 backdrop-blur-md border-b border-white/[0.12] flex items-center justify-between text-xs text-[#a1a1a6]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    <span className="ml-3 font-mono text-[11px] text-[#d2d2d7]">lacaza-cockpit.studio // retina-display</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="flex items-center gap-1.5 text-[#30d158] font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#30d158] animate-ping" />
                      KAFKA 144k msg/s
                    </span>
                    <span className="text-[#d2d2d7]">PUE 1.12</span>
                  </div>
                </div>

                {/* Hero Studio Mockup Visual Layer */}
                <div className="relative min-h-[380px] sm:min-h-[440px] overflow-hidden">
                  <img 
                    src={studioMockupImg} 
                    alt="LACAZA Studio Display Mockup" 
                    className="w-full h-full object-cover object-center scale-105 hover:scale-110 transition-transform duration-1000"
                  />
                  {/* Subtle Gradient Fog */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d10] via-transparent to-[#0c0d10]/30" />

                  {/* High-Tech Glass Telemetry Overlay Hud */}
                  <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between pointer-events-none">
                    
                    {/* Top Row Glass Chips */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="glass-badge-blue px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5">
                        <Activity className="w-3 h-3" />
                        <span>SUPERVISION 320 000 m² EN DIRECT</span>
                      </div>
                      <div className="glass-badge-green px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5">
                        <Gauge className="w-3 h-3" />
                        <span>PUE 1.12 NOMINAL</span>
                      </div>
                    </div>

                    {/* Bottom Row Interactive Glass Dock */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pointer-events-auto">
                      <div className="p-3.5 rounded-2xl glass-card backdrop-blur-xl border border-white/20 text-left">
                        <div className="text-[10px] font-mono text-[#a1a1a6] uppercase">Jumeau CAD 3D</div>
                        <div className="text-sm font-semibold text-white mt-0.5">42 Sites Connectés</div>
                        <div className="text-[10px] text-[#30d158] font-mono mt-0.5">100% Modélisé LOD 400</div>
                      </div>

                      <div className="p-3.5 rounded-2xl glass-card backdrop-blur-xl border border-white/20 text-left">
                        <div className="text-[10px] font-mono text-[#a1a1a6] uppercase">CMDB & Actifs IT</div>
                        <div className="text-sm font-semibold text-white mt-0.5">14 850 Composants</div>
                        <div className="text-[10px] text-[#2997ff] font-mono mt-0.5">Audit SNMPv3 Automatisé</div>
                      </div>

                      <div className="p-3.5 rounded-2xl glass-card backdrop-blur-xl border border-white/20 text-left flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-mono text-[#a1a1a6] uppercase">Maintenance IA</div>
                          <div className="text-sm font-semibold text-[#febc2e] mt-0.5">{totalTickets} Ordres en cours</div>
                        </div>
                        <button
                          onClick={onEnterDashboard}
                          className="mt-2 w-full py-1.5 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                        >
                          <span>Accéder</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 4. BRAND NEW: INTERACTIVE MULTI-DEVICE 3D MOCKUP SHOWCASE */}
      <section id="devices" className="py-24 bg-[#0a0a0c] border-t border-b border-white/[0.12] relative overflow-hidden">
        
        {/* Ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-[#0071e3]/10 via-[#a855f7]/10 to-[#30d158]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-[1024px] mx-auto px-4 sm:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff] px-3 py-1 rounded-full bg-[#2997ff]/10 border border-[#2997ff]/25 inline-block mb-3">
              Écosystème Matériel & Logiciel
            </span>
            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white mb-4">
              Une expérience fluide sur chaque appareil.
            </h2>
            <p className="text-base sm:text-lg text-[#d2d2d7] leading-relaxed">
              Du grand écran Studio Display 32" au technicien sur le terrain avec sa tablette iPad Pro durcie ou son iPhone Pro.
            </p>
          </div>

          {/* Interactive Apple Device Selector Pills */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setActiveDevice("studio")}
              className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeDevice === "studio"
                  ? "bg-white text-black font-semibold shadow-lg shadow-white/10 scale-105"
                  : "bg-[#161618] text-[#d2d2d7] hover:text-white border border-white/[0.12]"
              }`}
            >
              <Monitor className="w-4 h-4 text-[#2997ff]" />
              <span>Studio Display 32"</span>
            </button>

            <button
              onClick={() => setActiveDevice("ipad")}
              className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeDevice === "ipad"
                  ? "bg-white text-black font-semibold shadow-lg shadow-white/10 scale-105"
                  : "bg-[#161618] text-[#d2d2d7] hover:text-white border border-white/[0.12]"
              }`}
            >
              <Tablet className="w-4 h-4 text-[#a855f7]" />
              <span>iPad Pro 13" Terrain</span>
            </button>

            <button
              onClick={() => setActiveDevice("iphone")}
              className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeDevice === "iphone"
                  ? "bg-white text-black font-semibold shadow-lg shadow-white/10 scale-105"
                  : "bg-[#161618] text-[#d2d2d7] hover:text-white border border-white/[0.12]"
              }`}
            >
              <Smartphone className="w-4 h-4 text-[#30d158]" />
              <span>iPhone 16 Pro Max</span>
            </button>

            <button
              onClick={() => setActiveDevice("hardware")}
              className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeDevice === "hardware"
                  ? "bg-white text-black font-semibold shadow-lg shadow-white/10 scale-105"
                  : "bg-[#161618] text-[#d2d2d7] hover:text-white border border-white/[0.12]"
              }`}
            >
              <Cpu className="w-4 h-4 text-[#f59e0b]" />
              <span>Nœud Edge Titane 1U</span>
            </button>
          </div>

          {/* Device Mockup 3D Interactive Stage */}
          <div className="rounded-[36px] bg-[#121215] border border-white/20 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            
            {/* Dynamic Specular Sheen Background */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 transition-opacity"
              style={{
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(41, 151, 255, 0.15), transparent 80%)`
              }}
            />

            <AnimatePresence mode="wait">
              {/* 1. STUDIO DISPLAY VIEW */}
              {activeDevice === "studio" && (
                <motion.div
                  key="device-studio"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black group">
                    <img 
                      src={studioMockupImg} 
                      alt="Studio Display Mockup" 
                      className="w-full h-auto object-cover scale-100 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white flex items-center gap-1.5">
                      <Monitor className="w-3 h-3 text-[#2997ff]" />
                      <span>COCKPIT CENTRAL 5K RETINA</span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-5 text-left">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/40 text-[#2997ff] text-xs font-mono font-bold">
                      POSTE DE PILOTAGE STRATÉGIQUE
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                      Supervision GTB & ITSM sur écran 32 pouces.
                    </h3>
                    <p className="text-sm text-[#d2d2d7] leading-relaxed">
                      Vue holistique sur l'ensemble de votre patrimoine. Modélisation 3D temps réel, courbes énergétiques CVC, corrélation des alertes P1 et intégration SAP/Oracle.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                        <div className="text-[10px] font-mono text-[#a1a1a6]">Résolution</div>
                        <div className="text-sm font-semibold text-white mt-0.5">5120 × 2880 (5K)</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                        <div className="text-[10px] font-mono text-[#a1a1a6]">Rafraîchissement</div>
                        <div className="text-sm font-semibold text-[#30d158] mt-0.5">Temps réel 120 FPS</div>
                      </div>
                    </div>

                    <button
                      onClick={onEnterDashboard}
                      className="w-full py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lancer le mode Studio Cockpit</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 2. IPAD PRO TABLET VIEW */}
              {activeDevice === "ipad" && (
                <motion.div
                  key="device-ipad"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black group">
                    <img 
                      src={tabletMockupImg} 
                      alt="iPad Pro Tablet Mockup" 
                      className="w-full h-auto object-cover scale-100 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white flex items-center gap-1.5">
                      <Tablet className="w-3 h-3 text-[#a855f7]" />
                      <span>IPAD PRO 13" // INSPECTEUR TERRAIN</span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-5 text-left">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/40 text-[#a855f7] text-xs font-mono font-bold">
                      MOBILITÉ GMAO & CAD TACTILE
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                      L'outil ultime pour le technicien de terrain.
                    </h3>
                    <p className="text-sm text-[#d2d2d7] leading-relaxed">
                      Plan d'étage vectoriel interactif avec repérage instantané des gaines CVC, des vannes de débit et des disjoncteurs. Annotation directe au stylet et clôture d'ordres de travail hors ligne.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                        <div className="text-[10px] font-mono text-[#a1a1a6]">Mode Hors-Ligne</div>
                        <div className="text-sm font-semibold text-[#30d158] mt-0.5">Sync PWA SQLite</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                        <div className="text-[10px] font-mono text-[#a1a1a6]">Précision BIM</div>
                        <div className="text-sm font-semibold text-white mt-0.5">LOD 400 au mm</div>
                      </div>
                    </div>

                    <button
                      onClick={onEnterDashboard}
                      className="w-full py-3 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Inspecter les plans d'étage</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 3. IPHONE PRO MOBILE VIEW */}
              {activeDevice === "iphone" && (
                <motion.div
                  key="device-iphone"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 flex justify-center">
                    <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black max-w-[340px] group">
                      <img 
                        src={mobileMockupImg} 
                        alt="iPhone Pro Mockup" 
                        className="w-full h-auto object-cover scale-100 group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 left-4 right-4 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#30d158]"><span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-ping" /> DYNAMIC ISLAND</span>
                        <span className="text-[#a1a1a6]">ALERTE P1</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-5 text-left">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#30d158]/20 border border-[#30d158]/40 text-[#30d158] text-xs font-mono font-bold">
                      POCHE & NOTIFICATIONS CRITIQUES
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                      Alertes push en direct et badge d'accès NFC.
                    </h3>
                    <p className="text-sm text-[#d2d2d7] leading-relaxed">
                      L'application mobile LACAZA intègre l'ouverture des portes sécurisées par biométrie Apple Face ID / NFC et la réception prioritaire des alarmes d'équipements CVC et serveurs.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                        <div className="text-[10px] font-mono text-[#a1a1a6]">Push Notification</div>
                        <div className="text-sm font-semibold text-[#30d158] mt-0.5">&lt; 150 ms</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                        <div className="text-[10px] font-mono text-[#a1a1a6]">Accès Physique</div>
                        <div className="text-sm font-semibold text-white mt-0.5">NFC / Zero-Trust</div>
                      </div>
                    </div>

                    <a
                      href="/story-reels.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-[#1d1d1f] hover:bg-[#2d2d2f] border border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
                    >
                      <Play className="w-4 h-4 text-[#2997ff]" />
                      <span>Voir la démo mobile en format 9:16</span>
                    </a>
                  </div>
                </motion.div>
              )}

              {/* 4. TITANIUM HARDWARE & SILICON VIEW */}
              {activeDevice === "hardware" && (
                <motion.div
                  key="device-hardware"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                    <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-black">
                      <img 
                        src={edgeNodeImg} 
                        alt="Nœud Edge" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white border border-white/20">
                        Châssis Titane IP68
                      </div>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-black">
                      <img 
                        src={processorMacroImg} 
                        alt="Processor Macro" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-[#f59e0b] border border-white/20">
                        Puce M-Telemetry v5
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-5 text-left">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-mono font-bold">
                      INGÉNIERIE HARDWARE BARE-METAL
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                      Résilience physique totale. 0 dB de bruit.
                    </h3>
                    <p className="text-sm text-[#d2d2d7] leading-relaxed">
                      Usiné dans un bloc d'aluminium aérospatial et de titane grade 5. Dissipation passive assurant un fonctionnement continu sans ventilateur mécanique, même dans les environnements poussiéreux ou humides.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                        <div className="text-[10px] font-mono text-[#a1a1a6]">Étanchéité</div>
                        <div className="text-sm font-semibold text-[#30d158] mt-0.5">Certifié IP68</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                        <div className="text-[10px] font-mono text-[#a1a1a6]">Consommation</div>
                        <div className="text-sm font-semibold text-white mt-0.5">18 Watts Max</div>
                      </div>
                    </div>

                    <button
                      onClick={onEnterDashboard}
                      className="w-full py-3 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md cursor-pointer"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Consulter la télémétrie des Nœuds</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </section>

      {/* 5. APPLE HIGHLIGHTS REEL (INTERACTIVE STORY TILES) */}
      <section id="highlights" className="py-20 bg-[#0c0d10] border-t border-b border-white/[0.12]">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff] block mb-2">
                Points forts
              </span>
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
                Un regard suffit pour comprendre.
              </h2>
            </div>
            <p className="text-sm text-[#d2d2d7] max-w-sm leading-relaxed">
              Découvrez les quatre piliers technologiques qui font de LACAZA la référence absolue.
            </p>
          </div>

          {/* Interactive Feature Slider / Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stories.map((story, idx) => {
              const isActive = activeStoryIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStoryIndex(idx)}
                  className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-[380px] ${
                    isActive 
                      ? "bg-gradient-to-b from-[#1c1c1e] to-[#121214] border-white/35 shadow-[0_15px_40px_-10px_rgba(0,113,227,0.35)] ring-1 ring-[#2997ff]/60" 
                      : "bg-[#161618] border-white/[0.12] hover:border-white/25"
                  }`}
                >
                  {/* Photo Layer */}
                  <div className="absolute inset-0 z-0 overflow-hidden opacity-40 group-hover:opacity-50 transition-opacity">
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/70 to-transparent" />
                  </div>

                  {/* Header Tag */}
                  <div className="relative z-10">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-black/70 border border-white/20 text-white backdrop-blur-md">
                      {story.badge}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="relative z-10 space-y-2">
                    <h3 className="text-xl font-semibold text-white tracking-tight leading-snug">
                      {story.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#2997ff]">
                      {story.subtitle}
                    </p>
                    <p className="text-[12px] text-[#d2d2d7] leading-relaxed line-clamp-2">
                      {story.description}
                    </p>
                  </div>

                  {/* Active Progress Bar */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-bar"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[#2997ff]" 
                    />
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. APPLE 5-TIERS ARCHITECTURE (INTERACTIVE COMPARATOR) */}
      <section id="tiers" className="py-24 max-w-[1024px] mx-auto px-4 sm:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff] block mb-3">
            Architecture 5-Tiers
          </span>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white mb-6">
            Cinq couches. <br />
            Un seul écosystème.
          </h2>
          <p className="text-base sm:text-lg text-[#d2d2d7] leading-relaxed">
            Chaque couche est pensée comme un micro-service autonome, interconnecté par gRPC et Kafka pour une résilience absolue.
          </p>
        </div>

        {/* Apple Segmented Pill Switcher */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-10 gap-2 no-scrollbar">
          {ARCH_TIERS.map((tier) => {
            const isSelected = tier.id === activeTierId;
            return (
              <button
                key={tier.id}
                onClick={() => setActiveTierId(tier.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-white text-black font-semibold shadow-md"
                    : "bg-[#161618] text-[#d2d2d7] hover:text-white border border-white/[0.12]"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.accent }} />
                <span>Niveau {tier.tierNumber}</span>
                <span className="opacity-75 hidden md:inline">• {tier.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Apple Keynote Spec Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTier.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-[36px] bg-[#161618] border border-white/15 p-6 sm:p-12 relative overflow-hidden shadow-2xl"
          >
            {/* Subtle Gradient Glow */}
            <div 
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
              style={{ backgroundColor: currentTier.accent }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Description & Punchline */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-3">
                  <span 
                    className="text-xs font-mono font-bold px-3 py-1 rounded-full border"
                    style={{ 
                      borderColor: `${currentTier.accent}60`,
                      backgroundColor: `${currentTier.accent}20`,
                      color: currentTier.accent 
                    }}
                  >
                    NIVEAU {currentTier.tierNumber} // {currentTier.badge}
                  </span>
                  <span className="text-xs text-[#a1a1a6] font-mono">{currentTier.code}</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                  {currentTier.name}
                </h3>

                <p className="text-lg text-[#2997ff] font-semibold leading-snug">
                  "{currentTier.tagline}"
                </p>

                <p className="text-sm sm:text-base text-[#d2d2d7] leading-relaxed">
                  {currentTier.description}
                </p>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.12] text-xs">
                  <span className="text-[#a1a1a6] block mb-1 font-mono uppercase tracking-wider font-semibold">Highlight d'Ingénierie</span>
                  <span className="text-white font-medium text-sm">{currentTier.keynoteHighlight}</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onEnterDashboard}
                    className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium px-6 py-2.5 rounded-full transition-all flex items-center gap-2 active:scale-95 shadow-sm cursor-pointer"
                  >
                    <span>Inspecter dans le Cockpit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Components & Tech Specs */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Active Components List */}
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1a6] font-semibold block">
                    Composants Actifs Déployés
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentTier.components.map((comp, i) => (
                      <div 
                        key={i} 
                        className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.1] hover:border-white/25 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-white">{comp.name}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#a1a1a6]">
                          <span>{comp.type}</span>
                          <span className="text-white font-semibold">{comp.metric}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Protocols & Connectors */}
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1a6] font-semibold block mb-2">
                    Protocoles Supportés en Natif
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentTier.protocols.map((proto, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] text-xs font-mono text-[#f1f5f9]"
                      >
                        {proto}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Performance Specs Matrix */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/[0.12]">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1a6] font-semibold block mb-3">
                    Spécifications de Mesure
                  </span>
                  <div className="space-y-2 text-xs font-mono">
                    {currentTier.specs.map((spec, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-white/[0.08] last:border-b-0">
                        <span className="text-[#a1a1a6]">{spec.label}</span>
                        <span className="text-white font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </section>

      {/* 7. APPLE BENTO GRID (HARDWARE & SOFTWARE SYNERGY) */}
      <section id="bento" className="py-20 bg-[#0c0d10] border-t border-b border-white/[0.12]">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff] block mb-3">
              Ingénierie de précision
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-4">
              L'intégration dans ses moindres détails.
            </h2>
            <p className="text-sm sm:text-base text-[#d2d2d7]">
              Chaque couche matérielle et logicielle a été sculptée pour éliminer les goulots d'étranglement.
            </p>
          </div>

          {/* Asymmetrical Apple Bento Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Bento Card 1: Water-Resistance & Thermal Passivity (Span 7) */}
            <div className="md:col-span-7 rounded-[32px] bg-[#161618] border border-white/[0.12] p-8 relative overflow-hidden flex flex-col justify-between min-h-[380px] group">
              <div className="absolute inset-0 z-0 overflow-hidden opacity-30 group-hover:opacity-40 transition-opacity">
                <img 
                  src={waterResistImg} 
                  alt="Thermal chassis" 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-[#161618]/60 to-transparent" />
              </div>

              <div className="relative z-10">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#2997ff] font-semibold">
                  RÉSISTANCE EXTRÊME IP68
                </span>
                <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-2">
                  Conçu pour les salles blanches et toitures industrielles.
                </h3>
              </div>

              <div className="relative z-10 pt-8 flex items-baseline gap-6 font-mono">
                <div>
                  <div className="text-2xl font-bold text-white">-40°C à +85°C</div>
                  <div className="text-[11px] text-[#a1a1a6]">Plage opérationnelle</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#30d158]">0 dB</div>
                  <div className="text-[11px] text-[#a1a1a6]">Refroidissement passif</div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Quantum Edge Core (Span 5) */}
            <div className="md:col-span-5 rounded-[32px] bg-[#161618] border border-white/[0.12] p-8 relative overflow-hidden flex flex-col justify-between min-h-[380px] group">
              <div className="absolute inset-0 z-0 overflow-hidden opacity-25 group-hover:opacity-35 transition-opacity">
                <img 
                  src={quantumEdgeImg} 
                  alt="Quantum edge core" 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-[#161618]/70 to-transparent" />
              </div>

              <div className="relative z-10">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#a855f7] font-semibold">
                  SÉCURITÉ MATÉRIELLE
                </span>
                <h3 className="text-2xl font-semibold text-white tracking-tight mt-2">
                  Enclave de Sécurité Dédiée.
                </h3>
                <p className="text-xs text-[#d2d2d7] mt-2 leading-relaxed">
                  Chiffrement AES-256 en mémoire vive et signature cryptographique des paquets IoT.
                </p>
              </div>

              <div className="relative z-10 pt-4 flex items-center justify-between border-t border-white/[0.12]">
                <span className="text-xs font-mono text-[#d2d2d7] font-medium">ISO 27001 & NIS 2</span>
                <ShieldCheck className="w-5 h-5 text-[#30d158]" />
              </div>
            </div>

            {/* Bento Card 3: Interactive View Switcher (Span 12) */}
            <div className="md:col-span-12 rounded-[32px] bg-[#161618] border border-white/[0.12] p-6 sm:p-10 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#2997ff] font-semibold">
                    CONSOLE D'EXPLOITATION UNIFIÉE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-1">
                    Basculez d'angle de vue instantanément.
                  </h3>
                </div>

                {/* Apple Segmented Controls */}
                <div className="flex items-center gap-1 p-1 rounded-full bg-black/60 border border-white/15 text-xs">
                  <button
                    onClick={() => setActiveConsoleView("building")}
                    className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                      activeConsoleView === "building" 
                        ? "bg-white text-black font-semibold shadow-sm" 
                        : "text-[#d2d2d7] hover:text-white"
                    }`}
                  >
                    Bâtiment (GTB)
                  </button>
                  <button
                    onClick={() => setActiveConsoleView("servers")}
                    className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                      activeConsoleView === "servers" 
                        ? "bg-white text-black font-semibold shadow-sm" 
                        : "text-[#d2d2d7] hover:text-white"
                    }`}
                  >
                    Serveurs (ITSM)
                  </button>
                  <button
                    onClick={() => setActiveConsoleView("carbon")}
                    className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                      activeConsoleView === "carbon" 
                        ? "bg-white text-black font-semibold shadow-sm" 
                        : "text-[#d2d2d7] hover:text-white"
                    }`}
                  >
                    Carbone (CSRD)
                  </button>
                </div>
              </div>

              {/* Dynamic Console Preview Window */}
              <div className="p-6 rounded-2xl bg-black/60 border border-white/[0.12] font-mono text-xs">
                {activeConsoleView === "building" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="text-[#a1a1a6] text-[11px] font-semibold">RÉGULATION CVC</div>
                      <div className="text-xl font-bold text-[#30d158] mt-1">21.4 °C Nominal</div>
                      <div className="text-[10px] text-[#d2d2d7] mt-1">Économie d'énergie active (-42%)</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="text-[#a1a1a6] text-[11px] font-semibold">QUALITÉ DE L'AIR</div>
                      <div className="text-xl font-bold text-white mt-1">465 ppm CO2</div>
                      <div className="text-[10px] text-[#d2d2d7] mt-1">Ventilation asservie DALI-2</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="text-[#a1a1a6] text-[11px] font-semibold">ORDRES GMAO</div>
                      <div className="text-xl font-bold text-[#febc2e] mt-1">{totalTickets} En Cours</div>
                      <div className="text-[10px] text-[#d2d2d7] mt-1">SLA moyen de prise en charge 12 min</div>
                    </div>
                  </div>
                )}

                {activeConsoleView === "servers" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="text-[#a1a1a6] text-[11px] font-semibold">INGESTION KAFKA</div>
                      <div className="text-xl font-bold text-[#2997ff] mt-1">144 200 msg/s</div>
                      <div className="text-[10px] text-[#d2d2d7] mt-1">4 Consumer Groups synchronisés</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="text-[#a1a1a6] text-[11px] font-semibold">ACTIFS CARTOGRAPHIÉS</div>
                      <div className="text-xl font-bold text-white mt-1">14 850 Machines</div>
                      <div className="text-[10px] text-[#d2d2d7] mt-1">Découverte agentless SNMPv3/WMI</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="text-[#a1a1a6] text-[11px] font-semibold">INCIDENTS P1</div>
                      <div className="text-xl font-bold text-[#30d158] mt-1">0 Bloquant</div>
                      <div className="text-[10px] text-[#d2d2d7] mt-1">Disponibilité cluster 99.999%</div>
                    </div>
                  </div>
                )}

                {activeConsoleView === "carbon" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="text-[#a1a1a6] text-[11px] font-semibold">BILAN CARBONE TEMPS RÉEL</div>
                      <div className="text-xl font-bold text-[#30d158] mt-1">18.4 gCO2e / kWh</div>
                      <div className="text-[10px] text-[#d2d2d7] mt-1">Certifié conforme Décret Tertiaire</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="text-[#a1a1a6] text-[11px] font-semibold">ÉNERGIE VERTE DATACENTER</div>
                      <div className="text-xl font-bold text-white mt-1">100% Renouvelable</div>
                      <div className="text-[10px] text-[#d2d2d7] mt-1">Garanties d'origine européennes</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <div className="text-[#a1a1a6] text-[11px] font-semibold">PUE DATACENTER</div>
                      <div className="text-xl font-bold text-[#2997ff] mt-1">1.12 PUE</div>
                      <div className="text-[10px] text-[#d2d2d7] mt-1">Classe mondiale de sobriété</div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 8. JUMEAU NUMÉRIQUE RETINA (APPLE STUDIO DISPLAY CAD BLUEPRINT) */}
      <section id="blueprint" className="py-24 max-w-[1024px] mx-auto px-4 sm:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#30d158] block mb-2">
              Jumeau Numérique Retina
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              Chaque mètre carré au micron près.
            </h2>
          </div>
          <p className="text-sm text-[#d2d2d7] max-w-sm leading-relaxed">
            Cliquez sur une zone du campus pour inspecter ses sondes d'ambiance et ses ordres de maintenance en direct.
          </p>
        </div>

        {/* CAD Studio Window */}
        <div className="rounded-[36px] bg-[#161618] border border-white/15 p-4 sm:p-8 relative overflow-hidden shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 7 Cols: Floor plan schematic */}
            <div className="lg:col-span-7 bg-[#0b0d10] p-4 sm:p-6 rounded-3xl border border-white/[0.12]">
              <div className="flex items-center justify-between mb-4 text-xs font-mono text-[#a1a1a6]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#30d158]" />
                  <span>CAD CAMPUS // NIVEAU 0 // BLOC PRINCIPAL</span>
                </div>
                <span className="text-[#30d158] font-bold">TÉLÉMÉTRIE 1s</span>
              </div>

              {/* Schematic Map Grid */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedZone(BLUEPRINT_ZONES[0])}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedZone.id === "zone-dc"
                        ? "bg-[#0071e3]/25 border-[#2997ff] shadow-[0_0_20px_rgba(41,151,255,0.35)]"
                        : "bg-white/[0.04] border-white/[0.1] hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-[#2997ff]" />
                        Salle Blanche DC
                      </span>
                      <span className="text-[10px] font-mono text-[#2997ff] font-bold">19.8 °C</span>
                    </div>
                    <div className="text-[11px] text-[#d2d2d7] font-mono">184 Baies • PUE 1.12</div>
                  </button>

                  <button
                    onClick={() => setSelectedZone(BLUEPRINT_ZONES[1])}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedZone.id === "zone-cvc"
                        ? "bg-[#30d158]/25 border-[#30d158] shadow-[0_0_20px_rgba(48,209,88,0.35)]"
                        : "bg-white/[0.04] border-white/[0.1] hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#30d158]" />
                        Centrale CVC
                      </span>
                      <span className="text-[10px] font-mono text-[#30d158] font-bold">18.5 kW</span>
                    </div>
                    <div className="text-[11px] text-[#d2d2d7] font-mono">Régulation IA active</div>
                  </button>
                </div>

                {/* Wide Office flex area */}
                <button
                  onClick={() => setSelectedZone(BLUEPRINT_ZONES[2])}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedZone.id === "zone-office"
                      ? "bg-[#febc2e]/25 border-[#febc2e] shadow-[0_0_20px_rgba(254,188,46,0.35)]"
                      : "bg-white/[0.04] border-white/[0.1] hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#febc2e]" />
                      Plateau Bureaux Collaboratifs & Flex-Office
                    </span>
                    <span className="text-[10px] font-mono text-[#febc2e] font-bold">480 ppm CO2</span>
                  </div>
                  <div className="text-[11px] text-[#d2d2d7] font-mono">
                    Occupation 75% • Éclairage biodynamique DALI • 94 Équipements
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedZone(BLUEPRINT_ZONES[3])}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedZone.id === "zone-net"
                        ? "bg-[#a855f7]/25 border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                        : "bg-white/[0.04] border-white/[0.1] hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-[#a855f7]" />
                        Hub Réseau Edge
                      </span>
                      <span className="text-[10px] font-mono text-[#a855f7] font-bold">100 Gbps</span>
                    </div>
                    <div className="text-[11px] text-[#d2d2d7] font-mono">Anycast BGP • 3.8ms</div>
                  </button>

                  <button
                    onClick={() => setSelectedZone(BLUEPRINT_ZONES[4])}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedZone.id === "zone-sec"
                        ? "bg-[#2997ff]/25 border-[#2997ff] shadow-[0_0_20px_rgba(41,151,255,0.35)]"
                        : "bg-white/[0.04] border-white/[0.1] hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#2997ff]" />
                        SAS & Sécurité
                      </span>
                      <span className="text-[10px] font-mono text-[#2997ff] font-bold">ZTNA</span>
                    </div>
                    <div className="text-[11px] text-[#d2d2d7] font-mono">Portiques NFC Cryptés</div>
                  </button>
                </div>
              </div>

            </div>

            {/* Right 5 Cols: Selected Zone Telemetry Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-black/60 border border-white/[0.12]">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-[#30d158] font-bold">{selectedZone.category}</span>
                  <span className="text-[#a1a1a6]">{selectedZone.level}</span>
                </div>

                <h3 className="text-xl font-semibold text-white tracking-tight mb-2">
                  {selectedZone.name}
                </h3>
                <p className="text-xs text-[#d2d2d7] leading-relaxed mb-6">
                  {selectedZone.highlight}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="text-[#a1a1a6] text-[10px] font-semibold">Température</div>
                    <div className="text-lg font-bold text-white mt-0.5">{selectedZone.temp}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="text-[#a1a1a6] text-[10px] font-semibold">Puissance</div>
                    <div className="text-lg font-bold text-[#30d158] mt-0.5">{selectedZone.power}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="text-[#a1a1a6] text-[10px] font-semibold">Actifs Référencés</div>
                    <div className="text-lg font-bold text-[#2997ff] mt-0.5">{selectedZone.devices} u.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="text-[#a1a1a6] text-[10px] font-semibold">Tickets GMAO</div>
                    <div className="text-lg font-bold text-[#febc2e] mt-0.5">{selectedZone.workOrders} Actifs</div>
                  </div>
                </div>

                <button
                  onClick={onEnterDashboard}
                  className="w-full py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspecter les flux de la zone</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 8. APPLE BIG NUMBERS (LEADERSHIP STATS) */}
      <section id="specs" className="py-24 bg-[#0c0d10] border-t border-b border-white/[0.12]">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-8 text-center">
          
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff] block mb-3">
            Spécifications Réelles
          </span>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white mb-16">
            Des chiffres qui redéfinissent la norme.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2 p-6 rounded-3xl bg-[#161618] border border-white/[0.12]">
              <div className="text-5xl sm:text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-b from-[#30d158] to-[#10b981] font-mono">
                1.12
              </div>
              <div className="text-sm font-semibold text-white">PUE Datacenter</div>
              <p className="text-xs text-[#d2d2d7] leading-relaxed">
                Refroidissement passif en allée froide et régulation IA en continu.
              </p>
            </div>

            <div className="space-y-2 p-6 rounded-3xl bg-[#161618] border border-white/[0.12]">
              <div className="text-5xl sm:text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-b from-[#2997ff] to-[#0071e3] font-mono">
                &lt; 4ms
              </div>
              <div className="text-sm font-semibold text-white">Latence Kafka</div>
              <p className="text-xs text-[#d2d2d7] leading-relaxed">
                Ingestion et corrélation temps réel sur le backbone Anycast 144 Tbps.
              </p>
            </div>

            <div className="space-y-2 p-6 rounded-3xl bg-[#161618] border border-white/[0.12]">
              <div className="text-5xl sm:text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] to-[#a1a1a6] font-mono">
                14 850
              </div>
              <div className="text-sm font-semibold text-white">Actifs CMDB</div>
              <p className="text-xs text-[#d2d2d7] leading-relaxed">
                Découverte dynamique des baies, postes, switches et automates GTB.
              </p>
            </div>

            <div className="space-y-2 p-6 rounded-3xl bg-[#161618] border border-white/[0.12]">
              <div className="text-5xl sm:text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-b from-[#febc2e] to-[#f59e0b] font-mono">
                99.999%
              </div>
              <div className="text-sm font-semibold text-white">Disponibilité SLA</div>
              <p className="text-xs text-[#d2d2d7] leading-relaxed">
                Résilience triple-site avec basculement transparent sans interruption.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 9. APPLE PRIVACY & SECURITY SECTION */}
      <section id="security" className="py-24 max-w-[1024px] mx-auto px-4 sm:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center mx-auto text-[#2997ff] shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            Sécurité et Confidentialité. <br />
            <span className="text-[#a1a1a6]">Intégrées dès la conception.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#d2d2d7] leading-relaxed">
            Vos données de patrimoine immobilier et vos secrets d'infrastructure ne quittent jamais votre périmètre souverain. Conformité stricte ISO 27001, NIS 2 et RGPD.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-[#161618] border border-white/[0.12]">
              <ShieldCheck className="w-5 h-5 text-[#30d158] mx-auto mb-2" />
              <div className="text-white font-bold">ISO 27001</div>
              <div className="text-[#cbd5e1] text-[10px]">Certifié Bureau Veritas</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#161618] border border-white/[0.12]">
              <Workflow className="w-5 h-5 text-[#2997ff] mx-auto mb-2" />
              <div className="text-white font-bold">ITIL v4</div>
              <div className="text-[#cbd5e1] text-[10px]">Gouvernance de service</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#161618] border border-white/[0.12]">
              <Boxes className="w-5 h-5 text-[#febc2e] mx-auto mb-2" />
              <div className="text-white font-bold">ISO 55001</div>
              <div className="text-[#cbd5e1] text-[10px]">Asset Management</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#161618] border border-white/[0.12]">
              <Leaf className="w-5 h-5 text-[#30d158] mx-auto mb-2" />
              <div className="text-white font-bold">Décret Tertiaire</div>
              <div className="text-[#cbd5e1] text-[10px]">CSRD Reporting</div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. APPLE COMPARATOR MATRIX (FIND YOUR TIER) */}
      <section id="comparison" className="py-20 bg-[#0c0d10] border-t border-white/[0.12]">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff] block mb-3">
              Comparatif
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              Quelle échelle pour votre entreprise ?
            </h2>
            <p className="text-sm text-[#d2d2d7]">
              Des solutions dimensionnées pour les campus tertiaires, les réseaux bancaires et les infrastructures critiques d'importance vitale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tier 1: Starter Campus */}
            <div className="rounded-[32px] bg-[#161618] border border-white/[0.12] p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Campus Standard</h3>
                <p className="text-xs text-[#d2d2d7] mb-6">Idéal pour les sièges sociaux et parcs jusqu'à 50 000 m².</p>
                <div className="text-3xl font-semibold text-white mb-6 font-mono">Échelle 1</div>
                
                <div className="space-y-3 text-xs text-[#f1f5f9] border-t border-white/[0.12] pt-6">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>Supervision GTB & CVC</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>CMDB jusqu'à 2 500 actifs</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>GMAO mobile & tickets</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>SLA 99.9% Uptime</span></div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={onEnterDashboard}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
                >
                  Découvrir
                </button>
              </div>
            </div>

            {/* Tier 2: Enterprise Pro (Featured) */}
            <div className="rounded-[32px] bg-[#1c1c1e] border border-[#2997ff]/50 p-8 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0071e3] text-white text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wider uppercase">
                RECOMMANDÉ
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Enterprise Pro</h3>
                <p className="text-xs text-[#d2d2d7] mb-6">Pour les groupes multisites, datacenters et réseaux bancaires.</p>
                <div className="text-3xl font-semibold text-white mb-6 font-mono">Échelle Multi-Sites</div>
                
                <div className="space-y-3 text-xs text-[#f1f5f9] border-t border-white/[0.12] pt-6">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>Bus Kafka dédié 144k msg/s</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>Jumeau Numérique Retina 3D</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>IA Prédictive CVC (-42% kWh)</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>CMDB Illimitée & Zero-Trust</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>SLA 99.999% Garanti</span></div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={onEnterDashboard}
                  className="w-full py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium transition-all shadow-md active:scale-95"
                >
                  Accéder au Cockpit Pro
                </button>
              </div>
            </div>

            {/* Tier 3: Critical Infrastructure */}
            <div className="rounded-[32px] bg-[#161618] border border-white/[0.12] p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Infrastructure OIV</h3>
                <p className="text-xs text-[#d2d2d7] mb-6">Opérateurs d'importance vitale, santé et défense nationale.</p>
                <div className="text-3xl font-semibold text-white mb-6 font-mono">Souveraineté Totale</div>
                
                <div className="space-y-3 text-xs text-[#f1f5f9] border-t border-white/[0.12] pt-6">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>Déploiement On-Premise Air-Gapped</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>Chiffrement HSM Post-Quantique</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>Support d'astreinte 24/7/365 en &lt; 15 min</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#30d158]" /><span>Audit de code source annuel</span></div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={onSignIn}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
                >
                  Contacter l'Ingénierie
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 11. APPLE FINAL CALL TO ACTION */}
      <section className="py-24 text-center">
        <div className="max-w-[720px] mx-auto px-4 sm:px-8 space-y-6">
          <LacazaLogo size="lg" showPanelBadge={false} showDomain={false} />
          
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">
            Passez à l'extrême.
          </h2>
          
          <p className="text-base sm:text-lg text-[#d2d2d7] leading-relaxed max-w-xl mx-auto">
            Démarrez dès aujourd'hui la supervision unifiée de votre patrimoine immobilier et de vos parcs machines.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnterDashboard}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium px-8 py-3.5 rounded-full transition-all text-sm shadow-xl shadow-[#0071e3]/25 active:scale-95"
            >
              Lancer le Cockpit Opérationnel
            </button>
            <button
              onClick={onSignIn}
              className="bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white border border-white/15 font-medium px-7 py-3.5 rounded-full transition-all text-sm"
            >
              Authentification SSO
            </button>
          </div>
        </div>
      </section>

      {/* 12. APPLE ICONIC DIRECTORY FOOTER */}
      <footer className="bg-[#161617] text-[#a1a1a6] text-[12px] pt-12 pb-16 border-t border-white/[0.12]">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-8 space-y-8">
          
          {/* Footnotes */}
          <div className="space-y-2 border-b border-white/[0.12] pb-6 text-[11px] leading-relaxed text-[#a1a1a6]">
            <p>1. Le coefficient d'efficacité énergétique (PUE 1.12) est mesuré en conditions réelles sur les salles blanches de type N+1 équipées de confinement allée froide et régulation prédictive CVC.</p>
            <p>2. Les débits de télémétrie de 144 000 msg/seconde sont atteints via partitionnement distribué sur clusters Apache Kafka 3.6 avec compression zstd.</p>
            <p>3. Conformité aux normes ISO 27001:2022 et ITIL v4 auditée et validée pour les environnements de production.</p>
          </div>

          {/* Directory Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8">
            <div className="space-y-3">
              <span className="text-white font-semibold text-xs block">Architecture</span>
              <ul className="space-y-2">
                <li><a href="#tiers" className="hover:text-white text-[#d2d2d7] transition-colors">Couche 5 : Cockpit</a></li>
                <li><a href="#tiers" className="hover:text-white text-[#d2d2d7] transition-colors">Couche 4 : IA & CVC</a></li>
                <li><a href="#tiers" className="hover:text-white text-[#d2d2d7] transition-colors">Couche 3 : Data Mesh</a></li>
                <li><a href="#tiers" className="hover:text-white text-[#d2d2d7] transition-colors">Couche 2 : ITSM/CMDB</a></li>
                <li><a href="#tiers" className="hover:text-white text-[#d2d2d7] transition-colors">Couche 1 : Bâtiments</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-white font-semibold text-xs block">Matériel & Edge</span>
              <ul className="space-y-2">
                <li><a href="#bento" className="hover:text-white text-[#d2d2d7] transition-colors">Nœuds Edge IP68</a></li>
                <li><a href="#bento" className="hover:text-white text-[#d2d2d7] transition-colors">Puces M-Telemetry</a></li>
                <li><a href="#bento" className="hover:text-white text-[#d2d2d7] transition-colors">Passerelles LoRaWAN</a></li>
                <li><a href="#bento" className="hover:text-white text-[#d2d2d7] transition-colors">Switches Anycast</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-white font-semibold text-xs block">Jumeau Numérique</span>
              <ul className="space-y-2">
                <li><a href="#blueprint" className="hover:text-white text-[#d2d2d7] transition-colors">Plans CAD 3D</a></li>
                <li><a href="#blueprint" className="hover:text-white text-[#d2d2d7] transition-colors">Modélisation BIM LOD 400</a></li>
                <li><a href="#blueprint" className="hover:text-white text-[#d2d2d7] transition-colors">Thermographie</a></li>
                <li><a href="#blueprint" className="hover:text-white text-[#d2d2d7] transition-colors">Qualité d'Air & DALI</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-white font-semibold text-xs block">Gouvernance</span>
              <ul className="space-y-2">
                <li><a href="#security" className="hover:text-white text-[#d2d2d7] transition-colors">Sécurité ISO 27001</a></li>
                <li><a href="#security" className="hover:text-white text-[#d2d2d7] transition-colors">Conformité NIS 2</a></li>
                <li><a href="#security" className="hover:text-white text-[#d2d2d7] transition-colors">Décret Tertiaire CSRD</a></li>
                <li><a href="#security" className="hover:text-white text-[#d2d2d7] transition-colors">Zero-Trust mTLS 1.3</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-white font-semibold text-xs block">À Propos</span>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white text-[#d2d2d7] transition-colors">Vision d'Entreprise</a></li>
                <li><a href="#" className="hover:text-white text-[#d2d2d7] transition-colors">Documentation API</a></li>
                <li><a href="/story-reels.html" target="_blank" rel="noopener noreferrer" className="hover:text-white text-[#d2d2d7] transition-colors">Keynote Story 9:16</a></li>
                <li><a href="#" className="hover:text-white text-[#d2d2d7] transition-colors">Contacter le Support</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Language */}
          <div className="pt-8 border-t border-white/[0.12] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#a1a1a6]">
            <div>
              Copyright © 2026 LACAZA Inc. Tous droits réservés.
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white text-[#d2d2d7] transition-colors">Confidentialité</a>
              <span>|</span>
              <a href="#" className="hover:text-white text-[#d2d2d7] transition-colors">Conditions d'utilisation</a>
              <span>|</span>
              <a href="#" className="hover:text-white text-[#d2d2d7] transition-colors">Mentions légales</a>
              <span>|</span>
              <a href="#" className="hover:text-white text-[#d2d2d7] transition-colors flex items-center gap-1">
                <Globe2 className="w-3 h-3" />
                <span>France (Français)</span>
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* 13. FLOATING GLASS DOCK (DYNAMIC ISLAND NAVIGATION) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
      >
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#121316]/85 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]">
          
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 border-r border-white/10 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30d158] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30d158]"></span>
            </span>
            <span className="text-[#a1a1a6]">SYS: OK</span>
          </div>

          {/* Quick Nav Anchors */}
          <a
            href="#mockups"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5"
            title="Showcase Mockups"
          >
            <Monitor className="w-3.5 h-3.5 text-[#2997ff]" />
            <span className="hidden md:inline">Mockups 3D</span>
          </a>

          <a
            href="#tiers"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5"
            title="Architecture Tiers"
          >
            <Layers className="w-3.5 h-3.5 text-[#a855f7]" />
            <span className="hidden md:inline">Architecture</span>
          </a>

          <a
            href="#bento"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5"
            title="Ingénierie & Matériel"
          >
            <Cpu className="w-3.5 h-3.5 text-[#30d158]" />
            <span className="hidden md:inline">Matériel</span>
          </a>

          <a
            href="#blueprint"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5"
            title="Jumeau Numérique CAD"
          >
            <Compass className="w-3.5 h-3.5 text-[#febc2e]" />
            <span className="hidden md:inline">Jumeau CAD</span>
          </a>

          {/* Direct CTA */}
          <button
            onClick={onEnterDashboard}
            className="ml-1 px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-[#0071e3]/30 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Cockpit</span>
          </button>

          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="p-2 rounded-full hover:bg-white/10 text-[#a1a1a6] hover:text-white transition-colors cursor-pointer"
            title="Retour en haut"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

        </div>
      </motion.div>

    </div>
  );
};
