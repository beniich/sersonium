export interface PhoneColor {
  id: "theme-facility" | "theme-it" | "theme-eam";
  name: "Facility Management" | "IT Service" | "Enterprise Asset";
  displayName: string;
  frenchName?: string;
  hex: string;
  gradient: string;
  accentGlow: string;
  description: string;
  subDescription: string;
}

export const PHONE_COLORS: PhoneColor[] = [
  {
    id: "theme-facility",
    name: "Facility Management",
    displayName: "Facility Management (CAFM)",
    frenchName: "Facility Management (CAFM)",
    hex: "#10b981",
    gradient: "from-[#34d399] via-[#10b981] to-[#047857]",
    accentGlow: "rgba(16, 185, 129, 0.4)",
    description: "Comprehensive steering of your buildings, workspaces, and multi-site maintenance.",
    subDescription: "Occupancy optimization, energy management, and dynamic space planning."
  },
  {
    id: "theme-it",
    name: "IT Service",
    displayName: "IT Service Management (ITSM)",
    frenchName: "IT Service Management (ITSM)",
    hex: "#3b82f6",
    gradient: "from-[#60a5fa] via-[#3b82f6] to-[#1d4ed8]",
    accentGlow: "rgba(59, 130, 246, 0.45)",
    description: "IT fleet supervision, ticket resolution workflows, and automated support orchestration.",
    subDescription: "ITIL service desk, incident response automation, and embedded knowledge base."
  },
  {
    id: "theme-eam",
    name: "Enterprise Asset",
    displayName: "Enterprise Asset Management (EAM)",
    frenchName: "Enterprise Asset Management (EAM)",
    hex: "#f59e0b",
    gradient: "from-[#fbbf24] via-[#f59e0b] to-[#b45309]",
    accentGlow: "rgba(245, 158, 11, 0.3)",
    description: "End-to-end asset lifecycle management from edge IT hardware to heavy physical facility infrastructure.",
    subDescription: "Real-time inventory, depreciation analytics, and predictive maintenance (CMMS)."
  }
];

export interface FocalLengthSpec {
  id: string;
  focal: string;
  zoom: string;
  lensName: string;
  aperture: string;
  sensor: string;
  iso: string;
  shutter: string;
  sampleImage: string;
  title: string;
  caption: string;
}

export const FOCAL_LENGTHS: FocalLengthSpec[] = [
  {
    id: "global",
    focal: "Site",
    zoom: "1x",
    lensName: "Global Multi-Site View",
    aperture: "Live",
    sensor: "3D Cartography & IoT",
    iso: "View",
    shutter: "Real-time",
    sampleImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85",
    title: "Global CAFM Supervision",
    caption: "Monitor your entire real estate portfolio and edge IT assets on a single, real-time telemetry dashboard."
  },
  {
    id: "it",
    focal: "IT",
    zoom: "2x",
    lensName: "IT Operations Center",
    aperture: "NOC",
    sensor: "Hardware & Network Inventory",
    iso: "ITIL",
    shutter: "99.9%",
    sampleImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=85",
    title: "IT Infrastructure Fleet Management",
    caption: "Dynamic hardware inventory, license tracking, component health, and network topology dependency mapping."
  },
  {
    id: "helpdesk",
    focal: "Support",
    zoom: "3x",
    lensName: "User Portal & Helpdesk",
    aperture: "SLA",
    sensor: "Ticketing System",
    iso: "Auto",
    shutter: "24/7",
    sampleImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=85",
    title: "Reactive & Preventive Support",
    caption: "Centralize facilities maintenance requests (FM) and IT incident escalations into a unified portal."
  },
  {
    id: "energy",
    focal: "Energy",
    zoom: "4x",
    lensName: "Smart Building IoT",
    aperture: "IoT",
    sensor: "Environmental Probes",
    iso: "ESG",
    shutter: "Smart",
    sampleImage: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1600&q=85",
    title: "Energy & Carbon Performance",
    caption: "Analyze power draw, indoor air quality, and meeting room occupancy telemetry in real time."
  }
];

export interface TechSpecGroup {
  category: string;
  items: { label: string; value: string }[];
}

export const TECH_SPECS: TechSpecGroup[] = [
  {
    category: "Facilities Management (CAFM)",
    items: [
      { label: "Space Management", value: "2D/3D floorplans, occupancy tracking, workstation allocation, and flex-office workflows." },
      { label: "Maintenance (CMMS)", value: "Preventive and curative work order scheduling, contractor governance, and asset tracking." },
      { label: "Smart Building IoT", value: "Native sensor connectivity for presence, indoor temperature, humidity, and air quality metrics." },
      { label: "Energy & ESG", value: "Utility consumption analytics (electricity, gas, water) and automated CSRD compliance reporting." }
    ]
  },
  {
    category: "IT Service Management (ITSM)",
    items: [
      { label: "Ticketing & Helpdesk", value: "Self-service portal, knowledge base, ITIL incident routing, and automated escalation SLA policies." },
      { label: "Asset Management (ITAM)", value: "Automated hardware discovery, warranty tracking, firmware audit, and complete lifecycle monitoring." },
      { label: "License Governance", value: "SaaS subscription optimization, software compliance tracking, and IT budget rationalization." },
      { label: "CMDB Relational Graph", value: "Dependency mapping across hardware nodes, application runtimes, and critical business services." }
    ]
  },
  {
    category: "Platform & Security Governance",
    items: [
      { label: "Cloud & Sovereign Hosting", value: "High-availability geo-distributed cloud deployment with optional on-premise sovereign nodes." },
      { label: "Access & Identity", value: "SSO (Single Sign-On), hardware MFA keys, and fine-grained Role-Based Access Control (RBAC)." },
      { label: "API Integrations", value: "Native connectors for Active Directory, ERP systems (SAP, Oracle), HR suites, and IoT broker gateways." },
      { label: "Field Mobility", value: "Cross-platform mobile application for field engineers with complete offline synchronization." }
    ]
  }
];
