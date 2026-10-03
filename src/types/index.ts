export interface TelemetryMetrics {
  energyDeltaPercent: number;
  ashraeBaselineKwh: number;
  currentLoadKwh: number;
  copFactor: number;
  healthScore: number;
  carbonAbatedTco2e: number;
  activeEdgeNodes: number;
  ingestionRps: number;
  edgeLatencyMs: number;
}

export interface SpatialNode {
  id: string;
  name: string;
  category: 'CVC' | 'WATER' | 'IAQ' | 'LIGHTING';
  floor: number;
  floorName: string;
  coords: [number, number, number]; // [x, y, z]
  metricLabel: string;
  metricValue: string;
  status: 'OPTIMAL' | 'ADVISORY' | 'ALERT';
  description: string;
}

export interface WorkOrder {
  id: string;
  asset: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED';
  assignedTo: string;
  slaHoursRemaining: number;
  category: string;
  detectedBy: string;
  timestamp: string;
}

export interface GeminiDiagnosis {
  healthScore: number;
  breakdownProbability30d: string;
  copCurrent: number;
  copExpected: number;
  status: 'OPTIMAL' | 'NOMINAL_WITH_ADVISORY' | 'WARNING' | 'CRITICAL';
  anomalyDetected: boolean;
  rootCauseAnalysis: string;
  prescriptiveActions: string[];
  estimatedEnergySavingsKwhPerMonth: number;
  workOrderRecommended?: {
    title: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    suggestedParts: string[];
    requiredSkill: string;
  };
  summary: string;
}

export interface ValveState {
  id: string;
  name: string;
  isOpen: boolean;
  pressureBar: number;
  flowLpm: number;
  acousticAnomalyIndex: number;
  lastAction: string;
}

export interface LightingState {
  lux: number;
  cctKelvin: number;
  circadianActive: boolean;
  daliZones: {
    atrium: { power: number; state: string };
    offices: { power: number; state: string };
    plantRoom: { power: number; state: string };
    parking: { power: number; state: string };
  };
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'FACILITY_LEAD' | 'FIELD_TECHNICIAN' | 'CSRD_AUDITOR';
  organization: string;
}
