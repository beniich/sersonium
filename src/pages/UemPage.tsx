import React, { useState, useEffect, useCallback } from "react";
import {
  Monitor,
  Wifi,
  WifiOff,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Usb,
  Bluetooth,
  RotateCcw,
  Power,
  Lock,
  Download,
  Trash2,
  Activity,
  Search,
  Filter,
  RefreshCw,
  Send,
  ChevronRight,
  Cpu,
  HardDrive,
  MemoryStick,
  Globe,
  Bell,
  BellOff,
  Eye,
  Settings,
  PlusCircle,
  AlertCircle,
  Package,
  Copy,
  Check,
  X,
  Building2,
} from "lucide-react";
import ClientRegistrationModal from "../components/ClientRegistrationModal";
import ComparisonPage from "./ComparisonPage";

// ─── Types ───────────────────────────────────────────────────────────────────

type TerminalStatus = "ONLINE" | "OFFLINE" | "WARNING" | "CRITICAL" | "UNKNOWN";
type CommandType =
  | "BLOCK_USB" | "UNBLOCK_USB"
  | "BLOCK_BLUETOOTH" | "UNBLOCK_BLUETOOTH"
  | "INSTALL_APP" | "UNINSTALL_APP"
  | "REBOOT" | "SHUTDOWN" | "LOCK_SCREEN"
  | "POLICY_UPDATE" | "WIPE_DEVICE"
  | "COLLECT_LOGS" | "DEPLOY_PATCH";

interface UemTerminal {
  id: string;
  terminalId: string;
  hostname: string;
  os: string;
  osVersion: string;
  cpuCores: number;
  ramGb: number;
  diskGb: number;
  installedApps: string[];
  lastIp: string;
  agentVersion: string;
  status: TerminalStatus;
  lastSeen: string;
}

interface UemAlert {
  id: string;
  terminalId: string;
  alertType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  createdAt: string;
}

interface UemStats {
  totalTerminals: number;
  onlineTerminals: number;
  offlineTerminals: number;
  complianceRate: number;
  pendingCommands: number;
  openAlerts: number;
}

// ─── Mock data (fonctionnel en mode démo) ────────────────────────────────────

const MOCK_TERMINALS: UemTerminal[] = [
  {
    id: "t1", terminalId: "PC-CMR-001", hostname: "DESKTOP-CMR001",
    os: "Windows", osVersion: "11 Pro 23H2", cpuCores: 8, ramGb: 16, diskGb: 512,
    installedApps: ["Chrome", "Office 365", "Teams", "Zoom", "Adobe Reader"],
    lastIp: "192.168.1.45", agentVersion: "1.0.0", status: "ONLINE",
    lastSeen: new Date(Date.now() - 45000).toISOString()
  },
  {
    id: "t2", terminalId: "PC-CMR-002", hostname: "LAPTOP-FINANCE",
    os: "Windows", osVersion: "10 Pro 22H2", cpuCores: 4, ramGb: 8, diskGb: 256,
    installedApps: ["Chrome", "Excel", "WinRAR", "TorrentClient"],
    lastIp: "192.168.1.62", agentVersion: "1.0.0", status: "WARNING",
    lastSeen: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: "t3", terminalId: "SRV-CMR-001", hostname: "SERVER-AD",
    os: "Linux", osVersion: "Ubuntu 22.04 LTS", cpuCores: 16, ramGb: 64, diskGb: 2000,
    installedApps: ["nginx", "postgresql", "docker", "nodejs"],
    lastIp: "10.0.0.10", agentVersion: "1.0.0", status: "ONLINE",
    lastSeen: new Date(Date.now() - 30000).toISOString()
  },
  {
    id: "t4", terminalId: "PC-CMR-003", hostname: "DESKTOP-HR",
    os: "Windows", osVersion: "11 Home 23H2", cpuCores: 4, ramGb: 8, diskGb: 128,
    installedApps: ["Chrome", "Word", "Outlook"],
    lastIp: "192.168.1.71", agentVersion: "1.0.0", status: "OFFLINE",
    lastSeen: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: "t5", terminalId: "MAC-CMR-001", hostname: "MacBook-DG",
    os: "macOS", osVersion: "Sonoma 14.2", cpuCores: 10, ramGb: 32, diskGb: 1000,
    installedApps: ["Safari", "Xcode", "Slack", "Figma"],
    lastIp: "192.168.1.88", agentVersion: "1.0.0", status: "ONLINE",
    lastSeen: new Date(Date.now() - 15000).toISOString()
  },
];

const MOCK_STATS: UemStats = {
  totalTerminals: 5, onlineTerminals: 3,
  offlineTerminals: 1, complianceRate: 78,
  pendingCommands: 2, openAlerts: 3,
};

const MOCK_ALERTS: UemAlert[] = [
  {
    id: "a1", terminalId: "PC-CMR-002", alertType: "NON_COMPLIANT_SOFTWARE",
    severity: "HIGH", message: "Application non autorisée: TorrentClient",
    status: "OPEN", createdAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: "a2", terminalId: "PC-CMR-003", alertType: "AGENT_OFFLINE",
    severity: "MEDIUM", message: "Agent hors ligne depuis 15 minutes",
    status: "OPEN", createdAt: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: "a3", terminalId: "PC-CMR-001", alertType: "POLICY_VIOLATION",
    severity: "LOW", message: "USB connecté — en attente de validation",
    status: "ACKNOWLEDGED", createdAt: new Date(Date.now() - 1800000).toISOString()
  },
];

// ─── Utils ───────────────────────────────────────────────────────────────────

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

const STATUS_CONFIG: Record<TerminalStatus, { color: string; bg: string; dot: string; label: string }> = {
  ONLINE:   { color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/30", dot: "bg-emerald-400", label: "En ligne" },
  OFFLINE:  { color: "text-slate-500",   bg: "bg-slate-500/10 border border-slate-500/30",    dot: "bg-slate-500",   label: "Hors ligne" },
  WARNING:  { color: "text-amber-400",   bg: "bg-amber-500/10 border border-amber-500/30",    dot: "bg-amber-400",   label: "Alerte" },
  CRITICAL: { color: "text-red-400",     bg: "bg-red-500/10 border border-red-500/30",        dot: "bg-red-400",     label: "Critique" },
  UNKNOWN:  { color: "text-slate-500",   bg: "bg-slate-500/10 border border-slate-500/30",    dot: "bg-slate-500",   label: "Inconnu" },
};

const SEVERITY_CONFIG = {
  LOW:      { color: "text-blue-400",   bg: "bg-blue-500/10",   label: "Faible" },
  MEDIUM:   { color: "text-amber-400",  bg: "bg-amber-500/10",  label: "Moyen" },
  HIGH:     { color: "text-orange-400", bg: "bg-orange-500/10", label: "Élevé" },
  CRITICAL: { color: "text-red-400",    bg: "bg-red-500/10",    label: "Critique" },
};

// ─── Command Panel ────────────────────────────────────────────────────────────

const COMMANDS: Array<{ type: CommandType; label: string; icon: React.ReactNode; color: string; danger?: boolean }> = [
  { type: "BLOCK_USB",        label: "Bloquer USB",      icon: <Usb size={14}/>,       color: "text-red-400" },
  { type: "UNBLOCK_USB",      label: "Autoriser USB",    icon: <Usb size={14}/>,       color: "text-emerald-400" },
  { type: "BLOCK_BLUETOOTH",  label: "Bloquer BT",       icon: <Bluetooth size={14}/>, color: "text-red-400" },
  { type: "UNBLOCK_BLUETOOTH",label: "Autoriser BT",     icon: <Bluetooth size={14}/>, color: "text-emerald-400" },
  { type: "LOCK_SCREEN",      label: "Verrouiller",      icon: <Lock size={14}/>,      color: "text-amber-400" },
  { type: "REBOOT",           label: "Redémarrer",       icon: <RotateCcw size={14}/>, color: "text-blue-400" },
  { type: "SHUTDOWN",         label: "Éteindre",         icon: <Power size={14}/>,     color: "text-orange-400" },
  { type: "COLLECT_LOGS",     label: "Collecter logs",   icon: <Terminal size={14}/>,  color: "text-slate-400" },
  { type: "DEPLOY_PATCH",     label: "Déployer patch",   icon: <Download size={14}/>,  color: "text-cyan-400" },
  { type: "WIPE_DEVICE",      label: "Effacer terminal", icon: <Trash2 size={14}/>,    color: "text-red-500",  danger: true },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/8 transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} bg-current/10`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
        {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function TerminalCard({ terminal, onSelect, selected }: {
  terminal: UemTerminal; onSelect: () => void; selected: boolean;
}) {
  const sc = STATUS_CONFIG[terminal.status];
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer p-4 rounded-xl border transition-all hover:scale-[1.01] ${
        selected
          ? "border-orange-500/60 bg-orange-500/5"
          : "border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/6"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-slate-400" />
          <span className="font-mono text-sm font-semibold text-white">{terminal.terminalId}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${terminal.status === "ONLINE" ? "animate-pulse" : ""}`}/>
          {sc.label}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-2">{terminal.hostname} · {terminal.os} {terminal.osVersion}</div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <Cpu size={11}/> <span>{terminal.cpuCores}C</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <MemoryStick size={11}/> <span>{terminal.ramGb}GB</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <HardDrive size={11}/> <span>{terminal.diskGb}GB</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Globe size={10}/> {terminal.lastIp}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={10}/> {timeAgo(terminal.lastSeen)} ago
        </div>
      </div>
    </div>
  );
}

// ─── Modal Déploiement & All-in-One ──────────────────────────────────────────

function DeployAgentModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"windows" | "linux" | "allinone">("windows");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2500);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "https://app.sensorium.cloud";
  const winOneLiner = `powershell -Command "Invoke-WebRequest -Uri '${origin}/api/v1/uem/installer/download?os=windows' -OutFile install-agent.bat; .\\install-agent.bat"`;
  const linuxOneLiner = `curl -fsSL "${origin}/api/v1/uem/installer/download?os=linux" | sudo bash`;
  const allInOneWin = `.\\scripts\\setup-sensorium-all-in-one.bat`;
  const allInOnePs1 = `powershell -ExecutionPolicy Bypass -File .\\scripts\\setup-sensorium-all-in-one.ps1`;
  const allInOneLinux = `sudo bash scripts/setup-sensorium-all-in-one.sh`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Déploiement Automatisé & Pack Tout-En-Un</h2>
              <p className="text-xs text-slate-400">Installeur UEM en 1 clic ou enveloppeur complet logiciel + agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/20 px-5 pt-3 gap-2">
          <button
            onClick={() => setTab("windows")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              tab === "windows"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor size={14} /> Agent Windows (.bat / PS1)
          </button>
          <button
            onClick={() => setTab("linux")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              tab === "linux"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal size={14} /> Agent Linux (curl / systemd)
          </button>
          <button
            onClick={() => setTab("allinone")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              tab === "allinone"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Package size={14} /> Pack Tout-En-Un (Logiciel + Agent)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {tab === "windows" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-start gap-2.5">
                <Shield size={16} className="shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <p className="font-semibold text-blue-200">Installation en service d'arrière-plan Windows</p>
                  <p className="mt-0.5">L'agent UEM s'enregistre comme service système permanent (<code className="bg-blue-950/60 px-1 py-0.5 rounded">SensoriumUEMAgent</code>), surveille le matériel, applique le blocage USB/Bluetooth et remonte l'inventaire toutes les 60 secondes.</p>
                </div>
              </div>

              {/* Download Button */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/api/v1/uem/installer/download?os=windows"
                  download
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition shadow-lg shadow-orange-600/20"
                >
                  <Download size={14} /> Télécharger l'Installeur Windows (.bat préconfiguré)
                </a>
                <span className="text-xs text-slate-400">ou exécuter en 1 ligne PowerShell :</span>
              </div>

              {/* One liner code */}
              <div className="relative group">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs text-emerald-400 break-all pr-12">
                  {winOneLiner}
                </div>
                <button
                  onClick={() => copyToClipboard(winOneLiner, "win")}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Copier la commande"
                >
                  {copied === "win" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>• Nécessite les privilèges <strong>Administrateur</strong> (clic droit &gt; Exécuter en tant qu'administrateur).</p>
                <p>• Compatible Windows 10, Windows 11, et Windows Server (2019/2022).</p>
              </div>
            </div>
          )}

          {tab === "linux" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-start gap-2.5">
                <Terminal size={16} className="shrink-0 mt-0.5 text-teal-400" />
                <div>
                  <p className="font-semibold text-teal-200">Déploiement Linux / macOS avec daemon systemd</p>
                  <p className="mt-0.5">Crée un service système <code className="bg-teal-950/60 px-1 py-0.5 rounded">sensorium-agent.service</code> avec redémarrage automatique en cas de panne.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/api/v1/uem/installer/download?os=linux"
                  download
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition"
                >
                  <Download size={14} /> Télécharger le script Linux (.sh)
                </a>
                <span className="text-xs text-slate-400">ou via curl en 1 ligne :</span>
              </div>

              <div className="relative group">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs text-emerald-400 break-all pr-12">
                  {linuxOneLiner}
                </div>
                <button
                  onClick={() => copyToClipboard(linuxOneLiner, "linux")}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  {copied === "linux" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Compatible Debian, Ubuntu, CentOS, RedHat, Alpine et macOS.
              </div>
            </div>
          )}

          {tab === "allinone" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <Package size={16} className="shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <p className="font-semibold text-amber-200">Enveloppeur Tout-En-Un (Plateforme + Agent UEM Intégré)</p>
                  <p className="mt-0.5">Installe et déploie le logiciel SENSORIUM complet (Frontend + Backend + Base de données Prisma) ET configure l'agent UEM en arrière-plan en un seul passage ("en un seul coup").</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-white">Exécuter le script tout-en-un sur la machine cible :</p>

                {/* Windows Batch */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Windows (Invite de commande / Batch) :</span>
                    <button
                      onClick={() => copyToClipboard(allInOneWin, "aio-win")}
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      {copied === "aio-win" ? <Check size={12} /> : <Copy size={12} />} Copier
                    </button>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 font-mono text-xs text-amber-300">
                    {allInOneWin}
                  </div>
                </div>

                {/* Windows PowerShell */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Windows (PowerShell Administrateur) :</span>
                    <button
                      onClick={() => copyToClipboard(allInOnePs1, "aio-ps1")}
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      {copied === "aio-ps1" ? <Check size={12} /> : <Copy size={12} />} Copier
                    </button>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 font-mono text-xs text-amber-300">
                    {allInOnePs1}
                  </div>
                </div>

                {/* Linux */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Linux / Serveur Cloud (Root / Sudo) :</span>
                    <button
                      onClick={() => copyToClipboard(allInOneLinux, "aio-lin")}
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      {copied === "aio-lin" ? <Check size={12} /> : <Copy size={12} />} Copier
                    </button>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 font-mono text-xs text-amber-300">
                    {allInOneLinux}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Ce que fait l'enveloppeur automatique :</p>
                <p>✔ Détecte et installe Node.js automatiquement si absent</p>
                <p>✔ Installe l'intégralité des modules npm et compile en production</p>
                <p>✔ Synchronise la base de données PostgreSQL/Neon avec les tables UEM</p>
                <p>✔ Crée et démarre le service d'arrière-plan de l'agent de flotte</p>
                <p>✔ Configure le pare-feu et génère un raccourci Bureau prêt à l'emploi</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="text-xs text-slate-500 font-mono">
            Token Tenant : CMR-FLEET-01 · Clé API : SENS-AGENT-CMR-***
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface UemPageProps {
  isDark: boolean;
}

export default function UemPage({ isDark }: UemPageProps) {
  const [terminals, setTerminals] = useState<UemTerminal[]>(MOCK_TERMINALS);
  const [stats, setStats] = useState<UemStats>(MOCK_STATS);
  const [alerts, setAlerts] = useState<UemAlert[]>(MOCK_ALERTS);
  const [selectedTerminal, setSelectedTerminal] = useState<UemTerminal | null>(null);
  const [activeTab, setActiveTab] = useState<"terminals" | "alerts" | "policies" | "comparison">("terminals");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TerminalStatus | "ALL">("ALL");
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState<Record<string, "sending" | "done" | "error">>({});
  const [policyForm, setPolicyForm] = useState({
    usbBlocked: false, bluetoothBlocked: false,
    firewallStrict: true, screenLockMinutes: 15,
    blacklistedApps: "TorrentClient,BitTorrent,uTorrent",
    dlpEnabled: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  // ── Filters ──
  const filteredTerminals = terminals.filter(t => {
    const matchSearch =
      t.terminalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.os.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "ALL" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Send command ──
  const sendCommand = useCallback(async (terminalId: string, commandType: CommandType, payload = {}) => {
    const key = `${terminalId}-${commandType}`;
    setCommandFeedback(prev => ({ ...prev, [key]: "sending" }));

    try {
      // Simulation API call
      await new Promise(r => setTimeout(r, 1200));
      setCommandFeedback(prev => ({ ...prev, [key]: "done" }));
      setTimeout(() => setCommandFeedback(prev => {
        const n = { ...prev }; delete n[key]; return n;
      }), 3000);
    } catch {
      setCommandFeedback(prev => ({ ...prev, [key]: "error" }));
    }
  }, []);

  // ── Acknowledge alert ──
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: "ACKNOWLEDGED" } : a));
  };

  // ── Refresh ──
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6"
      style={{ background: isDark ? "transparent" : "transparent" }}>

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Shield size={16} className="text-white"/>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">UEM Cockpit</h1>
            <span className="text-xs font-mono bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
              Unified Endpoint Management
            </span>
          </div>
          <p className="text-sm text-slate-400 ml-11">
            Gestion centralisée de {stats.totalTerminals} terminaux · CMR Fleet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-700/60 dark:border-white/10 text-white font-medium text-sm transition-all shadow-sm"
          >
            <Building2 size={15}/>
            + Enregistrer Client &amp; Flotte
          </button>
          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium text-sm transition-all shadow-lg shadow-orange-500/20"
          >
            <Package size={15}/>
            Déployer / Pack All-in-One
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""}/>
            Actualiser
          </button>
        </div>
      </div>

      {/* ─── Stats KPIs ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Terminaux" value={stats.totalTerminals} icon={<Monitor size={18}/>} color="text-blue-400"/>
        <StatCard label="En ligne" value={stats.onlineTerminals} icon={<Wifi size={18}/>} color="text-emerald-400"/>
        <StatCard label="Hors ligne" value={stats.offlineTerminals} icon={<WifiOff size={18}/>} color="text-slate-400"/>
        <StatCard label="Conformité" value={`${stats.complianceRate}%`} icon={<CheckCircle2 size={18}/>} color="text-teal-400"/>
        <StatCard label="Commandes" value={stats.pendingCommands} icon={<Send size={18}/>} color="text-slate-400" sub="En attente"/>
        <StatCard label="Alertes" value={stats.openAlerts} icon={<AlertTriangle size={18}/>} color="text-amber-400" sub="Ouvertes"/>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 w-fit">
        {(["terminals", "alerts", "policies", "comparison"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm rounded-md transition-all capitalize font-medium ${
              activeTab === tab
                ? tab === "comparison" ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md shadow-orange-500/20" : "bg-orange-500 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab === "terminals" ? "Terminaux" : tab === "alerts" ? "Alertes" : tab === "policies" ? "Politiques" : "⚡ SENSORIUM vs ManageEngine"}
            {tab === "alerts" && stats.openAlerts > 0 && (
              <span className="ml-1.5 text-xs bg-red-500 text-white rounded-full px-1.5">{stats.openAlerts}</span>
            )}
            {tab === "comparison" && (
              <span className="ml-1.5 text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full px-1.5 py-0.2 font-bold">VS</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Terminals Tab ─── */}
      {activeTab === "terminals" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: List */}
          <div className="lg:col-span-1 space-y-3">
            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input
                  type="text"
                  placeholder="Rechercher un terminal..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as TerminalStatus | "ALL")}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-slate-300 focus:outline-none"
              >
                <option value="ALL">Tous</option>
                <option value="ONLINE">En ligne</option>
                <option value="OFFLINE">Hors ligne</option>
                <option value="WARNING">Alerte</option>
                <option value="CRITICAL">Critique</option>
              </select>
            </div>

            {/* Terminal Cards */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredTerminals.map(t => (
                <TerminalCard
                  key={t.id}
                  terminal={t}
                  selected={selectedTerminal?.id === t.id}
                  onSelect={() => setSelectedTerminal(selectedTerminal?.id === t.id ? null : t)}
                />
              ))}
              {filteredTerminals.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Aucun terminal trouvé
                </div>
              )}
            </div>
          </div>

          {/* Right: Terminal Detail + Commands */}
          <div className="lg:col-span-2">
            {selectedTerminal ? (
              <div className="space-y-4">
                {/* Terminal Info */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white font-mono">{selectedTerminal.terminalId}</h2>
                      <div className="text-sm text-slate-400">{selectedTerminal.hostname} · {selectedTerminal.lastIp}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedTerminal.status].bg} ${STATUS_CONFIG[selectedTerminal.status].color}`}>
                      {STATUS_CONFIG[selectedTerminal.status].label}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "OS", value: `${selectedTerminal.os} ${selectedTerminal.osVersion}`, icon: <Monitor size={12}/> },
                      { label: "CPU", value: `${selectedTerminal.cpuCores} cœurs`, icon: <Cpu size={12}/> },
                      { label: "RAM", value: `${selectedTerminal.ramGb} GB`, icon: <MemoryStick size={12}/> },
                      { label: "Disque", value: `${selectedTerminal.diskGb} GB`, icon: <HardDrive size={12}/> },
                    ].map(item => (
                      <div key={item.label} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">{item.icon} {item.label}</div>
                        <div className="text-sm text-white font-medium">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Installed Apps */}
                  <div>
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <Terminal size={12}/> Applications ({selectedTerminal.installedApps.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTerminal.installedApps.map(app => (
                        <span key={app} className={`text-xs px-2 py-0.5 rounded-full border ${
                          ["TorrentClient", "BitTorrent", "uTorrent"].includes(app)
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-white/5 border-white/10 text-slate-400"
                        }`}>
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                    <Activity size={11}/> Agent v{selectedTerminal.agentVersion} ·
                    Dernière activité: {timeAgo(selectedTerminal.lastSeen)} ago
                  </div>
                </div>

                {/* Command Panel */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Send size={15} className="text-orange-400"/>
                    <h3 className="font-semibold text-white text-sm">Actions à distance</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMMANDS.map(cmd => {
                      const key = `${selectedTerminal.terminalId}-${cmd.type}`;
                      const state = commandFeedback[key];
                      return (
                        <button
                          key={cmd.type}
                          disabled={state === "sending"}
                          onClick={() => {
                            if (cmd.danger) {
                              if (!window.confirm(`⚠️  Confirmer l'action "${cmd.label}" sur ${selectedTerminal.terminalId} ?`)) return;
                            }
                            sendCommand(selectedTerminal.terminalId, cmd.type);
                          }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all
                            ${cmd.danger
                              ? "border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400"
                              : "border-white/10 bg-white/3 hover:bg-white/10 text-slate-300 hover:text-white"
                            } ${state === "sending" ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <span className={state ? (state === "done" ? "text-emerald-400" : state === "error" ? "text-red-400" : cmd.color) : cmd.color}>
                            {state === "sending" ? <Activity size={14} className="animate-spin"/> :
                             state === "done" ? <CheckCircle2 size={14}/> :
                             state === "error" ? <XCircle size={14}/> : cmd.icon}
                          </span>
                          {state === "done" ? "Envoyé ✓" : state === "error" ? "Erreur" : cmd.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-500">
                <Monitor size={48} className="mb-4 opacity-20"/>
                <p className="text-sm">Sélectionnez un terminal pour voir le détail et envoyer des commandes</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Alerts Tab ─── */}
      {activeTab === "alerts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white">{alerts.filter(a => a.status === "OPEN").length} alerte(s) ouverte(s)</h2>
            <span className="text-xs text-slate-500">{alerts.length} total</span>
          </div>

          {alerts.map(alert => {
            const sev = SEVERITY_CONFIG[alert.severity];
            return (
              <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                alert.status === "OPEN"
                  ? "border-white/15 bg-white/5"
                  : "border-white/5 bg-white/2 opacity-60"
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sev.bg}`}>
                  <AlertTriangle size={15} className={sev.color}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${sev.bg} ${sev.color}`}>{sev.label}</span>
                    <span className="text-xs text-slate-500 font-mono">{alert.terminalId}</span>
                    <span className="text-xs text-slate-600">{timeAgo(alert.createdAt)} ago</span>
                  </div>
                  <p className="text-sm text-slate-300">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">{alert.alertType}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {alert.status === "OPEN" && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500/25 transition-all"
                    >
                      Acquitter
                    </button>
                  )}
                  {alert.status === "ACKNOWLEDGED" && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <CheckCircle2 size={12}/> Acquitté
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {alerts.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20"/>
              <p className="text-sm">Aucune alerte — tous les terminaux sont conformes</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Policies Tab ─── */}
      {activeTab === "policies" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-orange-400"/>
              <h2 className="font-semibold text-white">Politique de Sécurité Globale</h2>
            </div>

            <p className="text-xs text-slate-400">
              Cette politique s'applique à tous les terminaux du groupe "default". L'agent la télécharge et l'applique automatiquement.
            </p>

            {/* Toggle rows */}
            {[
              { key: "usbBlocked", label: "Bloquer les périphériques USB", desc: "Désactive le pilote USBSTOR", icon: <Usb size={14}/> },
              { key: "bluetoothBlocked", label: "Bloquer le Bluetooth", desc: "Désactive l'adaptateur BT", icon: <Bluetooth size={14}/> },
              { key: "firewallStrict", label: "Pare-feu strict activé", desc: "Bloque tout trafic non autorisé", icon: <Shield size={14}/> },
              { key: "dlpEnabled", label: "Protection DLP activée", desc: "Surveillance des fuites de données", icon: <Eye size={14}/> },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-sm text-white">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => setPolicyForm(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${
                    (policyForm as any)[item.key] ? "bg-orange-500" : "bg-white/10"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${
                    (policyForm as any)[item.key] ? "left-6" : "left-1"
                  }`}/>
                </button>
              </div>
            ))}

            <div>
              <label className="text-sm text-slate-300 block mb-1.5">Verrouillage écran (minutes)</label>
              <input
                type="number"
                value={policyForm.screenLockMinutes}
                onChange={e => setPolicyForm(prev => ({ ...prev, screenLockMinutes: parseInt(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 block mb-1.5">Applications blacklistées (séparées par virgule)</label>
              <textarea
                value={policyForm.blacklistedApps}
                onChange={e => setPolicyForm(prev => ({ ...prev, blacklistedApps: e.target.value }))}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 font-mono resize-none"
              />
            </div>

            <button
              onClick={() => {
                // Simulation save
                window.alert("✅ Politique sauvegardée et propagée aux terminaux.");
              }}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Enregistrer et propager
            </button>
          </div>

          {/* Policy Preview */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Terminal size={14} className="text-slate-400"/>
              <h3 className="text-sm font-semibold text-white">Aperçu JSON de la politique</h3>
            </div>
            <pre className="text-xs font-mono text-slate-300 bg-black/30 rounded-lg p-4 overflow-auto max-h-[400px]">
{JSON.stringify({
  usbBlocked: policyForm.usbBlocked,
  bluetoothBlocked: policyForm.bluetoothBlocked,
  firewallStrict: policyForm.firewallStrict,
  screenLockMinutes: policyForm.screenLockMinutes,
  dlpEnabled: policyForm.dlpEnabled,
  blacklistedApps: policyForm.blacklistedApps.split(",").map(s => s.trim()).filter(Boolean),
  encryptionRequired: false,
  allowedApps: [],
  allowedFileExtensions: [],
}, null, 2)}
            </pre>

            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300">
                💡 Cette politique est téléchargée par chaque agent au prochain cycle (60s).
                Elle est appliquée via les API système natifs (Registry Windows / modprobe Linux).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Comparatif ManageEngine vs SENSORIUM Tab ─── */}
      {activeTab === "comparison" && (
        <div className="animate-in fade-in duration-300">
          <ComparisonPage isDark={isDark} />
        </div>
      )}

      {/* ─── Modal Déploiement & All-In-One ─── */}
      {showDeployModal && <DeployAgentModal onClose={() => setShowDeployModal(false)} />}

      {/* ─── Modal Enregistrement Client & Réseau UEM ─── */}
      <ClientRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onClientRegistered={(client) => {
          window.alert(`Client "${client.name}" (${client.tenantId}) configuré avec succès !`);
        }}
      />
    </div>
  );
}
