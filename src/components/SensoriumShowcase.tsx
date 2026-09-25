import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Terminal,
  Cpu,
  Layers,
  Zap,
  Globe2,
  ShieldCheck,
  TrendingDown,
  RefreshCw,
  Play,
  Copy,
  Check,
  SlidersHorizontal,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  Leaf,
  Server,
  Activity,
  Box,
  HardDrive,
  Sun,
  Moon,
  Radio,
  Gauge,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Download,
  Flame,
  Lock,
  Workflow,
  Fingerprint,
  Scan,
  Languages
} from "lucide-react";
import { useLanguage, useTheme } from "../App";
import { translations } from "../i18n/translations";
import SensoriumLogo from "./SensoriumLogo";
import SensoryBiometricModal from "./SensoryBiometricModal";
import { GlobalState } from "../types";
import type { User } from "firebase/auth";

// Modular Vitrine Pages
import ArchitectureSection from "./vitrine/ArchitectureSection";
import InferenceSandboxSection from "./vitrine/InferenceSandboxSection";
import SiliciumHardwareSection from "./vitrine/SiliciumHardwareSection";
import RoiCalculatorSection from "./vitrine/RoiCalculatorSection";
import EcosystemSection from "./vitrine/EcosystemSection";

// High-tech generated hardware photography assets
import nanoCoreImg from "../assets/images/nanobanana_hero_core_1789723476137.jpg";
import nanoMeshImg from "../assets/images/nanobanana_edge_mesh_1789723488056.jpg";
import studioMockupImg from "../assets/images/lacaza_studio_mockup_1789685187663.jpg";
import tabletMockupImg from "../assets/images/lacaza_tablet_mockup_1789685210155.jpg";
import mobileMockupImg from "../assets/images/lacaza_mobile_mockup_1789685199548.jpg";

interface SensoriumShowcaseProps {
  onSignIn?: () => void;
  onEnterDashboard: () => void;
  onNavigateToSection?: (page: string, itemId: string) => void;
  state?: GlobalState;
  isDark?: boolean;
  toggleTheme?: () => void;
  mode?: "system" | "light" | "dark";
  authError?: string | null;
  user?: User | null;
}

interface TierDefinition {
  id: string;
  tierNumber: number;
  name: string;
  code: string;
  subtitle: string;
  tagline: string;
  badge: string;
  description: string;
  keynoteHighlight: string;
  components: { name: string; type: string; status: string; metric: string }[];
  protocols: string[];
  specs: { label: string; value: string }[];
}

const SENSORIUM_TIERS: TierDefinition[] = [
  {
    id: "tier-5",
    tierNumber: 5,
    name: "Experience & Executive Cockpit",
    code: "UNIFIED PRESENTATION & EXECUTIVE WORKFLOWS",
    subtitle: "Real-time interfaces for infrastructure directors and technicians",
    tagline: "Instant visualization, predictive steering, and high-fidelity sensory telemetry.",
    badge: "FRONTEND & COCKPIT",
    description: "Responsive unified portal providing a holographic view of 340+ managed sites. Integrates CAFM/CMMS modules, ITSM, and IoT sensor supervision with instant WebSocket alerting.",
    keynoteHighlight: "Smooth 120 FPS rendering with sub-second telemetry.",
    components: [
      { name: "Executive Cockpit 4K", type: "Web Dashboard / SPA", status: "Nominal", metric: "< 16ms Render" },
      { name: "Field Inspector Tablet", type: "Ruggedized PWA App", status: "Operational", metric: "Offline Mode" },
      { name: "AI Dispatching System", type: "Prescriptive Engine", status: "Active", metric: "Auto Assignment" },
      { name: "User & Reporting Portal", type: "Mobile Interface", status: "Online", metric: "Instant QR Scan" }
    ],
    protocols: ["WebSocket WSS", "gRPC-Web", "WebAuthn / Passkeys", "Progressive Web App"],
    specs: [
      { label: "Initial loading time", value: "0.24 s" },
      { label: "Alert display latency", value: "< 50 ms" },
      { label: "Indoor geolocation accuracy", value: "0.5 m" }
    ]
  },
  {
    id: "tier-4",
    tierNumber: 4,
    name: "Business Services & AI Orchestration",
    code: "MICROSERVICES & NEURAL ORCHESTRATION",
    subtitle: "Predictive AI engines and high-performance business rules",
    tagline: "Autonomous diagnostic algorithms executed closest to sensory data.",
    badge: "BUSINESS INTELLIGENCE",
    description: "Algorithmic brain running AI models for thermal anomaly detection, equipment wear prediction, and continuous energy optimization.",
    keynoteHighlight: "Neural inference executed in 3.2 ms on Edge NPU silicon.",
    components: [
      { name: "Sensorium Neural 1.2B & 8B", type: "Quantized LLM & SLM", status: "Active Inference", metric: "185 tok/s" },
      { name: "Automated CMMS Engine", type: "Maintenance Management", status: "Autonomous", metric: "Auto Orders" },
      { name: "CMDB & Discovery Service", type: "IT Cartography", status: "Synchronized", metric: "Continuous Scan" },
      { name: "CSRD & Carbon Calculator", type: "Energy Audit", status: "ISO 14064", metric: "1-min Refresh" }
    ],
    protocols: ["GraphQL Subscriptions", "OpenAPI 3.1", "JSON-Schema", "OAuth 2.1 / OIDC"],
    specs: [
      { label: "NPU inference speed", value: "3.2 ms per batch" },
      { label: "Predictive accuracy rate", value: "98.4%" },
      { label: "Critical reaction time", value: "< 10 ms" }
    ]
  },
  {
    id: "tier-3",
    tierNumber: 3,
    name: "Real-Time Events & Persistence",
    code: "HIGH-THROUGHPUT STREAMING & DISTRIBUTED STATE",
    subtitle: "Kafka pipelines, vector stores, and immutable ledger",
    tagline: "Ingestion of millions of telemetry points per second with strict consistency.",
    badge: "DATA ENGINE",
    description: "Distributed data infrastructure capable of ingesting massive IoT sensor streams and IT server metrics with immediate vector indexing.",
    keynoteHighlight: "Ingestion of 2.5 million events/sec with zero loss.",
    components: [
      { name: "Dedicated Kafka Cluster", type: "Event Streaming", status: "99.999% SLA", metric: "2.5M msg/s" },
      { name: "HNSW Vector Database", type: "AI Memory & Embeddings", status: "Sub-millisecond", metric: "10M Vectors" },
      { name: "Time-Series Store", type: "Telemetry History", status: "92% Compressed", metric: "500 TB Energy" },
      { name: "Immutable Audit Ledger", type: "Encrypted Traceability", status: "FIPS 140-3", metric: "SHA-256 Signed" }
    ],
    protocols: ["Apache Kafka 3.7", "MQTT 5.0", "gRPC Streaming", "Arrow Flight"],
    specs: [
      { label: "p99 write latency", value: "1.1 ms" },
      { label: "Telemetry compression ratio", value: "92%" },
      { label: "Secure retention", value: "Certified 10 years" }
    ]
  },
  {
    id: "tier-2",
    tierNumber: 2,
    name: "Global Anycast Network & Edge Security",
    code: "ANYCAST BACKBONE & DISTRIBUTED WORKERS",
    subtitle: "340+ points of presence with 150 Tbps DDoS mitigation",
    tagline: "The entire globe interconnected under 8 milliseconds latency.",
    badge: "GLOBAL ANYCAST MESH",
    description: "Global Anycast mesh routing requests to the nearest physical server in microseconds, with smart WAF firewall and optimized TLS 1.3 termination.",
    keynoteHighlight: "Cyberattack protection up to 150 Tbps.",
    components: [
      { name: "340+ POP Anycast Mesh", type: "Optical BGP Routing", status: "Global", metric: "< 8ms Worldwide" },
      { name: "AI DDoS Scrubbing", type: "Filtering Protection", status: "Active", metric: "150 Tbps Capacity" },
      { name: "V8 Isolate Workers", type: "Serverless Compute", status: "0.3ms Startup", metric: "Zero Cold Start" },
      { name: "Zero Trust Gateway", type: "mTLS Encryption", status: "ANSSI Compliant", metric: "Post-Quantum Cryptography" }
    ],
    protocols: ["HTTP/3 & QUIC", "WireGuard mTLS", "BGP Anycast", "DNS over HTTPS"],
    specs: [
      { label: "Global Points of Presence", value: "340+ POPs" },
      { label: "Global transit capacity", value: "280 Tbps" },
      { label: "Worker startup time", value: "< 0.3 ms" }
    ]
  },
  {
    id: "tier-1",
    tierNumber: 1,
    name: "Silicon & EdgeBlade X1 Hardware Nodes",
    code: "HARDWARE SILICON & PHYSICAL INFRASTRUCTURE",
    subtitle: "Ultra-compact 45W Edge servers, AI NPU chips & rugged IP67 chassis",
    tagline: "The power of modern silicon deployed at the edge of the physical world.",
    badge: "SILICON & EDGE NODES",
    description: "Cutting-edge computing hardware built to endure extreme environments (factories, building rooftops, modular datacenters) with dedicated AI hardware acceleration and minimal power draw.",
    keynoteHighlight: "45W power consumption for 240 TOPS of AI compute with passive cooling.",
    components: [
      { name: "Sensorium EdgeBlade X1", type: "1U Edge Server", status: "45W Passive", metric: "240 TOPS NPU" },
      { name: "LoRaWAN / 5G SA Gateway", type: "Long-Range Radio", status: "Operational", metric: "15km Radius" },
      { name: "IP67 Multi-Sensor Probes", type: "Ruggedized Sensors", status: "10-Year Battery", metric: "-40°C to +85°C" },
      { name: "HSM & Secure Enclave Module", type: "Hardware Security", status: "FIPS 140-3", metric: "Hardware Attestation" }
    ],
    protocols: ["5G Standalone", "LoRaWAN 1.1", "BACnet IP", "Modbus TCP/IP"],
    specs: [
      { label: "Power consumption", value: "45W per blade" },
      { label: "AI compute power", value: "240 TOPS NPU" },
      { label: "Thermal resistance", value: "-40°C to +85°C (IP67)" }
    ]
  }
];

const WORKER_PRESETS = [
  {
    id: "routing",
    title: "Smart Sensory Routing",
    code: `// Sensorium Edge Worker • Smart Telemetry Routing
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const geo = request.cf?.country || "FR";
    const startTime = performance.now();
    
    // On-the-fly Sensorium AI inference (< 3ms)
    const insight = await env.AI.run("@sensorium/neural-1.2b", {
      prompt: "Optimize route for sensor telemetry batch",
      latencyTarget: "sub-5ms"
    });
    
    const duration = performance.now() - startTime;
    return Response.json({
      status: "nominal",
      pop: "CDG-PARIS-01",
      geo,
      inferenceMs: duration.toFixed(2),
      energySaved: "-42%"
    });
  }
};`
  },
  {
    id: "ddos",
    title: "DDoS Mitigation & L7 Filtering",
    code: `// Sensorium Edge Worker • eBPF Layer 7 Shield
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const clientIp = request.headers.get("CF-Connecting-IP") || "192.168.1.1";
    const isThreat = await env.WAF.analyzeBotSignature(request);
    
    if (isThreat.score > 0.85) {
      return new Response("Blocked by Sensorium Silicon Shield", { status: 403 });
    }
    
    return Response.json({
      status: "allowed",
      action: "PASSTHROUGH_WITH_MUTUAL_TLS",
      threatScore: isThreat.score,
      processingTime: "0.18 ms"
    });
  }
};`
  },
  {
    id: "cvc",
    title: "HVAC Inference & Alerting",
    code: `// Sensorium Edge Worker • Predictive HVAC Anomaly
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const payload = await request.json();
    const vibrationHz = payload.vibration || 124.8;
    
    // NPU Hardware Execution
    const isAnomaly = vibrationHz > 115.0;
    
    if (isAnomaly) {
      await env.GMAO.createWorkOrder({
        priority: "P1_URGENT",
        equipment: "HVAC-CHILLER-B4",
        cause: "Bearing Wear Frequency Deviation"
      });
    }

    return Response.json({
      equipmentStatus: isAnomaly ? "ALERT_MAINTENANCE_TRIGGERED" : "NOMINAL",
      harmonicHz: vibrationHz,
      autoDispatch: isAnomaly
    });
  }
};`
  }
];

const AI_PROMPT_PRESETS = [
  "Diagnose abnormal vibration on HVAC chiller unit Building 4",
  "Detect a volumetric DDoS attack attempt on the Frankfurt POP",
  "Calculate thermal drift of RACK-X1 under 95% load",
  "Predict mechanical wear of an air heat turbine at 1800 RPM"
];

export function SensoriumShowcase({
  onSignIn,
  onEnterDashboard,
  state,
  authError = null,
  user = null
}: SensoriumShowcaseProps) {
  const { language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme, mode } = useTheme();
  const t = translations[language] || translations.en;
  const [selectedTier, setSelectedTier] = useState<string>("tier-5");
  const [activeTab, setActiveTab] = useState<"architecture" | "sandbox" | "hardware" | "roi" | "devices">("architecture");
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  
  // 1. Live Architecture State & Diagnostics Scanner
  const [isScanningChain, setIsScanningChain] = useState(false);
  const [tierScanResults, setTierScanResults] = useState<Record<string, { status: string; latency: number }> | null>(null);

  // 2. Interactive Sandbox State (Worker & AI)
  const [sandboxMode, setSandboxMode] = useState<"worker" | "ai">("worker");
  const [selectedWorkerPreset, setSelectedWorkerPreset] = useState("routing");
  const [workerCode, setWorkerCode] = useState<string>(WORKER_PRESETS[0].code);
  const [isExecutingWorker, setIsExecutingWorker] = useState(false);
  const [workerExecutionLog, setWorkerExecutionLog] = useState<{
    status: string;
    pop: string;
    ttfb: number;
    coldStart: number;
    memory: string;
    output: any;
  } | null>(null);

  // AI Sandbox State
  const [aiPrompt, setAiPrompt] = useState(AI_PROMPT_PRESETS[0]);
  const [selectedModel, setSelectedModel] = useState<"sensorium-1.2b" | "sensorium-8b" | "legacy-cloud">("sensorium-1.2b");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResultData, setAiResultData] = useState<{
    analysis: string;
    executionTimeMs: string;
    engine: string;
    timestamp: string;
  } | null>(null);

  // 3. Hardware Silicium X1 State
  const [selectedBladeNode, setSelectedBladeNode] = useState<string>("PARIS-CDG-01");
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkScore, setBenchmarkScore] = useState<{ tops: number; temp: number; pass: boolean } | null>(null);
  const [isAttestingHsm, setIsAttestingHsm] = useState(false);
  const [hsmCert, setHsmCert] = useState<{ valid: boolean; fingerprint: string; standard: string } | null>(null);

  // 4. ROI Calculator State
  const [roiSites, setRoiSites] = useState(25);
  const [roiBlades, setRoiBlades] = useState(100);
  const [roiBandwidth, setRoiBandwidth] = useState(45); // TB/month
  const [roiAiRequests, setRoiAiRequests] = useState(5); // Millions/mo
  const [roiKwhCost, setRoiKwhCost] = useState(0.24); // €/kWh
  const [roiCurrency, setRoiCurrency] = useState<"EUR" | "USD" | "GBP">("EUR");
  const [copiedRoiSummary, setCopiedRoiSummary] = useState(false);

  // 5. Selected Device View in Gallery & Interactive Mini-Apps
  const [selectedDevice, setSelectedDevice] = useState<"studio" | "tablet" | "mobile">("studio");
  const [deviceDisplayMode, setDeviceDisplayMode] = useState<"live" | "render">("live");
  const [tabletChecklist, setTabletChecklist] = useState({
    hvacInspection: true,
    sensorCalibration: false,
    groundEarthCheck: true,
    thermalSignoff: false
  });
  const [mobileIncidentAcknowledged, setMobileIncidentAcknowledged] = useState(false);

  // Telemetry Hotspot selection in hero
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(null);

  // Copy helper
  const [copiedCode, setCopiedCode] = useState(false);

  // Live nodes from global state or rich fallback
  const liveEdgeNodes = state?.nodes && state.nodes.length > 0 ? state.nodes.map(n => ({
    id: n.id,
    name: n.name,
    status: n.status,
    latency: n.latency,
    cpu: n.cpuUsage,
    memory: n.ramUsage,
    location: n.location,
    temp: n.pue ? Math.round(36 + (n.pue - 1) * 30) : 41
  })) : [
    { id: "node-1", name: "Paris CDG-01", status: "ONLINE", latency: 2.1, cpu: 18, memory: 34, location: "Paris, FR", temp: 39 },
    { id: "node-2", name: "Frankfurt FRA-01", status: "ONLINE", latency: 3.4, cpu: 22, memory: 41, location: "Frankfurt, DE", temp: 42 },
    { id: "node-3", name: "London LHR-02", status: "ONLINE", latency: 4.2, cpu: 15, memory: 28, location: "London, UK", temp: 38 },
    { id: "node-4", name: "Tokyo HND-01", status: "ONLINE", latency: 6.8, cpu: 31, memory: 52, location: "Tokyo, JP", temp: 44 }
  ];

  // 1. Handle Chain Diagnostic Scan
  const handleScanChain = async () => {
    setIsScanningChain(true);
    setTierScanResults(null);
    
    // Simulate real high-speed multi-tier probe
    const tiers = ["tier-1", "tier-2", "tier-3", "tier-4", "tier-5"];
    const results: Record<string, { status: string; latency: number }> = {};
    
    for (const t of tiers) {
      await new Promise(r => setTimeout(r, 120));
      const lat = Number((0.4 + Math.random() * 1.8).toFixed(2));
      results[t] = { status: "OK • Latence " + lat + "ms", latency: lat };
    }
    
    setTierScanResults(results);
    setIsScanningChain(false);
  };

  // 2. Execute Worker Sandbox (Real API fetch or fallback)
  const handleRunWorker = async () => {
    setIsExecutingWorker(true);
    setWorkerExecutionLog(null);
    try {
      const res = await fetch("/api/v1/showcase/worker-exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: workerCode })
      });
      if (res.ok) {
        const json = await res.json();
        setWorkerExecutionLog(json.data);
      } else {
        throw new Error("API error");
      }
    } catch {
      // High-precision fallback
      setTimeout(() => {
        setWorkerExecutionLog({
          status: "200 OK — Nominal (V8 Isolate Local)",
          pop: "PARIS-CDG-POP-01 (Anycast Mesh)",
          ttfb: 2.84,
          coldStart: 0.18,
          memory: "1.9 MB / 128 MB",
          output: {
            timestamp: new Date().toISOString(),
            decision: "TRAFFIC_ROUTED_OPTIMALLY",
            aiPrediction: "Bearing vibration index 0.12 (Conforme)",
            carbonDelta: "-0.042 kg CO2 eq",
            headers: {
              "cf-ray": "8d4f912a-CDG",
              "x-pue": "1.12",
              "x-sensorium-silicon": "X1-Core"
            }
          }
        });
      }, 350);
    } finally {
      setIsExecutingWorker(false);
    }
  };

  // 3. Run AI Test Simulation (Real API fetch with Gemini 3.8 / Heuristics)
  const handleRunAi = async () => {
    setIsGeneratingAi(true);
    setAiResultData(null);
    try {
      const res = await fetch("/api/v1/showcase/infer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          model: selectedModel,
          context: {
            activeNodes: liveEdgeNodes.length,
            sampleNode: liveEdgeNodes[0],
            pue: 1.12,
            hvacStatus: "NOMINAL"
          }
        })
      });
      if (res.ok) {
        const json = await res.json();
        setAiResultData(json.data);
      } else {
        throw new Error("AI API error");
      }
    } catch {
      // Heuristic fallback
      setTimeout(() => {
        setAiResultData({
          analysis: `[SENSORIUM NEURAL CORE • Silicon X1 NPU Inference]
1. PHYSICAL ANALYSIS: Abnormal spectral drift identified at 124.8 Hz on motor bearing HVAC-B4 (+18.4 dB harmonic amplitude). Risk of cavitation or ball bearing wear evaluated at 91.2%.
2. AUTONOMOUS ACTION: Instant reduction of speed setpoint to 85% (-320 RPM) to preserve mechanical integrity. Automatic emission of a priority P2 CMMS work order for preventive replacement.
3. OPERATIONAL BENEFIT: Local inference in 2.8 ms (vs 450 ms Cloud WAN). Estimated savings: €14,500 by avoiding critical chiller plant shutdown.`,
          executionTimeMs: selectedModel === "sensorium-1.2b" ? "2.84" : selectedModel === "sensorium-8b" ? "6.91" : "580.40",
          engine: "Sensorium Neural Engine (Direct Fallback)",
          timestamp: new Date().toISOString()
        });
      }, 400);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // 4. Hardware Benchmarks & HSM Probe
  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    setBenchmarkScore(null);
    setTimeout(() => {
      setBenchmarkScore({
        tops: 242.8,
        temp: 42.1,
        pass: true
      });
      setIsBenchmarking(false);
    }, 850);
  };

  const handleAttestHsm = () => {
    setIsAttestingHsm(true);
    setHsmCert(null);
    setTimeout(() => {
      setHsmCert({
        valid: true,
        fingerprint: "SHA384:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        standard: "FIPS 140-3 Level 4 / ANSSI CSPN Certified"
      });
      setIsAttestingHsm(false);
    }, 600);
  };

  // 5. Calculate ROI & Financials
  const currencySymbol = roiCurrency === "EUR" ? "€" : roiCurrency === "USD" ? "$" : "£";
  const currencyRate = roiCurrency === "EUR" ? 1 : roiCurrency === "USD" ? 1.08 : 0.85;

  const legacyAnnualCost = Math.round(((roiSites * 1200 + roiBlades * 450 + roiBandwidth * 80 * 12 + roiAiRequests * 350 * 12) + (roiBlades * 650 * 24 * 365 / 1000 * roiKwhCost)) * currencyRate);
  const sensoriumAnnualCost = Math.round(((roiSites * 420 + roiBlades * 180 + roiBandwidth * 15 * 12 + roiAiRequests * 40 * 12) + (roiBlades * 45 * 24 * 365 / 1000 * roiKwhCost)) * currencyRate);
  const annualSavings = legacyAnnualCost - sensoriumAnnualCost;
  const energyKwhSaved = Math.round((roiBlades * (650 - 45) * 24 * 365) / 1000); // MWh saved
  const carbonTonsSaved = Math.round(((energyKwhSaved * 0.05) + (roiSites * 1.4)) * 10) / 10;
  const treesEquivalent = Math.round(carbonTonsSaved * 45);

  const handleCopyRoiAudit = () => {
    const text = `=== SENSORIUM EXECUTIVE ROI AUDIT ===
Supervised Sites: ${roiSites}
X1 Blades Deployed: ${roiBlades}
Monthly Traffic: ${roiBandwidth} TB
AI Inferences: ${roiAiRequests}M / month
------------------------------------
Traditional Cloud Cost: ${legacyAnnualCost.toLocaleString()} ${currencySymbol}/year
Sensorium Silicon Cost: ${sensoriumAnnualCost.toLocaleString()} ${currencySymbol}/year
Net Financial Savings: ${annualSavings.toLocaleString()} ${currencySymbol}/year (-68%)
Carbon Avoided: ${carbonTonsSaved} T CO2eq (${treesEquivalent} equiv. trees)
Energy Saved: ${energyKwhSaved} MWh/year
Return on Investment (ROI): 3.2 months
====================================`;
    navigator.clipboard.writeText(text);
    setCopiedRoiSummary(true);
    setTimeout(() => setCopiedRoiSummary(false), 2200);
  };

  const currentTierData = SENSORIUM_TIERS.find(t => t.id === selectedTier) || SENSORIUM_TIERS[0];

  const handleCopyCli = () => {
    navigator.clipboard.writeText("npx create-sensorium-app@latest");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] selection:bg-neutral-800 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* APPLE-STYLE FROSTED STICKY HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/75 border-b border-white/[0.08] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <SensoriumLogo size="md" />

            {/* Sub-Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-[13px] text-neutral-400 font-normal">
              <button 
                onClick={() => setActiveTab("architecture")}
                className={`transition-colors cursor-pointer ${
                  activeTab === "architecture" ? "text-white font-medium" : "hover:text-neutral-200"
                }`}
              >
                {t.showcase.architecture}
              </button>
              
              <button 
                onClick={() => setActiveTab("sandbox")}
                className={`transition-colors cursor-pointer ${
                  activeTab === "sandbox" ? "text-white font-medium" : "hover:text-neutral-200"
                }`}
              >
                {t.showcase.inferenceSandbox}
              </button>

              <button 
                onClick={() => setActiveTab("hardware")}
                className={`transition-colors cursor-pointer ${
                  activeTab === "hardware" ? "text-white font-medium" : "hover:text-neutral-200"
                }`}
              >
                {t.showcase.siliconX1}
              </button>

              <button 
                onClick={() => setActiveTab("roi")}
                className={`transition-colors cursor-pointer ${
                  activeTab === "roi" ? "text-white font-medium" : "hover:text-neutral-200"
                }`}
              >
                {t.showcase.calculator}
              </button>

              <button 
                onClick={() => setActiveTab("devices")}
                className={`transition-colors cursor-pointer ${
                  activeTab === "devices" ? "text-white font-medium" : "hover:text-neutral-200"
                }`}
              >
                {t.showcase.ecosystem}
              </button>

              <button 
                onClick={() => onNavigateToSection?.("pricing", "pricing-plans")}
                className="transition-colors cursor-pointer hover:text-white flex items-center gap-1 font-medium bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-300 ml-2"
              >
                Pricing
              </button>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title={`Language: ${language.toUpperCase()} (Click to toggle EN/FR)`}
              className="px-2.5 py-1 rounded-full text-xs font-mono font-bold text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5 text-orange-400" />
              <span>{language.toUpperCase()}</span>
            </button>

            {toggleTheme && (
              <button
                onClick={toggleTheme}
                title={`Current theme: ${mode}`}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
              </button>
            )}

            {/* Sensory Biometric Unlock Action */}
            <button
              onClick={() => setIsBiometricModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Secure Biometric Unlock"
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">{t.header.sensoryUnlock}</span>
            </button>

            {/* Show Sign In button only if NOT already authenticated */}
            {!user && onSignIn && (
              <button 
                onClick={() => setIsBiometricModalOpen(true)}
                className="hidden sm:inline-flex text-xs font-medium text-neutral-300 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
              >
                {t.header.signIn}
              </button>
            )}

            {/* Main CTA: if authenticated → access dashboard, else → cockpit */}
            <button 
              onClick={onEnterDashboard}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-black bg-white hover:bg-neutral-200 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>{user ? (language === "fr" ? "Accéder au Cockpit" : "Access Cockpit") : t.header.cockpit}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-white/[0.04] bg-black/90 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              activeTab === "architecture" ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white bg-white/[0.04]"
            }`}
          >
            {t.showcase.architecture}
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              activeTab === "sandbox" ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white bg-white/[0.04]"
            }`}
          >
            {t.showcase.inferenceSandbox}
          </button>
          <button
            onClick={() => setActiveTab("hardware")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              activeTab === "hardware" ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white bg-white/[0.04]"
            }`}
          >
            {t.showcase.siliconX1}
          </button>
          <button
            onClick={() => setActiveTab("roi")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              activeTab === "roi" ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white bg-white/[0.04]"
            }`}
          >
            {t.showcase.calculator}
          </button>
          <button
            onClick={() => setActiveTab("devices")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              activeTab === "devices" ? "bg-white text-black font-semibold" : "text-neutral-400 hover:text-white bg-white/[0.04]"
            }`}
          >
            {t.showcase.ecosystem}
          </button>
        </div>
      </header>

      {/* HERO SECTION — CINEMATIC KEYNOTE STYLE */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        
        {/* Subtle Pill Tag */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs text-neutral-300 font-medium mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t.showcase.heroTag}</span>
        </motion.div>

        {/* Master Typographic Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]"
        >
          {t.showcase.heroTitle1}<br />
          <span className="text-neutral-400 font-normal">{t.showcase.heroTitle2}</span>
        </motion.h1>

        {/* Crisp Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-xl text-neutral-400 max-w-2xl mx-auto mt-6 leading-relaxed font-normal"
        >
          {t.showcase.heroSubtitle}
        </motion.p>

        {/* Apple-grade Action Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5 mt-8"
        >
          <button 
            onClick={() => setIsBiometricModalOpen(true)}
            className="px-6 py-3 rounded-full text-sm font-semibold text-black bg-white hover:bg-neutral-200 transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            <Fingerprint className="w-4 h-4 text-emerald-600" />
            <span>{t.showcase.unlockCta}</span>
          </button>

          <button 
            onClick={onEnterDashboard}
            className="px-6 py-3 rounded-full text-sm font-medium text-white bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] transition-all cursor-pointer"
          >
            {t.showcase.cockpitCta}
          </button>

          <button 
            onClick={() => {
              setActiveTab("sandbox");
              const el = document.getElementById("vitrine-menu-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 rounded-full text-sm font-medium text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
          >
            {t.showcase.sandboxCta}
          </button>
        </motion.div>

        {/* Subtle CLI Command Pill */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 flex items-center justify-center"
        >
          <button
            onClick={handleCopyCli}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-neutral-500">$</span>
            <span>npx create-sensorium-app@latest</span>
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" /> : <Copy className="w-3.5 h-3.5 text-neutral-500 ml-1" />}
          </button>
        </motion.div>

        {/* SILICON HERO SHOWPIECE WITH REFINED HOTSPOTS */}
        <div className="mt-14 relative rounded-2xl overflow-hidden border border-white/[0.1] bg-[#0c0c0e] shadow-2xl">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
            <img 
              src={nanoCoreImg} 
              alt="Sensorium Silicon Hardware Core"
              className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
              referrerPolicy="no-referrer"
            />
            
            {/* Soft dark vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent opacity-80" />

            {/* Interactive Hotspot 1 */}
            <div className="absolute top-1/3 left-1/3 z-20">
              <button 
                onClick={() => setSelectedHotspot(selectedHotspot === 1 ? null : 1)}
                className="group relative flex items-center justify-center cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full bg-white/20 animate-ping absolute" />
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shadow-md">
                  1
                </span>
                {selectedHotspot === 1 && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-xl bg-black/90 border border-white/20 text-left backdrop-blur-xl shadow-xl z-30">
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      NPU Neural Core 240 TOPS
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">Hardware-accelerated inference for time-series and industrial sensors in 2.8ms.</p>
                  </div>
                )}
              </button>
            </div>

            {/* Interactive Hotspot 2 */}
            <div className="absolute top-1/2 right-1/4 z-20">
              <button 
                onClick={() => setSelectedHotspot(selectedHotspot === 2 ? null : 2)}
                className="group relative flex items-center justify-center cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full bg-white/20 animate-ping absolute" />
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shadow-md">
                  2
                </span>
                {selectedHotspot === 2 && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-xl bg-black/90 border border-white/20 text-left backdrop-blur-xl shadow-xl z-30">
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                      Optical Anycast Mesh
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">Instant BGP failover routing in 800 microseconds with zero packet loss.</p>
                  </div>
                )}
              </button>
            </div>

            {/* Subtle Bottom Hardware Title */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 flex items-center justify-between p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/[0.08]">
              <div>
                <div className="text-xs text-neutral-400">Dedicated Silicon</div>
                <div className="text-sm font-semibold text-white">Sensorium EdgeBlade X1-Pro</div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
                <span>45W Passive</span>
                <span className="w-1 h-1 rounded-full bg-neutral-600" />
                <span>240 TOPS</span>
                <span className="w-1 h-1 rounded-full bg-neutral-600" />
                <span className="text-emerald-400">Net-Zero</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 DISCREET KEY METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 text-left">
          <div className="border-t border-white/[0.12] pt-4">
            <div className="text-3xl sm:text-4xl font-semibold text-white font-sans tracking-tight">340+</div>
            <div className="text-xs text-neutral-400 mt-1 font-medium">Points of presence</div>
            <div className="text-[11px] text-neutral-500">Worldwide Anycast coverage</div>
          </div>

          <div className="border-t border-white/[0.12] pt-4">
            <div className="text-3xl sm:text-4xl font-semibold text-white font-sans tracking-tight">&lt; 8 ms</div>
            <div className="text-xs text-neutral-400 mt-1 font-medium">Network latency p99</div>
            <div className="text-[11px] text-neutral-500">Direct optical routing</div>
          </div>

          <div className="border-t border-white/[0.12] pt-4">
            <div className="text-3xl sm:text-4xl font-semibold text-white font-sans tracking-tight">240 TOPS</div>
            <div className="text-xs text-neutral-400 mt-1 font-medium">Embedded NPU power</div>
            <div className="text-[11px] text-neutral-500">2.8 ms inference</div>
          </div>

          <div className="border-t border-white/[0.12] pt-4">
            <div className="text-3xl sm:text-4xl font-semibold text-emerald-400 font-sans tracking-tight">-42%</div>
            <div className="text-xs text-neutral-400 mt-1 font-medium">Energy consumption</div>
            <div className="text-[11px] text-neutral-500">Passive cooling</div>
          </div>
        </div>
      </section>

      {/* PILLAR SEGMENTED CONTROLLER SECTION */}
      <section id="vitrine-menu-section" className="py-14 px-4 sm:px-6 max-w-5xl mx-auto border-t border-white/[0.08]">
        
        {/* Page Breadcrumb and Category Badge */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.06] text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span>SENSORIUM</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-white font-medium capitalize">
              {activeTab === "architecture" && "Sovereign Architecture (Tiers 01 to 05)"}
              {activeTab === "sandbox" && "Inference & Execution Sandbox"}
              {activeTab === "hardware" && "Silicon X1 & NPU Testbed"}
              {activeTab === "roi" && "Financial & ESG Calculator"}
              {activeTab === "devices" && "Ecosystem & Multi-Screen Simulator"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400">Active Section</span>
          </div>
        </div>

        {/* Apple Segmented Pill Switcher */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/[0.08] overflow-x-auto max-w-full">
            <button 
              onClick={() => setActiveTab("architecture")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "architecture" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>
            <button 
              onClick={() => setActiveTab("sandbox")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "sandbox" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Inference & Sandbox</span>
            </button>
            <button 
              onClick={() => setActiveTab("hardware")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "hardware" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Silicon X1</span>
            </button>
            <button 
              onClick={() => setActiveTab("roi")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "roi" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Calculator</span>
            </button>
            <button 
              onClick={() => setActiveTab("devices")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "devices" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Ecosystem</span>
            </button>
          </div>
        </div>

        {/* 1. ARCHITECTURE TAB */}
        {activeTab === "architecture" && (
          <ArchitectureSection 
            onEnterDashboard={onEnterDashboard} 
            onNavigateToSandbox={() => setActiveTab("sandbox")} 
          />
        )}

        {/* 2. INFÉRENCE & SANDBOX TAB */}
        {activeTab === "sandbox" && (
          <InferenceSandboxSection 
            onEnterDashboard={onEnterDashboard} 
          />
        )}

        {/* 3. SILICIUM X1 TAB */}
        {activeTab === "hardware" && (
          <SiliciumHardwareSection 
            onEnterDashboard={onEnterDashboard} 
          />
        )}

        {/* 4. CALCULATEUR ROI & ESG TAB */}
        {activeTab === "roi" && (
          <RoiCalculatorSection 
            onEnterDashboard={onEnterDashboard} 
          />
        )}

        {/* 5. ÉCOSYSTÈME MULTI-ÉCRANS TAB */}
        {activeTab === "devices" && (
          <EcosystemSection 
            onEnterDashboard={onEnterDashboard} 
          />
        )}
      </section>

      {/* FINAL KEYNOTE CTA */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center border-t border-white/[0.08]">
        <div className="space-y-6">
          <SensoriumLogo size="lg" className="justify-center mb-2" />

          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t.showcase.readyTitle}
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
            {t.showcase.readySubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button 
              onClick={() => setIsBiometricModalOpen(true)}
              className="px-6 py-3 rounded-full text-sm font-semibold text-black bg-white hover:bg-neutral-200 transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <Fingerprint className="w-4 h-4 text-emerald-600" />
              <span>{t.showcase.unlockCta}</span>
            </button>

            <button 
              onClick={onEnterDashboard}
              className="px-6 py-3 rounded-full text-sm font-medium text-white bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{t.showcase.demoAccess}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SENSORY BIOMETRIC AUTHENTICATION MODAL */}
      <SensoryBiometricModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onSuccess={() => {
          setIsBiometricModalOpen(false);
          onEnterDashboard();
        }}
        onGoogleSignIn={onSignIn}
        authError={authError}
      />

      {/* MINIMALIST FOOTER */}
      <footer className="border-t border-white/[0.08] py-8 px-4 sm:px-6 text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <SensoriumLogo size="sm" />
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>© 2026 SENSORIUM Technologies Inc.</span>
            <span>•</span>
            <span>Anycast Mesh</span>
            <span>•</span>
            <span>ISO 27001 / SOC2 Type II</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Backward-compatibility alias
export const NanoBananaShowcase = SensoriumShowcase;
