import { TenantPrismaClient } from "../db/tenantPrisma.js";

export class TrafficService {
  /**
   * Enregistre un log de transfert Edge
   */
  static async recordTrafficLog(
    tenantPrisma: TenantPrismaClient,
    data: {
      nodeId: string;
      region: string;
      bytesTransferred: number;
      latencyMs: number;
      statusCode?: number;
    }
  ) {
    return tenantPrisma.trafficLog.create({
      data: {
        nodeId: data.nodeId,
        region: data.region,
        bytesTransferred: data.bytesTransferred,
        latencyMs: data.latencyMs,
        statusCode: data.statusCode || 200
      } as any
    });
  }

  /**
   * Calcul de l'usage de la bande passante et latence moyenne (Pattern Blueprint)
   */
  static async getBandwidthUsage(
    tenantPrisma: TenantPrismaClient,
    timeRange: { start: Date },
    nodeId?: string
  ) {
    const whereClause: any = {
      timestamp: { gte: timeRange.start }
    };
    if (nodeId) {
      whereClause.nodeId = nodeId;
    }

    const [aggregate, nodeBreakdown] = await Promise.all([
      tenantPrisma.trafficLog.aggregate({
        where: whereClause,
        _sum: { bytesTransferred: true },
        _avg: { latencyMs: true },
        _count: { id: true }
      }),
      tenantPrisma.trafficLog.groupBy({
        by: ["nodeId", "region"],
        where: whereClause,
        _sum: { bytesTransferred: true },
        _avg: { latencyMs: true },
        _count: { id: true }
      })
    ]);

    const totalBytes = aggregate._sum.bytesTransferred || 0;
    const totalGigabytes = Math.round((totalBytes / (1024 * 1024 * 1024)) * 100) / 100;
    const avgLatencyMs = aggregate._avg.latencyMs ? Math.round(aggregate._avg.latencyMs * 10) / 10 : 0;

    return {
      period: {
        since: timeRange.start.toISOString(),
        until: new Date().toISOString()
      },
      summary: {
        totalRequests: aggregate._count.id,
        totalBytesTransferred: totalBytes,
        totalGigabytes,
        avgLatencyMs
      },
      nodes: nodeBreakdown.map(n => ({
        nodeId: n.nodeId,
        region: n.region,
        requests: n._count.id,
        bytesTransferred: n._sum.bytesTransferred || 0,
        gigabytesTransferred: Math.round(((n._sum.bytesTransferred || 0) / (1024 * 1024 * 1024)) * 100) / 100,
        avgLatencyMs: n._avg.latencyMs ? Math.round(n._avg.latencyMs * 10) / 10 : 0
      }))
    };
  }
}
