export interface Translations {
  sidebar: {
    overview: string;
    siliconCompute: string;
    infrastructure: string;
    network: string;
    security: string;
    zeroTrust: string;
    storage: string;
    telemetry: string;
    workspace: string;
    strategy: string;
    settings: string;
  };
  header: {
    showcase: string;
    searchPlaceholder: string;
    mobileMode: string;
    quickSetup: string;
    auto: string;
    dark: string;
    light: string;
    signIn: string;
    signOut: string;
    cockpit: string;
    sensoryUnlock: string;
    availableServices: string;
    expandAll: string;
    collapseAll: string;
  };
  mockMode: {
    liveMode: string;
    mockMode: string;
    simulators: string;
  };
  showcase: {
    architecture: string;
    inferenceSandbox: string;
    siliconX1: string;
    calculator: string;
    ecosystem: string;
    heroTag: string;
    heroTitle1: string;
    heroTitle2: string;
    heroSubtitle: string;
    unlockCta: string;
    cockpitCta: string;
    sandboxCta: string;
    readyTitle: string;
    readySubtitle: string;
    demoAccess: string;
  };
}

export const translations: Record<"en" | "fr", Translations> = {
  en: {
    sidebar: {
      overview: "Overview & ERP",
      siliconCompute: "Silicon & Edge Compute",
      infrastructure: "Infrastructure (CAFM)",
      network: "Anycast Network & Routing",
      security: "Cybersecurity & WAF",
      zeroTrust: "Zero Trust & Access (ZTNA)",
      storage: "Storage & Data",
      telemetry: "Real-Time Streams (Kafka)",
      workspace: "Collaborative Workspace",
      strategy: "Governance & Strategy",
      settings: "Administration & IAM",
    },
    header: {
      showcase: "Showcase",
      searchPlaceholder: "Search services, nodes, topics...",
      mobileMode: "Mobile Mode",
      quickSetup: "Quick Setup",
      auto: "Auto",
      dark: "Dark",
      light: "Light",
      signIn: "Sign In",
      signOut: "Sign Out",
      cockpit: "Cockpit",
      sensoryUnlock: "Sensory Unlock",
      availableServices: "available services",
      expandAll: "Expand all",
      collapseAll: "Collapse",
    },
    mockMode: {
      liveMode: "Live Mode",
      mockMode: "Mock Mode",
      simulators: "Sensorium Simulators",
    },
    showcase: {
      architecture: "Architecture",
      inferenceSandbox: "Inference & Sandbox",
      siliconX1: "Silicon X1",
      calculator: "Calculator",
      ecosystem: "Ecosystem",
      heroTag: "SENSORIUM SENSORY EDGE 4.0 • LIVE ARCHITECTURE & TELEMETRY",
      heroTitle1: "Sensory intelligence.",
      heroTitle2: "Absolute speed.",
      heroSubtitle: "Supervise, analyze, and orchestrate critical infrastructure across 340+ Anycast points of presence. 3 ms inference, sub-8 ms latency, and full sovereignty.",
      unlockCta: "Sensory Unlock",
      cockpitCta: "Explore Cockpit",
      sandboxCta: "Sandbox & AI Inference",
      readyTitle: "Ready to empower your infrastructure?",
      readySubtitle: "Access the live management console, test the multi-node architecture, and simulate real-world scenarios.",
      demoAccess: "Access Demo Cockpit",
    },
  },
  fr: {
    sidebar: {
      overview: "Vue d'ensemble & ERP",
      siliconCompute: "Calcul Silicium & Edge",
      infrastructure: "Infrastructure (GMAO / CAFM)",
      network: "Réseau Anycast & Routage",
      security: "Cybersécurité & WAF",
      zeroTrust: "Zero Trust & Accès (ZTNA)",
      storage: "Stockage & Données",
      telemetry: "Flux Temps Réel (Kafka)",
      workspace: "Espace Collaboratif",
      strategy: "Gouvernance & Stratégie",
      settings: "Administration & IAM",
    },
    header: {
      showcase: "Vitrine",
      searchPlaceholder: "Rechercher services, nœuds, topics...",
      mobileMode: "Mode Mobile",
      quickSetup: "Configuration Rapide",
      auto: "Auto",
      dark: "Sombre",
      light: "Clair",
      signIn: "Connexion",
      signOut: "Déconnexion",
      cockpit: "Cockpit",
      sensoryUnlock: "Déverrouillage Sensoriel",
      availableServices: "services disponibles",
      expandAll: "Tout déployer",
      collapseAll: "Tout réduire",
    },
    mockMode: {
      liveMode: "Mode Réel",
      mockMode: "Mode Démo (Mock)",
      simulators: "Simulateurs Sensorium",
    },
    showcase: {
      architecture: "Architecture",
      inferenceSandbox: "Inférence & Sandbox",
      siliconX1: "Silicium X1",
      calculator: "Calculateur",
      ecosystem: "Écosystème",
      heroTag: "SENSORIUM SENSORY EDGE 4.0 • ARCHITECTURE TEMPS RÉEL & TÉLÉMÉTRIE",
      heroTitle1: "Intelligence sensorielle.",
      heroTitle2: "Vitesse absolue.",
      heroSubtitle: "Supervisez, analysez et orchestrez les infrastructures critiques sur plus de 340 points de présence Anycast. Inférence 3 ms, latence sous 8 ms et souveraineté totale.",
      unlockCta: "Déverrouillage Sensoriel",
      cockpitCta: "Explorer le Cockpit",
      sandboxCta: "Sandbox & Inférence IA",
      readyTitle: "Prêt à propulser vos infrastructures ?",
      readySubtitle: "Accédez à la console de supervision en direct, testez l'architecture multi-nœuds et simulez des scénarios opérationnels réels.",
      demoAccess: "Accéder au Cockpit Démo",
    },
  },
};
