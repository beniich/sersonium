import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { metricsCollector } from "../services/metrics.service.js";
import { AuditService } from "../services/audit.service.js";

/**
 * Contrôleur d'Observabilité, Audits et Métriques Temps Réel
 */
export const getLiveMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const snapshot = metricsCollector.getSnapshot();
    const timeline = metricsCollector.getTimeline();

    res.status(200).json({
      success: true,
      data: {
        ...snapshot,
        timeline
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "METRICS_FETCH_FAILED", message: error.message }
    });
  }
};

export const getTenantAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 25;

    const result = await AuditService.getTenantAuditLogs(tenantPrisma, { page, limit });

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      meta: {
        tenantId: req.tenantId
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "AUDIT_FETCH_FAILED", message: error.message }
    });
  }
};

export const getPrometheusMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const snapshot = metricsCollector.getSnapshot();

    // Formatage texte standardisé OpenMetrics / Prometheus
    let text = `# HELP beecarbonat_http_requests_total Total number of HTTP requests\n`;
    text += `# TYPE beecarbonat_http_requests_total counter\n`;
    text += `beecarbonat_http_requests_total ${snapshot.http.totalRequests}\n\n`;

    text += `# HELP beecarbonat_http_avg_response_time_ms Average response time in ms\n`;
    text += `# TYPE beecarbonat_http_avg_response_time_ms gauge\n`;
    text += `beecarbonat_http_avg_response_time_ms ${snapshot.http.avgResponseTimeMs}\n\n`;

    text += `# HELP beecarbonat_process_uptime_seconds Process uptime in seconds\n`;
    text += `# TYPE beecarbonat_process_uptime_seconds counter\n`;
    text += `beecarbonat_process_uptime_seconds ${snapshot.uptimeSeconds}\n\n`;

    text += `# HELP beecarbonat_memory_heap_used_mb Memory Heap Used in MB\n`;
    text += `# TYPE beecarbonat_memory_heap_used_mb gauge\n`;
    text += `beecarbonat_memory_heap_used_mb ${snapshot.memoryUsage.heapUsedMb}\n\n`;

    text += `# HELP beecarbonat_security_auth_failures Security Auth Failures count\n`;
    text += `# TYPE beecarbonat_security_auth_failures counter\n`;
    text += `beecarbonat_security_auth_failures ${snapshot.security.authFailures}\n\n`;

    text += `# HELP beecarbonat_security_rate_limit_hits Rate limit blocks count\n`;
    text += `# TYPE beecarbonat_security_rate_limit_hits counter\n`;
    text += `beecarbonat_security_rate_limit_hits ${snapshot.security.rateLimitHits}\n`;

    res.set("Content-Type", "text/plain; version=0.0.4");
    res.status(200).send(text);
  } catch (error: any) {
    res.status(500).send(`# Error generating prometheus metrics: ${error.message}`);
  }
};
