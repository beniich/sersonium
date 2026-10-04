import { TenantPrismaClient } from "../db/tenantPrisma.js";
import Redis from "ioredis";

// Interface pour un Point de Présence (PoP)
export interface EdgeNode {
  id: string;
  region: string;
  ip: string;
  status: "ONLINE" | "OFFLINE" | "SATURATED";
  currentLatency: number; // en ms
  load: number; // pourcentage 0-100%
}

// Simulation du parc de nœuds Edge mondials de SENSORIUM
const SIMULATED_EDGE_NODES: EdgeNode[] = [
  { id: "edge-par-01", region: "EU-WEST-3",      ip: "185.60.112.1",  status: "ONLINE",    currentLatency: 1.2, load: 32 },
  { id: "edge-fra-01", region: "EU-CENTRAL-1",   ip: "52.29.210.10",  status: "ONLINE",    currentLatency: 1.8, load: 55 },
  { id: "edge-lon-01", region: "EU-WEST-2",      ip: "35.176.50.20",  status: "ONLINE",    currentLatency: 2.1, load: 40 },
  { id: "edge-nyc-01", region: "US-EAST-1",      ip: "54.145.200.30", status: "ONLINE",    currentLatency: 3.5, load: 68 },
  { id: "edge-tky-01", region: "AP-NORTHEAST-1", ip: "52.198.80.40",  status: "SATURATED", currentLatency: 5.2, load: 91 },
  { id: "edge-sgp-01", region: "AP-SOUTHEAST-1", ip: "13.229.60.50",  status: "ONLINE",    currentLatency: 4.0, load: 22 },
];

// Heuristique simplifiée de routage géographique par préfixe d'IP
function inferNearestNodeFromIp(clientIp: string): EdgeNode {
  if (!clientIp || clientIp === "::1" || clientIp === "127.0.0.1") {
    return SIMULATED_EDGE_NODES[0]; // Loopback → Paris
  }
  const firstOctet = parseInt(clientIp.split(".")[0] || "185");
  if (firstOctet >= 1 && firstOctet <= 60) return SIMULATED_EDGE_NODES[3];   // USA
  if (firstOctet >= 61 && firstOctet <= 100) return SIMULATED_EDGE_NODES[4]; // Asie
  return SIMULATED_EDGE_NODES[0]; // Par défaut: EU-Paris
}

// Singleton Redis — utilise MOCK si REDIS_URL non défini
class RedisClient {
  private static instance: Redis | null = null;
  private static mockStore = new Map<string, string>();
  private static isMock = false;

  static get(): Redis | null {
    if (this.isMock) return null;
    if (!process.env.REDIS_URL) {
      this.isMock = true;
      console.warn("⚠️  REDIS_URL non défini — Redis opère en mode MOCK (Map mémoire).");
      return null;
    }
    if (!this.instance) {
      this.instance = new Redis(process.env.REDIS_URL, { lazyConnect: true, enableOfflineQueue: false });
      this.instance.on("error", (err) => {
        console.error("❌ Redis error:", err.message);
        this.instance = null;
        this.isMock = true;
      });
    }
    return this.instance;
  }

  static async getString(key: string): Promise<string | null> {
    const client = this.get();
    if (!client) return this.mockStore.get(key) ?? null;
    return client.get(key);
  }

  static async setString(key: string, value: string, ttlSeconds?: number) {
    const client = this.get();
    if (!client) { this.mockStore.set(key, value); return; }
    if (ttlSeconds) await client.set(key, value, "EX", ttlSeconds);
    else await client.set(key, value);
  }

  static async del(key: string) {
    const client = this.get();
    if (!client) { this.mockStore.delete(key); return; }
    await client.del(key);
  }

  static async smembers(key: string): Promise<string[]> {
    const client = this.get();
    if (!client) return SIMULATED_EDGE_NODES.map(n => n.id);
    return client.smembers(key);
  }
}

export class TrafficService {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. ROUTAGE ANYCAST — Détection du nœud le plus proche
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Retourne le nœud Edge optimal pour un client IP donné.
   * Utilise Redis comme cache L1 (TTL 1h) pour éviter le recalcul.
   */
  static async getNearestNode(clientIp: string): Promise<EdgeNode> {
    const cacheKey = `nearest_node:${clientIp}`;
    const cached = await RedisClient.getString(cacheKey);
    if (cached) return JSON.parse(cached);

    // Heuristique de routage — en production: appel à Cloudflare/AWS Global Accelerator
    let node = inferNearestNodeFromIp(clientIp);

    // Si le nœud sélectionné est saturé, on bascule sur le nœud EU de secours
    if (node.status === "SATURATED") {
      const fallback = SIMULATED_EDGE_NODES.find(n => n.status === "ONLINE" && n.load < 80);
      if (fallback) node = fallback;
    }

    await RedisClient.setString(cacheKey, JSON.stringify(node), 3600);
    return node;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. LOAD BALANCING — Redistribution dynamique du trafic
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Retourne les nœuds actifs triés par charge croissante pour un équilibrage optimal.
   */
  static getBalancedNodes(): EdgeNode[] {
    return SIMULATED_EDGE_NODES
      .filter(n => n.status === "ONLINE")
      .sort((a, b) => a.load - b.load);
  }

  /**
   * Simule une redirection de trafic et invalide le cache de routage.
   */
  static async optimizeRouting(nodeId: string, targetRegion: string) {
    await RedisClient.del(`nearest_node:*`);
    console.log(`🔀 Traffic redirected from [${nodeId}] → [${targetRegion}]`);
    return { success: true, message: `Traffic redirected from ${nodeId} to ${targetRegion}` };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. NETWORK MONITORING — Métriques de latence
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Retourne les métriques réseau globales de tous les nœuds Edge actifs.
   */
  static async getNetworkMetrics() {
    const activeNodes = SIMULATED_EDGE_NODES.filter(n => n.status !== "OFFLINE");
    return {
      timestamp: new Date().toISOString(),
      nodes: activeNodes.map(n => ({
        nodeId: n.id,
        region: n.region,
        status: n.status,
        latencyMs: n.currentLatency,
        loadPercent: n.load,
      })),
      globalHealth: activeNodes.some(n => n.currentLatency > 10 || n.load > 85) ? "DEGRADED" : "HEALTHY",
      averageLatencyMs: +(activeNodes.reduce((sum, n) => sum + n.currentLatency, 0) / activeNodes.length).toFixed(2),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. QoS — Priorisation de la bande passante
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Définit la priorité de trafic d'un tenant (ex: pour prioriser les alertes critiques).
   */
  static async setTrafficPriority(tenantId: string, priorityLevel: "LOW" | "MEDIUM" | "HIGH") {
    await RedisClient.setString(`qos:${tenantId}`, priorityLevel);
    return { tenantId, priorityLevel, applied: true };
  }

  static async getTrafficPriority(tenantId: string): Promise<"LOW" | "MEDIUM" | "HIGH"> {
    const val = await RedisClient.getString(`qos:${tenantId}`);
    return (val as "LOW" | "MEDIUM" | "HIGH") || "MEDIUM";
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. PERSISTANCE DB — Enregistrement des logs de trafic
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Enregistre un log de transfert Edge (horodaté, isolé par tenant via tenantPrisma).
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
   * Calcul de l'usage de la bande passante et latence moyenne (Pattern Blueprint).
   */
  static async getBandwidthUsage(
    tenantPrisma: TenantPrismaClient,
    timeRange: { start: Date },
    nodeId?: string
  ) {
    const whereClause: any = { timestamp: { gte: timeRange.start } };
    if (nodeId) whereClause.nodeId = nodeId;

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
      period: { since: timeRange.start.toISOString(), until: new Date().toISOString() },
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
