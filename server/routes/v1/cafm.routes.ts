import { Router } from "express";
import { 
  recordTelemetry, 
  getAssetTelemetry, 
  predictAssetFailure,
  getDashboardSummary
} from "../../controllers/cafm.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { recordTelemetrySchema, predictFailureQuerySchema } from "../../schemas/cafm.schema.js";
import type { AuthenticatedRequest } from "../../types/auth.js";

const router = Router();

// Synthèse publique ou avec fallback tenant pour Dashboard Vision
router.get("/dashboard/summary", async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  // Si token présent on passe par auth, sinon on fallback tenant public/demo
  if (req.headers.authorization || req.cookies?.sensorium_access_token || req.cookies?.token) {
    authenticateToken(authReq, res, () => {
      requireTenant(authReq, res, () => getDashboardSummary(authReq as any, res));
    });
  } else {
    // Mode d'évaluation/démo tenant par défaut
    authReq.tenantId = "caisse-retraites-default";
    const { getTenantClient } = await import("../../db/tenantPrisma.js");
    authReq.tenantPrisma = getTenantClient(authReq.tenantId);
    getDashboardSummary(authReq as any, res);
  }
});

router.use(authenticateToken, requireTenant);

// Enregistrement télémétrie IoT d'équipement
router.post("/telemetry", validateRequest({ body: recordTelemetrySchema }), recordTelemetry);

// Récupération de l'historique télémétrique
router.get("/assets/:assetId/telemetry", getAssetTelemetry);

// Maintenance Prédictive (Calcul de tendance & probabilité de panne)
router.get(
  "/assets/:assetId/predict-failure", 
  validateRequest({ query: predictFailureQuerySchema }), 
  predictAssetFailure
);

export default router;
