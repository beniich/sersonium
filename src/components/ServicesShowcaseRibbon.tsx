import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Flame, 
  HardDrive, 
  Zap, 
  Terminal, 
  Radio, 
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Award,
  Globe,
  Sliders,
  CheckCircle2,
  FileText
} from "lucide-react";
import InteractiveDashboardCard from "./InteractiveDashboardCard";

export interface ServiceCardDef {
  id: string;
  category: "HYPERVISION" | "SECURITY" | "HARDWARE" | "AI" | "ENERGY" | "DEV";
  categoryBadge: string;
  categoryColor: string;
  title: string;
  description: string;
  bannerImage: string;
  metrics: { label: string; value: string; badge?: string }[];
  status: "OPTIMAL" | "NOMINAL" | "PROTECTED" | "ACTIVE";
  statusColor: string;
  tags: string[];
  actionLabel: string;
  targetTab?: string;
  targetPath?: string;
}

export const SENSORIUM_SERVICES_CATALOG: ServiceCardDef[] = [
  {
    id: "srv-hypervision-3d",
    category: "HYPERVISION",
    categoryBadge: "Jumeau Spatial BIM",
    categoryColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    title: "Spider-Twin 3D & Jumeau Numérique",
    description: "Modélisation spatiale IFC/Revit en temps réel de vos bâtiments critiques avec injection directe de la télémétrie GTB/IoT.",
    bannerImage: "/banners/banner_1.png",
    metrics: [
      { label: "Précision Maillage", value: "0.04 mm" },
      { label: "Bâtiments Actifs", value: "42 Sites", badge: "Synced" }
    ],
    status: "OPTIMAL",
    statusColor: "text-emerald-400",
    tags: ["Three.js", "BIM IFC", "WebGL"],
    actionLabel: "Ouvrir Jumeau 3D",
    targetTab: "cockpit",
    targetPath: "/cockpit"
  },
  {
    id: "srv-master-control",
    category: "HYPERVISION",
    categoryBadge: "Command Center CEO",
    categoryColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    title: "Master Control Panel & Multi-Tenants",
    description: "Cockpit exécutif unifié de gouvernance multi-entreprises avec audit du gaspillage DB (Waste index) et rollups télémétriques.",
    bannerImage: "/banners/banner_2.png",
    metrics: [
      { label: "Débit Global", value: "34.8k req/s" },
      { label: "Santé Tenants", value: "100% OK", badge: "SLA 99.99%" }
    ],
    status: "OPTIMAL",
    statusColor: "text-emerald-400",
    tags: ["Multi-Tenants", "Rollup Worker", "Executive"],
    actionLabel: "Explorer Master Control",
    targetTab: "ov-erp-portlets"
  },
  {
    id: "srv-waf-security",
    category: "SECURITY",
    categoryBadge: "Cyberdéfense Adaptative",
    categoryColor: "bg-red-500/10 text-red-400 border-red-500/20",
    title: "WAF Adaptatif & Threat Intelligence",
    description: "Pare-feu applicatif à scoring dynamique de menaces (0-100) avec auto-ban 15 min et partage inter-tenants des vecteurs d'attaque.",
    bannerImage: "/banners/banner_3.png",
    metrics: [
      { label: "Attaques Bloquées", value: "6,840/j" },
      { label: "Temps Auto-Ban", value: "15 min", badge: "Automatisé" }
    ],
    status: "PROTECTED",
    statusColor: "text-red-400",
    tags: ["WAF Layer 7", "Threat Sharing", "Anti-Bot"],
    actionLabel: "Gérer le Pare-Feu",
    targetTab: "security",
    targetPath: "/security"
  },
  {
    id: "srv-dora-compliance",
    category: "SECURITY",
    categoryBadge: "Règlement UE 2022/2554",
    categoryColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    title: "Résilience & Conformité DORA (Piliers I-V)",
    description: "Homologation européenne DORA, registre des tiers critiques (TPST) et génération instantanée du Dossier PAS certifié SHA-256 HSM.",
    bannerImage: "/banners/banner_4.png",
    metrics: [
      { label: "Score DORA", value: "98.4%" },
      { label: "Sceau Cryptographique", value: "FIPS 140-3", badge: "Certifié" }
    ],
    status: "OPTIMAL",
    statusColor: "text-purple-400",
    tags: ["DORA EU", "PAS PDF", "Audit Tiers"],
    actionLabel: "Télécharger PAS DORA",
    targetTab: "compliance",
    targetPath: "/compliance/dora"
  },
  {
    id: "srv-silicon-ai",
    category: "AI",
    categoryBadge: "Silicium X1 NPU",
    categoryColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    title: "AIOps Neural Core & Auto-Guérison",
    description: "Moteur d'inférence en boucle fermée Gemini 2.5 Flash couplé à un circuit-breaker déterministe en cas de défaillance réseau.",
    bannerImage: "/banners/banner_5.png",
    metrics: [
      { label: "Latence Inférence", value: "2.8 ms" },
      { label: "Résilience Fallback", value: "Circuit CLOSED", badge: "Actif" }
    ],
    status: "ACTIVE",
    statusColor: "text-emerald-400",
    tags: ["Gemini AI", "Auto-Healing", "AIOps"],
    actionLabel: "Lancer Démo AIOps",
    targetTab: "compute",
    targetPath: "/compute"
  },
  {
    id: "srv-uem-fleet",
    category: "HARDWARE",
    categoryBadge: "Flotte & Terminaux",
    categoryColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    title: "UEM Sovereign & Agent Endpoint",
    description: "Supervision unifiée de terminaux Windows/Linux/Mac : télé-inventaire, contrôle à distance des ports USB et politiques DLP souveraines.",
    bannerImage: "/banners/banner_6.png",
    metrics: [
      { label: "Terminaux Enrôlés", value: "1,248" },
      { label: "DLP Ports USB", value: "Verrouillé", badge: "Zero-Trust" }
    ],
    status: "NOMINAL",
    statusColor: "text-cyan-400",
    tags: ["Agent UEM", "Bash / PS1", "DLP"],
    actionLabel: "Superviser la Flotte",
    targetTab: "uem",
    targetPath: "/uem"
  },
  {
    id: "srv-energy-cvc",
    category: "ENERGY",
    categoryBadge: "CSRD & Bilan Carbone",
    categoryColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    title: "GTB Climatisation (CVC) & PUE Datacenter",
    description: "Supervision aéraulique et thermo-régulée des centrales de froid, calcul du PUE temps réel et projection des économies ESG Scope 1-3.",
    bannerImage: "/banners/banner_7.png",
    metrics: [
      { label: "PUE Instantané", value: "1.12" },
      { label: "Économie Énergie", value: "-24% MWh", badge: "CSRD" }
    ],
    status: "OPTIMAL",
    statusColor: "text-teal-400",
    tags: ["PUE 1.12", "CVC / HVAC", "BACS B"],
    actionLabel: "Analyser l'Énergie",
    targetTab: "ov-perf"
  },
  {
    id: "srv-dev-studio",
    category: "DEV",
    categoryBadge: "OpenAPI 3.1 & Studio IDE",
    categoryColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    title: "Studio Artifacts & Action Layer",
    description: "Environnement d'ingénierie IaC Terraform/Kubernetes avec déploiement One-Click sur cluster souverain et pipeline streaming live.",
    bannerImage: "/banners/banner_8.png",
    metrics: [
      { label: "Spécification", value: "OpenAPI 3.1" },
      { label: "Pipeline Action", value: "5 Étapes", badge: "WireGuard" }
    ],
    status: "ACTIVE",
    statusColor: "text-amber-400",
    tags: ["Terraform", "Action Layer", "Live Stream"],
    actionLabel: "Ouvrir Studio IDE",
    targetTab: "artifacts",
    targetPath: "/artifacts"
  }
];

interface ServicesShowcaseRibbonProps {
  onNavigateToTab?: (tabId: string) => void;
  isDark?: boolean;
}

export const ServicesShowcaseRibbon: React.FC<ServicesShowcaseRibbonProps> = ({
  onNavigateToTab,
  isDark = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = [
    { id: "ALL", label: "Tous les Services (8 Piliers)" },
    { id: "HYPERVISION", label: "Jumeau Spatial & Hypervision" },
    { id: "SECURITY", label: "Cybersécurité & DORA" },
    { id: "AI", label: "AIOps & Silicium" },
    { id: "HARDWARE", label: "UEM & Flotte" },
    { id: "ENERGY", label: "Énergie & ESG" },
    { id: "DEV", label: "Studio & APIs" }
  ];

  const filtered = selectedCategory === "ALL" 
    ? SENSORIUM_SERVICES_CATALOG 
    : SENSORIUM_SERVICES_CATALOG.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-4 mb-4">
      {/* Header du Ruban de Services avec Style Lumina Pure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0c0c10]/90 border border-white/[0.08] backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-orange-400 font-bold">
              Architecture & Suite Opérationnelle
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Cartographie des Services SENSORIUM
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Chaque module est relié à son moteur télémétrique, ses garanties souveraines et son interface d'exploitation dédiée.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-orange-500 text-white font-bold shadow-xs"
                  : "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid des Services avec Affiches 16:9 Haute Définition */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filtered.map((service, idx) => (
          <InteractiveDashboardCard
            key={service.id}
            id={service.id}
            bannerImage={service.bannerImage}
            bannerAlt={service.title}
            badge={service.categoryBadge}
            badgeColor={service.categoryColor}
            glowColor={service.category === "SECURITY" ? "red" : service.category === "AI" ? "emerald" : "orange"}
            delay={idx * 0.04}
            onClick={() => {
              if (service.targetPath) {
                window.location.href = service.targetPath;
              } else if (service.targetTab && onNavigateToTab) {
                onNavigateToTab(service.targetTab);
              }
            }}
            quickActions={[
              {
                id: `act-${service.id}`,
                label: service.actionLabel,
                icon: ExternalLink,
                variant: "primary",
                onClick: () => {
                  if (service.targetPath) {
                    window.location.href = service.targetPath;
                  } else if (service.targetTab && onNavigateToTab) {
                    onNavigateToTab(service.targetTab);
                  }
                }
              }
            ]}
          >
            <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-neutral-500 uppercase">{service.category}</span>
                  <span className={`font-bold flex items-center gap-1 ${service.statusColor}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {service.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                  {service.title}
                </h3>

                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                  {service.description}
                </p>
              </div>

              {/* Metrics Pills Ribbon */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/[0.06] text-xs font-mono">
                {service.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="p-1.5 rounded-md bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[9px] text-neutral-500 uppercase truncate">{m.label}</div>
                    <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                      <span>{m.value}</span>
                      {m.badge && (
                        <span className="text-[8px] font-normal px-1 rounded bg-white/10 text-neutral-300">
                          {m.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags and CTA */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 flex-wrap">
                  {service.tags.slice(0, 2).map((tag, tIdx) => (
                    <span key={tIdx} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.04] text-neutral-400">
                      #{tag}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-medium text-orange-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Accéder</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </InteractiveDashboardCard>
        ))}
      </div>
    </div>
  );
};

export default ServicesShowcaseRibbon;
