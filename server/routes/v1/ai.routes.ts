import { Router } from "express";
import { analyzeLogs, analyzeTelemetry } from "../../controllers/ai.controller.js";
import { authenticateToken, requireSubscriptionTier } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { analyzeLogsSchema } from "../../schemas/ai.schema.js";

const router = Router();

router.use(authenticateToken, requireTenant);

// Analyse de logs d'infrastructure via Gemini (Nécessite Tier Pro minimum)
router.post(
  "/analyze-logs", 
  requireSubscriptionTier("pro"), 
  validateRequest({ body: analyzeLogsSchema }), 
  analyzeLogs
);

// Analyse de télémétrie rapide (Nécessite Tier Silver / Edge Explorer minimum)
router.post(
  "/analyze", 
  requireSubscriptionTier("silver"), 
  analyzeTelemetry
);

export default router;
