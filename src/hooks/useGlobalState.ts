import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, setDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  GlobalState, 
  TimeSeriesPoint, 
  EdgeNode, 
  SecurityEvent, 
  DNSRecord, 
  WorkerScript, 
  CAFMWorkOrder, 
  ZTPolicy, 
  StorageBucket, 
  WalletTransaction, 
  AuditLog, 
  StrategicObjective, 
  Kpi,
  UrlRedirectRule,
  DomainRoutingConfig,
  PayPalConfig,
  PayPalPaymentRecord,
  RolePermission,
  TeamMemberWithPermissions,
  GoogleAuthConfig
} from '../types';

// Mock generation logic for seeding
export const generateTimeSeries = (): TimeSeriesPoint[] => {
  const data: TimeSeriesPoint[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    data.push({
      timestamp: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      requests: Math.floor(Math.random() * 50000) + 12000,
      bandwidth: +(Math.random() * 5 + 1.5).toFixed(2),
      threats: Math.floor(Math.random() * 850) + 50
    });
  }
  return data;
};

export const initialNodes: EdgeNode[] = [
  { 
    id: "fra-1", 
    name: "Frankfurt HyperHub", 
    location: "Frankfurt, DE", 
    ip: "192.168.1.1", 
    status: "active", 
    cpuUsage: 45, 
    ramUsage: 60, 
    bandwidth: 2400, 
    latency: 12, 
    uptime: 99.9, 
    walletAddress: "cf_0xA1", 
    budget: 1000,
    lat: 50.1109,
    lng: 8.6821,
    category: "cafm",
    stockSku: "SKU-PWR-12",
    stockUnits: 3880,
    stockCapacity: 42,
    teamLead: "A. Benali",
    teamMembers: 8,
    activeShift: 8,
    workOrderId: "WO-8924",
    workOrderTitle: "Firmware update for racks & UPS units",
    pue: 1.14
  },
  { 
    id: "cdg-2", 
    name: "Paris Core Datacenter", 
    location: "Paris, FR", 
    ip: "192.168.1.2", 
    status: "active", 
    cpuUsage: 32, 
    ramUsage: 45, 
    bandwidth: 1800, 
    latency: 18, 
    uptime: 99.95, 
    walletAddress: "cf_0xB2", 
    budget: 800,
    lat: 48.8566,
    lng: 2.3522,
    category: "stock",
    stockSku: "SKU-PRO-01",
    stockUnits: 18420,
    stockCapacity: 85,
    teamLead: "S. Dupont",
    teamMembers: 14,
    activeShift: 12,
    workOrderId: "WO-8921",
    workOrderTitle: "HVAC & HEPA Filter Calibration",
    pue: 1.11
  },
  { 
    id: "lyon-3", 
    name: "Lyon Tech Campus", 
    location: "Lyon, FR", 
    ip: "192.168.1.15", 
    status: "warning", 
    cpuUsage: 78, 
    ramUsage: 82, 
    bandwidth: 3100, 
    latency: 22, 
    uptime: 99.7, 
    walletAddress: "cf_0xLY", 
    budget: 1200,
    lat: 45.7640,
    lng: 4.8357,
    category: "cafm",
    stockSku: "SKU-IOT-88",
    stockUnits: 8250,
    stockCapacity: 92,
    teamLead: "M. Leroy",
    teamMembers: 18,
    activeShift: 16,
    workOrderId: "WO-8922",
    workOrderTitle: "B4 UPS Battery Replacement",
    pue: 1.25
  },
  { 
    id: "mrs-4", 
    name: "Marseille Logistics Hub", 
    location: "Marseille, FR", 
    ip: "192.168.1.24", 
    status: "active", 
    cpuUsage: 28, 
    ramUsage: 40, 
    bandwidth: 1600, 
    latency: 25, 
    uptime: 99.98, 
    walletAddress: "cf_0xMR", 
    budget: 950,
    lat: 43.2965,
    lng: 5.3698,
    category: "stock",
    stockSku: "SKU-NET-40",
    stockUnits: 12300,
    stockCapacity: 64,
    teamLead: "C. Martin",
    teamMembers: 6,
    activeShift: 5,
    workOrderId: "WO-8923",
    workOrderTitle: "Server rack sensor weatherproofing audit",
    pue: 1.09
  },
  { 
    id: "lhr-5", 
    name: "London Hub Gateway", 
    location: "London, UK", 
    ip: "192.168.1.3", 
    status: "warning", 
    cpuUsage: 85, 
    ramUsage: 90, 
    bandwidth: 4100, 
    latency: 45, 
    uptime: 99.5, 
    walletAddress: "cf_0xC3", 
    budget: 1500,
    lat: 51.5074,
    lng: -0.1276,
    category: "edge",
    stockSku: "SKU-NET-40",
    stockUnits: 5400,
    stockCapacity: 70,
    teamLead: "S. Dupont",
    teamMembers: 10,
    activeShift: 9,
    workOrderId: "wo-2",
    workOrderTitle: "Sustained high RAM load (>85%)",
    pue: 1.18
  },
  { 
    id: "iad-6", 
    name: "Ashburn Hyperscale Hub", 
    location: "Ashburn, US", 
    ip: "192.168.1.4", 
    status: "active", 
    cpuUsage: 55, 
    ramUsage: 50, 
    bandwidth: 3200, 
    latency: 85, 
    uptime: 99.99, 
    walletAddress: "cf_0xD4", 
    budget: 2000,
    lat: 39.0438,
    lng: -77.4875,
    category: "cafm",
    stockSku: "SKU-PRO-01",
    stockUnits: 9400,
    stockCapacity: 88,
    teamLead: "A. Benali",
    teamMembers: 12,
    activeShift: 10,
    workOrderId: "WO-8925",
    workOrderTitle: "Free-Cooling HVAC Supervision",
    pue: 1.08
  },
  { 
    id: "sin-7", 
    name: "Singapore Oceanic Node", 
    location: "Singapore, SG", 
    ip: "192.168.1.5", 
    status: "active", 
    cpuUsage: 68, 
    ramUsage: 72, 
    bandwidth: 2900, 
    latency: 140, 
    uptime: 99.8, 
    walletAddress: "cf_0xE5", 
    budget: 1200,
    lat: 1.3521,
    lng: 103.8198,
    category: "edge",
    stockSku: "SKU-IOT-88",
    stockUnits: 4100,
    stockCapacity: 75,
    teamLead: "M. Leroy",
    teamMembers: 8,
    activeShift: 7,
    workOrderId: "wo-1",
    workOrderTitle: "PUE optimization & airflow calibration",
    pue: 1.22
  },
  { 
    id: "tok-8", 
    name: "Tokyo HyperCore Datacenter", 
    location: "Tokyo, JP", 
    ip: "192.168.1.6", 
    status: "active", 
    cpuUsage: 38, 
    ramUsage: 54, 
    bandwidth: 3800, 
    latency: 110, 
    uptime: 99.98, 
    walletAddress: "cf_0xF6", 
    budget: 1800,
    lat: 35.6895,
    lng: 139.6917,
    category: "cafm",
    stockSku: "SKU-PWR-12",
    stockUnits: 6200,
    stockCapacity: 80,
    teamLead: "C. Martin",
    teamMembers: 15,
    activeShift: 14,
    pue: 1.12
  },
];

export const initialSecurityEvents: SecurityEvent[] = [
  { id: "evt-1", timestamp: new Date().toISOString(), ip: "192.168.1.45", country: "CN", action: "block", ruleId: "WAF-SQLi-01", path: "/login", userAgent: "curl/7.68.0" },
  { id: "evt-2", timestamp: new Date(Date.now() - 5000).toISOString(), ip: "10.0.0.8", country: "RU", action: "challenge", ruleId: "Bot-Mitigation", path: "/api/v1/auth", userAgent: "python-requests/2.25.1" },
  { id: "evt-3", timestamp: new Date(Date.now() - 15000).toISOString(), ip: "172.16.0.4", country: "BR", action: "log", ruleId: "Rate-Limit-API", path: "/api/v1/health", userAgent: "Mozilla/5.0" },
  { id: "evt-4", timestamp: new Date(Date.now() - 32000).toISOString(), ip: "45.134.20.12", country: "DE", action: "block", ruleId: "CVE-2024-X-ZeroDay", path: "/admin/upload", userAgent: "Go-http-client/1.1" },
  { id: "evt-5", timestamp: new Date(Date.now() - 58000).toISOString(), ip: "185.220.101.5", country: "US", action: "challenge", ruleId: "Tor-Exit-Node-Filter", path: "/checkout", userAgent: "Mozilla/5.0 (Windows NT 10.0; rv:109.0)" },
  { id: "evt-6", timestamp: new Date(Date.now() - 120000).toISOString(), ip: "103.251.167.2", country: "IN", action: "block", ruleId: "HTTP-Flood-Shield", path: "/graphql", userAgent: "Apache-HttpClient/4.5.13" },
];

export const initialDnsRecords: DNSRecord[] = [
  { id: "dns-1", type: "A", name: "enterprise.cafm.com", content: "104.18.2.1", proxied: true, ttl: "Auto" },
  { id: "dns-2", type: "CNAME", name: "api.cafm.com", content: "edge-router.cafm.net", proxied: true, ttl: "Auto" },
  { id: "dns-3", type: "CNAME", name: "cdn.cafm.com", content: "edge-cache.cafm.net", proxied: true, ttl: "Auto" },
  { id: "dns-4", type: "TXT", name: "cafm.com", content: "v=spf1 include:_spf.cafm.com ~all", proxied: false, ttl: "10 min" },
  { id: "dns-5", type: "MX", name: "cafm.com", content: "mail.cafm.com", proxied: false, ttl: "Auto" },
  { id: "dns-6", type: "AAAA", name: "ipv6.cafm.com", content: "2606:4700:4700::1111", proxied: true, ttl: "Auto" },
];

export const initialWorkers: WorkerScript[] = [
  { id: "wk-1", name: "auth-middleware", route: "api.cafm.com/*", requests24h: 1450400, errors24h: 110, medianCpuTime: 11.2, status: "deployed", lastModified: new Date().toISOString() },
  { id: "wk-2", name: "image-resizer-webp", route: "assets.cafm.com/images/*", requests24h: 920500, errors24h: 32, medianCpuTime: 38.4, status: "deployed", lastModified: new Date().toISOString() },
  { id: "wk-3", name: "geo-router-dns", route: "enterprise.cafm.com/*", requests24h: 68000, errors24h: 12, medianCpuTime: 7.9, status: "deployed", lastModified: new Date().toISOString() },
  { id: "wk-4", name: "ai-prompt-sanitizer", route: "api.cafm.com/v1/ai/*", requests24h: 312000, errors24h: 5, medianCpuTime: 14.6, status: "deployed", lastModified: new Date().toISOString() },
];

export const initialWorkOrders: CAFMWorkOrder[] = [
  { id: "wo-1", nodeId: "sin-5", title: "PUE optimization & airflow calibration", priority: "p2", status: "investigating", assignedTo: "NOC Fleet Team", createdAt: new Date(Date.now() - 86400000).toISOString(), aiAnalysis: "Thermal modeling predicts a 0.04 PUE efficiency gain via automated fan curve tuning." },
  { id: "wo-2", nodeId: "lhr-3", title: "Sustained high RAM load (>85%) - London Node", priority: "p1", status: "open", assignedTo: "Edge Ops", createdAt: new Date().toISOString(), aiAnalysis: "Continuous network socket buffer growth identified during peak traffic surge." },
  { id: "wo-3", nodeId: "fra-1", title: "Datacenter chiller unit preventive maintenance", priority: "p3", status: "resolved", assignedTo: "CAFM HVAC Team", createdAt: new Date(Date.now() - 172800000).toISOString(), scheduledDate: "2026-09-20", aiAnalysis: "HEPA filter replacement completed and compressor pressure nominal." },
];

export const initialZtPolicies: ZTPolicy[] = [
  { id: "ztp-1", name: "Engineering Zero Trust VPN", action: "Allow", users: "engineering@enterprise.cafm.com", status: "Active" },
  { id: "ztp-2", name: "Contractors & Maintenance Access", action: "Service Auth", users: "contractors@*", status: "Active" },
  { id: "ztp-3", name: "Block Obsolete Protocols (TLS < 1.3)", action: "Block", users: "*", status: "Active" },
  { id: "ztp-4", name: "Edge SOC Admin Console Access", action: "Allow", users: "admin@enterprise.cafm.com", status: "Active" },
];

export const initialBuckets: StorageBucket[] = [
  { id: "bkt-1", name: "cafm-assets-prod", location: "EU-West (Paris)", sizeGB: 1850.4, objects: 540120 },
  { id: "bkt-2", name: "logs-cold-storage", location: "US-East (Ashburn)", sizeGB: 9200.6, objects: 14500000 },
  { id: "bkt-3", name: "ml-training-datasets", location: "APAC (Tokyo)", sizeGB: 460.8, objects: 22400 },
  { id: "bkt-4", name: "daily-db-snapshots", location: "EU-Central (Frankfurt)", sizeGB: 3100.0, objects: 180 },
];

export const initialAuditLogs: AuditLog[] = [
  { id: "log-1", timestamp: new Date(Date.now() - 1800000).toISOString(), userId: "usr_admin", userEmail: "beniich.contact@gmail.com", action: "WAF_RULE_DEPLOY", details: "Deployed OWASP Core Rule Set v3.3 pack across all Edge nodes", ipAddress: "82.165.197.1", gdprStatus: "logged" },
  { id: "log-2", timestamp: new Date(Date.now() - 7200000).toISOString(), userId: "usr_ops", userEmail: "ops@enterprise.cafm.com", action: "NODE_PROVISION", details: "Provisioned Frankfurt Edge Node linked to CAFM wallet cf_0xA1", ipAddress: "192.168.1.1", gdprStatus: "encrypted" },
  { id: "log-3", timestamp: new Date(Date.now() - 14400000).toISOString(), userId: "usr_sec", userEmail: "sec@enterprise.cafm.com", action: "ZT_POLICY_CREATE", details: "Enforced mandatory hardware MFA for Engineering VPN access", ipAddress: "10.0.4.12", gdprStatus: "anonymized" },
  { id: "log-4", timestamp: new Date(Date.now() - 28800000).toISOString(), userId: "usr_cafm", userEmail: "billing@enterprise.cafm.com", action: "ENERGY_SETTLEMENT", details: "Automated billing settlement for Paris Datacenter PUE (1,200 Credits)", ipAddress: "192.168.1.2", gdprStatus: "logged" }
];

export const initialTransactions: WalletTransaction[] = [
  { id: "tx-1", nodeId: "fra-1", type: "budget_allocation", amount: 5000, status: "completed", timestamp: new Date(Date.now() - 86400000).toISOString(), description: "Quarterly reserve allocation for Edge compute capacity", txHash: "0x4b7e9a8f2c3d1e0b5a6c7d8e9f0a1b2c3d4e5f6a" },
  { id: "tx-2", nodeId: "cdg-2", type: "utility_payment", amount: 1200, status: "completed", timestamp: new Date(Date.now() - 43200000).toISOString(), description: "Electric power consumption & PUE 1.18 settlement", txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b" },
  { id: "tx-3", nodeId: "lhr-3", type: "maintenance_fee", amount: 850, status: "completed", timestamp: new Date(Date.now() - 21600000).toISOString(), description: "RAM module and thermal cooling maintenance service", txHash: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e" },
  { id: "tx-4", nodeId: "tok-6", type: "budget_allocation", amount: 3500, status: "completed", timestamp: new Date(Date.now() - 10800000).toISOString(), description: "Transpacific 10 Gbps backbone bandwidth reservation", txHash: "0x7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9a8b" }
];

export const initialObjectives: StrategicObjective[] = [
  { id: "obj-1", title: "Reduce Datacenter Carbon Footprint by 15%", description: "Optimize energy efficiency towards 1.15 PUE and transition to 100% renewable power.", period: "2025-2026", status: "Active", priority: 1, progress: 74 },
  { id: "obj-2", title: "Guarantee 99.99% Global Edge Availability", description: "Harden Edge network resilience against volumetric DDoS floods and BGP route leaks.", period: "2026", status: "Active", priority: 2, progress: 95 },
  { id: "obj-3", title: "Optimize Edge OPEX Infrastructure Costs", description: "Strict budget governance via CAFM smart contracts and automated micro-allocations.", period: "Q3 2026", status: "Active", priority: 3, progress: 58 }
];

export const initialKpis: Kpi[] = [
  { id: "kpi-1", objectiveId: "obj-1", name: "Monthly Average PUE", unit: "Ratio", targetValue: 1.15, currentValue: 1.18, frequency: "Daily", source: "AUTOMATED", sourceKey: "cafm.pue_average", history: Array.from({length: 14}).map((_, i) => ({ timestamp: new Date(Date.now() - i*86400000).toLocaleDateString([], { month: 'short', day: 'numeric' }), value: +(1.25 - (i * 0.005) + (Math.sin(i) * 0.01)).toFixed(3) })).reverse() },
  { id: "kpi-2", objectiveId: "obj-1", name: "Renewable Energy Share", unit: "%", targetValue: 100, currentValue: 88, frequency: "Monthly", source: "MANUAL" },
  { id: "kpi-3", objectiveId: "obj-2", name: "Global Uptime Availability", unit: "%", targetValue: 99.99, currentValue: 99.96, frequency: "Automated", source: "AUTOMATED", sourceKey: "traffic.uptime" },
  { id: "kpi-4", objectiveId: "obj-2", name: "WAF Threat Mitigation Time", unit: "ms", targetValue: 45, currentValue: 38, frequency: "Automated", source: "AUTOMATED", sourceKey: "waf.mitigation_time" },
  { id: "kpi-5", objectiveId: "obj-3", name: "Realized Edge Budget Spend", unit: "Credits", targetValue: 12000, currentValue: 6800, frequency: "Weekly", source: "AUTOMATED", sourceKey: "billing.spend" }
];

export const initialUrlRedirects: UrlRedirectRule[] = [
  {
    id: "redir-1",
    sourceDomain: "clouindustrie.com",
    sourcePath: "/lacaza/*",
    targetUrl: "https://lacaza.clouindustrie.com/$1",
    statusCode: 301,
    preserveQueryString: true,
    matchType: "prefix",
    enabled: true,
    hitCount: 128940,
    lastHitAt: new Date(Date.now() - 120000).toISOString(),
    description: "Canonical Apex Routing -> Official LACAZA Subdomain",
    priority: 1
  },
  {
    id: "redir-2",
    sourceDomain: "lacaza.clouindustrie.com",
    sourcePath: "/",
    targetUrl: "https://lacaza.clouindustrie.com/app/dashboard",
    statusCode: 302,
    preserveQueryString: true,
    matchType: "exact",
    enabled: true,
    hitCount: 48210,
    lastHitAt: new Date(Date.now() - 45000).toISOString(),
    description: "Home Redirect to Centralized Dashboard",
    priority: 2
  },
  {
    id: "redir-3",
    sourceDomain: "lacaza.clouindustrie.com",
    sourcePath: "/shop",
    targetUrl: "https://lacaza.clouindustrie.com/billing/checkout?gateway=paypal",
    statusCode: 301,
    preserveQueryString: true,
    matchType: "exact",
    enabled: true,
    hitCount: 34100,
    lastHitAt: new Date(Date.now() - 300000).toISOString(),
    description: "Online Store to PayPal Smart Checkout Gateway",
    priority: 3
  },
  {
    id: "redir-4",
    sourceDomain: "lacaza.clouindustrie.com",
    sourcePath: "/boutique/*",
    targetUrl: "https://lacaza.clouindustrie.com/billing/checkout",
    statusCode: 301,
    preserveQueryString: true,
    matchType: "wildcard",
    enabled: true,
    hitCount: 15430,
    lastHitAt: new Date(Date.now() - 900000).toISOString(),
    description: "Boutique alias forwarding to billing module",
    priority: 4
  },
  {
    id: "redir-5",
    sourceDomain: "lacaza.clouindustrie.com",
    sourcePath: "/auth/google",
    targetUrl: "https://lacaza.clouindustrie.com/auth/callback",
    statusCode: 302,
    preserveQueryString: true,
    matchType: "exact",
    enabled: true,
    hitCount: 9420,
    lastHitAt: new Date(Date.now() - 60000).toISOString(),
    description: "Google Identity Services OAuth Anchor Point",
    priority: 5
  },
  {
    id: "redir-6",
    sourceDomain: "lacaza.clouindustrie.com",
    sourcePath: "/api/legacy/*",
    targetUrl: "https://lacaza.clouindustrie.com/api/v1/*",
    statusCode: 308,
    preserveQueryString: true,
    matchType: "prefix",
    enabled: true,
    hitCount: 92040,
    lastHitAt: new Date(Date.now() - 15000).toISOString(),
    description: "Transparent Migration API v0 to Anycast API v1",
    priority: 6
  },
  {
    id: "redir-7",
    sourceDomain: "*",
    sourcePath: "/http-to-https",
    targetUrl: "https://lacaza.clouindustrie.com/",
    statusCode: 301,
    preserveQueryString: true,
    matchType: "wildcard",
    enabled: true,
    hitCount: 312000,
    lastHitAt: new Date(Date.now() - 5000).toISOString(),
    description: "Universal SSL HSTS 100% Encryption Enforcement",
    priority: 7
  }
];

export const initialDomainConfigs: DomainRoutingConfig[] = [
  {
    domain: "lacaza.clouindustrie.com",
    tenantName: "LACAZA ClouIndustrie Primary",
    status: "active",
    sslStatus: "active_strict",
    forceHttps: true,
    hstsEnabled: true,
    canonicalRedirect: true,
    originServerIp: "104.18.2.1 (Anycast Global Edge)",
    edgeWafActive: true
  },
  {
    domain: "clouindustrie.com",
    tenantName: "ClouIndustrie Apex Domain",
    status: "active",
    sslStatus: "issued",
    forceHttps: true,
    hstsEnabled: true,
    canonicalRedirect: true,
    originServerIp: "104.18.2.2 (Apex Edge)",
    edgeWafActive: true
  },
  {
    domain: "api.lacaza.clouindustrie.com",
    tenantName: "LACAZA Realtime API Gateway",
    status: "active",
    sslStatus: "active_strict",
    forceHttps: true,
    hstsEnabled: true,
    canonicalRedirect: false,
    originServerIp: "192.168.1.4 (Ashburn Core)",
    edgeWafActive: true
  }
];

export const initialPayPalConfig: PayPalConfig = {
  mode: "live",
  clientId: "BAA00dyc-fm10uZX1_VVXFtVsS1-VXdWR-MlnA1hPj65_Sn1KQ4g9QUSBPzmyL7NuwdAhm0Y6BZF_iYws0",
  clientSecretMasked: "EK_1••••••••••••••••••••••••••••••••9yW3",
  webhookId: "35E46678GU990015U",
  merchantEmail: "billing@sersonium.cloudindustrie.com",
  currency: "EUR",
  instantCheckoutEnabled: true,
  autoRechargeThreshold: 500,
  autoRechargeAmount: 2000,
  ipnListenerActive: true,
  smartButtonsTheme: "gold"
};

export const initialPayPalTransactions: PayPalPaymentRecord[] = [
  {
    id: "pp-tx-1",
    orderId: "PAYID-MN68912P449102",
    payerEmail: "finance@lacaza.clouindustrie.com",
    payerName: "LACAZA ClouIndustrie SARL",
    amount: 1499.00,
    currency: "EUR",
    planId: "plan-enterprise",
    description: "Enterprise CAFM Suite Subscription + Unlimited Edge Nodes",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    paymentMethod: "paypal_balance"
  },
  {
    id: "pp-tx-2",
    orderId: "PAYID-LK45129B772019",
    payerEmail: "treasury@cafm-europe.com",
    payerName: "CAFM Treasury SAS",
    amount: 500.00,
    currency: "EUR",
    description: "Wallet recharge: 10,000 AI compute & telemetry credits",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    paymentMethod: "card_via_paypal"
  },
  {
    id: "pp-tx-3",
    orderId: "PAYID-QX90184M330182",
    payerEmail: "devops@clouindustrie.com",
    payerName: "ClouIndustrie Dev Team",
    amount: 299.00,
    currency: "EUR",
    planId: "plan-pro",
    description: "Subscription Pack: Paris Core Regional Node (CDG-2)",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    paymentMethod: "paypal_balance"
  }
];

export const initialRolesAndPermissions: RolePermission[] = [
  {
    id: "role-super-admin",
    roleName: "Super Administrator (Root)",
    description: "Full irrevocable administrative access to entire LACAZA tenant, DNS, PayPal, WAF, and Zero-Trust policies.",
    usersCount: 1,
    isSystem: true,
    permissions: {
      canManageUrlsAndRedirects: true,
      canManageDomains: true,
      canManagePayPal: true,
      canProcessPayments: true,
      canManageRoles: true,
      canManageGoogleAuth: true,
      canManageEdgeNetwork: true,
      canViewAuditLogs: true,
      canExecuteWAFMitigation: true
    }
  },
  {
    id: "role-tenant-admin",
    roleName: "LACAZA Tenant Admin",
    description: "Complete administration of URLs, subdomains, payment gateways, and tenant accounts.",
    usersCount: 2,
    isSystem: false,
    permissions: {
      canManageUrlsAndRedirects: true,
      canManageDomains: true,
      canManagePayPal: true,
      canProcessPayments: true,
      canManageRoles: true,
      canManageGoogleAuth: true,
      canManageEdgeNetwork: true,
      canViewAuditLogs: true,
      canExecuteWAFMitigation: false
    }
  },
  {
    id: "role-finance-paypal",
    roleName: "Billing & PayPal Officer",
    description: "Management of PayPal credentials, wallet automated top-ups, invoices, and active subscriptions.",
    usersCount: 2,
    isSystem: false,
    permissions: {
      canManageUrlsAndRedirects: false,
      canManageDomains: false,
      canManagePayPal: true,
      canProcessPayments: true,
      canManageRoles: false,
      canManageGoogleAuth: false,
      canManageEdgeNetwork: false,
      canViewAuditLogs: true,
      canExecuteWAFMitigation: false
    }
  },
  {
    id: "role-network-ops",
    roleName: "Network & Traffic Engineer",
    description: "Configuration of 301/302 redirects, Anycast DNS edge routing, and cloud edge routing parameters.",
    usersCount: 3,
    isSystem: false,
    permissions: {
      canManageUrlsAndRedirects: true,
      canManageDomains: true,
      canManagePayPal: false,
      canProcessPayments: false,
      canManageRoles: false,
      canManageGoogleAuth: false,
      canManageEdgeNetwork: true,
      canViewAuditLogs: true,
      canExecuteWAFMitigation: true
    }
  },
  {
    id: "role-auditor",
    roleName: "Auditor & Compliance (Read-Only)",
    description: "Read-only access to operational telemetries, immutable cryptographic audit trails, and CSRD compliance reports.",
    usersCount: 1,
    isSystem: false,
    permissions: {
      canManageUrlsAndRedirects: false,
      canManageDomains: false,
      canManagePayPal: false,
      canProcessPayments: false,
      canManageRoles: false,
      canManageGoogleAuth: false,
      canManageEdgeNetwork: false,
      canViewAuditLogs: true,
      canExecuteWAFMitigation: false
    }
  }
];

export const initialTeamMembers: TeamMemberWithPermissions[] = [
  {
    id: "mbr-1",
    name: "Lead Administrator",
    email: "beniich.contact@gmail.com",
    roleId: "role-super-admin",
    status: "active",
    mfaEnabled: true,
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    tenant: "lacaza.clouindustrie.com"
  },
  {
    id: "mbr-2",
    name: "Yassine LACAZA Ops",
    email: "ops@lacaza.clouindustrie.com",
    roleId: "role-tenant-admin",
    status: "active",
    mfaEnabled: true,
    lastLoginAt: new Date(Date.now() - 14400000).toISOString(),
    tenant: "lacaza.clouindustrie.com"
  },
  {
    id: "mbr-3",
    name: "Finance Department",
    email: "billing@lacaza.clouindustrie.com",
    roleId: "role-finance-paypal",
    status: "active",
    mfaEnabled: true,
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    tenant: "lacaza.clouindustrie.com"
  },
  {
    id: "mbr-4",
    name: "NOC Network Operator",
    email: "noc@clouindustrie.com",
    roleId: "role-network-ops",
    status: "active",
    mfaEnabled: false,
    lastLoginAt: new Date(Date.now() - 259200000).toISOString(),
    tenant: "lacaza.clouindustrie.com"
  }
];

export const initialGoogleAuthConfig: GoogleAuthConfig = {
  enabled: true,
  clientId: "783660138806-cafm-lacaza-client.apps.googleusercontent.com",
  clientSecretMasked: "GOCSPX-••••••••••••92bF",
  authorizedRedirectUris: [
    "https://lacaza.clouindustrie.com/auth/google/callback",
    "https://lacaza.clouindustrie.com/__/auth/handler",
    "https://clouindustrie.com/auth/callback",
    "http://localhost:3000"
  ],
  allowedDomains: [
    "clouindustrie.com",
    "lacaza.clouindustrie.com",
    "gmail.com"
  ],
  enforceHostedDomain: false,
  scopes: ["openid", "email", "profile"],
  promptMethod: "popup",
  autoCreateUserAccount: true,
  defaultRoleId: "role-tenant-admin",
  lastVerifiedAt: "2026-09-16 10:45 UTC",
  dnsVerificationTxtRecord: "google-site-verification=lacaza-clouindustrie-dns-verify-2026-09"
};

export function getDefaultMockState(): GlobalState {
  return {
    trafficData: generateTimeSeries(),
    nodes: initialNodes,
    securityEvents: initialSecurityEvents,
    dnsRecords: initialDnsRecords,
    workers: initialWorkers,
    workOrders: initialWorkOrders,
    transactions: initialTransactions,
    auditLogs: initialAuditLogs,
    ztPolicies: initialZtPolicies,
    buckets: initialBuckets,
    objectives: initialObjectives,
    kpis: initialKpis,
    urlRedirects: initialUrlRedirects,
    domainConfigs: initialDomainConfigs,
    paypalConfig: initialPayPalConfig,
    paypalTransactions: initialPayPalTransactions,
    rolesAndPermissions: initialRolesAndPermissions,
    teamMembers: initialTeamMembers,
    googleAuthConfig: initialGoogleAuthConfig,
    subscriptionTier: (typeof window !== "undefined" && localStorage.getItem("sensorium_subscription_tier") as any) || "pro",
  };
}

export async function logAuditEvent(action: string, details: string) {
  try {
    const colRef = collection(db, "auditLogs");
    const docData: Omit<AuditLog, "id"> = {
      timestamp: new Date().toISOString(),
      userId: "usr_admin",
      userEmail: "beniich.contact@gmail.com",
      action,
      details,
      ipAddress: "192.168.1.100",
      gdprStatus: "logged"
    };
    await setDoc(doc(colRef), docData);
  } catch (e) {
    console.error("Failed to write audit log", e);
  }
}

export function useGlobalState(userId: string | null, isMockMode: boolean = false) {
  const [state, setState] = useState<GlobalState>(() => {
    if (isMockMode || !userId) {
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("cafm_mock_state");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
              return {
                ...getDefaultMockState(),
                ...parsed,
                urlRedirects: parsed.urlRedirects || initialUrlRedirects,
                domainConfigs: parsed.domainConfigs || initialDomainConfigs,
                paypalConfig: parsed.paypalConfig || initialPayPalConfig,
                paypalTransactions: parsed.paypalTransactions || initialPayPalTransactions,
                rolesAndPermissions: parsed.rolesAndPermissions || initialRolesAndPermissions,
                teamMembers: parsed.teamMembers || initialTeamMembers,
                googleAuthConfig: parsed.googleAuthConfig || initialGoogleAuthConfig,
              };
            }
          }
        } catch {
          // Ignore json parse failure
        }
      }
      return getDefaultMockState();
    }
    return {
      trafficData: generateTimeSeries(),
      nodes: [],
      securityEvents: [],
      dnsRecords: [],
      workers: [],
      workOrders: [],
      transactions: [],
      auditLogs: [],
      ztPolicies: [],
      buckets: [],
      objectives: initialObjectives,
      kpis: initialKpis,
      urlRedirects: initialUrlRedirects,
      domainConfigs: initialDomainConfigs,
      paypalConfig: initialPayPalConfig,
      paypalTransactions: initialPayPalTransactions,
      rolesAndPermissions: initialRolesAndPermissions,
      teamMembers: initialTeamMembers,
      googleAuthConfig: initialGoogleAuthConfig,
    };
  });

  const [loading, setLoading] = useState(!isMockMode && !!userId);

  // When in Mock Mode: live micro-fluctuations simulation (keeps graphs & nodes feeling alive)
  useEffect(() => {
    if (!isMockMode && !!userId) return;

    const interval = setInterval(() => {
      setState(prev => {
        // Slight fluctuation in requests & bandwidth on the latest point
        const trafficData = [...(prev.trafficData || [])];
        if (trafficData.length > 0) {
          const lastIdx = trafficData.length - 1;
          const deltaReq = Math.floor((Math.random() - 0.48) * 1200);
          const newReq = Math.max(10000, trafficData[lastIdx].requests + deltaReq);
          const deltaBw = +((Math.random() - 0.48) * 0.2).toFixed(2);
          const newBw = Math.max(1.0, +(trafficData[lastIdx].bandwidth + deltaBw).toFixed(2));
          trafficData[lastIdx] = {
            ...trafficData[lastIdx],
            requests: newReq,
            bandwidth: newBw
          };
        }

        // Slight live jitter on node CPU/RAM
        const nodes = (prev.nodes || []).map(node => {
          if (node.status === "offline") return node;
          const cpuJitter = Math.floor((Math.random() - 0.5) * 4);
          const newCpu = Math.min(99, Math.max(10, node.cpuUsage + cpuJitter));
          return {
            ...node,
            cpuUsage: newCpu,
          };
        });

        const updated = { ...prev, trafficData, nodes };
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isMockMode, userId]);

  // Save mock state changes to localStorage
  useEffect(() => {
    if (isMockMode || !userId) {
      try {
        localStorage.setItem("cafm_mock_state", JSON.stringify(state));
      } catch {
        // localStorage quota or private mode
      }
    }
  }, [state, isMockMode, userId]);

  // Firestore synchronization (when in Live Mode with authenticated user)
  useEffect(() => {
    if (isMockMode || !userId) {
      setLoading(false);
      return;
    }

    let unsubs: (() => void)[] = [];

    const setup = async () => {
      try {
        setLoading(true);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore connection timeout')), 3000)
        );

        await Promise.race([
          (async () => {
            const userNodesRef = collection(db, `users/${userId}/nodes`);
            const nodesSnap = await getDocs(userNodesRef);
            
            if (nodesSnap.empty) {
              console.log(`Seeding database for user ${userId}...`);
              const promises = [
                ...initialNodes.map(n => setDoc(doc(db, `users/${userId}/nodes`, n.id), n)),
                ...initialSecurityEvents.map(e => setDoc(doc(db, `users/${userId}/securityEvents`, e.id), e)),
                ...initialDnsRecords.map(d => setDoc(doc(db, `users/${userId}/dnsRecords`, d.id), d)),
                ...initialWorkers.map(w => setDoc(doc(db, `users/${userId}/workers`, w.id), w)),
                ...initialWorkOrders.map(w => setDoc(doc(db, `users/${userId}/workOrders`, w.id), w)),
                ...initialZtPolicies.map(z => setDoc(doc(db, `users/${userId}/ztPolicies`, z.id), z)),
                ...initialBuckets.map(b => setDoc(doc(db, `users/${userId}/buckets`, b.id), b)),
                ...initialAuditLogs.map(a => setDoc(doc(db, `users/${userId}/auditLogs`, a.id), a)),
                ...initialTransactions.map(t => setDoc(doc(db, `users/${userId}/transactions`, t.id), t)),
              ];
              await Promise.all(promises);
            }
          })(),
          timeoutPromise
        ]);

        const cols = [
          'nodes', 'securityEvents', 'dnsRecords', 'workers', 
          'workOrders', 'ztPolicies', 'buckets', 'auditLogs', 'transactions'
        ];

        cols.forEach(colName => {
          const q = query(collection(db, `users/${userId}/${colName}`));
          const unsub = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
            setState(prev => ({ ...prev, [colName]: items }));
          });
          unsubs.push(unsub);
        });

        setLoading(false);
      } catch (err) {
        console.warn("Firestore setup failed, using offline mock data:", err);
        setState(getDefaultMockState());
        setLoading(false);
      }
    };

    setup();

    return () => {
      unsubs.forEach(u => u());
    };
  }, [userId, isMockMode]);

  // Simulation Triggers for Mock Mode
  const simulateTrafficSpike = () => {
    setState(prev => {
      const now = new Date();
      const newPoint: TimeSeriesPoint = {
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        requests: Math.floor(Math.random() * 40000) + 75000,
        bandwidth: +(Math.random() * 6 + 7.5).toFixed(2),
        threats: Math.floor(Math.random() * 2500) + 1200
      };
      const trafficData = [...(prev.trafficData || []).slice(1), newPoint];
      return { ...prev, trafficData };
    });
  };

  const simulateSecurityIncident = () => {
    setState(prev => {
      const newEvent: SecurityEvent = {
        id: `evt-sim-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ip: `${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country: ["RU", "CN", "BR", "US", "DE", "IR"][Math.floor(Math.random() * 6)],
        action: "block",
        ruleId: "DDoS-L7-Volumetric-Mitigation",
        path: "/api/v1/auth/token",
        userAgent: "Mirai-Botnet-Probe/2.4"
      };
      return {
        ...prev,
        securityEvents: [newEvent, ...(prev.securityEvents || [])].slice(0, 15)
      };
    });
  };

  const simulateNodeAlert = () => {
    setState(prev => {
      const nodes = (prev.nodes || []).map((node, idx) => {
        if (idx === 1) { // Paris Core
          return {
            ...node,
            status: "warning" as const,
            cpuUsage: 94,
            ramUsage: 91,
            latency: 78
          };
        }
        return node;
      });
      return { ...prev, nodes };
    });
  };

  const resetMockData = () => {
    try {
      localStorage.removeItem("cafm_mock_state");
    } catch {
      // Ignore
    }
    setState(getDefaultMockState());
  };

  return {
    state,
    loading,
    isMock: isMockMode || !userId,
    simulateTrafficSpike,
    simulateSecurityIncident,
    simulateNodeAlert,
    resetMockData
  };
}

