import { Router } from "express";
import { analyzeLogs, analyzeTelemetry } from "../../controllers/ai.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { analyzeLogsSchema } from "../../schemas/ai.schema.js";

const router = Router();

router.use(authenticateToken, requireTenant);

// Analyse de logs d'infrastructure via Gemini (Pattern Blueprint)
router.post("/analyze-logs", validateRequest({ body: analyzeLogsSchema }), analyzeLogs);

// Analyse de télémétrie rapide
router.post("/analyze", analyzeTelemetry);

export default router;
