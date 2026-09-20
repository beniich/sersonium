import { Router } from "express";
import { getWafEvents, simulateSecurityChallenge } from "../../controllers/waf.controller.js";
import { authenticateToken, requireRole } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";

const router = Router();

router.use(authenticateToken, requireTenant);

// Consultation des menaces WAF (admins, auditeurs)
router.get("/events", requireRole("admin", "auditor", "operator"), getWafEvents);

// Déclenchement / Simulation de règle WAF
router.post("/challenge", requireRole("admin", "operator"), simulateSecurityChallenge);

export default router;
