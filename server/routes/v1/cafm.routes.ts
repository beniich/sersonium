import { Router } from "express";
import { 
  recordTelemetry, 
  getAssetTelemetry, 
  predictAssetFailure 
} from "../../controllers/cafm.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { recordTelemetrySchema, predictFailureQuerySchema } from "../../schemas/cafm.schema.js";

const router = Router();

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
