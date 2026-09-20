import { Request, Response } from "express";
import os from "os";

export interface MetricBucket {
  timestamp: number;
  count: number;
  totalDurationMs: number;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  os: {
    cpuCores: number;
    cpuModel: string;
    loadAverage: number[];
    totalMemGb: number;
    freeMemGb: number;
    usedMemGb: number;
  };
  memoryUsage: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
    externalMb: number;
  };
  http: {
    totalRequests: number;
    statusCodes: Record<string, number>;
    requestsByMethod: Record<string, number>;
    avgResponseTimeMs: number;
    activeConnections: number;
  };
  security: {
    authFailures: number;
    crossTenantAttemptsBlocked: number;
    rateLimitHits: number;
  };
}

/**
 * Service d'Observabilité & Télémétrie en mémoire
 * Enregistre les compteurs Prometheus-ready et les séries temporelles légères.
 */
class MetricsCollector {
  private startTime = Date.now();
  private totalRequests = 0;
  private totalDurationMs = 0;
  private statusCodes: Record<string, number> = {};
  private requestsByMethod: Record<string, number> = {};
  private activeConnections = 0;

  // Compteurs d'incidents de sécurité
  private authFailures = 0;
  private crossTenantAttemptsBlocked = 0;
  private rateLimitHits = 0;

  // Fenêtres glissantes (5 dernières minutes, par tranche de 10s)
  private timelineBuckets: MetricBucket[] = [];

  constructor() {
    // Nettoyage régulier des anciens buckets
    setInterval(() => {
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      this.timelineBuckets = this.timelineBuckets.filter(b => b.timestamp > fiveMinAgo);
    }, 30 * 1000).unref();
  }

  public recordRequestStart(): () => void {
    this.activeConnections++;
    const start = Date.now();

    return () => {
      this.activeConnections = Math.max(0, this.activeConnections - 1);
    };
  }

  public recordRequest(method: string, statusCode: number, durationMs: number): void {
    this.totalRequests++;
    this.totalDurationMs += durationMs;

    // Status code breakdown
    const codeGroup = `${Math.floor(statusCode / 100)}xx`;
    this.statusCodes[statusCode.toString()] = (this.statusCodes[statusCode.toString()] || 0) + 1;
    this.statusCodes[codeGroup] = (this.statusCodes[codeGroup] || 0) + 1;

    // Method breakdown
    this.requestsByMethod[method] = (this.requestsByMethod[method] || 0) + 1;

    // Timeline bucket
    const bucketTime = Math.floor(Date.now() / 10000) * 10000;
    let bucket = this.timelineBuckets.find(b => b.timestamp === bucketTime);
    if (!bucket) {
      bucket = { timestamp: bucketTime, count: 0, totalDurationMs: 0 };
      this.timelineBuckets.push(bucket);
    }
    bucket.count++;
    bucket.totalDurationMs += durationMs;
  }

  public recordSecurityEvent(type: "auth_failure" | "cross_tenant_blocked" | "rate_limit_hit"): void {
    if (type === "auth_failure") this.authFailures++;
    if (type === "cross_tenant_blocked") this.crossTenantAttemptsBlocked++;
    if (type === "rate_limit_hit") this.rateLimitHits++;
  }

  public getSnapshot(): SystemMetrics {
    const mem = process.memoryUsage();
    const toMb = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;
    const toGb = (bytes: number) => Math.round((bytes / 1024 / 1024 / 1024) * 100) / 100;
    
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    return {
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      os: {
        cpuCores: os.cpus().length,
        cpuModel: os.cpus()[0]?.model || "Unknown CPU",
        loadAverage: os.loadavg(),
        totalMemGb: toGb(totalMem),
        freeMemGb: toGb(freeMem),
        usedMemGb: toGb(totalMem - freeMem)
      },
      memoryUsage: {
        rssMb: toMb(mem.rss),
        heapTotalMb: toMb(mem.heapTotal),
        heapUsedMb: toMb(mem.heapUsed),
        externalMb: toMb(mem.external)
      },
      http: {
        totalRequests: this.totalRequests,
        statusCodes: { ...this.statusCodes },
        requestsByMethod: { ...this.requestsByMethod },
        avgResponseTimeMs: this.totalRequests > 0 ? Math.round((this.totalDurationMs / this.totalRequests) * 10) / 10 : 0,
        activeConnections: this.activeConnections
      },
      security: {
        authFailures: this.authFailures,
        crossTenantAttemptsBlocked: this.crossTenantAttemptsBlocked,
        rateLimitHits: this.rateLimitHits
      }
    };
  }

  public getTimeline(): Array<{ timestamp: string; count: number; avgDurationMs: number }> {
    return this.timelineBuckets.map(b => ({
      timestamp: new Date(b.timestamp).toISOString(),
      count: b.count,
      avgDurationMs: b.count > 0 ? Math.round((b.totalDurationMs / b.count) * 10) / 10 : 0
    }));
  }
}

export const metricsCollector = new MetricsCollector();
