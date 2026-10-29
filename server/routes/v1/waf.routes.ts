import { Router } from "express";
import { 
  getWafEvents, 
  simulateSecurityChallenge, 
  getThreatIntelligence, 
  getBannedIps, 
  unbanIp 
} from "../../controllers/waf.controller.js";
import { authenticateToken, requireRole } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";

const router = Router();

router.use(authenticateToken, requireTenant);

// Consultation des menaces WAF (admins, auditeurs, opérateurs)
router.get("/events", requireRole("admin", "auditor", "operator"), getWafEvents);

// Threat Intelligence partagée inter-tenants et scores de menace
router.get("/threat-intelligence", requireRole("admin", "auditor", "operator"), getThreatIntelligence);

// Liste des adresses IP actuellement bannies
router.get("/banned-ips", requireRole("admin", "operator"), getBannedIps);

// Débannissement manuel d'une IP
router.post("/unban", requireRole("admin"), unbanIp);

// Déclenchement / Simulation de règle WAF
router.post("/challenge", requireRole("admin", "operator"), simulateSecurityChallenge);

export default router;
