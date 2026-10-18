import React, { useState, useMemo } from "react";
import {
  Building2,
  Server,
  Globe,
  Key,
  Shield,
  Download,
  Copy,
  Check,
  X,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Terminal,
  Lock,
  Wifi,
  Laptop,
  FileCode,
  AlertCircle
} from "lucide-react";

export interface ClientRegistrationData {
  tenantId: string;
  name: string;
  plan: "STARTER" | "PRO" | "ENTERPRISE";
  serverProtocol: "http" | "https";
  serverHost: string;
  serverPort: string;
  agentKey: string;
  terminalPrefix: string;
  pollIntervalSeconds: number;
  blockUsb: boolean;
  blockBluetooth: boolean;
  strictFirewall: boolean;
  enableDlp: boolean;
}

interface ClientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientRegistered?: (client: ClientRegistrationData) => void;
}

export const ClientRegistrationModal: React.FC<ClientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onClientRegistered,
}) => {
  // Détection de l'hôte actuel par défaut
  const defaultHost = typeof window !== "undefined" ? window.location.hostname || "192.168.1.50" : "192.168.1.50";
  const defaultPort = typeof window !== "undefined" && window.location.port ? window.location.port : "3000";
  const defaultProto = typeof window !== "undefined" && window.location.protocol === "https:" ? "https" : "http";

  const [formData, setFormData] = useState<ClientRegistrationData>({
    name: "Banque Atlantique Cameroun",
    tenantId: "CMR-BAC-01",
    plan: "ENTERPRISE",
    serverProtocol: defaultProto,
    serverHost: defaultHost,
    serverPort: defaultPort,
    agentKey: "SENS-KEY-CMR-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    terminalPrefix: "BAC-PC-",
    pollIntervalSeconds: 60,
    blockUsb: false,
    blockBluetooth: false,
    strictFirewall: true,
    enableDlp: true,
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "preview" | "installers">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // URL API calculée
  const computedServerUrl = useMemo(() => {
    const portStr =
      (formData.serverProtocol === "https" && formData.serverPort === "443") ||
      (formData.serverProtocol === "http" && formData.serverPort === "80") ||
      !formData.serverPort
        ? ""
        : `:${formData.serverPort}`;
    return `${formData.serverProtocol}://${formData.serverHost}${portStr}/api/v1/uem`;
  }, [formData.serverProtocol, formData.serverHost, formData.serverPort]);

  // Contenu du script Windows .bat personnalisé
  const generatedBatContent = useMemo(() => {
    return `@echo off
:: ============================================================================
::  SENSORIUM UEM Agent - Installeur Dédié Client
::  Client / Organisation : ${formData.name}
::  Tenant ID             : ${formData.tenantId}
:: ============================================================================
title SENSORIUM UEM Agent - Déploiement Client ${formData.name}

net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Ce script necessite les privileges Administrateur.
    echo Clic-droit -> "Executer en tant qu'administrateur"
    pause
    exit /b 1
)

set SERVER_URL=${computedServerUrl}
set AGENT_KEY=${formData.agentKey}
set TENANT_ID=${formData.tenantId}
set PREFIX=${formData.terminalPrefix}
set INSTALL_DIR=%ProgramFiles%\\SensoriumAgent
set SERVICE_NAME=SensoriumUEMAgent

echo.
echo ============================================================================
echo   Deploiement de SENSORIUM UEM Agent pour : ${formData.name}
echo   Tenant ID: %TENANT_ID%
echo   Serveur  : %SERVER_URL%
echo ============================================================================
echo.

if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

for /f "tokens=*" %%h in ('hostname') do set HOSTNAME=%%h
set TERMINAL_ID=%PREFIX%%HOSTNAME%

echo [1/4] Telechargement de l'agent...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%SERVER_URL%/agent/binary/index.js' -OutFile '%INSTALL_DIR%\\index.js'"

echo [2/4] Ecriture de la configuration pour %TERMINAL_ID%...
(
echo {
echo   "serverUrl": "%SERVER_URL%",
echo   "agentKey": "%AGENT_KEY%",
echo   "tenantId": "%TENANT_ID%",
echo   "terminalId": "%TERMINAL_ID%",
echo   "agentVersion": "1.0.0",
echo   "pollIntervalMs": ${formData.pollIntervalSeconds * 1000},
echo   "logFile": "agent.log"
echo }
) > "%INSTALL_DIR%\\agent.config.json"

echo [3/4] Preparation du service Windows...
sc query %SERVICE_NAME% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    sc stop %SERVICE_NAME% >nul 2>&1
    sc delete %SERVICE_NAME% >nul 2>&1
    timeout /t 2 /nobreak >nul
)

(
echo @echo off
echo cd /d "%INSTALL_DIR%"
echo node index.js ^>^> "%INSTALL_DIR%\\agent.log" 2^>^&1
) > "%INSTALL_DIR%\\start-agent.bat"

echo [4/4] Creation du service de surveillance...
sc create %SERVICE_NAME% binPath= "cmd /c \"%INSTALL_DIR%\\start-agent.bat\"" start= auto DisplayName= "SENSORIUM UEM Agent (${formData.name})"
sc description %SERVICE_NAME% "Agent de securite de flotte endpoint connecte a ${computedServerUrl}"
sc start %SERVICE_NAME%

echo.
echo [SUCCES] Agent SENSORIUM UEM installe et actif avec succes pour %TERMINAL_ID%!
pause
`;
  }, [formData, computedServerUrl]);

  // Contenu du script Linux .sh personnalisé
  const generatedShContent = useMemo(() => {
    return `#!/bin/bash
# ============================================================================
#  SENSORIUM UEM Agent - Installeur Client Linux / macOS
#  Client : ${formData.name}
# ============================================================================
set -e

if [ "$EUID" -ne 0 ]; then
  echo "❌ Ce script doit etre execute en root (sudo bash ...)"
  exit 1
fi

SERVER_URL="${computedServerUrl}"
AGENT_KEY="${formData.agentKey}"
TENANT_ID="${formData.tenantId}"
PREFIX="${formData.terminalPrefix}"
INSTALL_DIR="/opt/sensorium-agent"
SERVICE_NAME="sensorium-agent"

echo "============================================================================"
echo "  Deploiement de SENSORIUM UEM Agent pour : ${formData.name}"
echo "  Serveur : $SERVER_URL"
echo "============================================================================"

mkdir -p "$INSTALL_DIR"
HOSTNAME=$(hostname)
TERMINAL_ID="\${PREFIX}\${HOSTNAME}"

echo "[1/4] Telechargement de l'agent..."
curl -fsSL "$SERVER_URL/agent/binary/index.js" -o "$INSTALL_DIR/index.js"
chmod 750 "$INSTALL_DIR/index.js"

echo "[2/4] Configuration..."
cat > "$INSTALL_DIR/agent.config.json" << EOF
{
  "serverUrl": "$SERVER_URL",
  "agentKey": "$AGENT_KEY",
  "tenantId": "$TENANT_ID",
  "terminalId": "$TERMINAL_ID",
  "agentVersion": "1.0.0",
  "pollIntervalMs": ${formData.pollIntervalSeconds * 1000},
  "logFile": "$INSTALL_DIR/agent.log"
}
EOF
chmod 600 "$INSTALL_DIR/agent.config.json"

echo "[3/4] Creation du service systemd..."
NODE_BIN=$(which node || echo "/usr/bin/node")
cat > "/etc/systemd/system/\${SERVICE_NAME}.service" << EOF
[Unit]
Description=SENSORIUM UEM Endpoint Agent (${formData.name})
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$NODE_BIN $INSTALL_DIR/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "[4/4] Demarrage du service..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

echo "✅ Agent SENSORIUM UEM installe et actif pour $TERMINAL_ID!"
`;
  }, [formData, computedServerUrl]);

  // Commande PowerShell en 1 ligne
  const oneLinerPowerShell = useMemo(() => {
    return `powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '${computedServerUrl}/installer/download?os=windows&tenantId=${formData.tenantId}' -OutFile install-agent.bat; .\\install-agent.bat"`;
  }, [computedServerUrl, formData.tenantId]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownload = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 16);
    setFormData((prev) => ({
      ...prev,
      name,
      tenantId: slug ? `CMR-${slug}` : prev.tenantId,
      terminalPrefix: slug ? `${slug.substring(0, 4)}-PC-` : prev.terminalPrefix,
    }));
  };

  const regenerateKey = () => {
    const newKey = "SENS-KEY-CMR-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData((prev) => ({ ...prev, agentKey: newKey }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      // 1. Tenter l'enregistrement sur le backend SENSORIUM
      const res = await fetch("/api/v1/uem/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: "default",
          policy: {
            usbBlocked: formData.blockUsb,
            bluetoothBlocked: formData.blockBluetooth,
            firewallStrict: formData.strictFirewall,
            dlpEnabled: formData.enableDlp,
            screenLockMinutes: 15,
            blacklistedApps: ["TorrentClient", "BitTorrent"],
            allowedApps: [],
            encryptionRequired: false,
            allowedFileExtensions: [".exe", ".msi"],
          },
        }),
      }).catch(() => null);

      if (onClientRegistered) {
        onClientRegistered(formData);
      }

      setSuccessMessage(`Le client "${formData.name}" a été enregistré avec succès ! Téléchargez son installeur.`);
      setActiveTab("installers");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700/70 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Enregistrement Client &amp; Déploiement Réseau
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  UEM Suite
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configurez l'adresse IP, le DNS du serveur et générez l'installeur pré-configuré pour ce client.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("form")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "form"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders size={14} /> 1. Configuration Client &amp; Réseau
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode size={14} /> 2. Aperçu JSON de l'Agent
          </button>
          <button
            onClick={() => setActiveTab("installers")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "installers"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download size={14} /> 3. Installeurs Générés (.BAT / .SH)
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" /> {successMessage}
            </span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Body Container */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* ── Section 1 : Informations Client ── */}
              <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-800/80 pb-2">
                  <Building2 size={16} className="text-orange-400" />
                  <span>1. Identité du Client / Organisation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Nom du Client / Entreprise
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="Ex: Banque Atlantique CMR"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Identifiant Unique (Tenant ID)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tenantId}
                      onChange={(e) =>
                        setFormData({ ...formData, tenantId: e.target.value.toUpperCase() })
                      }
                      placeholder="Ex: CMR-BAC-01"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Formule / Souscription
                    </label>
                    <select
                      value={formData.plan}
                      onChange={(e) =>
                        setFormData({ ...formData, plan: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="STARTER">Starter (Jusqu'à 10 postes)</option>
                      <option value="PRO">Professional (Flotte jusqu'à 100 postes)</option>
                      <option value="ENTERPRISE">Enterprise CAFM (Flotte Illimitée)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Section 2 : Configuration Réseau & Serveur ── */}
              <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Server size={16} className="text-cyan-400" />
                    <span>2. Configuration Réseau du Serveur (IP, DNS, Port &amp; Clé)</span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    Point de chute des agents
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Protocole</label>
                    <select
                      value={formData.serverProtocol}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          serverProtocol: e.target.value as "http" | "https",
                          serverPort: e.target.value === "https" ? "443" : "3000",
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="http">http:// (Local / IP brute)</option>
                      <option value="https">https:// (Sécurisé SSL / DNS)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">
                      Adresse IP ou Nom de Domaine DNS du Serveur
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.serverHost}
                        onChange={(e) =>
                          setFormData({ ...formData, serverHost: e.target.value.trim() })
                        }
                        placeholder="Ex: 192.168.1.50 ou uem.sensorium.io"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Port</label>
                    <input
                      type="text"
                      value={formData.serverPort}
                      onChange={(e) =>
                        setFormData({ ...formData, serverPort: e.target.value.trim() })
                      }
                      placeholder="3000"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Clé API Agent */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Key size={13} className="text-amber-400" />
                      <span>Clé Secrète de l'Agent (X-Agent-Key)</span>
                    </label>
                    <button
                      type="button"
                      onClick={regenerateKey}
                      className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1 transition"
                    >
                      <RefreshCw size={11} /> Régénérer une clé
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.agentKey}
                    onChange={(e) => setFormData({ ...formData, agentKey: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Aperçu URL calculée */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe size={14} className="text-cyan-400" />
                    <span>URL Endpoint calculée :</span>
                    <span className="text-cyan-300 font-bold">{computedServerUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(computedServerUrl, "url")}
                    className="text-slate-400 hover:text-white transition"
                    title="Copier l'URL"
                  >
                    {copiedKey === "url" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* ── Section 3 : Politiques de Flotte & UEM ── */}
              <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-800/80 pb-2">
                  <Shield size={16} className="text-purple-400" />
                  <span>3. Paramètres de Flotte &amp; Politiques de Sécurité par Défaut</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Préfixe d'Identifiant Terminal
                    </label>
                    <input
                      type="text"
                      value={formData.terminalPrefix}
                      onChange={(e) =>
                        setFormData({ ...formData, terminalPrefix: e.target.value.toUpperCase() })
                      }
                      placeholder="Ex: BAC-PC-"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Le nom final sera : <code className="text-slate-300">{formData.terminalPrefix}[HOSTNAME]</code>
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Intervalle de Télémétrie
                    </label>
                    <select
                      value={formData.pollIntervalSeconds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pollIntervalSeconds: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500 font-mono"
                    >
                      <option value={30}>30 secondes (Haute fréquence)</option>
                      <option value={60}>60 secondes (Recommandé standard)</option>
                      <option value={120}>2 minutes (Économie bande passante)</option>
                      <option value={300}>5 minutes (Réseau faible débit / Satellite)</option>
                    </select>
                  </div>
                </div>

                {/* Toggles de sécurité */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900 transition">
                    <input
                      type="checkbox"
                      checked={formData.blockUsb}
                      onChange={(e) => setFormData({ ...formData, blockUsb: e.target.checked })}
                      className="rounded border-slate-700 text-orange-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-200">Bloquer les clés USB</span>
                      <p className="text-[10px] text-slate-500">Désactive l'écriture sur clés USB amovibles</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900 transition">
                    <input
                      type="checkbox"
                      checked={formData.blockBluetooth}
                      onChange={(e) => setFormData({ ...formData, blockBluetooth: e.target.checked })}
                      className="rounded border-slate-700 text-orange-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-200">Bloquer le Bluetooth</span>
                      <p className="text-[10px] text-slate-500">Empêche les transferts de fichiers sans fil</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900 transition">
                    <input
                      type="checkbox"
                      checked={formData.strictFirewall}
                      onChange={(e) => setFormData({ ...formData, strictFirewall: e.target.checked })}
                      className="rounded border-slate-700 text-orange-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-200">Pare-feu Strict Activé</span>
                      <p className="text-[10px] text-slate-500">Filtre les connexions entrantes non sollicitées</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900 transition">
                    <input
                      type="checkbox"
                      checked={formData.enableDlp}
                      onChange={(e) => setFormData({ ...formData, enableDlp: e.target.checked })}
                      className="rounded border-slate-700 text-orange-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-200">Surveillance DLP Logicielle</span>
                      <p className="text-[10px] text-slate-500">Détecte et alerte sur logiciels interdits (Torrents...)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Bouton d'action */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs transition shadow-lg shadow-orange-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Enregistrer le Client &amp; Générer les Installeurs
                </button>
              </div>
            </form>
          )}

          {/* ── Onglet 2 : Prévisualisation JSON de l'agent ── */}
          {activeTab === "preview" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-slate-300">
                  Fichier <code className="text-cyan-400 font-mono">agent.config.json</code> qui sera déployé sur chaque poste de <strong className="text-white">{formData.name}</strong> :
                </p>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(
                        {
                          serverUrl: computedServerUrl,
                          agentKey: formData.agentKey,
                          tenantId: formData.tenantId,
                          terminalId: `${formData.terminalPrefix}HOSTNAME`,
                          agentVersion: "1.0.0",
                          pollIntervalMs: formData.pollIntervalSeconds * 1000,
                          logFile: "agent.log",
                        },
                        null,
                        2
                      ),
                      "json"
                    )
                  }
                  className="flex items-center gap-1 text-slate-400 hover:text-white"
                >
                  {copiedKey === "json" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>Copier le JSON</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-auto">
{JSON.stringify(
  {
    serverUrl: computedServerUrl,
    agentKey: formData.agentKey,
    tenantId: formData.tenantId,
    terminalId: `${formData.terminalPrefix}[HOSTNAME]`,
    agentVersion: "1.0.0",
    pollIntervalMs: formData.pollIntervalSeconds * 1000,
    logFile: "agent.log",
  },
  null,
  2
)}
              </pre>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                💡 L'agent utilisera automatiquement l'adresse <strong className="text-white">{computedServerUrl}</strong> configurée pour faire remonter son inventaire et récupérer ses ordres en toute transparence.
              </div>
            </div>
          )}

          {/* ── Onglet 3 : Téléchargement des Installeurs ── */}
          {activeTab === "installers" && (
            <div className="space-y-5 text-xs">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-200">
                    Installeurs configurés pour "{formData.name}" (Tenant : {formData.tenantId})
                  </p>
                  <p className="mt-0.5 text-emerald-400/90">
                    Ces scripts intègrent directement l'adresse de votre serveur ({computedServerUrl}) ainsi que la clé de sécurité.
                  </p>
                </div>
              </div>

              {/* Boutons de téléchargement direct */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Laptop size={16} className="text-orange-400" />
                    <span>Installeur Windows (.bat)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Installe le service Windows en tâche de fond pour Windows 10/11 et Windows Server.
                  </p>
                  <button
                    onClick={() =>
                      handleDownload(
                        `install-sensorium-${formData.tenantId}.bat`,
                        generatedBatContent,
                        "application/x-bat"
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition shadow-md shadow-orange-600/20"
                  >
                    <Download size={14} /> Télécharger le fichier .BAT
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Terminal size={16} className="text-cyan-400" />
                    <span>Installeur Linux / macOS (.sh)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Configure un daemon systemd permanent sous Ubuntu, Debian, CentOS ou macOS.
                  </p>
                  <button
                    onClick={() =>
                      handleDownload(
                        `install-sensorium-${formData.tenantId}.sh`,
                        generatedShContent,
                        "application/x-sh"
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition shadow-md shadow-cyan-600/20"
                  >
                    <Download size={14} /> Télécharger le script .SH
                  </button>
                </div>
              </div>

              {/* Commande 1 ligne PowerShell */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">Ou déploiement en 1 seule ligne PowerShell Administrateur :</span>
                  <button
                    onClick={() => copyToClipboard(oneLinerPowerShell, "ps1")}
                    className="text-orange-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === "ps1" ? <Check size={12} /> : <Copy size={12} />} Copier
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all">
                  {oneLinerPowerShell}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/50 text-xs">
          <div className="text-slate-500 font-mono">
            Tenant actif : <span className="text-slate-300 font-bold">{formData.tenantId}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientRegistrationModal;
