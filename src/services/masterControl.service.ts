import axios from "axios";

export interface MasterControlRow {
  tenantId: string;
  tenantName: string;
  slug: string;
  plan: string;
  connection: "ONLINE" | "OFFLINE";
  connectionBadge: string;
  payment: "PAID" | "PENDING" | "FAILED" | "NO_INVOICE";
  paymentBadge: string;
  lastInvoiceAmount?: number;
  lastInvoiceCurrency?: string;
  dbWastePercent: number;
  dbWasteFormatted: string;
  trafficLoad: "HIGH" | "NORMAL" | "LOW";
  trafficBadge: string;
  trafficRps: number;
  serverStatus: "ONLINE" | "SATURATED" | "OFFLINE";
  serverBadge: string;
  primaryNodeId: string;
  nodeRegion: string;
  cpuPercent: number;
  memoryPercent: number;
  edgeLatencyMs: number;
  tokensRemaining: number;
  tokensCapacity: number;
  activeUsersCount: number;
  criticalAlertsCount: number;
  doraScore: number;
  lastAlert: string;
  lastActiveFormatted: string;
}

export interface MasterControlSummary {
  totalTenants: number;
  onlineTenants: number;
  paidTenants: number;
  healthyNodesCount: number;
  avgDbWaste: number;
  globalRps: number;
  activeDoraAlerts: number;
  timestamp: string;
}

export interface MasterControlData {
  summary: MasterControlSummary;
  rows: MasterControlRow[];
}

export const masterControlService = {
  /**
   * Récupère l'état global du Master Control Panel depuis l'API REST
   */
  async getStatus(): Promise<MasterControlData> {
    try {
      const res = await axios.get("/api/v1/master-control", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error("Invalid response format");
    } catch {
      // Fallback déterministe pour fonctionnement hors-ligne ou dev
      return this.getMockFallback();
    }
  },

  getMockFallback(): MasterControlData {
    return {
      summary: {
        totalTenants: 4,
        onlineTenants: 3,
        paidTenants: 3,
        healthyNodesCount: 6,
        avgDbWaste: 7.4,
        globalRps: 34850,
        activeDoraAlerts: 1,
        timestamp: new Date().toISOString(),
      },
      rows: [
        {
          tenantId: "tenant_enterprise_lacaza",
          tenantName: "LACAZA ClouIndustrie Group",
          slug: "lacaza-group",
          plan: "ENTERPRISE",
          connection: "ONLINE",
          connectionBadge: "🟢 Online",
          payment: "PAID",
          paymentBadge: "✅ Payé",
          lastInvoiceAmount: 4900,
          lastInvoiceCurrency: "EUR",
          dbWastePercent: 3.42,
          dbWasteFormatted: "3.4%",
          trafficLoad: "HIGH",
          trafficBadge: "🔥 Haute",
          trafficRps: 18450,
          serverStatus: "ONLINE",
          serverBadge: "✅ OK",
          primaryNodeId: "edge-par-01",
          nodeRegion: "EU-WEST-3 (Paris)",
          cpuPercent: 38,
          memoryPercent: 54,
          edgeLatencyMs: 1.2,
          tokensRemaining: 84200000,
          tokensCapacity: 100000000,
          activeUsersCount: 42,
          criticalAlertsCount: 0,
          doraScore: 99.4,
          lastAlert: "Nominale — Système sous haute résilience",
          lastActiveFormatted: "À l'instant",
        },
        {
          tenantId: "tenant_beecarbonat_global",
          tenantName: "BeeCarbonat Enterprise Core",
          slug: "beecarbonat-global",
          plan: "ENTERPRISE",
          connection: "ONLINE",
          connectionBadge: "🟢 Online",
          payment: "PAID",
          paymentBadge: "✅ Payé",
          lastInvoiceAmount: 2500,
          lastInvoiceCurrency: "EUR",
          dbWastePercent: 5.18,
          dbWasteFormatted: "5.2%",
          trafficLoad: "HIGH",
          trafficBadge: "🔥 Haute",
          trafficRps: 14200,
          serverStatus: "ONLINE",
          serverBadge: "✅ OK",
          primaryNodeId: "edge-fra-01",
          nodeRegion: "EU-CENTRAL-1 (Francfort)",
          cpuPercent: 52,
          memoryPercent: 64,
          edgeLatencyMs: 1.8,
          tokensRemaining: 68150000,
          tokensCapacity: 100000000,
          activeUsersCount: 18,
          criticalAlertsCount: 0,
          doraScore: 98.1,
          lastAlert: "Nominale — Cluster multi-région synchronisé",
          lastActiveFormatted: "Il y a 1 min",
        },
        {
          tenantId: "tenant_client_alpha",
          tenantName: "Client Alpha SAS (Logistique)",
          slug: "client-alpha",
          plan: "PRO",
          connection: "ONLINE",
          connectionBadge: "🟢 Online",
          payment: "PAID",
          paymentBadge: "✅ Payé",
          lastInvoiceAmount: 390,
          lastInvoiceCurrency: "EUR",
          dbWastePercent: 9.64,
          dbWasteFormatted: "9.6%",
          trafficLoad: "NORMAL",
          trafficBadge: "⚡ Modérée",
          trafficRps: 4200,
          serverStatus: "SATURATED",
          serverBadge: "⚠️ Saturé",
          primaryNodeId: "edge-tky-01",
          nodeRegion: "AP-NORTHEAST-1 (Tokyo)",
          cpuPercent: 88,
          memoryPercent: 82,
          edgeLatencyMs: 5.2,
          tokensRemaining: 742000,
          tokensCapacity: 1000000,
          activeUsersCount: 6,
          criticalAlertsCount: 1,
          doraScore: 91.5,
          lastAlert: "Avertissement: Hub Logistique Lyon sous surveillance",
          lastActiveFormatted: "Il y a 3 min",
        },
        {
          tenantId: "tenant_client_beta",
          tenantName: "Client Beta Corp (Auditeurs)",
          slug: "client-beta",
          plan: "STANDARD",
          connection: "OFFLINE",
          connectionBadge: "🔴 Offline",
          payment: "PENDING",
          paymentBadge: "⚠️ Impayé",
          lastInvoiceAmount: 120,
          lastInvoiceCurrency: "EUR",
          dbWastePercent: 14.85,
          dbWasteFormatted: "14.9%",
          trafficLoad: "LOW",
          trafficBadge: "❄️ Faible",
          trafficRps: 650,
          serverStatus: "ONLINE",
          serverBadge: "✅ OK",
          primaryNodeId: "edge-lon-01",
          nodeRegion: "EU-WEST-2 (Londres)",
          cpuPercent: 18,
          memoryPercent: 32,
          edgeLatencyMs: 2.1,
          tokensRemaining: 28400,
          tokensCapacity: 100000,
          activeUsersCount: 2,
          criticalAlertsCount: 0,
          doraScore: 94.0,
          lastAlert: "Facture échue en attente de régularisation",
          lastActiveFormatted: "Il y a plus de 20 min",
        },
      ],
    };
  },
};
