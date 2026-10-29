import { Router } from "express";
import { 
  getLiveMetrics, 
  getTenantAuditLogs, 
  getPrometheusMetrics 
} from "../../controllers/observability.controller.js";
import { authenticateToken, requireRole } from "../../middlewares/auth.middleware.js";
import { requireTenant } from "../../middlewares/tenant.middleware.js";
import { AIService } from "../../services/ai.service.js";
import { RollupService, RollupInterval } from "../../services/rollup.service.js";

const router = Router();

// 1. Endpoint Prometheus (compatible scraping Kubernetes/Prometheus agent)
// Protégé par token ou header de supervision
router.get("/metrics/prometheus", getPrometheusMetrics);

// 2. Télémétrie en temps réel (accessible aux opérateurs et admins)
router.get("/metrics/live", getLiveMetrics);

// 3. Piste d'audit isolée par tenant (accessible aux admins et auditeurs)
router.get("/audit-logs", authenticateToken, requireTenant, requireRole("admin", "auditor", "operator"), getTenantAuditLogs);

// 4. État du Circuit Breaker IA Gemini (Observabilité de la résilience IA)
router.get("/circuit-status", authenticateToken, requireRole("admin", "operator"), (req, res) => {
  const status = AIService.getCircuitStatus();
  res.json({
    circuitBreaker: {
      service: "Google Gemini AI",
      state: status.state,
      failureCount: status.failureCount,
      lastFailureAt: status.lastFailureTime > 0 
        ? new Date(status.lastFailureTime).toISOString() 
        : null,
      isHealthy: status.state === "CLOSED",
    },
    timestamp: new Date().toISOString()
  });
});

// 5. Réinitialisation manuelle du Circuit Breaker (Action SRE / Master Control)
router.post("/circuit-reset", authenticateToken, requireRole("admin"), (req, res) => {
  const result = AIService.resetCircuit();
  res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString()
  });
});

// 6. Déclenchement forcé d'un rollup télémétrique (Action Master Control)
router.post("/rollup-force", authenticateToken, requireRole("admin", "operator"), async (req, res) => {
  try {
    const interval: RollupInterval = (req.body.interval as RollupInterval) || "MINUTE";
    const result = await RollupService.aggregate(interval);
    res.json({
      success: true,
      data: result,
      message: `Agrégation rollup ${interval} exécutée avec succès.`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "ROLLUP_FAILED", message: error.message }
    });
  }
});

// 7. Historique de télémétrie intelligent (Sélection automatique de la granularité)
router.get("/history", authenticateToken, requireTenant, async (req: any, res) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId || "default";
    const sensorId = (req.query.sensorId as string) || "sensor-cluster-main";
    const rangeDays = parseFloat((req.query.rangeDays as string) || "1");

    const history = await RollupService.getHistory(tenantId, sensorId, rangeDays);
    res.json({
      success: true,
      data: history,
      meta: {
        tenantId,
        sensorId,
        rangeDays,
        count: history.length,
        resolution: rangeDays <= 1 ? "RAW_HIGH_RES" : rangeDays <= 7 ? "ROLLUP_MINUTE" : rangeDays <= 30 ? "ROLLUP_HOUR" : "ROLLUP_DAY"
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "HISTORY_FETCH_FAILED", message: error.message }
    });
  }
});

export default router;
