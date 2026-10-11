/**
 * SENSORIUM — UEM Controller
 * Endpoints API pour le cockpit (dashboard) et l'agent endpoint
 */

import { Request, Response } from "express";
import { UemService } from "../services/uem.service.js";

// ─── Cockpit Dashboard Endpoints ──────────────────────────────────────────────

export const getUemStats = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const stats = await UemService.getUemStats(tenantId);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTerminals = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const terminals = await UemService.getAllTerminals(tenantId);
    res.json(terminals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const sendCommand = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id || "system";
    const { terminalId, commandType, payload } = req.body;

    if (!terminalId || !commandType) {
      return res.status(400).json({ error: "terminalId et commandType sont requis." });
    }

    const cmd = await UemService.sendCommand(
      tenantId,
      userId,
      terminalId,
      commandType,
      payload || {}
    );

    res.status(201).json(cmd);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCommandHistory = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { terminalId } = req.params;
    const history = await UemService.getCommandHistory(tenantId, terminalId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const setSecurityPolicy = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id || "system";
    const { groupId, policy } = req.body;

    if (!groupId || !policy) {
      return res.status(400).json({ error: "groupId et policy sont requis." });
    }

    const result = await UemService.setSecurityPolicy(tenantId, userId, groupId, policy);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { status } = req.query;
    const alerts = await UemService.getAlerts(tenantId, status as string | undefined);
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const acknowledgeAlert = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id || "system";
    const { alertId } = req.params;

    const result = await UemService.acknowledgeAlert(tenantId, alertId, userId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/v1/uem/clients/register
 * Enregistrement d'un client / tenant avec configuration réseau et politiques UEM
 */
export const registerClient = async (req: Request, res: Response) => {
  try {
    const { tenantId, name, plan, policy, serverHost, serverPort, serverProtocol, agentKey } = req.body;
    if (!tenantId || !name) {
      return res.status(400).json({ error: "tenantId et name sont requis." });
    }

    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";

    const result = await UemService.registerClient({
      tenantId,
      name,
      plan: plan || "PRO",
      serverHost: serverHost || host,
      serverPort: Number(serverPort) || 3000,
      serverProtocol: serverProtocol || protocol,
      agentKey: agentKey || AGENT_API_KEY,
      policy: policy || {},
    });

    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/v1/uem/installer/download
 * Génère dynamiquement l'installeur préconfiguré pour le tenant (Windows .bat ou Linux .sh)
 */
export const downloadAgentInstaller = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || req.query.tenantId || "CMR-FLEET-01";
    const osType = (req.query.os as string) || "windows";
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const serverUrl = `${protocol}://${host}/api/v1/uem`;

    if (osType === "windows" || osType === "bat") {
      const batContent = `@echo off
:: ============================================================================
::  SENSORIUM UEM Agent - Installeur Unifie & Auto-Deploiement Windows
::  Tenant ID : ${tenantId}
:: ============================================================================
title SENSORIUM UEM Agent — Deploiement Automatique

net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Ce script necessite des privileges Administrateur.
    echo Clic-droit -> "Executer en tant qu'administrateur"
    pause
    exit /b 1
)

set SERVER_URL=${serverUrl}
set AGENT_KEY=${AGENT_API_KEY}
set TENANT_ID=${tenantId}
set INSTALL_DIR=C:\\Program Files\\SensoriumAgent
set SERVICE_NAME=SensoriumUEMAgent

echo.
echo ===================================================================
echo   Deploiement de SENSORIUM UEM Agent
echo   Tenant : %TENANT_ID%
echo   Serveur: %SERVER_URL%
echo ===================================================================
echo.

if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

for /f "tokens=*" %%h in ('hostname') do set HOSTNAME=%%h
set TERMINAL_ID=PC-CMR-%HOSTNAME%

echo [1/4] Telechargement des composants de l'agent...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%SERVER_URL%/agent/binary/index.js' -OutFile '%INSTALL_DIR%\\index.js'"

if not exist "%INSTALL_DIR%\\index.js" (
    echo [ERREUR] Impossible de telecharger le composant index.js depuis le serveur.
    pause
    exit /b 1
)

echo [2/4] Configuration du terminal : %TERMINAL_ID%...
(
echo {
echo   "serverUrl": "%SERVER_URL%",
echo   "agentKey": "%AGENT_KEY%",
echo   "tenantId": "%TENANT_ID%",
echo   "terminalId": "%TERMINAL_ID%",
echo   "agentVersion": "1.0.0",
echo   "pollIntervalMs": 60000,
echo   "logFile": "C:\\\\Program Files\\\\SensoriumAgent\\\\agent.log"
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
echo node index.js ^>^> agent.log 2^>^&1
) > "%INSTALL_DIR%\\run-agent.bat"

echo [4/4] Creation et demarrage du service %SERVICE_NAME%...
sc create %SERVICE_NAME% binPath= "cmd /c \"%INSTALL_DIR%\\run-agent.bat\"" start= auto DisplayName= "SENSORIUM UEM Endpoint Agent"
sc description %SERVICE_NAME% "Agent de securite et gestion de flotte SENSORIUM UEM"
sc start %SERVICE_NAME%

echo.
echo [SUCCES] Agent SENSORIUM UEM installe avec succes pour %TERMINAL_ID%!
echo Le terminal est maintenant visible dans votre console UEM Cockpit.
echo.
pause
`;
      res.setHeader("Content-Disposition", `attachment; filename=install-sensorium-agent-${tenantId}.bat`);
      res.setHeader("Content-Type", "application/x-bat; charset=utf-8");
      return res.send(batContent);
    } else if (osType === "linux" || osType === "sh") {
      const shContent = `#!/bin/bash
# ============================================================================
#  SENSORIUM UEM Agent - Installeur Unifie & Auto-Deploiement Linux/macOS
#  Tenant ID : ${tenantId}
# ============================================================================
set -e

if [ "$EUID" -ne 0 ]; then
  echo "❌ Ce script doit etre execute avec les privileges root (sudo bash ...)"
  exit 1
fi

SERVER_URL="${serverUrl}"
AGENT_KEY="${AGENT_API_KEY}"
TENANT_ID="${tenantId}"
INSTALL_DIR="/opt/sensorium-agent"
SERVICE_NAME="sensorium-agent"

echo "==================================================================="
echo "  Deploiement de SENSORIUM UEM Agent"
echo "  Tenant : $TENANT_ID"
echo "  Serveur: $SERVER_URL"
echo "==================================================================="

mkdir -p "$INSTALL_DIR"
HOSTNAME=$(hostname)
TERMINAL_ID="SRV-CMR-$HOSTNAME"

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
  "pollIntervalMs": 60000,
  "logFile": "$INSTALL_DIR/agent.log"
}
EOF
chmod 600 "$INSTALL_DIR/agent.config.json"

echo "[3/4] Configuration du service systemd..."
NODE_BIN=$(which node || echo "/usr/bin/node")
cat > "/etc/systemd/system/\${SERVICE_NAME}.service" << EOF
[Unit]
Description=SENSORIUM UEM Endpoint Security Agent
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

echo "[4/4] Activation du service..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

echo ""
echo "✅ Agent SENSORIUM UEM installe et actif avec succes pour $TERMINAL_ID!"
`;
      res.setHeader("Content-Disposition", `attachment; filename=install-sensorium-agent-${tenantId}.sh`);
      res.setHeader("Content-Type", "application/x-sh; charset=utf-8");
      return res.send(shContent);
    }

    res.status(400).json({ error: "Le parametre 'os' doit etre 'windows' ou 'linux'" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/v1/uem/agent/binary/index.js
 * Distribue le binaire/source de l'agent pour le bootstrap automatique
 */
export const getAgentSource = async (req: Request, res: Response) => {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const agentPath = path.resolve(process.cwd(), "agent", "index.js");
    const content = await fs.readFile(agentPath, "utf-8");
    res.setHeader("Content-Type", "application/javascript");
    res.send(content);
  } catch (err: any) {
    res.status(500).json({ error: "Impossible de charger le binaire de l'agent: " + err.message });
  }
};

// ─── Agent Endpoint Callbacks (Shared Secret Auth via X-Agent-Key header) ─────

const AGENT_API_KEY = process.env.UEM_AGENT_API_KEY || "SENS-AGENT-CMR-SECURE-KEY";

const verifyAgentKey = (req: Request, res: Response): string | null => {
  const key = req.headers["x-agent-key"] as string;
  const tenantId = req.headers["x-tenant-id"] as string;

  if (!key || key !== AGENT_API_KEY) {
    res.status(401).json({ error: "Clé agent invalide ou absente." });
    return null;
  }
  if (!tenantId) {
    res.status(400).json({ error: "X-Tenant-ID requis." });
    return null;
  }
  return tenantId;
};

/**
 * POST /api/v1/uem/agent/inventory
 * L'agent poste son inventaire toutes les 60 secondes
 */
export const agentPostInventory = async (req: Request, res: Response) => {
  const tenantId = verifyAgentKey(req, res);
  if (!tenantId) return;

  try {
    const data = req.body;
    if (!data.terminalId) {
      return res.status(400).json({ error: "terminalId requis." });
    }

    const terminal = await UemService.registerInventory(tenantId, {
      terminalId: data.terminalId,
      hostname: data.hostname || data.terminalId,
      os: data.os || "Unknown",
      osVersion: data.osVersion || "",
      cpuCores: data.cpuCores || 0,
      ramGb: data.ramGb || 0,
      diskGb: data.diskGb || 0,
      installedApps: data.installedApps || [],
      lastIp: data.lastIp || req.ip || "",
      agentVersion: data.agentVersion || "1.0.0",
      timestamp: new Date().toISOString(),
    });

    // DLP check
    if (data.installedApps?.length > 0) {
      await UemService.detectNonCompliantSoftware(
        tenantId,
        data.terminalId,
        data.installedApps
      );
    }

    res.json({ success: true, terminal });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/v1/uem/agent/commands/:terminalId
 * L'agent récupère ses ordres en attente
 */
export const agentPollCommands = async (req: Request, res: Response) => {
  const tenantId = verifyAgentKey(req, res);
  if (!tenantId) return;

  try {
    const { terminalId } = req.params;
    const commands = await UemService.pollCommands(terminalId);

    // Récupérer la politique active en même temps
    const policy = await UemService.getTerminalPolicy(terminalId, tenantId);

    res.json({ commands, policy });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/v1/uem/agent/commands/:commandId/result
 * L'agent reporte le résultat d'une commande exécutée
 */
export const agentReportResult = async (req: Request, res: Response) => {
  const tenantId = verifyAgentKey(req, res);
  if (!tenantId) return;

  try {
    const { commandId } = req.params;
    const { success, result } = req.body;

    const updated = await UemService.reportCommandResult(
      commandId,
      success === true,
      result || ""
    );

    res.json({ success: true, command: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
