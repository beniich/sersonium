/**
 * SENSORIUM — UEM Routes
 *
 * Deux routeurs distincts :
 * 1. uemAgentRoutes : Pour les agents autonomes (X-Agent-Key) et installeurs curl/bat (avant CSRF)
 * 2. uemCockpitRoutes : Pour le tableau de bord administrateur (JWT + Tenant + CSRF)
 */

import { Router } from "express";
import {
  getUemStats,
  getTerminals,
  sendCommand,
  getCommandHistory,
  setSecurityPolicy,
  getAlerts,
  acknowledgeAlert,
  agentPostInventory,
  agentPollCommands,
  agentReportResult,
  downloadAgentInstaller,
  getAgentSource,
  registerClient,
} from "../../controllers/uem.controller.js";

// ─── 1. Routes Agent & Bootstrap (Pas de CSRF, pas de JWT navigateur) ─────────
export const uemAgentRoutes = Router();

// Enregistrement client accessible aussi en mode bootstrap
uemAgentRoutes.post("/clients/register", registerClient);

// Distribution du code de l'agent
uemAgentRoutes.get("/binary/index.js", getAgentSource);

// Téléchargement direct d'installeur (.bat ou .sh)
uemAgentRoutes.get("/download", downloadAgentInstaller);
uemAgentRoutes.get("/installer/download", downloadAgentInstaller);

// Callbacks et télémétrie de l'agent (authentifiés par X-Agent-Key)
uemAgentRoutes.post("/inventory", agentPostInventory);
uemAgentRoutes.get("/commands/:terminalId", agentPollCommands);
uemAgentRoutes.post("/commands/:commandId/result", agentReportResult);

// ─── 2. Routes Cockpit Dashboard (Protégées par JWT + Tenant) ─────────────────
export const uemCockpitRoutes = Router();

// Enregistrement de client depuis le Cockpit
uemCockpitRoutes.post("/clients/register", registerClient);

// Installeur accessible aussi depuis l'interface cockpit
uemCockpitRoutes.get("/installer/download", downloadAgentInstaller);

// Données du tableau de bord
uemCockpitRoutes.get("/stats", getUemStats);
uemCockpitRoutes.get("/terminals", getTerminals);
uemCockpitRoutes.post("/commands", sendCommand);
uemCockpitRoutes.get("/commands/:terminalId", getCommandHistory);
uemCockpitRoutes.post("/policies", setSecurityPolicy);
uemCockpitRoutes.get("/alerts", getAlerts);
uemCockpitRoutes.patch("/alerts/:alertId/ack", acknowledgeAlert);

// Canal temps réel SSE pour notification instantanée des alertes et propagation
uemCockpitRoutes.get("/stream", (req, res) => {
  const tenantId = (req as any).tenantId || (req.query.tenantId as string) || "CMR-FLEET-01";
  const userId = (req as any).user?.id || (req.query.userId as string);
  const clientId = `${tenantId}:${userId || "anon"}:${Date.now()}`;
  import("../../services/sse.service.js").then(({ SseService }) => {
    SseService.addClient(clientId, tenantId, userId, res);
  });
});

export default uemCockpitRoutes;
