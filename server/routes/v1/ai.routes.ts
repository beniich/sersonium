import { Router } from "express";
import { analyzeLogs, analyzeTelemetry } from "../../controllers/ai.controller.js";
import { executeArtifact } from "../../controllers/ai.execution.controller.js";
import { authenticateToken, requireSubscriptionTier } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { analyzeLogsSchema } from "../../schemas/ai.schema.js";
import { aiRateLimiter } from "../../middlewares/aiRateLimiter.middleware.js";
import { requireEntitlement } from "../../middlewares/subscriptionGate.middleware.js";

const router = Router();

// Action Layer: Déploiement One-Click d'artefacts IaC & Scripts
router.post("/execute", executeArtifact);

router.use(authenticateToken, requireTenant);

// Analyse de logs d'infrastructure via Gemini (Nécessite Entitlement AI_OPS + Rate limiter par tenant)
router.post(
  "/analyze-logs", 
  requireSubscriptionTier("pro"), 
  requireEntitlement("AI_OPS"),
  aiRateLimiter(600),
  validateRequest({ body: analyzeLogsSchema }), 
  analyzeLogs
);

// Analyse de télémétrie rapide (Nécessite Entitlement AI_OPS + Rate limiter par tenant)
router.post(
  "/analyze", 
  requireSubscriptionTier("silver"), 
  requireEntitlement("AI_OPS"),
  aiRateLimiter(250),
  analyzeTelemetry
);

export default router;
