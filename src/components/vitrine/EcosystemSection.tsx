import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Wifi,
  Battery,
  Shield,
  ArrowRight,
  Code2,
  Terminal,
  QrCode,
  Sliders,
  Check
} from "lucide-react";

interface EcosystemSectionProps {
  onEnterDashboard: () => void;
}

export default function EcosystemSection({
  onEnterDashboard
}: EcosystemSectionProps) {
  const [activeDevice, setActiveDevice] = useState<"desktop" | "mobile" | "tablet">("desktop");
  const [selectedSdkLang, setSelectedSdkLang] = useState<"typescript" | "rust" | "python" | "go">("typescript");
  const [copiedSdk, setCopiedSdk] = useState<boolean>(false);

  const sdkSnippets = {
    typescript: `import { SensoriumClient } from "@sensorium/sdk-node";

// Automatic mTLS connection via TPM 2.0 sealed certificate
const client = new SensoriumClient({
  endpoint: "anycast.edge.sensorium.cloud:443",
  tenantId: "org_enterprise_sovereign",
  autoHeartbeat: true
});

// Subscribe to live inference stream
client.telemetry.subscribe("turbines/vibration", (sample) => {
  console.log("100kHz sensor sample:", sample.anomalyScore);
});`,
    rust: `use sensorium_edge_sdk::{SensoriumClient, SensorPayload};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = SensoriumClient::connect_tpm("anycast.edge.sensorium.cloud").await?;
    
    // Zero-copy DMA ingestion
    client.stream_sensor_batch("vibration_axis_z", &payload).await?;
    Ok(())
}`,
    python: `from sensorium_sdk import SensoriumEdge

# High-performance client initialization
client = SensoriumEdge.connect(
    cluster="anycast.edge.sensorium.cloud",
    cert_path="/etc/sensorium/tls.crt"
)

# Local INT4 inference on Silicon X1
prediction = client.npu.predict(model="anomaly-int4", tensor_data=matrix)`,
    go: `package main

import (
	"context"
	"github.com/sensorium/edge-go-sdk"
)

func main() {
	client, _ := sensorium.NewClient(context.Background(), sensorium.Config{
		Endpoint: "anycast.edge.sensorium.cloud",
		UseHardwareTPM: true,
	})
	defer client.Close()
}`
  };

  const handleCopySdk = () => {
    navigator.clipboard.writeText(sdkSnippets[selectedSdkLang]);
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 2000);
  };

  return (
    <div className="space-y-12">
      {/* SECTION HEADER */}
      <div className="text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
          <Monitor className="w-3.5 h-3.5" />
          <span>Multi-Platform Ecosystem & SDK</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          A Unified Experience from 4K NOC to Rugged Field Devices
        </h2>
        <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
          Sensorium adapts instantly to any operational context: centralized control room orchestration,
          touch diagnostics on rugged field inspection tablets, or haptic mobile alerts on the move.
        </p>
      </div>

      {/* DEVICE SIMULATOR SELECTOR */}
      <div className="flex items-center justify-center">
        <div className="p-1 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center gap-1">
          <button
            onClick={() => setActiveDevice("desktop")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeDevice === "desktop" ? "bg-white text-black font-semibold shadow-xs" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>4K Studio / NOC Cockpit</span>
          </button>
          <button
            onClick={() => setActiveDevice("tablet")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeDevice === "tablet" ? "bg-white text-black font-semibold shadow-xs" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Rugged Field Tablet</span>
          </button>
          <button
            onClick={() => setActiveDevice("mobile")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeDevice === "mobile" ? "bg-white text-black font-semibold shadow-xs" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Field PWA</span>
          </button>
        </div>
      </div>

      {/* DEVICE FRAME SIMULATOR */}
      <div className="p-4 sm:p-8 rounded-3xl bg-[#0d0d12] border border-white/[0.1] shadow-2xl flex items-center justify-center min-h-[460px]">
        
        {/* DESKTOP SIMULATOR */}
        {activeDevice === "desktop" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl rounded-2xl bg-black border border-white/20 overflow-hidden shadow-2xl text-left"
          >
            {/* Desktop Window Titlebar */}
            <div className="px-4 py-2.5 bg-neutral-900 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-neutral-400 ml-2">
                  Sensorium Enterprise Cockpit — NOC Control Room (4K Ultra-Wide)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>340 Connected POPs</span>
              </div>
            </div>

            {/* Desktop Screen Mockup */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="text-xs font-mono text-neutral-400">Global Anycast Latency</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">1.2 ms</div>
                <div className="text-[10px] text-neutral-500">Direct optical routing active</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="text-xs font-mono text-neutral-400">Kafka Ingestion Throughput</div>
                <div className="text-2xl font-bold text-white font-mono">2.4M msg/s</div>
                <div className="text-[10px] text-neutral-500">Consumer lag: 0 ms</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="text-xs font-mono text-neutral-400">Silicon X1 Integrity</div>
                <div className="text-2xl font-bold text-purple-400 font-mono">100% NOMINAL</div>
                <div className="text-[10px] text-neutral-500">FIPS 140-3 sealed enclave</div>
              </div>

              {/* Central Map / Telemetry visual placeholder */}
              <div className="md:col-span-3 p-4 rounded-xl bg-black/80 border border-white/[0.06] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-white">High-Density Console</div>
                  <div className="text-[11px] text-neutral-400">Matrix supervision of 1,200 blades in real time.</div>
                </div>
                <button
                  onClick={onEnterDashboard}
                  className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Enter Cockpit
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TABLET SIMULATOR */}
        {activeDevice === "tablet" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-3xl bg-neutral-900 p-4 border-4 border-neutral-700 shadow-2xl text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-neutral-400">
              <span className="font-bold text-white">CMMS INSPECTOR V4</span>
              <div className="flex items-center gap-3">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <Battery className="w-3.5 h-3.5 text-white" />
                <span>94%</span>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Site #42: North Hydro Turbine</span>
                  <span className="text-emerald-400 font-mono text-[10px]">COMPLIANT</span>
                </div>
                <div className="text-xs text-neutral-400 mt-1">INT4 vibration audit validated by local Silicon X1.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>HVAC Thermal Reading</span>
                  <span className="text-purple-400 font-mono text-[10px]">PUE 1.08</span>
                </div>
                <div className="text-xs text-neutral-400 mt-1">Daily savings recorded: $142.50.</div>
              </div>
            </div>

            <button
              onClick={onEnterDashboard}
              className="w-full py-2 rounded-xl bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-all cursor-pointer text-center"
            >
              Sign Inspection Report
            </button>
          </motion.div>
        )}

        {/* MOBILE SIMULATOR */}
        {activeDevice === "mobile" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-72 rounded-[40px] bg-black p-4 border-[6px] border-neutral-800 shadow-2xl text-left relative overflow-hidden"
          >
            {/* Dynamic Island Notch */}
            <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-3 px-1">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <Battery className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Mobile Content */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10">
                <div className="text-[10px] font-mono text-neutral-400">Haptic Alert</div>
                <div className="text-xs font-bold text-white mt-0.5">Micro-fissure Engine #4</div>
                <div className="text-[10px] text-emerald-400 mt-1">Prescriptive action applied</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10">
                <div className="text-[10px] font-mono text-neutral-400">NFC Blade Pairing</div>
                <div className="text-xs font-bold text-white mt-0.5">EdgeBlade X1-Pro #84</div>
                <div className="text-[10px] text-purple-400 mt-1">mTLS certificate verified</div>
              </div>

              <button
                onClick={onEnterDashboard}
                className="w-full py-2 rounded-2xl bg-white text-black font-semibold text-xs transition-all cursor-pointer text-center mt-3"
              >
                Open on Mobile
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* MULTI-LANGUAGE SDK CODE SUITE */}
      <div className="p-6 sm:p-8 rounded-2xl bg-black/60 border border-white/[0.08] text-left space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Developer SDKs & Official Connectors
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Deploy your edge microservices in a few lines of code in your favorite language.
            </p>
          </div>

          {/* Lang switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            {(["typescript", "rust", "python", "go"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedSdkLang(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  selectedSdkLang === lang ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="rounded-xl bg-[#08080c] border border-white/[0.06] p-4 relative font-mono text-xs text-neutral-300 overflow-x-auto">
          <button
            onClick={handleCopySdk}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white text-[11px] flex items-center gap-1 transition-all cursor-pointer"
          >
            {copiedSdk ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
            <span>{copiedSdk ? "Copied!" : "Copy SDK"}</span>
          </button>
          <pre>
            <code>{sdkSnippets[selectedSdkLang]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
