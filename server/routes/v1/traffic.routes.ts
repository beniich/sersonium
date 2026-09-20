import { Router } from "express";
import { 
  recordTrafficLog, 
  getBandwidthUsage 
} from "../../controllers/traffic.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { recordTrafficLogSchema, bandwidthQuerySchema } from "../../schemas/traffic.schema.js";

const router = Router();

router.use(authenticateToken, requireTenant);

// Usage de la bande passante et latence (Focus Blueprint)
router.get("/bandwidth", validateRequest({ query: bandwidthQuerySchema }), getBandwidthUsage);

// Ingestion télémétrique Edge
router.post("/logs", validateRequest({ body: recordTrafficLogSchema }), recordTrafficLog);

export default router;
