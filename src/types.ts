export type Status = "active" | "warning" | "critical" | "offline";

export interface TimeSeriesPoint {
  timestamp: string;
  requests: number;
  bandwidth: number;
  threats: number;
}

export interface EdgeNode {
  id: string;
  name: string;
  location: string;
  ip: string;
  status: Status;
  cpuUsage: number;
  ramUsage: number;
  bandwidth: number; // Mbps
  latency: number; // ms
  uptime: number; // percentage
  walletAddress: string; // CAFM integration
  budget: number;
  // Attached Metric Fields from Dashboard ERP
  lat?: number;
  lng?: number;
  category?: "cafm" | "stock" | "hr" | "edge";
  stockSku?: string;
  stockUnits?: number;
  stockCapacity?: number;
  teamLead?: string;
  teamMembers?: number;
  activeShift?: number;
  workOrderId?: string;
  workOrderTitle?: string;
  pue?: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  action: "block" | "challenge" | "log" | "allow";
  ruleId: string;
  path: string;
  userAgent: string;
}

export interface DNSRecord {
  id: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";
  name: string;
  content: string;
  proxied: boolean;
  ttl: string;
}

export interface WorkerScript {
  id: string;
  name: string;
  route?: string;
  routes?: string[];
  requests24h?: number;
  errors24h?: number;
  medianCpuTime?: number; // ms
  cpuTime?: string;
  status: "deployed" | "disabled" | "draft" | "active";
  lastModified?: string;
  lastDeployed?: string;
}

export interface MaintenanceChecklistItem {
  id: string;
  task: string;
  done: boolean;
  notes?: string;
  measuredValue?: string;
  nominalRange?: string;
}

export interface WorkOrderPartUsage {
  partId: string;
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface PreventiveSchedulePlan {
  id: string;
  name: string;
  assetCategory: "cooling" | "power" | "storage" | "network" | "all_racks";
  targetAssetTag: string; // e.g., "ALL_CRAC_UNITS", "RACK_A01_TO_A12", "UPS_INVERTERS"
  frequencyType: "calendar_monthly" | "calendar_quarterly" | "calendar_yearly" | "counter_hours" | "smart_sensor_threshold";
  counterIntervalHours?: number; // e.g., 2000 hours
  currentCounterHours?: number; // e.g., 1850 hours
  calendarIntervalDays?: number; // e.g. 90 days
  lastExecutedAt: string;
  nextDueDate: string;
  estimatedDurationMinutes: number;
  assignedTeam: string;
  priority: "p1" | "p2" | "p3" | "p4";
  checklistTemplate: { task: string; nominalRange?: string }[];
  sparePartsPreReservation?: { partId: string; quantity: number }[];
  active: boolean;
  autoDispatch: boolean;
}

export interface CAFMWorkOrder {
  id: string;
  nodeId: string;
  title: string;
  priority: "p1" | "p2" | "p3" | "p4"; 
  status: "open" | "investigating" | "resolved";
  assignedTo: string;
  createdAt: string;
  aiAnalysis?: string;
  scheduledDate?: string;
  interventionType?: "corrective" | "preventive_time" | "preventive_counter" | "improvement";
  operatingHoursAtFailure?: number;
  durationMinutes?: number;
  partsUsed?: WorkOrderPartUsage[];
  checklist?: MaintenanceChecklistItem[];
  digitalSignature?: {
    technicianName: string;
    signedAt: string;
    signatureNote?: string;
  };
}

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: "cooling" | "power" | "storage" | "network" | "mechanical" | "cables";
  quantityInStock: number;
  minThreshold: number;
  unitCost: number;
  locationWarehouse: string;
  leadTimeDays: number;
  compatibleAssets: string[];
  lastRestockedAt: string;
  supplier: string;
}

export interface AssetHierarchyItem {
  id: string;
  name: string;
  code: string;
  type: "site" | "building" | "datacenter" | "room" | "rack" | "asset" | "component";
  parentId?: string;
  status: "operational" | "warning" | "critical" | "maintenance";
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  installationDate?: string;
  warrantyExpiry?: string;
  contractSLA?: string;
  operatingHours?: number;
  pueRating?: number;
  assignedTechnician?: string;
  maintenanceCostTCO?: number;
  location?: string;
}

export interface WalletTransaction {
  id: string;
  nodeId: string;
  type: "utility_payment" | "maintenance_fee" | "budget_allocation" | "refund";
  amount: number;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  description: string;
  txHash: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  gdprStatus: "encrypted" | "logged" | "anonymized";
}

export interface ZTPolicy {
  id: string;
  name: string;
  action: "Allow" | "Block" | "Bypass" | "Service Auth";
  users: string;
  status: "Active" | "Inactive";
}

export interface StorageBucket {
  id: string;
  name: string;
  location: string;
  sizeGB: number;
  objects: number;
}

export interface StrategicObjective {
  id: string;
  title: string;
  description: string;
  period: string;
  status: "Draft" | "Active" | "Completed";
  priority: number;
  progress?: number;
}

export interface Kpi {
  id: string;
  objectiveId: string;
  name: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  frequency: string;
  source: "MANUAL" | "AUTOMATED";
  sourceKey?: string;
  history?: { timestamp: string; value: number }[];
}

export interface UrlRedirectRule {
  id: string;
  sourceDomain: string; // e.g. "lacaza.clouindustrie.com", "clouindustrie.com", "*"
  sourcePath: string; // e.g. "/shop", "/boutique", "/old-portal/*", "/app", "/login"
  targetUrl: string; // e.g. "https://lacaza.clouindustrie.com/checkout"
  statusCode: 301 | 302 | 307 | 308 | 200;
  preserveQueryString: boolean;
  matchType: "exact" | "prefix" | "regex" | "wildcard";
  enabled: boolean;
  hitCount: number;
  lastHitAt?: string;
  description: string;
  priority: number;
}

export interface DomainRoutingConfig {
  domain: string;
  tenantName: string;
  status: "active" | "provisioning" | "dns_pending";
  sslStatus: "active_strict" | "issued" | "renewing";
  forceHttps: boolean;
  hstsEnabled: boolean;
  canonicalRedirect: boolean;
  originServerIp: string;
  edgeWafActive: boolean;
}

export interface PayPalConfig {
  mode: "sandbox" | "live";
  clientId: string;
  clientSecretMasked: string;
  webhookId: string;
  merchantEmail: string;
  currency: "EUR" | "USD" | "GBP";
  instantCheckoutEnabled: boolean;
  autoRechargeThreshold: number;
  autoRechargeAmount: number;
  ipnListenerActive: boolean;
  smartButtonsTheme: "gold" | "blue" | "silver" | "black";
}

export interface PayPalPaymentRecord {
  id: string;
  orderId: string;
  payerEmail: string;
  payerName: string;
  amount: number;
  currency: string;
  planId?: string;
  description: string;
  status: "COMPLETED" | "PENDING" | "REFUNDED" | "DENIED";
  createdAt: string;
  paymentMethod: "paypal_balance" | "paypal_credit" | "card_via_paypal";
}

export interface RolePermission {
  id: string;
  roleName: string;
  description: string;
  usersCount: number;
  isSystem: boolean;
  permissions: {
    canManageUrlsAndRedirects: boolean;
    canManageDomains: boolean;
    canManagePayPal: boolean;
    canProcessPayments: boolean;
    canManageRoles: boolean;
    canManageGoogleAuth: boolean;
    canManageEdgeNetwork: boolean;
    canViewAuditLogs: boolean;
    canExecuteWAFMitigation: boolean;
  };
}

export interface TeamMemberWithPermissions {
  id: string;
  name: string;
  email: string;
  roleId: string;
  avatarUrl?: string;
  status: "active" | "invited" | "suspended";
  mfaEnabled: boolean;
  lastLoginAt: string;
  tenant: string;
}

export interface GoogleAuthConfig {
  enabled: boolean;
  clientId: string;
  clientSecretMasked: string;
  authorizedRedirectUris: string[];
  allowedDomains: string[];
  enforceHostedDomain: boolean;
  scopes: string[];
  promptMethod: "popup" | "redirect" | "one_tap";
  autoCreateUserAccount: boolean;
  defaultRoleId: string;
  lastVerifiedAt: string;
  dnsVerificationTxtRecord: string;
}

export type SubscriptionTier = "lite" | "pro";

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  description: string;
  badge?: string;
  features: string[];
  limitations?: string[];
  buttonText: string;
  isPopular?: boolean;
}

export interface GlobalState {
  trafficData: TimeSeriesPoint[];
  nodes: EdgeNode[];
  securityEvents: SecurityEvent[];
  dnsRecords: DNSRecord[];
  workers: WorkerScript[];
  workOrders: CAFMWorkOrder[];
  transactions: WalletTransaction[];
  auditLogs: AuditLog[];
  ztPolicies: ZTPolicy[];
  buckets: StorageBucket[];
  objectives?: StrategicObjective[];
  kpis?: Kpi[];
  urlRedirects?: UrlRedirectRule[];
  domainConfigs?: DomainRoutingConfig[];
  paypalConfig?: PayPalConfig;
  paypalTransactions?: PayPalPaymentRecord[];
  rolesAndPermissions?: RolePermission[];
  teamMembers?: TeamMemberWithPermissions[];
  googleAuthConfig?: GoogleAuthConfig;
  subscriptionTier?: SubscriptionTier;
  spareParts?: SparePart[];
  assetHierarchy?: AssetHierarchyItem[];
  preventivePlans?: PreventiveSchedulePlan[];
}
