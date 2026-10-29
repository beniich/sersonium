import { Router } from "express";
import { 
  getPolicies, 
  createPolicy, 
  deletePolicy, 
  evaluateAccess,
  evaluateTravel,
  getTravelAlerts,
  getTravelSessions
} from "../../controllers/zeroTrust.controller.js";
import { authenticateToken, requireRole } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createAccessPolicySchema, evaluateAccessSchema } from "../../schemas/zeroTrust.schema.js";

import { requireEntitlement } from "../../middlewares/subscriptionGate.middleware.js";

const router = Router();

router.use(authenticateToken, requireTenant);

// Évaluation d'accès (accessible aux services et utilisateurs)
router.post("/evaluate", validateRequest({ body: evaluateAccessSchema }), evaluateAccess);

// Impossible Travel Detection (Axe 3 Zero Trust)
router.post("/travel-check", evaluateTravel);
router.get("/travel-alerts", requireRole("admin", "operator", "auditor"), getTravelAlerts);
router.get("/travel-sessions", requireRole("admin", "auditor"), getTravelSessions);

// Liste des politiques (admins, auditeurs)
router.get("/policies", requireRole("admin", "auditor"), getPolicies);

// Création d'une politique (admin avec entitlement ZERO_TRUST_ADVANCED)
router.post(
  "/policies", 
  requireRole("admin"), 
  requireEntitlement("ZERO_TRUST_ADVANCED"),
  validateRequest({ body: createAccessPolicySchema }), 
  createPolicy
);

// Suppression d'une politique (admin avec entitlement ZERO_TRUST_ADVANCED)
router.delete("/policies/:id", requireRole("admin"), requireEntitlement("ZERO_TRUST_ADVANCED"), deletePolicy);

export default router;
