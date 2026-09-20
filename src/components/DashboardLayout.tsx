import React, { useState, useMemo } from "react";
import { 
  Activity, 
  Shield, 
  Globe, 
  Zap, 
  Server, 
  Database, 
  Users, 
  Settings, 
  Menu,
  Search,
  Download,
  Target,
  RotateCcw,
  Eye,
  LogIn,
  Layers,
  ChevronRight,
  ChevronDown,
  X,
  Compass,
  Cpu,
  Lock,
  Sparkles,
  SlidersHorizontal,
  FolderTree,
  Sun,
  Moon,
  Monitor,
  FileSpreadsheet,
  FileText,
  Wifi,
  WifiOff,
  Crown,
  Languages,
  Smartphone
} from "lucide-react";

import { useLanguage } from "../App";
import { generateInfrastructureReport, exportStrategicDashboardPDF, exportDashboardDataCSV } from "../utils/pdfGenerator";
import { logout } from "../firebase";
import SensoriumLogo from "./SensoriumLogo";
import QuickSetupDrawer from "./QuickSetupDrawer";
import SubscriptionPricingModal from "./SubscriptionPricingModal";

export interface SidebarServiceItem {
  id: string;
  label: string;
  page: string;
  badge?: string;
  badgeType?: "live" | "ia" | "svg" | "paypal" | "stream" | "fips" | "default";
  keywords?: string;
}

export interface SidebarServiceGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  items: SidebarServiceItem[];
}

export const SENSORIUM_SERVICE_SUITE: SidebarServiceGroup[] = [
  {
    id: "grp-overview",
    name: "Overview & ERP",
    icon: Layers,
    items: [
      { id: "ov-general", label: "Unified Dashboard & KPIs", page: "overview", badge: "Live", badgeType: "live", keywords: "cockpit metrics global home erp kpi dashboard" },
      { id: "ov-floorplan", label: "2D Building Floor Plan (CAFM)", page: "overview", badge: "2D SVG", badgeType: "svg", keywords: "floor plan campus datacenter svg rooms" },
      { id: "ov-map", label: "Global POP Map", page: "overview", keywords: "map geography nodes pop points presence" },
      { id: "ov-cafm", label: "CAFM & Space Management", page: "overview", keywords: "buildings maintenance facility management" },
      { id: "ov-stock", label: "Hardware Stock & Logistics", page: "overview", keywords: "inventory hardware spare parts sku stock" },
      { id: "ov-hr", label: "Personnel & On-Call Shifts", page: "overview", keywords: "teams technicians shifts schedule hr staff" },
      { id: "ov-telemetry", label: "Global Telemetry", page: "overview", keywords: "streams bandwidth latency health telemetry" }
    ]
  },
  {
    id: "grp-compute",
    name: "Silicon & Edge Compute",
    icon: Cpu,
    items: [
      { id: "com-mon", label: "Silicon CPU / RAM Monitoring", page: "compute", badge: "Live", badgeType: "live", keywords: "cpu memory load processors thermal hardware" },
      { id: "com-grnd", label: "Grounded AI Assistant (Gemini)", page: "compute", badge: "AI", badgeType: "ia", keywords: "artificial intelligence assistant grounded gemini ai" },
      { id: "com-1", label: "Edge Workers (V8 Isolates)", page: "compute", keywords: "serverless v8 isolate functions microservices workers" },
      { id: "com-2", label: "KV Storage (Key-Value)", page: "compute", keywords: "key value ultra fast storage distributed cache kv" },
      { id: "com-3", label: "Durable Objects (Stateful)", page: "compute", keywords: "durable objects persistent state coordination stateful" },
      { id: "com-4", label: "Neural AI Inference (INT4)", page: "compute", badge: "AI", badgeType: "ia", keywords: "llm slm local inference neural models int4" },
      { id: "com-5", label: "Vectorize (HNSW Embeddings)", page: "compute", keywords: "vectors embeddings semantic search index vectorize" },
      { id: "com-6", label: "Async Queues", page: "compute", keywords: "queues async messages buffering" },
      { id: "com-7", label: "Hyperdrive (SQL Acceleration)", page: "compute", keywords: "sql pool hyperdrive latency database cache" }
    ]
  },
  {
    id: "grp-infrastructure",
    name: "Infrastructure (CAFM)",
    icon: Server,
    items: [
      { id: "cmms-preventive", label: "Preventive Tour Scheduler", page: "infrastructure", badge: "Auto", badgeType: "ia", keywords: "preventive tour scheduler gmao tours tournees maintenance heures compteurs planificateur" },
      { id: "cmms-mobile", label: "Mobile Field Tech (GMAO)", page: "infrastructure", badge: "App", badgeType: "ia", keywords: "mobile technician field gmao ots scan qr barcode orders parts" },
      { id: "inf-floorplan", label: "2D Server Room Plan", page: "infrastructure", badge: "2D SVG", badgeType: "svg", keywords: "server room racks bays plan svg floorplan" },
      { id: "inf-geo", label: "Global Site Map", page: "infrastructure", keywords: "points presence geolocation pop sites" },
      { id: "inf-1", label: "Edge Nodes & X1 Racks", page: "infrastructure", keywords: "racks edge nodes physical servers hardware" },
      { id: "inf-2", label: "IoT Sensors & Metrics", page: "infrastructure", keywords: "temperature humidity iot probes telemetry sensors" },
      { id: "inf-stream", label: "Event Stream Ingestion", page: "infrastructure", keywords: "event streaming pipeline ingestion" },
      { id: "cmms-inventory", label: "Spare Parts & Stock (GMAO)", page: "infrastructure", badge: "Stock", badgeType: "live", keywords: "stock inventory spare parts warehouse sku pieces rechange logistique" },
      { id: "cmms-hierarchy", label: "Asset Hierarchy & Fiche de Vie", page: "infrastructure", badge: "Tree", badgeType: "default", keywords: "asset hierarchy tree topology arborescence equipment sheet lifecycle" },
      { id: "cmms-kpi", label: "Reliability KPIs (MTBF / MTTR)", page: "infrastructure", badge: "KPI", badgeType: "live", keywords: "mtbf mttr reliability kpis availability tco gmao cmms performance" },
      { id: "inf-3", label: "Work Orders (CMMS)", page: "infrastructure", keywords: "work orders interventions maintenance tickets gmao" },
      { id: "inf-4", label: "Hardware Assets & PUE", page: "infrastructure", keywords: "pue energy efficiency hardware inventory assets" },
      { id: "inf-5", label: "Datacenter Ops & HVAC", page: "infrastructure", keywords: "cooling hvac air conditioning energy ops" },
      { id: "inf-6", label: "AI Predictive Maintenance", page: "infrastructure", badge: "AI", badgeType: "ia", keywords: "ai predictive failures anomaly detection" }
    ]
  },
  {
    id: "grp-network",
    name: "Anycast Network & Routing",
    icon: Globe,
    items: [
      { id: "net-1", label: "Global Anycast & DNS Zone", page: "network", keywords: "dns records a aaaa cname anycast route" },
      { id: "net-redirects", label: "URL Redirects & Mappings", page: "network", keywords: "redirects urls 301 302 canonical lacaza" },
      { id: "net-2", label: "Geo-DNS Routing & Latency", page: "network", keywords: "geographic routing geoip latency" },
      { id: "net-3", label: "Load Balancing & Failover", page: "network", keywords: "load balancing failover traffic distribution" },
      { id: "net-4", label: "Edge Cache Rules & TTL", page: "network", keywords: "caching purge ttl edge cache rules" },
      { id: "net-5", label: "Hierarchical Tiered Cache", page: "network", keywords: "hierarchical tiered cache backbone" },
      { id: "net-6", label: "Argo Smart Routing", page: "network", keywords: "argo smart routing transit network highway" },
      { id: "net-7", label: "Spectrum L4 TCP/UDP Proxy", page: "network", keywords: "spectrum layer 4 proxy gaming ssh raw tcp udp" },
      { id: "net-8", label: "Domains & Strict SSL", page: "network", keywords: "tls ssl certificates https strict hsts domains" }
    ]
  },
  {
    id: "grp-security",
    name: "Cybersecurity & WAF",
    icon: Shield,
    items: [
      { id: "sec-1", label: "WAF & DDoS Events", page: "security", badge: "Live", badgeType: "live", keywords: "waf ddos attacks blocks security logs" },
      { id: "sec-2", label: "Custom Firewall Rules", page: "security", keywords: "firewall expressions ip rules filtering" },
      { id: "sec-3", label: "Bot Management & Mitigation", page: "security", keywords: "bots scrapers captcha mitigation" },
      { id: "sec-4", label: "Layer 7 DDoS Protection", page: "security", keywords: "ddos syn flood layer 7 volumetric protection" },
      { id: "sec-5", label: "Rate Limiting & Quotas", page: "security", keywords: "rate limit throttling quotas" },
      { id: "sec-6", label: "Page Shield & Integrity", page: "security", keywords: "page shield csp scripts integrity" },
      { id: "sec-7", label: "API Shield & JSON Schemas", page: "security", keywords: "api shield rest graphql json validation" },
      { id: "sec-8", label: "SOC 2 & ISO 27001 Audit", page: "security", keywords: "security score posture vulnerabilities audit soc2 iso" }
    ]
  },
  {
    id: "grp-zerotrust",
    name: "Zero Trust & Access (ZTNA)",
    icon: Lock,
    items: [
      { id: "zt-1", label: "ZTNA Access Policies", page: "zerotrust", keywords: "zero trust policies mfa posture access" },
      { id: "zt-2", label: "Identity Providers (IdP)", page: "zerotrust", keywords: "saml oidc google okta idp identity" },
      { id: "zt-3", label: "Secure Web Gateway", page: "zerotrust", keywords: "gateway web filtering dns dnssec" },
      { id: "zt-4", label: "Digital Experience (DEX)", page: "zerotrust", keywords: "dex user performance agent telemetry" },
      { id: "zt-5", label: "Remote Browser Isolation (RBI)", page: "zerotrust", keywords: "remote browser isolation secure navigation" }
    ]
  },
  {
    id: "grp-storage",
    name: "Storage & Data",
    icon: Database,
    items: [
      { id: "db-1", label: "R2 Object Storage (S3)", page: "storage", keywords: "r2 s3 buckets file storage blobs" },
      { id: "db-2", label: "D1 Distributed SQL Database", page: "storage", keywords: "d1 sql sqlite distributed edge database" },
      { id: "db-3", label: "Image Optimization", page: "storage", keywords: "images resizing webp avif media optimization" },
      { id: "db-4", label: "Video Stream & Cameras", page: "storage", keywords: "video streaming hls surveillance stream" }
    ]
  },
  {
    id: "grp-telemetry",
    name: "Real-Time Streams (Kafka)",
    icon: Activity,
    items: [
      { id: "tel-1", label: "Kafka Topics Monitoring", page: "telemetry", badge: "Kafka", badgeType: "stream", keywords: "kafka topics partitions offset stream" },
      { id: "tel-2", label: "Producers & Consumers", page: "telemetry", keywords: "producers consumers lag throughput" },
      { id: "tel-3", label: "Avro Schemas & Ingestion", page: "telemetry", keywords: "avro json schemas serialization broker" }
    ]
  },
  {
    id: "grp-workspace",
    name: "Collaborative Workspace",
    icon: Users,
    items: [
      { id: "ws-1", label: "Workspace Collaborative Hub", page: "workspace", keywords: "hub collaboration team suite" },
      { id: "ws-2", label: "Gmail & Communications", page: "workspace", keywords: "email gmail alerts messages" },
      { id: "ws-3", label: "Calendar & On-Call Schedule", page: "workspace", keywords: "schedule on call calendar shifts appointments" },
      { id: "ws-4", label: "Meet Video Conferences", page: "workspace", keywords: "meet video conference calls crisis" },
      { id: "ws-5", label: "Drive Docs & Sheets", page: "workspace", keywords: "sheets docs drive tabular reports" }
    ]
  },
  {
    id: "grp-strategy",
    name: "Governance & Strategy",
    icon: Target,
    items: [
      { id: "strat-1", label: "Strategic Objectives (OKRs)", page: "strategy", keywords: "okr kpi tracking strategic vision performance" },
      { id: "strat-2", label: "SENSORIUM Brand Identity", page: "brand-vision", keywords: "brand vision guidelines identity logo presskit" },
      { id: "ad-campaigns", label: "Campaigns & Visibility", page: "ad-campaigns", keywords: "campaigns billboard communication ads" }
    ]
  },
  {
    id: "grp-settings",
    name: "Administration & IAM",
    icon: Settings,
    items: [
      { id: "pricing-plans", label: "Plans & Pricing (Lite/Pro)", page: "pricing", badge: "Pro", badgeType: "ia", keywords: "pricing plans subscriptions paypal billing lite pro" },
      { id: "set-1", label: "Billing & PayPal Gateway", page: "settings", badge: "PayPal", badgeType: "paypal", keywords: "billing paypal cards subscriptions payments" },
      { id: "set-2", label: "Roles & RBAC Management", page: "settings", keywords: "rbac roles permissions authorizations members" },
      { id: "set-google", label: "Google SSO Authentication", page: "settings", keywords: "google sso auth oauth2 login signin" },
      { id: "set-3", label: "Audit Logs (FIPS 140-3)", page: "settings", badge: "FIPS", badgeType: "fips", keywords: "audit logs traceability security fips compliance" },
      { id: "set-4", label: "API Tokens & Service Keys", page: "settings", keywords: "api tokens keys service authentication" },
      { id: "set-5", label: "Alerts & Notification Channels", page: "settings", keywords: "alerts notifications webhook sms email" },
      { id: "set-6", label: "Global Tenant Settings", page: "settings", keywords: "config parameters general settings configuration" }
    ]
  }
];

export default function DashboardLayout(props: any) {
  const { 
    children, 
    activeItemId, 
    setActiveItemId, 
    activePage, 
    setActivePage, 
    isDark = true, 
    toggleTheme, 
    mode = "system", 
    state, 
    user,
    isMockMode = false,
    onToggleMockMode,
    onReturnToPortal,
    onSignIn,
    simulateTrafficSpike,
    simulateSecurityIncident,
    simulateNodeAlert,
    resetMockData,
    isOnline = true,
    simulatedOffline = false,
    onToggleSimulatedOffline
  } = props;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isNavExportOpen, setIsNavExportOpen] = useState(false);
  const { language, toggleLanguage, setLanguage } = useLanguage();

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const expandAllGroups = () => setCollapsedGroups({});
  const collapseAllGroups = () => {
    const allCollapsed: Record<string, boolean> = {};
    SENSORIUM_SERVICE_SUITE.forEach(g => { allCollapsed[g.id] = true; });
    setCollapsedGroups(allCollapsed);
  };

  // Filtered Services based on Quick Search
  const filteredStructure = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SENSORIUM_SERVICE_SUITE;

    return SENSORIUM_SERVICE_SUITE.map(group => {
      const groupMatches = group.name.toLowerCase().includes(q);
      const filteredItems = group.items.filter(item => 
        item.label.toLowerCase().includes(q) || 
        item.page.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.toLowerCase().includes(q))
      );

      if (groupMatches || filteredItems.length > 0) {
        return {
          ...group,
          items: groupMatches ? group.items : filteredItems
        };
      }
      return null;
    }).filter(Boolean) as SidebarServiceGroup[];
  }, [searchQuery]);

  const totalServicesCount = useMemo(() => {
    return SENSORIUM_SERVICE_SUITE.reduce((acc, g) => acc + g.items.length, 0);
  }, []);

  const getBadgeClass = (type?: string) => {
    switch (type) {
      case "live":
        return "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 dark:border-emerald-500/30";
      case "ia":
        return "bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25 dark:border-purple-500/30";
      case "svg":
        return "bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 dark:border-blue-500/30";
      case "paypal":
        return "bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 dark:border-amber-500/30";
      case "stream":
        return "bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25 dark:border-orange-500/30";
      case "fips":
        return "bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 dark:border-cyan-500/30";
      default:
        return "bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/[0.08]";
    }
  };

  const handleSelectService = (page: string, itemId: string) => {
    setActiveItemId(itemId);
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070709] text-slate-900 dark:text-white font-sans selection:bg-orange-500/20 dark:selection:bg-orange-500/30 relative overflow-x-hidden flex flex-col transition-colors duration-300">
      
      {/* Background Ambient Flagship Glow with Soft Easing */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-orange-500/[0.025] dark:bg-orange-500/[0.04] blur-[100px] sm:blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] rounded-full bg-amber-600/[0.02] dark:bg-amber-600/[0.03] blur-[120px] sm:blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] sm:bg-[size:32px_32px]" />
      </div>

      {/* Flagship Responsive Header */}
      <header className="sticky top-0 z-50 h-14 sm:h-16 border-b border-slate-200/80 dark:border-white/[0.07] bg-white/80 dark:bg-[#070709]/85 backdrop-blur-2xl flex items-center justify-between px-3 sm:px-6 transition-colors duration-300">
        
        {/* Brand & Mobile Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] active:bg-slate-200 dark:active:bg-white/[0.1] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={onReturnToPortal} 
            className="flex items-center gap-2 cursor-pointer group py-1"
            title="Return to showcase portal"
          >
            <SensoriumLogo size="sm" badgeText="CONSOLE" />
          </div>
        </div>
        
        {/* Top Header Actions Bar */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Global Quick Search - Syncs with sidebar filter */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] text-xs text-slate-500 dark:text-neutral-400 w-44 lg:w-64 focus-within:border-orange-500/50 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 flex-shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search across ${totalServicesCount} services...`}
              className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 text-xs" 
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-white text-xs p-0.5"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Switch to Vitrine */}
          {onReturnToPortal && (
            <button
              onClick={onReturnToPortal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white rounded-full text-xs font-medium transition-colors cursor-pointer min-h-[36px]"
              title="Display showcase portal"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
              <span className="hidden md:inline">Showcase</span>
            </button>
          )}

          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer min-h-[36px]"
            title={`Current language: ${language.toUpperCase()} (Click to toggle EN/FR)`}
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-mono font-bold">
              {language.toUpperCase()}
            </span>
          </button>

          {/* Seamless Theme Toggle Button */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer min-h-[36px]"
              title={`Current mode: ${mode === 'system' ? 'System (Auto)' : isDark ? 'Dark' : 'Light'} (Click to toggle)`}
              aria-label="Toggle theme"
            >
              {mode === "system" ? (
                <Monitor className="w-3.5 h-3.5 text-orange-500" />
              ) : isDark ? (
                <Moon className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="hidden xl:inline text-xs font-medium">
                {mode === "system" ? "Auto" : isDark ? "Dark" : "Light"}
              </span>
            </button>
          )}

          {/* Mode Pill */}
          <button
            onClick={onToggleMockMode}
            className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 sm:py-1.5 rounded-full border transition-all cursor-pointer min-h-[36px] ${
              isMockMode
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                : "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
            }`}
            title="Toggle data mode"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-semibold">{isMockMode ? "Live" : "Cloud"}</span>
          </button>

          {/* Quick Mobile Mode Button */}
          <button
            onClick={() => handleSelectService("infrastructure", "cmms-mobile")}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 dark:bg-orange-500/15 dark:hover:bg-orange-500/25 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-semibold transition-all cursor-pointer min-h-[36px]"
            title="Switch to Mobile Field Technician Interface"
          >
            <Smartphone className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">Mode Mobile</span>
          </button>

          {/* Quick Setup Floating Drawer Trigger */}
          <button
            onClick={() => setIsQuickSetupOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 dark:bg-orange-500/15 dark:hover:bg-orange-500/25 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-medium transition-all cursor-pointer min-h-[36px]"
            title="Open quick telemetry setup"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            <span className="hidden sm:inline">Quick Setup</span>
          </button>

          {/* Strategic Export (PDF & CSV) */}
          <div className="relative">
            <button 
              onClick={() => setIsNavExportOpen(!isNavExportOpen)}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 sm:px-3.5 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 min-h-[36px]"
              title="Export data and strategic analyses (PDF / CSV)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {isNavExportOpen && (
              <div className="absolute right-0 mt-1.5 w-60 p-2 rounded-xl bg-white dark:bg-[#111116] border border-slate-200 dark:border-white/[0.12] shadow-xl z-50 text-xs animate-in fade-in duration-150">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-neutral-500 border-b border-slate-100 dark:border-white/[0.06] mb-1">
                  Strategic Reports
                </div>
                
                <button
                  onClick={() => {
                    exportStrategicDashboardPDF(state, { activeView: activeItemId, title: "Strategic Infrastructure Report" });
                    setIsNavExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-left transition-colors cursor-pointer text-slate-800 dark:text-neutral-200 font-medium"
                >
                  <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div>Executive PDF Report</div>
                    <div className="text-[10px] text-slate-400 font-normal">A4 Summary with KPIs & WAF</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />
                <div className="px-2 py-0.5 text-[9px] font-mono text-slate-400">RAW CSV DATA</div>

                <button
                  onClick={() => {
                    exportDashboardDataCSV(state, "nodes");
                    setIsNavExportOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Nodes & Metrics</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">.csv</span>
                </button>

                <button
                  onClick={() => {
                    exportDashboardDataCSV(state, "workOrders");
                    setIsNavExportOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-orange-500" />
                    <span>CMMS / CAFM Orders</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">.csv</span>
                </button>

                <button
                  onClick={() => {
                    exportDashboardDataCSV(state, "telemetry");
                    setIsNavExportOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
                    <span>24h Telemetry</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">.csv</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Pill & Quick Greeting */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] rounded-full text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-neutral-300">
              <strong className="text-slate-900 dark:text-white font-medium">
                {user?.displayName || (user?.email ? user.email.split('@')[0] : "Supervisor")}
              </strong>
            </span>
            {((state?.workOrders || []).filter((w: any) => w.status !== "resolved").length > 0) && (
              <span 
                onClick={() => handleSelectService("overview", "ov-general")}
                className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-500/15 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-semibold cursor-pointer hover:bg-orange-500/25 transition-colors"
                title="Pending daily tasks"
              >
                {(state?.workOrders || []).filter((w: any) => w.status !== "resolved").length} task(s)
              </span>
            )}
          </div>

          {/* Subscription Tier Pill */}
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              state?.subscriptionTier === "pro"
                ? "bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:border-amber-500/60"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300"
            }`}
            title="Manage subscription plan (Lite / Pro)"
          >
            <Crown className={`w-3.5 h-3.5 ${state?.subscriptionTier === "pro" ? "text-amber-500" : "text-slate-400"}`} />
            <span className="hidden sm:inline">{state?.subscriptionTier === "pro" ? "PRO MEMBER" : "LITE • UPGRADE"}</span>
            <span className="sm:hidden">{state?.subscriptionTier === "pro" ? "PRO" : "LITE"}</span>
          </button>

          {/* User Auth */}
          {user ? (
            <button 
              onClick={() => logout()}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-800 border border-slate-300 dark:border-white/20 flex items-center justify-center text-xs font-semibold text-slate-800 dark:text-white cursor-pointer hover:border-orange-500 dark:hover:border-white transition-colors overflow-hidden"
              title={`Signed in as ${user.displayName || user.email} (Click to sign out)`}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                user?.email?.charAt(0).toUpperCase() || 'U'
              )}
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-900 text-white dark:bg-white/10 dark:hover:bg-white/20 hover:bg-slate-800 border border-slate-700 dark:border-white/10 rounded-full text-xs font-medium flex items-center gap-1 cursor-pointer min-h-[36px]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Offline Mode PWA Notification Banner */}
      {!isOnline && (
        <div className="bg-amber-500/15 dark:bg-amber-500/20 border-b border-amber-500/30 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-sm z-40">
          <div className="flex items-center gap-2.5 max-w-4xl mx-auto">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-pulse" />
            <span>
              <strong>Offline Mode (Local PWA Cache):</strong> The application is currently operating without an Internet connection. Telemetry data is read and stored in the local cache; real-time cloud sync is temporarily paused.
            </span>
          </div>
          {onToggleSimulatedOffline && (
            <button
              onClick={onToggleSimulatedOffline}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-full text-xs shadow-xs transition-colors flex-shrink-0 cursor-pointer"
            >
              Reconnect
            </button>
          )}
        </div>
      )}

      {/* Mock Mode Simulation Control Bar */}
      {isMockMode && (
        <div className="bg-slate-100/90 dark:bg-[#09090b] border-b border-slate-200 dark:border-white/[0.06] px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs z-30 overflow-x-auto no-scrollbar transition-colors duration-300">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-neutral-300 text-xs">
              Sensorium Simulators
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap flex-shrink-0">
            {simulateTrafficSpike && (
              <button
                onClick={simulateTrafficSpike}
                className="px-2.5 py-1 bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer min-h-[32px] whitespace-nowrap shadow-2xs"
              >
                <Zap className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                <span>+Traffic</span>
              </button>
            )}
            {simulateSecurityIncident && (
              <button
                onClick={simulateSecurityIncident}
                className="px-2.5 py-1 bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer min-h-[32px] whitespace-nowrap shadow-2xs"
              >
                <Shield className="w-3 h-3 text-red-500 dark:text-red-400" />
                <span>+WAF</span>
              </button>
            )}
            {simulateNodeAlert && (
              <button
                onClick={simulateNodeAlert}
                className="px-2.5 py-1 bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer min-h-[32px] whitespace-nowrap shadow-2xs"
              >
                <Server className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                <span>+CAFM</span>
              </button>
            )}
            {onToggleSimulatedOffline && (
              <button
                onClick={onToggleSimulatedOffline}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer min-h-[32px] whitespace-nowrap shadow-2xs border ${
                  isOnline
                    ? "bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.1] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300"
                    : "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300 animate-pulse font-bold"
                }`}
                title="Simulate offline loss of connectivity & PWA cache fallback"
              >
                {isOnline ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
                <span>{isOnline ? "Simulate Offline" : "Restore Online"}</span>
              </button>
            )}
            {resetMockData && (
              <button
                onClick={resetMockData}
                className="px-2 py-1 text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200 text-[11px] flex items-center gap-1 transition-colors cursor-pointer min-h-[32px] whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] relative z-10">
        
        {/* Exhaustive Master Sidebar on Desktop (lg+) with Silky Frosted Glass */}
        <aside className="w-64 xl:w-72 flex-shrink-0 border-r border-slate-200/80 dark:border-white/[0.07] bg-white/70 dark:bg-[#070709]/85 backdrop-blur-2xl flex flex-col hidden lg:flex transition-colors duration-300">
          
          {/* Search and Navigation Tools Header */}
          <div className="p-3 border-b border-slate-200/80 dark:border-white/[0.06] space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter services..."
                className="w-full bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] focus:border-orange-500/50 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-neutral-400 font-mono px-1">
              <span>{filteredStructure.reduce((a, b) => a + b.items.length, 0)} available services</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={expandAllGroups}
                  className="hover:text-slate-800 dark:hover:text-neutral-200 cursor-pointer"
                  title="Expand all sections"
                >
                  Expand all
                </button>
                <span>•</span>
                <button 
                  onClick={collapseAllGroups}
                  className="hover:text-slate-800 dark:hover:text-neutral-200 cursor-pointer"
                  title="Collapse sections"
                >
                  Collapse
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Services Tree */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
            {filteredStructure.map((group) => {
              const isCollapsed = collapsedGroups[group.id] && !searchQuery;
              const hasActiveItem = group.items.some(item => activeItemId === item.id);

              return (
                <div key={group.id} className="space-y-1">
                  
                  {/* Category Header with Toggle */}
                  <button
                    onClick={() => toggleGroupCollapse(group.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1 rounded text-[11px] font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <group.icon className={`w-3.5 h-3.5 flex-shrink-0 ${hasActiveItem ? "text-orange-500 dark:text-orange-400" : "text-slate-400 dark:text-neutral-500"}`} />
                      <span className="truncate uppercase tracking-wider text-[10px] font-mono">{group.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-neutral-300">
                        {group.items.length}
                      </span>
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                      )}
                    </div>
                  </button>

                  {/* Category Items */}
                  {!isCollapsed && (
                    <div className="space-y-0.5 pl-2 border-l border-slate-200/80 dark:border-white/[0.04] ml-2 mt-0.5">
                      {group.items.map(item => {
                        const isActive = activeItemId === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectService(item.page, item.id)}
                            className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-all flex items-center justify-between group cursor-pointer ${
                              isActive 
                                ? "bg-orange-500/10 dark:bg-white/[0.09] text-orange-600 dark:text-white font-medium border border-orange-500/25 dark:border-white/[0.12] shadow-2xs" 
                                : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/[0.04]"
                            }`}
                          >
                            <span className="truncate text-[12px]">{item.label}</span>
                            
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-1.5">
                              {item.badge && (
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${getBadgeClass(item.badgeType)}`}>
                                  {item.badge}
                                </span>
                              )}
                              {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredStructure.length === 0 && (
              <div className="text-center py-8 px-4 text-slate-400 dark:text-neutral-500 text-xs">
                <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p>No service matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-orange-500 dark:text-orange-400 hover:underline text-xs"
                >
                  Reset filter
                </button>
              </div>
            )}
          </div>

          {/* Desktop Sidebar Footer Action */}
          {onReturnToPortal && (
            <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.07] bg-slate-50/80 dark:bg-[#0c0c0e]/80">
              <button
                onClick={onReturnToPortal}
                className="w-full py-2 px-3 rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform" />
                <span>SENSORIUM Showcase</span>
              </button>
            </div>
          )}
        </aside>

        {/* Mobile & Tablet Full Screen Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-5/6 max-w-md bg-white dark:bg-[#0c0c0e] border-r border-slate-200 dark:border-white/[0.08] h-full overflow-y-auto p-4 space-y-4 z-10 flex flex-col justify-between shadow-2xl transition-colors duration-300">
              <div className="space-y-4 flex-1 overflow-y-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/[0.07]">
                  <SensoriumLogo size="sm" badgeText="CONSOLE" />
                  <button 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="p-2 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter services..."
                    className="w-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-lg pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Service Categories */}
                <div className="space-y-4">
                  {filteredStructure.map((group) => (
                    <div key={group.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 px-2">
                        <div className="flex items-center gap-2">
                          <group.icon className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                          <span>{group.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">({group.items.length})</span>
                      </div>

                      <div className="space-y-1 pl-1">
                        {group.items.map(item => {
                          const isActive = activeItemId === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectService(item.page, item.id)}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between min-h-[40px] transition-colors cursor-pointer ${
                                isActive 
                                  ? "bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-2xs" 
                                  : "text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              <span className="truncate">{item.label}</span>
                              
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {item.badge && (
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isActive ? "bg-white/20 dark:bg-black/15 text-white dark:text-black" : getBadgeClass(item.badgeType)} font-semibold`}>
                                    {item.badge}
                                  </span>
                                )}
                                {isActive && (
                                  <ChevronRight className="w-4 h-4 text-current flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/[0.07] space-y-2">
                {onReturnToPortal && (
                  <button
                    onClick={() => {
                      onReturnToPortal();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-3 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-neutral-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 min-h-[44px] cursor-pointer transition-colors"
                  >
                    <Eye className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                    <span>SENSORIUM Showcase</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Responsive Main Content Viewport with compact padding & optimal density */}
        <main className="flex-1 overflow-y-auto p-2.5 sm:p-4 lg:p-5 transition-colors duration-300">
          <div className="max-w-[1440px] mx-auto space-y-3 sm:space-y-3.5 pb-12">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Quick Setup Action Pill */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsQuickSetupOpen(true)}
          className="group px-3.5 sm:px-4 py-2.5 rounded-full bg-slate-900/90 text-white dark:bg-white/90 dark:text-black hover:bg-slate-900 dark:hover:bg-white border border-slate-700/50 dark:border-white/30 backdrop-blur-xl shadow-xl hover:shadow-2xl flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Open quick telemetry setup"
        >
          <SlidersHorizontal className="w-4 h-4 text-orange-500 dark:text-orange-600 animate-pulse" />
          <span className="hidden xs:inline">Quick Setup</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
        </button>
      </div>

      {/* Quick Setup Telemetry Drawer */}
      <QuickSetupDrawer
        isOpen={isQuickSetupOpen}
        onClose={() => setIsQuickSetupOpen(false)}
        isDark={isDark}
      />

      {/* Professional Subscription & Pricing Modal */}
      <SubscriptionPricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        state={state}
        onUpgradeSuccess={(tier) => {
          if (state) state.subscriptionTier = tier;
        }}
        isDark={isDark}
      />
    </div>
  );
}
