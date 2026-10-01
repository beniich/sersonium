/**
 * Sensorium — Terminal Routes
 * Physical terminal (Silicium X1 NPU) callback endpoints
 *
 * POST /api/v1/terminal/installation-success  → LLM install callback
 * POST /api/v1/terminal/heartbeat             → Weekly subscription check
 * GET  /api/v1/terminal/status/:orgId         → Superadmin dashboard
 */

import { Router } from "express";
import {
  reportInstallationSuccess,
  terminalHeartbeat,
  getTerminalStatus,
  syncComplianceData,
} from "../../controllers/terminal.controller.js";
import { authenticateToken, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * Terminal callbacks — use a lightweight shared secret instead of JWT
 * because terminals may not have a full auth session.
 * The activation key in the payload serves as the proof-of-identity.
 */

// POST /api/v1/terminal/installation-success
// Called by terminal after Ollama + LLM installation is complete
router.post("/installation-success", reportInstallationSuccess);

// POST /api/v1/terminal/heartbeat
// Called weekly by the terminal to verify subscription is still active
router.post("/heartbeat", terminalHeartbeat);

// GET & POST /api/v1/terminal/sync-compliance
// Physical terminal downloads the complete compliance registry mirror
router.get("/sync-compliance", syncComplianceData);
router.post("/sync-compliance", syncComplianceData);

// GET /api/v1/terminal/status/:orgId
// Superadmin only — view terminal installation & heartbeat status
router.get("/status/:orgId", authenticateToken, requireRole("admin"), getTerminalStatus);

export default router;
