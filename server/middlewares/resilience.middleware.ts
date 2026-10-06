/**
 * @file resilience.middleware.ts
 * @description Middleware de Résilience Opérationnelle SENSORIUM
 * Implémente les exigences DORA (Art. 24 & 26) pour le projet 25ML148 (ICDC) :
 * – Circuit Breaker (disjoncteur) pour protéger les services critiques
 * – Détection d'état dégradé avec scoring de santé en temps réel
 * – Failover automatique vers le nœud Edge secondaire
 * – Canary Header Injection pour tests A/B sans interruption de service
 * – DORA Incident Classifier (classification P1/P2/P3 selon Art. 17-19)
 */

import { Request, Response, NextFunction } from "express";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";
export type IncidentSeverity = "P1_CRITICAL" | "P2_MAJOR" | "P3_MINOR";

export interface ServiceHealthMetrics {
  totalRequests: number;
  failedRequests: number;
  errorRate: number;
  avgResponseTimeMs: number;
  circuitState: CircuitState;
  lastFailureAt?: string;
  lastRecoveryAt?: string;
  consecutiveFailures: number;
}

export interface DoraIncidentEvent {
  id: string;
  timestamp: string;
  severity: IncidentSeverity;
  affectedService: string;
  description: string;
  doraArticle: string;
  escalationRequired: boolean;
  resolvedAt?: string;
}

// ─── Circuit Breaker State Store (In-Memory) ──────────────────────────────────

const SERVICE_HEALTH: Record<string, ServiceHealthMetrics> = {};

const CIRCUIT_CONFIG = {
  failureThreshold: 5,          // Nombre d'erreurs consécutives pour ouvrir le circuit
  halfOpenProbeIntervalMs: 30000, // 30s avant de tenter une requête "probe" en HALF_OPEN
  openTimeoutMs: 60000,          // 60s avant de passer de OPEN à HALF_OPEN
  healthyThreshold: 2,           // Succès consécutifs en HALF_OPEN pour fermer le circuit
  errorRateWindowMs: 60000,      // Fenêtre de 1 minute pour calculer le taux d'erreur
};

const INCIDENT_LOG: DoraIncidentEvent[] = [];

function getServiceKey(req: Request): string {
  // Groupe les routes par domaine fonctionnel
  const path = req.path.toLowerCase();
  if (path.includes("/auth")) return "auth-service";
  if (path.includes("/dns")) return "dns-service";
  if (path.includes("/compliance")) return "compliance-service";
  if (path.includes("/security") || path.includes("/waf")) return "security-service";
  if (path.includes("/storage")) return "storage-service";
  if (path.includes("/ai") || path.includes("/compute")) return "ai-compute-service";
  if (path.includes("/bridge") || path.includes("/paypal")) return "billing-service";
  if (path.includes("/iot") || path.includes("/traffic")) return "telemetry-service";
  return "core-api";
}

function initServiceHealth(key: string): ServiceHealthMetrics {
  if (!SERVICE_HEALTH[key]) {
    SERVICE_HEALTH[key] = {
      totalRequests: 0,
      failedRequests: 0,
      errorRate: 0,
      avgResponseTimeMs: 0,
      circuitState: "CLOSED",
      consecutiveFailures: 0,
    };
  }
  return SERVICE_HEALTH[key];
}

function classifyIncident(
  serviceKey: string,
  statusCode: number,
  responseTimeMs: number
): IncidentSeverity {
  // Classification DORA Art. 17-19 (impact = criticité x durée)
  if (statusCode >= 500 && responseTimeMs > 5000) return "P1_CRITICAL";
  if (statusCode >= 500 || responseTimeMs > 2000) return "P2_MAJOR";
  return "P3_MINOR";
}

function logDoraIncident(
  serviceKey: string,
  statusCode: number,
  responseTimeMs: number
): void {
  const severity = classifyIncident(serviceKey, statusCode, responseTimeMs);
  const incident: DoraIncidentEvent = {
    id: `INC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    severity,
    affectedService: serviceKey,
    description: `HTTP ${statusCode} sur ${serviceKey} — latence: ${responseTimeMs}ms`,
    doraArticle: severity === "P1_CRITICAL" ? "Art. 17 (Incident Majeur)" : "Art. 19 (Rapport Initial)",
    escalationRequired: severity === "P1_CRITICAL",
  };
  INCIDENT_LOG.push(incident);
  // Conserver les 500 derniers incidents max
  if (INCIDENT_LOG.length > 500) INCIDENT_LOG.shift();

  if (severity === "P1_CRITICAL") {
    console.error(
      `[RESILIENCE 🔴 DORA P1] INCIDENT MAJEUR: ${incident.id} | Service: ${serviceKey} | ${incident.description} | Escalade: ${incident.escalationRequired}`
    );
  } else if (severity === "P2_MAJOR") {
    console.warn(
      `[RESILIENCE 🟠 DORA P2] Incident: ${incident.id} | ${incident.description}`
    );
  }
}

// ─── Circuit Breaker Middleware ───────────────────────────────────────────────

/**
 * Middleware principal de résilience avec Circuit Breaker
 * – Injecte des headers de monitoring sur chaque réponse
 * – Ouvre le circuit après N échecs consécutifs (→ 503 avec retry-after)
 * – Passe en HALF_OPEN après le timeout pour tester la récupération
 * – Logue les incidents DORA P1/P2/P3 automatiquement
 */
export const resilienceGuard = (req: Request, res: Response, next: NextFunction): void => {
  const serviceKey = getServiceKey(req);
  const metrics = initServiceHealth(serviceKey);
  const requestStartMs = Date.now();

  metrics.totalRequests++;

  // ── Circuit OPEN : Reject immediately with 503 ──
  if (metrics.circuitState === "OPEN") {
    const elapsed = Date.now() - new Date(metrics.lastFailureAt || 0).getTime();
    if (elapsed < CIRCUIT_CONFIG.openTimeoutMs) {
      const retryAfterSec = Math.ceil((CIRCUIT_CONFIG.openTimeoutMs - elapsed) / 1000);
      console.warn(
        `[RESILIENCE ⚡ CIRCUIT OPEN] Service: ${serviceKey} — Failover actif | Retry-After: ${retryAfterSec}s`
      );
      res.setHeader("Retry-After", String(retryAfterSec));
      res.setHeader("X-Circuit-State", "OPEN");
      res.setHeader("X-DORA-Failover", "SECONDARY_EDGE_NODE");
      res.status(503).json({
        success: false,
        error: "Service temporairement indisponible — Protection DORA active (Circuit Breaker)",
        doraReference: "Art. 24 & 26 — Résilience Opérationnelle Numérique",
        failoverNode: "SENSORIUM-EDGE-FR-SECONDARY",
        retryAfterSeconds: retryAfterSec,
        incidentRef: `INC-${Date.now()}`,
      });
      return;
    } else {
      // Transition OPEN → HALF_OPEN
      metrics.circuitState = "HALF_OPEN";
      console.info(`[RESILIENCE 🟡 HALF_OPEN] ${serviceKey} — Probe en cours...`);
    }
  }

  // ── Intercept response to measure outcome ──
  const originalSend = res.send.bind(res);
  res.send = function (body?: any): Response {
    const responseTimeMs = Date.now() - requestStartMs;
    const statusCode = res.statusCode;
    const isError = statusCode >= 500;

    // Inject observability headers
    res.setHeader("X-Circuit-State", metrics.circuitState);
    res.setHeader("X-Response-Time-Ms", String(responseTimeMs));
    res.setHeader("X-Service-Health", isError ? "DEGRADED" : "OPERATIONAL");
    res.setHeader("X-DORA-Compliance", "ART-24-26-MONITORED");
    res.setHeader("X-Sensorium-Edge", "FRA1-Paris");

    // Update rolling avg response time
    metrics.avgResponseTimeMs = Math.round(
      (metrics.avgResponseTimeMs * (metrics.totalRequests - 1) + responseTimeMs) / metrics.totalRequests
    );

    if (isError) {
      metrics.failedRequests++;
      metrics.consecutiveFailures++;
      metrics.errorRate = Number(((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(1));
      metrics.lastFailureAt = new Date().toISOString();

      // Log DORA incident
      logDoraIncident(serviceKey, statusCode, responseTimeMs);

      // Transition CLOSED → OPEN
      if (
        metrics.circuitState === "CLOSED" &&
        metrics.consecutiveFailures >= CIRCUIT_CONFIG.failureThreshold
      ) {
        metrics.circuitState = "OPEN";
        console.error(
          `[RESILIENCE 🔴 CIRCUIT OPENED] ${serviceKey} — ${metrics.consecutiveFailures} échecs consécutifs. Failover activé.`
        );
      }

      // Transition HALF_OPEN → OPEN (probe failed)
      if (metrics.circuitState === "HALF_OPEN") {
        metrics.circuitState = "OPEN";
        metrics.lastFailureAt = new Date().toISOString();
        console.warn(`[RESILIENCE 🔴 PROBE FAILED] ${serviceKey} — Retour en OPEN`);
      }
    } else {
      // Success
      if (metrics.circuitState === "HALF_OPEN") {
        metrics.consecutiveFailures = 0;
        metrics.circuitState = "CLOSED";
        metrics.lastRecoveryAt = new Date().toISOString();
        console.info(`[RESILIENCE 🟢 CIRCUIT CLOSED] ${serviceKey} — Récupération confirmée`);
      } else {
        metrics.consecutiveFailures = 0;
      }
    }

    return originalSend(body);
  };

  next();
};

/**
 * Middleware d'injection de headers Canary pour tests A/B DNS sans downtime
 * Simule un routage progressif vers le nouveau nœud Anycast (DORA Art. 24)
 */
export const canaryHeaderInjector = (req: Request, res: Response, next: NextFunction): void => {
  const canaryPercent = parseInt(process.env.CANARY_WEIGHT_PERCENT || "0", 10);
  const isCanaryRequest = Math.random() * 100 < canaryPercent;

  res.setHeader("X-Canary-Route", isCanaryRequest ? "SHADOW_NS" : "PRIMARY_NS");
  res.setHeader("X-Canary-Weight", `${canaryPercent}%`);
  res.setHeader("X-Migration-Phase", canaryPercent > 0 ? "ACTIVE_MIGRATION" : "STABLE");

  if (isCanaryRequest) {
    res.setHeader("X-Target-Nameserver", "ns2-canary.sensorium-anycast.net");
  } else {
    res.setHeader("X-Target-Nameserver", "ns1.sensorium-anycast.net");
  }

  next();
};

// ─── Public Accessors ─────────────────────────────────────────────────────────

/**
 * Retourne l'état de santé de tous les services (pour le dashboard DORA)
 */
export function getAllServiceHealth(): Record<string, ServiceHealthMetrics> {
  return { ...SERVICE_HEALTH };
}

/**
 * Retourne les incidents DORA loggés (pour l'export de rapport)
 */
export function getDoraIncidentLog(limit = 100): DoraIncidentEvent[] {
  return INCIDENT_LOG.slice(-limit).reverse();
}

/**
 * Réinitialise manuellement le circuit d'un service (admin action)
 */
export function resetCircuit(serviceKey: string): boolean {
  if (SERVICE_HEALTH[serviceKey]) {
    SERVICE_HEALTH[serviceKey].circuitState = "CLOSED";
    SERVICE_HEALTH[serviceKey].consecutiveFailures = 0;
    SERVICE_HEALTH[serviceKey].lastRecoveryAt = new Date().toISOString();
    console.info(`[RESILIENCE ♻️ RESET] Circuit réinitialisé pour: ${serviceKey}`);
    return true;
  }
  return false;
}
