import React, { useState, useMemo, useEffect } from "react";
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
  AlertCircle,
  Sparkles,
  Zap,
  Receipt,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Crown,
  Star
} from "lucide-react";
import { auth, db, googleSignIn } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { GoogleLogoIcon } from "./ShowcaseViewer";

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

export interface GeneratedInvoice {
  invoiceId: string;
  transactionRef: string;
  date: string;
  clientName: string;
  tenantId: string;
  email: string;
  plan: string;
  amountHtEur: number;
  tvaEur: number;
  amountTtcEur: number;
  amountTtcMad: number;
  tokensAllocated: number;
  endpointsCount: string;
  doraReference: string;
}

interface ClientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientRegistered?: (client: ClientRegistrationData) => void;
  initialPlan?: "STARTER" | "PRO" | "ENTERPRISE";
}

export const PLAN_DETAILS: Record<"STARTER" | "PRO" | "ENTERPRISE", {
  label: string;
  tier: "free" | "silver" | "enterprise";
  price: string;
  priceEurHt: number;
  tokens: number;
  tokensLabel: string;
  endpoints: string;
  doraCoverage: string;
  isPopular?: boolean;
}> = {
  STARTER: {
    label: "FREE Starter",
    tier: "free",
    price: "0 €/mois",
    priceEurHt: 0,
    tokens: 10_000,
    tokensLabel: "10 000 Tokens IA / mois",
    endpoints: "Jusqu'à 5 terminaux UEM",
    doraCoverage: "Audit trimestriel standard"
  },
  PRO: {
    label: "SILVER Professional",
    tier: "silver",
    price: "29 €/mois (~316 MAD)",
    priceEurHt: 29,
    tokens: 250_000,
    tokensLabel: "250 000 Tokens IA / mois",
    endpoints: "Jusqu'à 50 terminaux managés",
    doraCoverage: "Audits DORA réguliers & Zero-Trust"
  },
  ENTERPRISE: {
    label: "GOLD Enterprise",
    tier: "enterprise",
    price: "99 €/mois (~1 080 MAD)",
    priceEurHt: 99,
    tokens: 2_000_000,
    tokensLabel: "2 000 000 Tokens IA (2 Millions)",
    endpoints: "Terminaux illimités (500+)",
    doraCoverage: "AIOps autonome, WAF L7 & SLA 99.999%",
    isPopular: true
  }
};

export const ClientRegistrationModal: React.FC<ClientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onClientRegistered,
  initialPlan = "ENTERPRISE"
}) => {
  // Détection de l'hôte actuel par défaut
  const defaultHost = typeof window !== "undefined" ? window.location.hostname || "192.168.1.50" : "192.168.1.50";
  const defaultPort = typeof window !== "undefined" && window.location.port ? window.location.port : "3000";
  const defaultProto = typeof window !== "undefined" && window.location.protocol === "https:" ? "https" : "http";

  const [formData, setFormData] = useState<ClientRegistrationData>({
    name: "Banque Atlantique Cameroun",
    tenantId: "CMR-BAC-01",
    plan: initialPlan,
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

  // Profil Google Gmail Connecté
  const [googleUser, setGoogleUser] = useState<{
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
  } | null>(() => {
    if (auth?.currentUser) {
      return {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || "",
        displayName: auth.currentUser.displayName || "",
        photoURL: auth.currentUser.photoURL || undefined
      };
    }
    if (typeof localStorage !== "undefined") {
      try {
        const cached = localStorage.getItem("sensorium_auth_user");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.email) {
            return {
              uid: parsed.userId || `usr-${Date.now()}`,
              email: parsed.email,
              displayName: parsed.displayName || parsed.name || "",
              photoURL: parsed.photoUrl
            };
          }
        }
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<GeneratedInvoice | null>(null);
  const [activeTab, setActiveTab] = useState<"auth-select" | "form" | "confirm">(
    googleUser ? "form" : "auth-select"
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialPlan) {
      setFormData(prev => ({ ...prev, plan: initialPlan }));
    }
  }, [initialPlan]);

  // Synchronisation avec l'état d'authentification Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setGoogleUser({
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || undefined
        });
        // Pré-remplissage intelligent si nom par défaut
        if (formData.name === "Banque Atlantique Cameroun" && user.displayName) {
          const orgName = `${user.displayName} Org`;
          const slug = user.displayName.toUpperCase().replace(/[^A-Z0-9]/g, "-").substring(0, 12);
          setFormData(prev => ({
            ...prev,
            name: orgName,
            tenantId: slug ? `TEN-${slug}` : prev.tenantId,
            terminalPrefix: slug ? `${slug.substring(0, 4)}-PC-` : prev.terminalPrefix,
          }));
        }
      }
    });
    return () => unsubscribe();
  }, [formData.name]);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);
      const res = await googleSignIn();
      if (res?.user) {
        const user = res.user;
        setGoogleUser({
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || undefined
        });
        const nameGuess = user.displayName || user.email?.split("@")[0] || "Entreprise";
        const orgName = `${nameGuess.charAt(0).toUpperCase() + nameGuess.slice(1)} Smart Fleet`;
        const slug = nameGuess.toUpperCase().replace(/[^A-Z0-9]/g, "-").substring(0, 12);
        setFormData(prev => ({
          ...prev,
          name: orgName,
          tenantId: `TEN-${slug}`,
          terminalPrefix: `${slug.substring(0, 4)}-PC-`,
        }));
        window.dispatchEvent(new CustomEvent("sensorium:profile_updated"));
      }
    } catch (err) {
      console.warn("[ClientRegistrationModal] Google Auth warning:", err);
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

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
echo node index.js ^>> "%INSTALL_DIR%\\agent.log" 2^>&1
) > "%INSTALL_DIR%\\start-agent.bat"

echo [4/4] Creation du service de surveillance...
sc create %SERVICE_NAME% binPath= "cmd /c \\"%INSTALL_DIR%\\start-agent.bat\\"" start= auto DisplayName= "SENSORIUM UEM Agent (${formData.name})"
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
cat > "$INSTALL_DIR/agent.config.json" <<EOF
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
cat > "/etc/systemd/system/\${SERVICE_NAME}.service" <<EOF
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

    // Si pas de compte Google, déclencher l'auth d'abord
    if (!googleUser) {
      await handleGoogleSignIn();
      setIsSubmitting(false);
      return;
    }

    const planConfig = PLAN_DETAILS[formData.plan] || PLAN_DETAILS.ENTERPRISE;
    const mappedTier = planConfig.tier;

    try {
      // 1. Tenter l'enregistrement sur le backend SENSORIUM (non bloquant)
      await fetch("/api/v1/uem/policies", {
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

      // 2. Attribution et initialisation du tokenQuota en localStorage
      const initialQuota = {
        tokensMonth: 0,
        tokensDay: 0,
        reqMin: 0,
        entitlements: 0,
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sensorium_subscription_tier", mappedTier);
          localStorage.setItem(`sensorium_quota_${mappedTier}`, JSON.stringify(initialQuota));
          localStorage.setItem(
            `sensorium_client_${formData.tenantId}`,
            JSON.stringify({
              name: formData.name,
              tenantId: formData.tenantId,
              plan: formData.plan,
              tier: mappedTier,
              tokenQuota: {
                totalMonthly: planConfig.tokens,
                tokensRemaining: planConfig.tokens,
                tokensUsed: 0,
              },
              registeredAt: new Date().toISOString(),
            })
          );
        } catch {
          // ignore
        }

        window.dispatchEvent(
          new CustomEvent("sensorium:quota_updated", {
            detail: {
              tier: mappedTier,
              usage: initialQuota,
              tokenQuota: {
                totalMonthly: planConfig.tokens,
                tokensRemaining: planConfig.tokens,
                tokensUsed: 0,
              },
            },
          })
        );
      }

      // 3. Génération de la facture fiscale
      const invoiceNum = Math.floor(1000 + Math.random() * 9000);
      const invoiceId = `FAC-${new Date().getFullYear()}-${invoiceNum}`;
      const uid = googleUser.uid;
      const transactionRef = `TXN-GMAIL-${uid.slice(0, 8).toUpperCase()}-${Date.now()}`;
      const amountHtEur = planConfig.priceEurHt;
      const tvaEur = Math.round(amountHtEur * 0.20 * 100) / 100;
      const amountTtcEur = amountHtEur + tvaEur;
      const amountTtcMad = Math.round(amountTtcEur * 10.9 * 100) / 100;

      const invoice: GeneratedInvoice = {
        invoiceId,
        transactionRef,
        date: new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }),
        clientName: googleUser.displayName || formData.name,
        tenantId: formData.tenantId,
        email: googleUser.email,
        plan: planConfig.label,
        amountHtEur,
        tvaEur,
        amountTtcEur,
        amountTtcMad,
        tokensAllocated: planConfig.tokens,
        endpointsCount: planConfig.endpoints,
        doraReference: "Article 24 - Conformité DORA"
      };

      // 4. Enregistrement Firestore (users/{userId}) et facture
      try {
        const currentUser = auth?.currentUser;
        if (currentUser && db) {
          // Profil et quota
          await setDoc(
            doc(db, `users/${currentUser.uid}`),
            {
              organizationName: formData.name,
              tenantId: formData.tenantId,
              plan: formData.plan,
              subscriptionTier: mappedTier,
              tokenQuota: {
                totalMonthly: planConfig.tokens,
                tokensRemaining: planConfig.tokens,
                tokensUsed: 0,
                lastAllocatedAt: new Date().toISOString(),
              },
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          // Facture certifiée
          await setDoc(
            doc(db, `users/${currentUser.uid}/invoices/${invoiceId}`),
            {
              ...invoice,
              createdAt: new Date().toISOString(),
              status: "paid",
              currency: "EUR",
              doraCompliant: true,
            }
          );
        }
      } catch (firestoreErr) {
        console.warn("[ClientRegistration] Firestore sync warning:", firestoreErr);
      }

      setGeneratedInvoice(invoice);

      if (onClientRegistered) {
        onClientRegistered(formData);
      }

      setActiveTab("confirm");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const planConfig = PLAN_DETAILS[formData.plan] || PLAN_DETAILS.ENTERPRISE;

  // Initiales de l'avatar
  const initials = googleUser?.displayName
    ? googleUser.displayName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()
    : "?";

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
                Configurez votre abonnement, liez votre compte Gmail et générez l'installeur pré-configuré.
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
            onClick={() => setActiveTab("auth-select")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "auth-select"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <GoogleLogoIcon size={14} /> 1. Compte Gmail &amp; Forfait
          </button>
          <button
            onClick={() => googleUser ? setActiveTab("form") : undefined}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "form"
                ? "border-orange-500 text-orange-400"
                : googleUser
                  ? "border-transparent text-slate-400 hover:text-slate-200"
                  : "border-transparent text-slate-600 cursor-not-allowed"
            }`}
          >
            <Sliders size={14} /> 2. Configuration Réseau
          </button>
          <button
            onClick={() => generatedInvoice ? setActiveTab("confirm") : undefined}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "confirm"
                ? "border-emerald-500 text-emerald-400"
                : generatedInvoice
                  ? "border-transparent text-slate-400 hover:text-slate-200"
                  : "border-transparent text-slate-600 cursor-not-allowed"
            }`}
          >
            <Receipt size={14} /> 3. Confirmation &amp; Facture
          </button>
        </div>

        {/* Body Container */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* ── Onglet 1 : Auth Gmail & Sélecteur de Forfait ── */}
          {activeTab === "auth-select" && (
            <div className="space-y-6 text-xs">
              {/* Bloc Google Auth */}
              <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-800/80 pb-3">
                  <GoogleLogoIcon size={18} />
                  <span>Associer votre compte Gmail / Google Workspace</span>
                </div>

                {!googleUser ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <p className="text-slate-400 text-center max-w-sm">
                      Connectez votre compte Gmail pour sécuriser votre abonnement, générer vos factures certifiées et synchroniser vos quotas de tokens IA.
                    </p>
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleSigningIn}
                      className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm shadow-md border border-gray-200 transition disabled:opacity-70"
                    >
                      {isGoogleSigningIn ? (
                        <RefreshCw size={18} className="animate-spin text-blue-500" />
                      ) : (
                        <GoogleLogoIcon size={20} />
                      )}
                      {isGoogleSigningIn ? "Connexion en cours..." : "Se connecter avec Google"}
                    </button>
                    <p className="text-[11px] text-slate-500">
                      Connexion sécurisée via OAuth 2.0 • Vos données restent privées
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    {googleUser.photoURL ? (
                      <img
                        src={googleUser.photoURL}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm">{googleUser.displayName || "Utilisateur"}</p>
                      <p className="text-slate-300 text-xs">{googleUser.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                        <Check size={10} /> Gmail Vérifié &amp; Certifié
                      </span>
                    </div>
                    <button
                      onClick={handleGoogleSignIn}
                      className="text-xs text-slate-400 hover:text-white underline underline-offset-2"
                    >
                      Changer
                    </button>
                  </div>
                )}
              </div>

              {/* Sélecteur de Forfait */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-orange-400" />
                  Choisissez votre Forfait &amp; Quota de Tokens IA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(["STARTER", "PRO", "ENTERPRISE"] as const).map((plan) => {
                    const p = PLAN_DETAILS[plan];
                    const isSelected = formData.plan === plan;
                    return (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, plan }))}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20"
                            : "border-slate-700 bg-slate-950/40 hover:border-slate-600"
                        }`}
                      >
                        {p.isPopular && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold flex items-center gap-1">
                            <Star size={8} /> Recommandé
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-bold text-sm ${isSelected ? "text-orange-300" : "text-white"}`}>
                            {p.label}
                          </span>
                          {isSelected && <Check size={16} className="text-orange-400" />}
                        </div>
                        <p className={`text-lg font-black mb-1 ${isSelected ? "text-orange-400" : "text-slate-200"}`}>
                          {p.price}
                        </p>
                        <div className="space-y-1 text-[11px] text-slate-400">
                          <p className="flex items-center gap-1 text-orange-300 font-semibold">
                            <Zap size={10} /> {p.tokensLabel}
                          </p>
                          <p className="flex items-center gap-1">
                            <Wifi size={10} /> {p.endpoints}
                          </p>
                          <p className="flex items-center gap-1">
                            <Shield size={10} /> {p.doraCoverage}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bouton Continuer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!googleUser) {
                      await handleGoogleSignIn();
                    } else {
                      setActiveTab("form");
                    }
                  }}
                  disabled={isGoogleSigningIn}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs transition shadow-lg shadow-orange-500/25 disabled:opacity-50"
                >
                  {isGoogleSigningIn ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ArrowRight size={14} />
                  )}
                  {!googleUser ? "Se connecter et Continuer" : "Continuer vers la Configuration →"}
                </button>
              </div>
            </div>
          )}

          {/* ── Onglet 2 : Configuration Réseau (form) ── */}
          {activeTab === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">

              {/* Profil Gmail lié en haut */}
              {googleUser && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  {googleUser.photoURL ? (
                    <img src={googleUser.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-indigo-400" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xs">{googleUser.displayName}</p>
                    <p className="text-slate-400 text-[11px]">{googleUser.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30 flex items-center gap-1">
                    <Check size={10} /> Compte lié
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("auth-select")}
                    className="text-[10px] text-slate-400 hover:text-white underline"
                  >
                    Changer
                  </button>
                </div>
              )}

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
                      Formule Sélectionnée
                    </label>
                    <div
                      className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-orange-500/40 text-orange-300 font-semibold cursor-pointer text-xs"
                      onClick={() => setActiveTab("auth-select")}
                    >
                      {planConfig.label} — {planConfig.tokensLabel}
                    </div>
                  </div>
                </div>

                {/* Badge Récapitulatif du Quota de Tokens */}
                <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-slate-900/90 to-slate-950 border border-orange-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                      <Sparkles size={14} />
                    </span>
                    <div>
                      <span className="font-bold text-white">{planConfig.label}</span>
                      <span className="text-slate-400 ml-2">({planConfig.price})</span>
                      <p className="text-[11px] text-orange-300 font-mono mt-0.5">
                        ⚡ {planConfig.tokensLabel} • {planConfig.endpoints}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold">
                      🛡️ {planConfig.doraCoverage}
                    </span>
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
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("auth-select")}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  ← Retour au forfait
                </button>
                <div className="flex items-center gap-3">
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
                    {isSubmitting ? "Finalisation en cours..." : "Finaliser l'Abonnement &amp; Générer la Facture"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ── Onglet 3 : Confirmation & Facture ── */}
          {activeTab === "confirm" && generatedInvoice && (
            <div className="space-y-5 text-xs">
              {/* En-tête de confirmation */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Abonnement Activé</h3>
                  <p className="text-slate-400 text-xs">
                    Organisation <span className="text-orange-300 font-semibold">{formData.name}</span> enregistrée sur SENSORIUM.
                  </p>
                </div>
              </div>

              {/* Compte Gmail confirmé */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                {googleUser?.photoURL ? (
                  <img src={googleUser.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-emerald-400" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-orange-500 flex items-center justify-center text-white font-bold">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{googleUser?.displayName}</p>
                  <p className="text-slate-400 text-[11px]">{googleUser?.email}</p>
                </div>
                <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Check size={10} /> Compte Certifié
                </span>
              </div>

              {/* Facture certifiée */}
              <div className="bg-slate-950/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
                  <div className="flex items-center gap-2">
                    <Receipt size={16} className="text-orange-400" />
                    <span className="font-bold text-white">Facture Fiscale Certifiée</span>
                  </div>
                  <span className="font-mono text-orange-300 font-bold text-sm">{generatedInvoice.invoiceId}</span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500 mb-0.5">Client</p>
                      <p className="text-white font-semibold">{generatedInvoice.clientName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5">Email</p>
                      <p className="text-white">{generatedInvoice.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5">Tenant ID</p>
                      <p className="text-cyan-300 font-mono">{generatedInvoice.tenantId}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5">Date</p>
                      <p className="text-white">{generatedInvoice.date}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5">Référence Transaction</p>
                      <p className="text-slate-300 font-mono text-[10px]">{generatedInvoice.transactionRef}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5">Conformité</p>
                      <p className="text-emerald-300">{generatedInvoice.doraReference}</p>
                    </div>
                  </div>

                  {/* Montants */}
                  <div className="bg-slate-900/80 rounded-lg p-3 space-y-1.5 border border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Forfait {generatedInvoice.plan} (HT)</span>
                      <span className="text-white font-semibold">{generatedInvoice.amountHtEur.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>TVA 20%</span>
                      <span className="text-white">{generatedInvoice.tvaEur.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-slate-700 pt-1.5 mt-1">
                      <span className="text-white">Total TTC</span>
                      <div className="text-right">
                        <span className="text-orange-300 text-sm">{generatedInvoice.amountTtcEur.toFixed(2)} €</span>
                        <span className="text-slate-400 text-[10px] ml-2">/ {generatedInvoice.amountTtcMad.toFixed(0)} MAD</span>
                      </div>
                    </div>
                  </div>

                  {/* Tokens alloués */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <Zap size={18} className="text-orange-400 shrink-0" />
                    <div>
                      <p className="font-bold text-orange-300">{generatedInvoice.tokensAllocated.toLocaleString("fr-FR")} Tokens IA alloués</p>
                      <p className="text-slate-400 text-[11px]">{generatedInvoice.endpointsCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Téléchargement des agents */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Download size={14} className="text-cyan-400" />
                  Télécharger les Agents UEM pré-configurés
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      handleDownload(
                        `install-sensorium-${formData.tenantId}.bat`,
                        generatedBatContent,
                        "application/x-bat"
                      )
                    }
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold text-xs transition shadow-md shadow-orange-600/20"
                  >
                    <Laptop size={15} /> Télécharger Agent Windows (.BAT)
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        `install-sensorium-${formData.tenantId}.sh`,
                        generatedShContent,
                        "application/x-sh"
                      )
                    }
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold text-xs transition shadow-md shadow-cyan-600/20"
                  >
                    <Terminal size={15} /> Télécharger Agent Linux / macOS (.SH)
                  </button>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    window.location.hash = "#dashboard";
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                >
                  <ExternalLink size={13} /> Accéder à la Console de Flotte
                </button>
                <button
                  onClick={() => setActiveTab("form")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
                >
                  Modifier la config
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition"
                >
                  Terminer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/50 text-xs">
          <div className="text-slate-500 font-mono">
            Tenant actif : <span className="text-slate-300 font-bold">{formData.tenantId}</span>
            {generatedInvoice && (
              <span className="ml-3 text-emerald-400">• {generatedInvoice.invoiceId}</span>
            )}
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
