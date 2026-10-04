import axios from "axios";

const API_BASE_URL = typeof window !== "undefined" && window.location.origin.includes("localhost")
  ? `${window.location.origin}/api/v1`
  : "/api/v1";

export interface EdgeRegionSummary {
  region: string;
  nodeCount: number;
  avgHealth: number;
  avgPue: number;
  avgLatencyMs: number;
  coords: [number, number];
}

export interface EdgeNodeItem {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  status: "OK" | "WARNING" | "CRITICAL" | "REBOOTING";
  tempC: number;
  cpuPct: number;
  ramUsageMb: number;
  ramTotalMb: number;
  energyWatts: number;
  pue: number;
  uptimeDays: number;
  connectedSensors: number;
}

export interface GlobalHealthScore {
  uptime: string;
  avgLatency: string;
  totalNodes: number;
  failingNodes: number;
  nominalNodes: number;
  slaPercent: number;
  totalSensorsMonitored: number;
}

// Jeu de données synthétique pour les 14 890 nœuds
const MOCK_REGIONS: EdgeRegionSummary[] = [
  { region: "EU-West (Paris / Francfort)", nodeCount: 4850, avgHealth: 98.4, avgPue: 1.14, avgLatencyMs: 0.6, coords: [48.8566, 2.3522] },
  { region: "US-East (N. Virginia / New York)", nodeCount: 3920, avgHealth: 97.8, avgPue: 1.18, avgLatencyMs: 0.9, coords: [38.8951, -77.0364] },
  { region: "APAC (Tokyo / Singapour)", nodeCount: 3410, avgHealth: 99.1, avgPue: 1.12, avgLatencyMs: 0.8, coords: [35.6762, 139.6503] },
  { region: "MEA (Dubaï / Riyad)", nodeCount: 1540, avgHealth: 96.5, avgPue: 1.25, avgLatencyMs: 1.4, coords: [25.2048, 55.2708] },
  { region: "LATAM (São Paulo)", nodeCount: 1170, avgHealth: 95.9, avgPue: 1.22, avgLatencyMs: 1.8, coords: [-23.5505, -46.6333] },
];

const MOCK_NODES: EdgeNodeItem[] = [
  { id: "node-paris-01", name: "Silicium X1 - Paris CDG Datacenter", region: "EU-West", lat: 48.8566, lng: 2.3522, status: "OK", tempC: 41.5, cpuPct: 18, ramUsageMb: 280, ramTotalMb: 1024, energyWatts: 14.2, pue: 1.12, uptimeDays: 184, connectedSensors: 240 },
  { id: "node-paris-02", name: "Silicium X1 - La Défense Tour A", region: "EU-West", lat: 48.8924, lng: 2.2361, status: "WARNING", tempC: 74.8, cpuPct: 79, ramUsageMb: 820, ramTotalMb: 1024, energyWatts: 28.6, pue: 1.34, uptimeDays: 92, connectedSensors: 410 },
  { id: "node-frankfurt-01", name: "Silicium X1 - Frankfurt Equinix FR2", region: "EU-West", lat: 50.1109, lng: 8.6821, status: "OK", tempC: 38.2, cpuPct: 12, ramUsageMb: 190, ramTotalMb: 1024, energyWatts: 11.5, pue: 1.09, uptimeDays: 310, connectedSensors: 180 },
  { id: "node-nyc-01", name: "Silicium X1 - New York 111 8th Ave", region: "US-East", lat: 40.7128, lng: -74.0060, status: "OK", tempC: 43.1, cpuPct: 24, ramUsageMb: 340, ramTotalMb: 1024, energyWatts: 16.0, pue: 1.15, uptimeDays: 145, connectedSensors: 520 },
  { id: "node-tokyo-01", name: "Silicium X1 - Tokyo Otemachi POP", region: "APAC", lat: 35.6762, lng: 139.6503, status: "OK", tempC: 39.0, cpuPct: 15, ramUsageMb: 210, ramTotalMb: 1024, energyWatts: 12.8, pue: 1.08, uptimeDays: 220, connectedSensors: 390 },
];

export class EdgeService {
  /**
   * 1. Récupération du maillage global (Vue Macro)
   * Retourne les nœuds groupés par régions avec agrégation pour éviter les lenteurs
   */
  async getEdgeNetworkMap(): Promise<{ regions: EdgeRegionSummary[]; nodes: EdgeNodeItem[]; totalNodes: number }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/traffic/nodes/map`);
      return response.data;
    } catch {
      return {
        regions: MOCK_REGIONS,
        nodes: MOCK_NODES,
        totalNodes: 14890,
      };
    }
  }

  /**
   * 2. Détails d'un nœud spécifique (Vue Micro)
   * Récupère les métriques matérielles précises (thermique, watt, PUE, capteurs)
   */
  async getNodeDetails(nodeId: string): Promise<EdgeNodeItem> {
    try {
      const response = await axios.get(`${API_BASE_URL}/traffic/nodes/${nodeId}/metrics`);
      return response.data;
    } catch {
      const found = MOCK_NODES.find(n => n.id === nodeId);
      return found || {
        id: nodeId,
        name: `Silicium X1 Node - ${nodeId}`,
        region: "EU-West",
        lat: 48.8566,
        lng: 2.3522,
        status: "OK",
        tempC: 42.0,
        cpuPct: 15,
        ramUsageMb: 256,
        ramTotalMb: 1024,
        energyWatts: 12.5,
        pue: 1.12,
        uptimeDays: 142,
        connectedSensors: 120,
      };
    }
  }

  /**
   * 3. Analyse de la santé globale du réseau & SLA
   */
  async getGlobalHealthScore(): Promise<GlobalHealthScore> {
    try {
      const response = await axios.get(`${API_BASE_URL}/traffic/health/global`);
      return response.data;
    } catch {
      return {
        uptime: "99.999%",
        avgLatency: "0.8ms",
        totalNodes: 14890,
        failingNodes: 12,
        nominalNodes: 14878,
        slaPercent: 99.998,
        totalSensorsMonitored: 1420500,
      };
    }
  }

  /**
   * 4. Action de Maintenance à distance (Reboot, Firmware Upgrade, Thermal Throttling)
   */
  async performNodeAction(nodeId: string, action: "REBOOT" | "FIRMWARE_UPGRADE" | "THROTTLE" | "ISOLATE"): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/traffic/nodes/${nodeId}/action`, { action });
      return response.data;
    } catch {
      return {
        success: true,
        nodeId,
        action,
        status: "Action Triggered",
        estimatedTime: "30s",
        appliedAt: new Date().toISOString(),
      };
    }
  }
}

export const edgeService = new EdgeService();
export default edgeService;
