import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { metricsCollector } from "../services/metrics.service.js";

export interface AuditRecord {
  timestamp: string;
  method: string;
  path: string;
  userId: string | "anonymous";
  tenantId: string | "public";
  role: string | "none";
  ip: string;
  statusCode: number;
  durationMs: number;
  userAgent?: string;
}

/**
 * Audit Middleware & Observability Collector
 * - Trace chaque transaction de manière structurée
 * - Alimente le collecteur de métriques temps réel (Prometheus/Grafana ready)
 */
export const auditMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const finishActiveConn = metricsCollector.recordRequestStart();

  res.on("finish", () => {
    finishActiveConn();
    const durationMs = Date.now() - startTime;

    // 1. Enregistrement télémétrie HTTP
    metricsCollector.recordRequest(req.method, res.statusCode, durationMs);

    // 2. Détection d'événements de sécurité
    if (res.statusCode === 401 || res.statusCode === 403) {
      metricsCollector.recordSecurityEvent("auth_failure");
    } else if (res.statusCode === 429) {
      metricsCollector.recordSecurityEvent("rate_limit_hit");
    }

    // 3. Log structuré JSON pour audit trail
    const auditEntry: AuditRecord = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl || req.url,
      userId: req.user?.userId || "anonymous",
      tenantId: req.tenantId || req.user?.tenantId || "public",
      role: req.user?.role || "none",
      ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1",
      statusCode: res.statusCode,
      durationMs,
      userAgent: req.headers["user-agent"]
    };

    if (process.env.NODE_ENV !== "test") {
      console.log(`[AUDIT] ${JSON.stringify(auditEntry)}`);
    }
  });

  next();
};
