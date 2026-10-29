import React, { useState, useMemo, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Code2, 
  FileText, 
  Table, 
  Eye, 
  Download, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Play, 
  RotateCcw, 
  ChevronRight, 
  Layers, 
  FileCode, 
  Terminal, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Sliders,
  FileSpreadsheet,
  Radio,
  Rocket,
  Zap,
  Flame
} from "lucide-react";
import LiveStreamRenderer from "../components/renderers/LiveStreamRenderer";
import SelfHealingModal, { SelfHealingIncident, DEFAULT_INCIDENT } from "../components/SelfHealingModal";
import RollbackWatchdogStatus from "../components/RollbackWatchdogStatus";
import FeatureGate from "../components/FeatureGate";

export interface ArtifactData {
  id: string;
  type: "code" | "doc" | "sheet" | "ui" | "stream";
  title: string;
  language?: string;
  content: string;
  /** Nom du topic Kafka pour les artefacts de type stream */
  topic?: string;
  version: number;
  createdAt: string;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  artifactId?: string;
}

// Presets d'ingénierie et de génération pour SENSORIUM
const PROMPT_PRESETS = [
  {
    label: "⚡ Terraform Cluster Edge",
    type: "code" as const,
    prompt: "Génère un script Terraform (HCL) pour déployer un cluster SENSORIUM Edge de 3 nœuds haute résilience avec Anycast DNS et Zero-Trust WireGuard mesh."
  },
  {
    label: "🛡️ Rapport DORA Pilier III",
    type: "doc" as const,
    prompt: "Rédige le dossier de conformité DORA (Règlement UE 2022/2554) pour le Pilier III : Tests de résilience opérationnelle numérique et audit des tiers critiques."
  },
  {
    label: "📊 Télémétrie PUE & Capteurs (CSV)",
    type: "sheet" as const,
    prompt: "Génère une matrice tabulaire de télémétrie des 8 datacenters européens de SENSORIUM incluant PUE, température salle serveur, latence réseau et débit CVC."
  },
  {
    label: "🎨 Widget React Supervision",
    type: "ui" as const,
    prompt: "Génère le composant visuel d'un widget de surveillance temps réel pour les actionneurs de vannes thermo-régulées avec jauge et alertes."
  },
  {
    label: "📡 Flux Live Thermique Rack B",
    type: "stream" as const,
    prompt: "Je veux voir l'état thermique des serveurs du Rack B en temps réel. Lance une hypervision live Kafka."
  },
  {
    label: "⚡ Flux Live Énergie Datacenter",
    type: "stream" as const,
    prompt: "Ouvre un flux temps réel pour surveiller la consommation énergétique et le PUE de nos datacenters européens."
  },
  {
    label: "🌐 Flux Live Réseau Anycast",
    type: "stream" as const,
    prompt: "Lance une surveillance temps réel du trafic réseau Anycast sur les nœuds Edge SENSORIUM."
  },
  {
    label: "🚨 Auto-Guérison Rack B (> 92°C)",
    type: "stream" as const,
    prompt: "Alerte thermique critique détectée sur Rack B (92.4°C). Déclenche la procédure de remédiation autonome et le pre-flight check."
  }
];

// Dictionnaires de templates initiaux d'artefacts pour démonstration immédiate
const INITIAL_ARTIFACTS: Record<string, ArtifactData> = {
  "art-tf-1": {
    id: "art-tf-1",
    type: "code",
    title: "sensorium_edge_cluster.tf",
    language: "hcl",
    version: 1,
    createdAt: "2026-10-21 19:35",
    summary: "Déploiement IaC Terraform pour 3 nœuds souverains Edge avec Zero-Trust Mesh",
    content: `# ==============================================================================
# SENSORIUM SOVEREIGN CLOUD - INFRASTRUCTURE AS CODE (TERRAFORM)
# Cluster Edge Haute Résilience - Conformité FIPS 140-3 & DORA Art. 12
# ==============================================================================

terraform {
  required_version = ">= 1.8.0"
  required_providers {
    sensorium = {
      source  = "sensorium/sovereign"
      version = "~> 3.4.0"
    }
  }
}

variable "cluster_region" {
  type    = string
  default = "eu-west-souverain-paris"
}

# 1. Edge Node Orchestration (Silicon Bare-Metal)
resource "sensorium_edge_cluster" "mesh_primary" {
  name        = "cluster-apex-01"
  region      = var.cluster_region
  nodes_count = 3
  
  hardware_spec {
    processor_arch = "x86_64_epyc_gen4"
    allocated_vcpu = 32
    memory_gib     = 128
    nvme_storage   = "2TB_ENCRYPTED_LUKS2"
  }

  network_mesh {
    protocol          = "WIREGUARD_ZTNA"
    anycast_vip       = "185.12.94.10"
    ddos_mitigation   = "HARDWARE_SILICON_INT4"
    strict_sni_origin = true
  }

  telemetry_sink {
    kafka_broker_endpoint = "kafka.internal.sensorium.cloud:9092"
    sampling_frequency_hz = 100
  }

  tags = {
    Environment = "Production"
    Compliance  = "DORA_EU_2022_2554"
    Owner       = "Sovereign Operations Fleet"
  }
}`
  },

  "art-dora-1": {
    id: "art-dora-1",
    type: "doc",
    title: "Dossier_Audit_DORA_Pilier_III.md",
    language: "markdown",
    version: 1,
    createdAt: "2026-10-21 19:36",
    summary: "Dossier d'homologation réglementaire DORA pour les tests de résilience opérationnelle",
    content: `# RAPPORT D'HOMOLOGATION DORA (Règlement UE 2022/2554)
**Plateforme :** SENSORIUM Sovereign Hypervision Platform  
**Entité :** Direction de la Sécurité des Systèmes d'Information (DSSI)  
**Date d'audit :** Octobre 2026 | **Classification :** Confidentiel Défense / Opérations  

---

### 1. Contexte & Champ d'Application
Le présent document formalise la conformité de l'architecture **SENSORIUM** aux exigences du **Pilier III de DORA** (*Digital Operational Resilience Act*), relatif aux programmes d'essais de résilience opérationnelle numérique et aux tests de pénétration fondés sur la menace (TLPT / Threat-Led Penetration Testing).

### 2. Synthèse des Contrôles & Métriques Clés

| Composant Testé | Norme de Référence | RTO Objectif | RPO Réalisé | Résultat Audit |
| :--- | :--- | :--- | :--- | :--- |
| **Cluster Edge Anycast (1 571 DNS)** | ISO 27001 / BIND 9.18 | < 120 ms | 0 sec (Sync) | **100% Validé (A+)** |
| **Pipeline Kafka Télémétrie IoT** | FIPS 140-3 Niveau 3 | < 300 ms | < 50 ms | **Conforme** |
| **Passerelle ZTNA Hardware Token** | DORA Art. 9 §2 | Immédiat | N/A | **Conforme** |
| **Plan Reversibilité PSR RFC 1035** | DORA Art. 28 §8 | < 4 heures | 18 min | **Audit Certifié** |

### 3. Matrice de Risques & Plan d'Action Correctif
> [!IMPORTANT]
> Tous les flux de télémétrie transitent exclusivement par des enclaves matérielles chiffrées (HSM matériels certifiés). Aucun transfert hors de l'Union Européenne n'est autorisé.

- **Exercices de Cyber-Résilience :** Simulation de black-out complet sur le POP Paris-Nord menée avec succès (bascule automatique en 380 ms).
- **Audit Tiers Fournisseurs :** Cartographie exhaustive des 14 prestataires critiques achevée.`
  },

  "art-sheet-1": {
    id: "art-sheet-1",
    type: "sheet",
    title: "Matrice_Telemetrie_Datacenters_EU.csv",
    language: "csv",
    version: 1,
    createdAt: "2026-10-21 19:37",
    summary: "Relevé télémétrique PUE, température et charge énergétique des centres de données",
    content: `Datacenter_ID,Localisation,PUE_Actuel,Temp_Moyenne_C,Serveurs_Actifs,Charge_KW,SLA_Uptime,Statut_CVC
DC-PAR-01,Paris (France),1.14,21.4,1420,860,99.999%,Optimal (Free-Cooling)
DC-FRA-02,Francfort (Allemagne),1.18,22.1,2100,1240,99.998%,Optimal
DC-AMS-03,Amsterdam (Pays-Bas),1.12,20.8,1890,990,99.999%,Optimal (Water-Loop)
DC-STO-04,Stockholm (Suède),1.09,19.2,1650,780,100.000%,Éco-Plafond
DC-MAD-05,Madrid (Espagne),1.24,23.8,980,620,99.995%,Surveillance HVAC
DC-MIL-06,Milan (Italie),1.19,22.6,1120,710,99.996%,Optimal
DC-DUB-07,Dublin (Irlande),1.11,20.4,1750,940,99.999%,Optimal
DC-VIE-08,Vienne (Autriche),1.16,21.9,890,530,99.997%,Optimal`
  },

  "art-ui-1": {
    id: "art-ui-1",
    type: "ui",
    title: "Widget_Actionneur_Vannes_CVC.tsx",
    language: "typescript",
    version: 1,
    createdAt: "2026-10-21 19:38",
    summary: "Composant interactif de régulation des vannes et de débit d'eau glacée",
    content: `<div class="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-700/60 shadow-2xl space-y-5">
  <div class="flex items-center justify-between border-b border-white/10 pb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-lg">
        ⚡
      </div>
      <div>
        <h4 class="font-bold text-base tracking-wide text-white">Actionneur Vanne CVC-V04</h4>
        <p class="text-xs text-slate-400 font-mono">Loop Eau Glacée • Datacenter Paris-Nord</p>
      </div>
    </div>
    <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
      Régulation Active
    </span>
  </div>

  <div class="grid grid-cols-3 gap-3 text-center">
    <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10">
      <span class="text-[11px] text-slate-400 uppercase font-semibold">Débit Fluide</span>
      <div class="text-xl font-bold font-mono text-cyan-400 mt-1">42.8 L/s</div>
    </div>
    <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10">
      <span class="text-[11px] text-slate-400 uppercase font-semibold">Ouverture</span>
      <div class="text-xl font-bold font-mono text-orange-400 mt-1">68.5%</div>
    </div>
    <div class="p-3 rounded-xl bg-white/[0.04] border border-white/10">
      <span class="text-[11px] text-slate-400 uppercase font-semibold">Consigne Delta T</span>
      <div class="text-xl font-bold font-mono text-emerald-400 mt-1">Δ 7.2°C</div>
    </div>
  </div>

  <div class="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 flex items-center justify-between">
    <span>PID Algorithmique Souverain synchronisé à 100 Hz</span>
    <span class="font-mono font-bold">Latency: 1.4 ms</span>
  </div>
</div>`
  }
};

export default function ArtifactsIdeStudio({ isDark = true }: { isDark?: boolean; state?: any; onNavigate?: (p: string) => void }) {
  // Liste des artefacts en mémoire
  const [artifacts, setArtifacts] = useState<Record<string, ArtifactData>>(INITIAL_ARTIFACTS);
  const [activeArtifactId, setActiveArtifactId] = useState<string>("art-tf-1");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSelfHealingOpen, setIsSelfHealingOpen] = useState(false);
  const [watchdogActive, setWatchdogActive] = useState(false);

  // Historique des messages de conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      role: "system",
      text: "Bienvenue dans le Studio d'Artefacts & IDE IA SENSORIUM. Le volet gauche gère la conversation et le raisonnement, tandis que le volet droit affiche et exécute en temps réel les documents, scripts et données générés.",
      timestamp: "19:30"
    },
    {
      id: "msg-2",
      role: "user",
      text: "Génère un script Terraform pour déployer notre cluster Edge souverain avec maillage Zero-Trust.",
      timestamp: "19:35"
    },
    {
      id: "msg-3",
      role: "assistant",
      text: "J'ai configuré l'architecture Terraform complète avec spécifications bare-metal EPYC, WireGuard et télémétrie Kafka. Le script est ouvert dans l'espace d'artefacts à votre droite.",
      timestamp: "19:35",
      artifactId: "art-tf-1"
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // L'artefact actif actuellement sélectionné
  const currentArtifact = artifacts[activeArtifactId] || null;

  useEffect(() => {
    if (currentArtifact) {
      setEditedContent(currentArtifact.content);
      setIsEditing(false);
    }
  }, [activeArtifactId, currentArtifact]);

  // Fonction de parsing de balises <artifact ...>...</artifact>
  const parseArtifactFromResponse = (responseRaw: string): { cleanText: string; artifact?: Partial<ArtifactData> } => {
    const artifactRegex = /<artifact\s+type="([^"]+)"(?:\s+title="([^"]+)")?(?:\s+language="([^"]+)")?>([\s\S]*?)<\/artifact>/i;
    const match = responseRaw.match(artifactRegex);

    if (match) {
      const type = (match[1] || "code") as "code" | "doc" | "sheet" | "ui";
      const title = match[2] || `artefact_${Date.now()}`;
      const language = match[3] || (type === "code" ? "typescript" : type === "sheet" ? "csv" : "markdown");
      const content = match[4].trim();
      const cleanText = responseRaw.replace(artifactRegex, "").trim();

      return {
        cleanText,
        artifact: {
          type,
          title,
          language,
          content
        }
      };
    }

    return { cleanText: responseRaw };
  };

  // Envoi d'un prompt utilisateur
  const handleSendMessage = (customPrompt?: string) => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt("");
    setIsGenerating(true);

    // Simulation de l'inférence avec émission de balises d'artefact
    setTimeout(() => {
      let generatedReply = "";
      let newArtifact: ArtifactData | null = null;
      const lower = promptToSend.toLowerCase();

      if (lower.includes("auto-guérison") || lower.includes("auto guerison") || lower.includes("remédiation") || (lower.includes("rack b") && lower.includes("alerte"))) {
        setIsSelfHealingOpen(true);
        generatedReply = `🚨 Anomalie thermique critique détectée sur le Rack B (92.4°C). J'ai ouvert le panneau de Remédiation Autonome Human-in-the-Loop avec le Pre-Flight Check et le correctif YAML. Utilisez [CTRL+ENTER] pour approuver ou [ESC] pour rejeter.`;
      } else if (lower.includes("dora") || lower.includes("audit") || lower.includes("rapport")) {
        const id = `art-dora-${Date.now()}`;
        newArtifact = {
          ...INITIAL_ARTIFACTS["art-dora-1"],
          id,
          title: `Rapport_DORA_Revision_${new Date().getFullYear()}.md`,
          version: (currentArtifact?.type === "doc" ? currentArtifact.version + 1 : 1),
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        generatedReply = `J'ai généré le dossier de conformité réglementaire DORA Pilier III adapté à votre infrastructure. Les exigences d'audit et la matrice de risques sont prêtes.`;
      } else if (lower.includes("pue") || lower.includes("csv") || lower.includes("sheet") || lower.includes("matrice") || lower.includes("datacenter")) {
        const id = `art-sheet-${Date.now()}`;
        newArtifact = {
          ...INITIAL_ARTIFACTS["art-sheet-1"],
          id,
          title: `Telemetrie_Datacenters_${Date.now().toString().slice(-4)}.csv`,
          version: (currentArtifact?.type === "sheet" ? currentArtifact.version + 1 : 1),
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        generatedReply = `Voici la matrice de télémétrie complète des 8 datacenters européens. Le tableau interactif est chargé dans l'espace d'artefacts.`;
      } else if (lower.includes("widget") || lower.includes("vanne") || lower.includes("ui") || lower.includes("cvc")) {
        const id = `art-ui-${Date.now()}`;
        newArtifact = {
          ...INITIAL_ARTIFACTS["art-ui-1"],
          id,
          title: `Widget_Supervision_CVC_${Date.now().toString().slice(-4)}.tsx`,
          version: (currentArtifact?.type === "ui" ? currentArtifact.version + 1 : 1),
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        generatedReply = `J'ai modélisé le widget de régulation active pour vos vannes CVC. L'aperçu dynamique est disponible immédiatement.`;
      } else if (
        lower.includes("flux") || lower.includes("stream") || lower.includes("live") ||
        lower.includes("temps réel") || lower.includes("rack") || lower.includes("kafka") ||
        lower.includes("hypervision") || lower.includes("réseau") || lower.includes("anycast") ||
        lower.includes("thermique") || lower.includes("énergie") || lower.includes("energie")
      ) {
        // Détecter le topic Kafka le plus pertinent selon la requête
        let kafkaTopic = "telemetry.sensorium.generic";
        let streamTitle = "Flux Télémétrie SENSORIUM";
        if (lower.includes("rack b") || lower.includes("thermique") || lower.includes("thermal") || lower.includes("temp")) {
          kafkaTopic = "telemetry.rackB.thermal";
          streamTitle = "Températures Rack B — Hypervision Live";
        } else if (lower.includes("énergie") || lower.includes("energie") || lower.includes("pue") || lower.includes("power")) {
          kafkaTopic = "telemetry.dc.power";
          streamTitle = "Consommation Énergétique DC — Live";
        } else if (lower.includes("réseau") || lower.includes("reseau") || lower.includes("anycast") || lower.includes("réseau") || lower.includes("network")) {
          kafkaTopic = "telemetry.edge.network";
          streamTitle = "Trafic Réseau Anycast — Live";
        } else if (lower.includes("hvac") || lower.includes("cvc") || lower.includes("climatisation")) {
          kafkaTopic = "telemetry.hvac.zones";
          streamTitle = "Régulation HVAC Zones — Live";
        }
        const id = `art-stream-${Date.now()}`;
        newArtifact = {
          id,
          type: "stream",
          title: streamTitle,
          topic: kafkaTopic,
          content: "",
          version: 1,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          summary: `Flux temps réel Kafka — Topic: ${kafkaTopic}`
        };
        generatedReply = `J'ai lancé l'hypervision temps réel. Le flux Kafka \`${kafkaTopic}\` est maintenant actif dans l'espace d'artefacts. Le tableau se remplit automatiquement via Socket.IO.`;
      } else {
        const id = `art-code-${Date.now()}`;
        newArtifact = {
          ...INITIAL_ARTIFACTS["art-tf-1"],
          id,
          title: `sensorium_config_${Date.now().toString().slice(-4)}.tf`,
          version: (currentArtifact?.type === "code" ? currentArtifact.version + 1 : 1),
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        generatedReply = `Voici le script d'infrastructure adapté. Vous pouvez le modifier directement dans l'éditeur à droite ou l'exporter en un clic.`;
      }

      if (newArtifact) {
        setArtifacts(prev => ({
          ...prev,
          [newArtifact!.id]: newArtifact!
        }));
        setActiveArtifactId(newArtifact.id);
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        text: generatedReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        artifactId: newArtifact?.id
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsGenerating(false);
    }, 1200);
  };

  // Copier le contenu
  const handleCopyContent = () => {
    if (!currentArtifact) return;
    navigator.clipboard.writeText(isEditing ? editedContent : currentArtifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Télécharger le document sous son format natif
  const handleDownload = () => {
    if (!currentArtifact) return;
    const content = isEditing ? editedContent : currentArtifact.content;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = currentArtifact.title;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sauvegarder les modifications manuelles de l'artefact
  const handleSaveEdit = () => {
    if (!currentArtifact) return;
    setArtifacts(prev => ({
      ...prev,
      [currentArtifact.id]: {
        ...currentArtifact,
        content: editedContent,
        version: currentArtifact.version + 1
      }
    }));
    setIsEditing(false);
  };

  // Déploiement One-Click sur le cluster souverain via l'Action Layer
  const handleDeployArtifact = async () => {
    if (!currentArtifact) return;
    setIsDeploying(true);
    const contentToDeploy = isEditing ? editedContent : currentArtifact.content;

    try {
      const response = await fetch("/api/v1/ai/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artifactId: currentArtifact.id,
          title: currentArtifact.title,
          content: contentToDeploy,
          language: currentArtifact.language || "hcl",
          targetCluster: "cluster-apex-01",
          environment: "production",
        }),
      });

      const resData = await response.json();
      const executionResult = resData?.data;

      // Création automatique du flux de télémétrie de déploiement en direct
      const deployTopic = executionResult?.topic || `telemetry.deploy.exec-${Date.now()}`;
      const deployStreamId = `art-deploy-${Date.now()}`;

      const newStreamArtifact: ArtifactData = {
        id: deployStreamId,
        type: "stream",
        title: `Déploiement Live : ${currentArtifact.title}`,
        topic: deployTopic,
        content: "",
        version: 1,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        summary: `Suivi du déploiement en direct sur le cluster souverain (ID: ${executionResult?.executionId || "exec"})`
      };

      setArtifacts((prev) => ({
        ...prev,
        [deployStreamId]: newStreamArtifact,
      }));
      setActiveArtifactId(deployStreamId);

      // Notification dans le copilote
      const deployMsg: ChatMessage = {
        id: `msg-deploy-${Date.now()}`,
        role: "assistant",
        text: `🚀 **Action Layer enclenché :** Déploiement de l'artefact \`${currentArtifact.title}\` lancé sur le cluster souverain (\`cluster-apex-01\`).\n\n- **Audit DORA :** \`${executionResult?.metrics?.auditLogId || "AUDIT-DORA-01"}\`\n- **Intégrité HSM :** \`SHA256: ${executionResult?.complianceHash || "VALIDE"}\`\n- **Pipeline CI/CD :** Suivi en temps réel ci-contre via le topic \`${deployTopic}\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        artifactId: deployStreamId,
      };

      setMessages((prev) => [...prev, deployMsg]);
    } catch (err) {
      console.error("[ActionLayer Deploy Error]:", err);
      // Fallback local résilient
      const fallbackTopic = `telemetry.deploy.exec-${Date.now().toString().slice(-4)}`;
      const deployStreamId = `art-deploy-${Date.now()}`;
      const fallbackStreamArtifact: ArtifactData = {
        id: deployStreamId,
        type: "stream",
        title: `Déploiement Live : ${currentArtifact.title}`,
        topic: fallbackTopic,
        content: "",
        version: 1,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        summary: `Pipeline CI/CD en direct sur le cluster souverain (Mode Sandbox)`
      };
      setArtifacts((prev) => ({
        ...prev,
        [deployStreamId]: fallbackStreamArtifact,
      }));
      setActiveArtifactId(deployStreamId);
    } finally {
      setIsDeploying(false);
    }
  };

  // Approbation de la Remédiation Autonome (Human-in-the-Loop)
  const handleApproveSelfHealing = async (incident: SelfHealingIncident) => {
    setIsSelfHealingOpen(false);
    setWatchdogActive(true);

    const remediationYaml = `# ==============================================================================
# SENSORIUM SOVEREIGN CLOUD - AUTO-HEALING REMEDIATION MANIFEST
# Ingress Traffic Shifting - DORA Incident Mitigation Art. 11 & BCP-V2
# ==============================================================================
apiVersion: networking.sensorium.cloud/v1alpha1
kind: IngressTrafficPolicy
metadata:
  name: rack-b-thermal-relief
  cluster: cluster-apex-01
  incident_ref: ${incident.eventId}
  applied_at: "${new Date().toISOString()}"
spec:
  routing_policy: dynamic_weighted
  targets:
    - target: ${incident.targetComponent}
      weight: ${incident.newWeightOriginal}
      status: THROTTLED_COOLING
    - target: ${incident.alternateTarget}
      weight: ${incident.newWeightAlternate}
      status: ABSORBING_SPIKE
  watchdog:
    enabled: true
    evaluation_window_seconds: 300
    target_temp_celsius: 78.0
    auto_rollback_on_failure: true
  compliance:
    dora_policy: DORA-SEC-ICT-BCP-V2
    operator_hsm_signed: true
`;

    // Création de l'artefact de code YAML
    const remCodeId = `art-rem-${Date.now()}`;
    const remArtifact: ArtifactData = {
      id: remCodeId,
      type: "code",
      title: "ingress-routing-remediation.yaml",
      language: "yaml",
      content: remediationYaml,
      version: 1,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      summary: "Manifeste de remédiation automatique de charge thermique (Rack B -> Rack A)"
    };

    // Création du stream de déploiement
    const streamTopic = `telemetry.deploy.sh-${Date.now().toString(36)}`;
    const streamDeployId = `art-stream-sh-${Date.now()}`;
    const deployStream: ArtifactData = {
      id: streamDeployId,
      type: "stream",
      title: "Live Stream : Remédiation Rack B",
      topic: streamTopic,
      content: "",
      version: 1,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      summary: "Pipeline de déploiement et télémétrie post-remédiation thermique"
    };

    setArtifacts(prev => ({
      ...prev,
      [remCodeId]: remArtifact,
      [streamDeployId]: deployStream
    }));
    setActiveArtifactId(streamDeployId);

    // Déclencher l'appel à l'Action Layer
    try {
      await fetch("/api/v1/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifactId: remCodeId,
          title: remArtifact.title,
          content: remediationYaml,
          language: "yaml",
          targetCluster: "cluster-apex-01",
          environment: "production"
        })
      });
    } catch {
      console.warn("[SelfHealing] Exécution en mode sandbox");
    }

    // Message dans le copilote
    const msg: ChatMessage = {
      id: `msg-sh-${Date.now()}`,
      role: "assistant",
      text: `🛡️ **Remédiation Autonome Approuvée & Déployée [CTRL+ENTER] :**\n\n- **Incident :** \`${incident.eventId}\`\n- **Action :** Redirection immédiate de ${incident.proposedRedirectPercent}% du trafic vers le Rack A.\n- **Conformité DORA :** Signé par HSM opérateur, consigné au registre d'audit immuable.\n- **Filet de Sécurité :** Le **RollbackWatchdog (300s)** est activé. En cas de non-baisse sous 85°C ou d'alerte en cascade, le routage antérieur sera restauré sans délai.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      artifactId: streamDeployId
    };
    setMessages(prev => [...prev, msg]);
  };

  // Rejet de la Remédiation Autonome
  const handleRejectSelfHealing = () => {
    setIsSelfHealingOpen(false);
    const msg: ChatMessage = {
      id: `msg-rej-${Date.now()}`,
      role: "assistant",
      text: `⚠️ **Remédiation Rejetée par l'Opérateur [ESC] :** Le correctif de redirection de charge n'a pas été appliqué. Notification de traçabilité consignée au registre DORA avec le statut *Régulation Manuelle Maintenue*.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, msg]);
  };

  // Données de feuille de calcul (Data Grid)
  const parsedSheetData = useMemo(() => {
    if (currentArtifact?.type !== "sheet") return null;
    const lines = (isEditing ? editedContent : currentArtifact.content).trim().split("\n");
    if (lines.length === 0) return null;
    const headers = lines[0].split(",").map(h => h.trim());
    const rows = lines.slice(1).map(line => line.split(",").map(cell => cell.trim()));

    // Filtrage
    const filteredRows = rows.filter(row => 
      !searchTableQuery || row.some(cell => cell.toLowerCase().includes(searchTableQuery.toLowerCase()))
    );

    // Tri
    if (sortColumnIndex !== null) {
      filteredRows.sort((a, b) => {
        const valA = a[sortColumnIndex] || "";
        const valB = b[sortColumnIndex] || "";
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return { headers, rows: filteredRows, totalCount: rows.length };
  }, [currentArtifact, isEditing, editedContent, searchTableQuery, sortColumnIndex, sortAsc]);

  const handleSort = (colIndex: number) => {
    if (sortColumnIndex === colIndex) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumnIndex(colIndex);
      setSortAsc(true);
    }
  };

  return (
    <FeatureGate
      requiredTier="PRO"
      featureTitle="🤖 SENSORIUM AI Artifacts IDE & Copilot"
      featureDescription="La génération d'artefacts IaC, le copilote Gemini en direct et la boucle d'auto-remédiation SRE requièrent un abonnement Pro actif."
      isDark={isDark}
    >
      <div className={`space-y-4 animate-in fade-in duration-300 ${isFullScreen ? "fixed inset-0 z-50 bg-[#f8fafc] dark:bg-[#070709] p-4 overflow-hidden" : ""}`}>
      
      {/* En-tête de la fonctionnalité */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                SENSORIUM Artifacts IDE
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                  Hybride Split-Screen
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Séparation stricte : Flux de raisonnement (gauche) &amp; Espace de rendu multi-formats interactif (droite)
              </p>
            </div>
          </div>
        </div>

        {/* Action Pills & Fullscreen Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Bouton Trigger Démo Auto-Guérison */}
          <button
            onClick={() => setIsSelfHealingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/40 transition-all cursor-pointer animate-pulse shadow-sm shadow-red-500/20"
            title="Déclencher la Remédiation Autonome (Self-Healing Loop)"
          >
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">Remédiation Autonome (Rack B)</span>
            <span className="sm:hidden">Auto-Guérison</span>
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/[0.08] transition-colors cursor-pointer"
            title={isFullScreen ? "Quitter le plein écran" : "Mode Plein Écran IDE"}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullScreen ? "Réduire" : "Plein Écran"}</span>
          </button>
        </div>
      </div>

      {/* Conteneur Principal Split-Screen */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${isFullScreen ? "h-[calc(100vh-100px)]" : "min-h-[720px] h-[calc(100vh-220px)]"}`}>
        
        {/* ========================================================================= */}
        {/* PANNEAU GAUCHE : FLUX DE CONVERSATION (CHAT PANEL)                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0E0E12] shadow-xs overflow-hidden">
          
          {/* Header du Chat */}
          <div className="p-3.5 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Copilote d'Ingénierie IA
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              Parser &lt;artifact&gt; Actif
            </span>
          </div>

          {/* Presets rapides de génération */}
          <div className="p-2.5 bg-slate-50/50 dark:bg-white/[0.01] border-b border-slate-200/60 dark:border-white/[0.05] overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {PROMPT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(preset.prompt)}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-white dark:bg-white/[0.04] text-slate-600 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-white/[0.08] hover:border-orange-500/40 transition-all cursor-pointer shadow-2xs"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Liste des Messages avec Détection d'Artefact */}
          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto custom-scrollbar">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              const isSystem = msg.role === "system";

              if (isSystem) {
                return (
                  <div key={msg.id} className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-neutral-300 mb-1">
                      <Bot className="w-3.5 h-3.5 text-orange-500" />
                      Système Hybride SENSORIUM
                    </div>
                    {msg.text}
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}>
                  <div
                    className={`max-w-[92%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isAssistant
                        ? "bg-slate-100 dark:bg-white/[0.05] text-slate-800 dark:text-neutral-200 border border-slate-200 dark:border-white/[0.07] rounded-tl-xs"
                        : "bg-slate-900 text-white dark:bg-orange-600 dark:text-white rounded-tr-xs shadow-xs"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Capsule interactive cliquable si un artefact a été généré */}
                    {msg.artifactId && artifacts[msg.artifactId] && (
                      <div 
                        onClick={() => setActiveArtifactId(msg.artifactId!)}
                        className="mt-2.5 p-2 rounded-xl bg-white dark:bg-black/40 border border-orange-500/30 flex items-center justify-between gap-2 cursor-pointer hover:border-orange-500 transition-all group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {artifacts[msg.artifactId].type === "code" && <Code2 className="w-4 h-4 text-orange-500 shrink-0" />}
                          {artifacts[msg.artifactId].type === "doc" && <FileText className="w-4 h-4 text-blue-500 shrink-0" />}
                          {artifacts[msg.artifactId].type === "sheet" && <Table className="w-4 h-4 text-emerald-500 shrink-0" />}
                          {artifacts[msg.artifactId].type === "ui" && <Eye className="w-4 h-4 text-purple-500 shrink-0" />}
                          {artifacts[msg.artifactId].type === "stream" && <Radio className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />}
                          <div className="truncate text-left">
                            <span className="font-bold text-[11px] text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors block truncate">
                              {artifacts[msg.artifactId].title}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">
                              {artifacts[msg.artifactId].type === "stream" ? "KAFKA LIVE" : artifacts[msg.artifactId].type} • v{artifacts[msg.artifactId].version}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold shrink-0 flex items-center">
                          Ouvrir →
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 px-1 mt-1 font-mono">{msg.timestamp}</span>
                </div>
              );
            })}

            {/* Animation de streaming IA */}
            {isGenerating && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-xs text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-white/[0.06] w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
                <span>Raisonnement &amp; streaming de la structure d'artefact...</span>
              </div>
            )}
          </div>

          {/* Formulaire de saisie du Prompt */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-black/20"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ex : Crée un script Terraform ou un rapport DORA..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isGenerating}
                className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white transition-colors cursor-pointer shadow-xs shrink-0"
                title="Envoyer la consigne"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>

        {/* ========================================================================= */}
        {/* PANNEAU DROIT : ESPACE D'ARTEFACTS (RENDERER ROUTER & IDE)              */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#070709] shadow-xs overflow-hidden">
          
          {/* Bandeau de Surveillance RollbackWatchdog (si actif) */}
          {watchdogActive && (
            <div className="p-2.5 border-b border-amber-500/30 bg-black/40 shrink-0">
              <RollbackWatchdogStatus
                onRollbackTriggered={(reason) => {
                  const rollbackMsg: ChatMessage = {
                    id: `msg-rb-${Date.now()}`,
                    role: "assistant",
                    text: `🚨 **Rollback Automatique Déclenché par le Watchdog :**\n\n- **Cause :** ${reason}\n- **Action Immédiate :** Restauration du routage antérieur (100% Rack B).\n- **Mesure de Sauvegarde :** Isolation préventive du Rack B via failover passif Anycast.\n- **Audit DORA :** Événement consigné dans le registre DORA Art. 12 (*Rollback Certifié*).`,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  };
                  setMessages(prev => [...prev, rollbackMsg]);
                }}
                onSuccessCompleted={() => {
                  const successMsg: ChatMessage = {
                    id: `msg-succ-${Date.now()}`,
                    role: "assistant",
                    text: `✅ **Auto-Guérison Complète & Certifiée :** Le cycle de 300s s'est conclu avec succès. Les sondes de Rack B sont retournées sous le seuil d'alerte (< 78°C). Le registre DORA a été verrouillé avec signature cryptographique immuable.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  };
                  setMessages(prev => [...prev, successMsg]);
                }}
                onDismiss={() => setWatchdogActive(false)}
              />
            </div>
          )}

          {currentArtifact ? (
            <>
              {/* Header de l'Artefact : Onglets + Actions (Copier, Télécharger, Éditer) */}
              <div className="p-3 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/90 dark:bg-[#0E0E12] flex flex-wrap items-center justify-between gap-3 shrink-0">
                
                {/* Métadonnées & Sélecteur d'Artefacts */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {Object.values(artifacts).map((art) => {
                    const isSelected = art.id === activeArtifactId;
                    return (
                      <button
                        key={art.id}
                        onClick={() => setActiveArtifactId(art.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                            : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {art.type === "code" && <Code2 className="w-3.5 h-3.5 text-orange-500" />}
                        {art.type === "doc" && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                        {art.type === "sheet" && <Table className="w-3.5 h-3.5 text-emerald-500" />}
                        {art.type === "ui" && <Eye className="w-3.5 h-3.5 text-purple-500" />}
                        {art.type === "stream" && (
                          <span className="relative">
                            <Radio className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                          </span>
                        )}
                        <span>{art.title}</span>
                        <span className="text-[10px] opacity-70 font-mono">v{art.version}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Boutons d'Action Rapide */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Bascule Mode Édition */}
                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleSaveEdit();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      isEditing
                        ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                        : "bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-white/[0.08] hover:bg-slate-200"
                    }`}
                  >
                    {isEditing ? <Check className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                    <span>{isEditing ? "Enregistrer" : "Modifier"}</span>
                  </button>

                  {/* Bouton Copier */}
                  <button
                    onClick={handleCopyContent}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Copier dans le presse-papiers"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {/* Bouton Télécharger */}
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Télécharger le fichier"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Exporter</span>
                  </button>

                  {/* Bouton Action Layer: Déployer sur Cluster Souverain */}
                  {currentArtifact.type === "code" && (
                    <button
                      onClick={handleDeployArtifact}
                      disabled={isDeploying}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:brightness-110 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
                      title="Exécuter et déployer l'artefact sur le Cluster Souverain SENSORIUM (Action Layer)"
                    >
                      {isDeploying ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Rocket className="w-3.5 h-3.5" />
                      )}
                      <span>{isDeploying ? "Déploiement..." : "Déployer"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ROUTEUR DE RENDU : CODE / DOC / SHEET / UI */}
              <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-50/50 dark:bg-[#070709]">
                
                {/* 1. RENDERER CODE */}
                {currentArtifact.type === "code" && (
                  <div className="h-full flex flex-col rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-[#0E0E12] text-slate-100">
                    <div className="px-4 py-2 border-b border-white/[0.08] bg-black/40 flex items-center justify-between text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>Format: {currentArtifact.language?.toUpperCase() || "CODE"}</span>
                        <span className="hidden sm:inline-block text-slate-600">•</span>
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                          <ShieldCheck className="w-3.5 h-3.5" /> Zero-Trust Validé (DORA)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">{isEditing ? "Mode Éditeur Interactif" : "Cible: cluster-apex-01"}</span>
                        {!isEditing && (
                          <button
                            onClick={handleDeployArtifact}
                            disabled={isDeploying}
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Rocket className="w-3 h-3" />
                            {isDeploying ? "Exécution..." : "Action Layer"}
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="flex-1 p-4 font-mono text-xs leading-relaxed bg-transparent text-emerald-400 focus:outline-hidden resize-none"
                        spellCheck={false}
                      />
                    ) : (
                      <pre className="flex-1 p-4 font-mono text-xs leading-relaxed overflow-auto text-slate-200 select-text">
                        <code>{currentArtifact.content}</code>
                      </pre>
                    )}
                  </div>
                )}

                {/* 2. RENDERER DOCUMENT / RAPPORT */}
                {currentArtifact.type === "doc" && (
                  <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0E0E12] border border-slate-200/80 dark:border-white/[0.08] shadow-sm text-slate-800 dark:text-neutral-200 space-y-4">
                    {isEditing ? (
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={20}
                        className="w-full p-4 font-mono text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 focus:outline-hidden"
                      />
                    ) : (
                      <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-3">
                        <div className="whitespace-pre-wrap font-sans">
                          {currentArtifact.content}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. RENDERER DATA GRID / SHEET */}
                {currentArtifact.type === "sheet" && parsedSheetData && (
                  <div className="space-y-3">
                    {/* Barre d'outils du tableau */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#0E0E12] border border-slate-200 dark:border-white/[0.08]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          Data Grid ({parsedSheetData.rows.length} lignes)
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Tri par colonne interactif
                        </span>
                      </div>
                      <input
                        type="text"
                        value={searchTableQuery}
                        onChange={(e) => setSearchTableQuery(e.target.value)}
                        placeholder="Rechercher dans les lignes..."
                        className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-neutral-200 focus:outline-hidden"
                      />
                    </div>

                    {/* Grille Tabulaire Réactive */}
                    <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E0E12] overflow-x-auto shadow-2xs">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-100/80 dark:bg-white/[0.04] text-slate-700 dark:text-neutral-300 border-b border-slate-200 dark:border-white/[0.08]">
                          <tr>
                            {parsedSheetData.headers.map((h, idx) => (
                              <th
                                key={idx}
                                onClick={() => handleSort(idx)}
                                className="p-3 font-bold cursor-pointer hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors whitespace-nowrap"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>{h}</span>
                                  {sortColumnIndex === idx && (
                                    <span className="text-orange-500">{sortAsc ? "▲" : "▼"}</span>
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
                          {parsedSheetData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 whitespace-nowrap text-slate-700 dark:text-neutral-300">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. RENDERER LIVE CANVAS / UI */}
                {currentArtifact.type === "ui" && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-500" />
                        <span>Aperçu interactif rendu en direct dans le bac à sable</span>
                      </div>
                      <span className="font-mono text-[10px] font-semibold">HTML / CSS / Tailwind</span>
                    </div>

                    <div 
                      className="p-4" 
                      dangerouslySetInnerHTML={{ __html: currentArtifact.content }} 
                    />
                  </div>
                )}

                {/* 5. RENDERER KAFKA LIVE STREAM */}
                {currentArtifact.type === "stream" && currentArtifact.topic && (
                  <div className="h-full min-h-[480px]">
                    <LiveStreamRenderer
                      topic={currentArtifact.topic}
                      title={currentArtifact.title}
                    />
                  </div>
                )}

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Bot className="w-12 h-12 text-slate-300 dark:text-neutral-700 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-700 dark:text-neutral-300">
                Aucun document sélectionné
              </p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Posez une question ou cliquez sur une suggestion dans le volet de gauche pour générer un artefact.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Modal Human-in-the-Loop de Remédiation Autonome (Self-Healing Loop) */}
      <SelfHealingModal
        isOpen={isSelfHealingOpen}
        onApprove={handleApproveSelfHealing}
        onReject={handleRejectSelfHealing}
      />
    </div>
    </FeatureGate>
  );
}
