import { Router } from "express";
import { 
  getPolicies, 
  createPolicy, 
  deletePolicy, 
  evaluateAccess 
} from "../../controllers/zeroTrust.controller.js";
import { authenticateToken, requireRole } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createAccessPolicySchema, evaluateAccessSchema } from "../../schemas/zeroTrust.schema.js";

const router = Router();

router.use(authenticateToken, requireTenant);

// Évaluation d'accès (accessible aux services et utilisateurs)
router.post("/evaluate", validateRequest({ body: evaluateAccessSchema }), evaluateAccess);

// Liste des politiques (admins, auditeurs)
router.get("/policies", requireRole("admin", "auditor"), getPolicies);

// Création d'une politique (admin uniquement)
router.post("/policies", requireRole("admin"), validateRequest({ body: createAccessPolicySchema }), createPolicy);

// Suppression d'une politique (admin uniquement)
router.delete("/policies/:id", requireRole("admin"), deletePolicy);

export default router;
