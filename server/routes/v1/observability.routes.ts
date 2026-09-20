import { Router } from "express";
import { 
  getLiveMetrics, 
  getTenantAuditLogs, 
  getPrometheusMetrics 
} from "../../controllers/observability.controller.js";
import { authenticateToken, requireRole } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";

const router = Router();

// 1. Endpoint Prometheus (compatible scraping Kubernetes/Prometheus agent)
// Protégé par token ou header de supervision
router.get("/metrics/prometheus", getPrometheusMetrics);

// 2. Télémétrie en temps réel (accessible aux opérateurs et admins)
router.get("/metrics/live", getLiveMetrics);

// 3. Piste d'audit isolée par tenant (accessible aux admins et auditeurs)
router.get("/audit-logs", authenticateToken, requireTenant, requireRole("admin", "auditor", "operator"), getTenantAuditLogs);

export default router;
