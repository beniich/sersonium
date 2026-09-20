import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Terminal,
  Play,
  Sparkles,
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Layers,
  Code2,
  Brain,
  Sliders,
  ShieldAlert
} from "lucide-react";

interface InferenceSandboxSectionProps {
  onEnterDashboard: () => void;
}

interface CodeTemplate {
  id: string;
  name: string;
  badge: string;
  category: "iot" | "hvac" | "secops" | "vision";
  code: string;
  simulatedOutput: string;
  executionTime: string;
  memoryUsed: string;
  tensorOps: string;
}

const SANDBOX_TEMPLATES: CodeTemplate[] = [
  {
    id: "vibration",
    name: "Predictive Vibration Anomaly Detection (Industrial Motors)",
    badge: "Industrial IoT INT4",
    category: "iot",
    code: `import { SensoriumEdge, TensorQuantizer } from "@sensorium/edge-runtime";

// 1. Ingestion of 100 kHz triaxial accelerometer stream
export default async function onVibrationStream(event: SensorBatchEvent) {
  const { motorId, axes, rpm, tempCelsius } = event.payload;
  
  // 2. FFT transformation & local INT4 inference on Silicon X1 NPU
  const spectralPeaks = FastFourierTransform.analyze(axes, { sampleRate: 100_000 });
  const anomalyScore = await SensoriumEdge.NPU.predict({
    model: "vibration-anomaly-quant-int4",
    inputs: [spectralPeaks, rpm, tempCelsius],
    precision: "INT4_TENSOR"
  });

  // 3. Prescriptive trigger if micro-crack threshold is exceeded
  if (anomalyScore > 0.82) {
    return {
      status: "CRITICAL_ANOMALY_DETECTED",
      component: "Axle-2 Ball Bearing",
      confidence: 0.964,
      prescriptiveAction: "Reduce speed to 1200 RPM & Alert Maintenance Team"
    };
  }

  return { status: "NOMINAL", p99LatencyMicros: 420 };
}`,
    simulatedOutput: `[V8 Isolate] Worker initialized in 4 µs.
[Silicon X1 NPU] Model 'vibration-anomaly-quant-int4' loaded in SRAM (4.2 MB).
[Sensor] Ingestion of 10,000 acceleration points (Motor #TURBINE-04).
[FFT] Spectral peaks detected at 1,420 Hz (Abnormal H3 harmonic).
[INT4 Inference] Computed anomaly score: 0.891 > Threshold 0.82.
>>> DECISION: PRESCRIPTIVE ACTION TRIGGERED (RPM reduction + CMMS Ticket #84912 generated).`,
    executionTime: "1.82 ms",
    memoryUsed: "4.8 MB",
    tensorOps: "14.2 GFLOPS"
  },
  {
    id: "hvac",
    name: "Dynamic HVAC Regulation & PUE Energy Optimization",
    badge: "Smart Building ESG",
    category: "hvac",
    code: `import { BuildingOptimizer } from "@sensorium/edge-runtime";

export default async function optimizeHVAC(context: FacilityContext) {
  const { currentPowerKw, ambientTemp, occupancyMatrix, electricityTariff } = context;

  // Thermodynamic delta calculation and 15-min load forecast
  const optimalSetpoint = await BuildingOptimizer.calculateOptimum({
    targetPUE: 1.08,
    occupancyForecast: occupancyMatrix,
    gridCostEurPerKwh: electricityTariff
  });

  return {
    coolingZoneA: optimalSetpoint.zoneA_temp,
    airflowCFM: optimalSetpoint.fanSpeed,
    projectedDailySavingsEur: 142.50,
    carbonAvoidedKg: 38.2
  };
}`,
    simulatedOutput: `[Facility Sensor Hub] 48 HVAC probes synchronized.
[Thermodynamic Model] Outdoor temperature: 31.4°C | Occupancy rate: 74%.
[PUE Calculation] Thermodynamic optimization converged in 14 iterations.
>>> RESULT: Setpoint temperature adjusted to 22.4°C (+0.8°C optimized).
>>> ESTIMATED SAVINGS: $142.50/day | 38.2 kg CO2 avoided.`,
    executionTime: "0.94 ms",
    memoryUsed: "3.2 MB",
    tensorOps: "6.8 GFLOPS"
  },
  {
    id: "secops",
    name: "L7 DDoS Mitigation & Botnet Heuristic Scoring",
    badge: "eBPF Cyberdefense",
    category: "secops",
    code: `import { WAFEngine } from "@sensorium/security";

export async function onHTTPRequest(req: EdgeRequest) {
  const ipScore = await WAFEngine.reputationLookup(req.clientIP);
  const fingerprint = req.tlsFingerprint;

  if (ipScore.threatLevel === "HIGH" || fingerprint.isKnownScraper) {
    // Cookieless cryptographic challenge
    return WAFEngine.issueProofOfWorkChallenge({ difficulty: 16 });
  }

  return { pass: true, latencyNs: 120 };
}`,
    simulatedOutput: `[eBPF Ingress] HTTP/3 QUIC packet analysis (Client IP: 185.220.101.5).
[TLS Fingerprint] JA4 fingerprint = t13d1516h2_8daaf6152771_b098192ecae5 (Aggressive scraper).
[WAF Heuristics] Threat score: 94/100.
>>> DECISION: DROP_PACKET & Temporary BGP Blackhole (Duration: 300s).`,
    executionTime: "0.28 ms",
    memoryUsed: "1.1 MB",
    tensorOps: "1.2 GFLOPS"
  }
];

export default function InferenceSandboxSection({
  onEnterDashboard
}: InferenceSandboxSectionProps) {
  const [activeTemplateId, setActiveTemplateId] = useState<string>("vibration");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasExecuted, setHasExecuted] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const activeTemplate = SANDBOX_TEMPLATES.find((t) => t.id === activeTemplateId) || SANDBOX_TEMPLATES[0];

  const handleRunCode = () => {
    setIsRunning(true);
    setHasExecuted(false);
    setTimeout(() => {
      setIsRunning(false);
      setHasExecuted(true);
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeTemplate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12">
      {/* SECTION HEADER */}
      <div className="text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">
          <Terminal className="w-3.5 h-3.5" />
          <span>V8 Isolate & Silicon Tensor Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Edge Inference & V8 Execution Sandbox
        </h2>
        <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
          Test Sensorium's serverless runtime engine: write TypeScript code, run quantized INT4 neural models
          in microseconds, and observe prescriptive decisions with zero cloud dependencies.
        </p>
      </div>

      {/* TEMPLATE PICKER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SANDBOX_TEMPLATES.map((tmpl) => {
          const isSelected = tmpl.id === activeTemplateId;
          return (
            <button
              key={tmpl.id}
              onClick={() => {
                setActiveTemplateId(tmpl.id);
                setHasExecuted(true);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? "bg-white text-black font-semibold border-white shadow-md"
                  : "bg-white/[0.03] text-neutral-400 hover:text-white border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{tmpl.name.split("(")[0]}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-black/10 text-black" : "bg-white/10 text-neutral-300"}`}>
                {tmpl.badge.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* INTERACTIVE IDE & CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Left 7 Cols: Code Editor */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0d0d12] border border-white/[0.1] overflow-hidden flex flex-col shadow-2xl">
          
          {/* IDE Window Bar */}
          <div className="px-4 py-3 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-neutral-400 ml-2">
                worker_{activeTemplate.id}.ts
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-3.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? "animate-spin" : ""}`} />
                <span>{isRunning ? "Running..." : "Run"}</span>
              </button>
            </div>
          </div>

          {/* Code Content */}
          <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed text-emerald-300 overflow-x-auto flex-1 bg-black/70 max-h-[420px]">
            <pre className="text-neutral-200">
              <code>{activeTemplate.code}</code>
            </pre>
          </div>

          {/* Runtime Metrics Bar */}
          <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400 flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Execution time: <strong className="text-white">{activeTemplate.executionTime}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              V8 Memory: <strong className="text-white">{activeTemplate.memoryUsed}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              INT4 NPU: <strong className="text-white">{activeTemplate.tensorOps}</strong>
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Live Terminal Console & Prescriptive Insights */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Terminal Console Output */}
          <div className="p-5 rounded-2xl bg-black/90 border border-white/[0.08] shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-white">Standard Output & Telemetry</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="font-mono text-xs text-neutral-300 space-y-2 min-h-[160px] max-h-[220px] overflow-y-auto leading-relaxed">
              {isRunning ? (
                <div className="flex items-center gap-2 text-yellow-400 py-8 justify-center">
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>JIT compilation & inference on Silicon X1 NPU...</span>
                </div>
              ) : hasExecuted ? (
                activeTemplate.simulatedOutput.split("\n").map((line, idx) => (
                  <div key={idx} className={line.startsWith(">>>") ? "text-emerald-400 font-bold" : "text-neutral-300"}>
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 py-8 text-center">Click "Run" to test.</div>
              )}
            </div>
          </div>

          {/* Prescriptive Recommendation Card */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-semibold">
              <Brain className="w-4 h-4" />
              <span>Prescriptive Agent Summary</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              The Sensorium runtime does not simply trigger an alert: it computes the optimal minimal
              compensatory action and injects it immediately into PLC controllers with zero network latency.
            </p>
            <div className="pt-2">
              <button
                onClick={onEnterDashboard}
                className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore AI Cockpit</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
