import React, { useState, useEffect } from 'react';

interface ArchitectureViewProps {
  onNavigate: (path: any) => void;
  onLaunchCockpit?: () => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onNavigate, onLaunchCockpit }) => {
  // Sync state
  const [syncActive, setSyncActive] = useState(true);
  const [calibrating, setCalibrating] = useState(false);

  // Air gap dial state: 0=100%, 1=75%, 2=50%, 3=OPEN
  const [dialState, setDialState] = useState(0);
  const dialLabels = ['ISOLATION: 100%', 'FILTERED PASS: 75%', 'BURST MIRROR: 50%', 'DEBUG TAP: OPEN'];

  // Predictive pass simulation
  const [predictiveState, setPredictiveState] = useState<'idle' | 'calculating' | 'done'>('idle');

  // Protocol shunt control buttons
  const [activeBuffers, setActiveBuffers] = useState<Record<string, boolean>>({
    'MQTT-8883': true,
    'BACNET-IP': true,
  });

  // Dynamic live latency jitter
  const [tier1Latency, setTier1Latency] = useState(0.42);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const v = Number((0.38 + Math.random() * 0.12).toFixed(2));
      setTier1Latency(v);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const handleToggleBuffer = (proto: string) => {
    setActiveBuffers((prev) => ({ ...prev, [proto]: !prev[proto] }));
  };

  const handleCycleAirGap = () => {
    setDialState((prev) => (prev + 1) % 4);
  };

  const handleTriggerPtpSync = () => {
    setCalibrating(true);
    setTimeout(() => setCalibrating(false), 800);
  };

  const handleRunPredictivePass = () => {
    setPredictiveState('calculating');
    setTimeout(() => {
      setPredictiveState('done');
      setTimeout(() => setPredictiveState('idle'), 3000);
    }, 1100);
  };

  const handleCopyCode = () => {
    const code = `import { z } from 'zod';
import { BACnetFrame, HSMSigner } from '@beecarbonat/edge-mesh';

export const TelemetryPayloadSchema = z.object({
  nodeId: z.string().uuid(),
  buildingRef: z.string().regex(/^BLD-[A-Z0-9]{4}$/),
  spatialZoneGuid: z.string().length(36),
  hvacVector: z.object({
    staticPressurePa: z.number().min(0).max(2500),
    thermalC: z.number().refine(v => v > -15 && v < 60),
    co2Ppm: z.number().int().positive(),
    refrigerantLoopDeltaT: z.number(),
  }),
  zeroTrustAttestation: z.string().startsWith('0x_SEC_L4_'),
  geminiMacroDispatched: z.boolean().default(false)
});`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 py-8 gap-8 max-w-7xl mx-auto">
      {/* TOP HERO ARCHITECTURE BANNER */}
      <section className="relative w-full rounded-2xl bg-[#f5f2fa] p-6 sm:p-10 shadow-[8px_8px_20px_rgba(112,104,133,0.14),-8px_-8px_20px_rgba(255,255,255,0.95)] overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#7c3aed]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efedf4] shadow-[inset_2px_2px_4px_rgba(112,104,133,0.18),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-[#630ed4] animate-ping" />
              <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] tracking-widest font-mono font-bold">
                MTLS HSM ACCREDITED // TIER-4 ENCLAVE
              </span>
            </div>
            <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl lg:text-5xl text-[#1b1b20] font-bold tracking-tight leading-tight">
              Architecture &amp; Pipeline Télémétrique Haute Fidélité
            </h1>
            <p className="font-['Inter'] text-sm sm:text-base text-[#4a4455] leading-relaxed">
              Du capteur physique IoT aux modèles spatiaux Gemini IA sans latence. Topologie unifiée CAFM Spider pour le pilotage d'infrastructures critiques.
            </p>
          </div>

          {/* Live Stream Quick Actuator */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#efedf4] shadow-[inset_3px_3px_6px_rgba(112,104,133,0.16),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#f5f2fa] flex items-center justify-center text-[#630ed4] shadow-[4px_4px_10px_rgba(112,104,133,0.2),-3px_-3px_8px_rgba(255,255,255,1)]">
                <span className="material-symbols-outlined text-[28px]">timeline</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-bold">
                  Global Clock Drift
                </span>
                <span className="font-['Space_Grotesk'] text-sm sm:text-base text-[#1b1b20] font-mono font-bold">
                  ± 0.0014 ms
                </span>
              </div>
            </div>
            <button
              onClick={handleTriggerPtpSync}
              className={`px-4 py-2.5 rounded-lg bg-[#f5f2fa] text-[#630ed4] font-['Space_Grotesk'] text-xs uppercase tracking-wider font-bold shadow-[4px_4px_10px_rgba(112,104,133,0.16),-4px_-4px_10px_rgba(255,255,255,0.95)] active:shadow-[inset_2px_2px_4px_rgba(112,104,133,0.25)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                calibrating ? 'scale-95 opacity-80' : ''
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${calibrating ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{calibrating ? 'Calibrating...' : 'Calibrate PTP'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* TACTILE METRIC STATS STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#f5f2fa] shadow-[6px_6px_14px_rgba(112,104,133,0.14),-6px_-6px_14px_rgba(255,255,255,0.95)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Space_Grotesk'] text-[11px] text-[#4a4455] uppercase tracking-wider font-bold">
              Surface Monitorée
            </span>
            <span className="material-symbols-outlined text-[#630ed4] text-[20px]">domain</span>
          </div>
          <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl text-[#1b1b20] font-mono font-bold">
            48.2M<span className="text-base text-[#630ed4]">m²</span>
          </div>
          <div className="mt-1 font-['Inter'] text-xs text-[#005952] flex items-center gap-1 font-mono font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +3.8M m² ce trimestre
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#f5f2fa] shadow-[6px_6px_14px_rgba(112,104,133,0.14),-6px_-6px_14px_rgba(255,255,255,0.95)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Space_Grotesk'] text-[11px] text-[#4a4455] uppercase tracking-wider font-bold">
              Mesh SLA Haute Dispo
            </span>
            <span className="material-symbols-outlined text-[#00746a] text-[20px]">network_check</span>
          </div>
          <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl text-[#1b1b20] font-mono font-bold">
            99.999%
          </div>
          <div className="mt-1 font-['Inter'] text-xs text-[#005952] flex items-center gap-1 font-mono font-semibold">
            <span className="material-symbols-outlined text-[14px]">shield</span> Zéro failover manqué
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#f5f2fa] shadow-[6px_6px_14px_rgba(112,104,133,0.14),-6px_-6px_14px_rgba(255,255,255,0.95)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Space_Grotesk'] text-[11px] text-[#4a4455] uppercase tracking-wider font-bold">
              Réduction Énergétique
            </span>
            <span className="material-symbols-outlined text-[#712edd] text-[20px]">bolt</span>
          </div>
          <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl text-[#1b1b20] font-mono font-bold">
            -42.6%
          </div>
          <div className="mt-1 font-['Inter'] text-xs text-[#630ed4] flex items-center gap-1 font-mono font-semibold">
            <span className="material-symbols-outlined text-[14px]">energy_savings_leaf</span> HVAC Dynamic Shaving
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#f5f2fa] shadow-[6px_6px_14px_rgba(112,104,133,0.14),-6px_-6px_14px_rgba(255,255,255,0.95)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Space_Grotesk'] text-[11px] text-[#4a4455] uppercase tracking-wider font-bold">
              Audit Dérive BIM
            </span>
            <span className="material-symbols-outlined text-[#630ed4] text-[20px]">task_alt</span>
          </div>
          <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl text-[#1b1b20] font-mono font-bold">
            0.00%
          </div>
          <div className="mt-1 font-['Inter'] text-xs text-[#4a4455] font-mono">
            Conformité IFC 4.3 certifiée
          </div>
        </div>
      </section>

      {/* 4-TIER FULLSTACK PIPELINE (TACTILE SCULPTED CONSOLES) */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#7c3aed] shadow-[0_0_10px_#7c3aed]" />
            <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl text-[#1b1b20] font-bold tracking-tight">
              4-Tier Industrial Mesh Architecture
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#efedf4] shadow-[inset_2px_2px_4px_rgba(112,104,133,0.18),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase font-bold">
              Bus Synchronisation:
            </span>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#00746a] font-mono uppercase font-bold">
              Full Duplex Ultra-Low Latency
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* TIER 1 */}
          <div className="flex flex-col rounded-2xl bg-[#f5f2fa] p-5 shadow-[8px_8px_18px_rgba(112,104,133,0.16),-8px_-8px_18px_rgba(255,255,255,0.95)] transition-all">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-[#630ed4] text-white font-['Space_Grotesk'] text-[10px] font-bold">
                  01
                </span>
                <span className="font-['Space_Grotesk'] text-sm text-[#1b1b20] font-bold">
                  Edge Cloudflare
                </span>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#00746a] shadow-[0_0_8px_#00746a]" />
            </div>
            <p className="font-['Inter'] text-xs text-[#4a4455] min-h-[44px] leading-relaxed">
              300+ Edge PoPs terminant les flux MQTT, BACnet/IP, Modbus RTU et WebSockets chiffrés.
            </p>

            {/* Inset Gauge Box */}
            <div className="my-3 p-3 rounded-xl bg-[#efedf4] shadow-[inset_3px_3px_6px_rgba(112,104,133,0.22),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-mono font-bold">
                  Ingest Latency
                </span>
                <span className="font-['Space_Grotesk'] text-xs text-[#00746a] font-mono font-bold">
                  {tier1Latency} ms
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#e3e1e8] shadow-[inset_1px_1px_3px_rgba(112,104,133,0.3)] overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#00746a] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round(tier1Latency * 70))}%` }}
                />
              </div>
              <div className="flex justify-between font-['Space_Grotesk'] text-[10px] text-[#7b7487] font-mono">
                <span>0.0 ms</span>
                <span>1.5 ms MAX</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase tracking-wider font-bold">
                Protocol Shunt Control
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleToggleBuffer('MQTT-8883')}
                  className={`px-2 py-2 rounded-lg font-['Space_Grotesk'] text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeBuffers['MQTT-8883']
                      ? 'bg-[#7c3aed] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]'
                      : 'bg-[#f5f2fa] text-[#1b1b20] shadow-[3px_3px_6px_rgba(112,104,133,0.18),-3px_-3px_6px_rgba(255,255,255,0.95)]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#89f5e7]" />
                  MQTT/mTLS
                </button>
                <button
                  onClick={() => handleToggleBuffer('BACNET-IP')}
                  className={`px-2 py-2 rounded-lg font-['Space_Grotesk'] text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeBuffers['BACNET-IP']
                      ? 'bg-[#7c3aed] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]'
                      : 'bg-[#f5f2fa] text-[#1b1b20] shadow-[3px_3px_6px_rgba(112,104,133,0.18),-3px_-3px_6px_rgba(255,255,255,0.95)]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#89f5e7]" />
                  BACnet/IP
                </button>
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between border-t border-[#706885]/10">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-mono">
                Buffer Cache
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-[#630ed4] font-mono font-bold">
                2.4 TB Flash RAM
              </span>
            </div>
          </div>

          {/* TIER 2 */}
          <div className="flex flex-col rounded-2xl bg-[#f5f2fa] p-5 shadow-[8px_8px_18px_rgba(112,104,133,0.16),-8px_-8px_18px_rgba(255,255,255,0.95)] transition-all">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-[#712edd] text-white font-['Space_Grotesk'] text-[10px] font-bold">
                  02
                </span>
                <span className="font-['Space_Grotesk'] text-sm text-[#1b1b20] font-bold">
                  Microservices &amp; API Mesh
                </span>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#8b4ef7] shadow-[0_0_8px_#8b4ef7]" />
            </div>
            <p className="font-['Inter'] text-xs text-[#4a4455] min-h-[44px] leading-relaxed">
              Validation de schémas spatiaux IFC 4.3, calibrage matriciel et dénormalisation géométrique en vol.
            </p>

            <div className="my-3 p-3 rounded-xl bg-[#efedf4] shadow-[inset_3px_3px_6px_rgba(112,104,133,0.22),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-mono font-bold">
                  Throughput Débit
                </span>
                <span className="font-['Space_Grotesk'] text-xl text-[#1b1b20] font-mono font-bold">
                  18,490
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#712edd] font-mono">
                  req / sec
                </span>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#dbd9e0] stroke-current"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-[#7c3aed] stroke-current"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeDasharray="78, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <span className="absolute font-['Space_Grotesk'] text-[10px] font-mono text-[#1b1b20] font-bold">
                  78%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <div className="px-3 py-1.5 rounded-lg bg-[#f5f2fa] shadow-[3px_3px_6px_rgba(112,104,133,0.14),-3px_-3px_6px_rgba(255,255,255,0.9)] flex items-center justify-between">
                <span className="font-['Space_Grotesk'] text-[10px] font-mono text-[#1b1b20]">
                  IFC 4x3 Spatial Parser
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#00746a] font-bold">READY</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#f5f2fa] shadow-[3px_3px_6px_rgba(112,104,133,0.14),-3px_-3px_6px_rgba(255,255,255,0.9)] flex items-center justify-between">
                <span className="font-['Space_Grotesk'] text-[10px] font-mono text-[#1b1b20]">
                  Affine Bias Compensation
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#712edd] font-bold">0.02% OFFSET</span>
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between border-t border-[#706885]/10">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-mono">
                Event Bus
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-[#1b1b20] font-mono font-semibold">
                Kafka 3-Broker Enclave
              </span>
            </div>
          </div>

          {/* TIER 3 */}
          <div className="flex flex-col rounded-2xl bg-[#f5f2fa] p-5 shadow-[8px_8px_18px_rgba(112,104,133,0.16),-8px_-8px_18px_rgba(255,255,255,0.95)] transition-all">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-[#00746a] text-white font-['Space_Grotesk'] text-[10px] font-bold">
                  03
                </span>
                <span className="font-['Space_Grotesk'] text-sm text-[#1b1b20] font-bold">
                  Persistance Neon &amp; Dexie
                </span>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#00746a] shadow-[0_0_8px_#00746a]" />
            </div>
            <p className="font-['Inter'] text-xs text-[#4a4455] min-h-[44px] leading-relaxed">
              PostgreSQL Neon serverless distribué + Dexie.js IndexedDB pour reprise intégrale déconnectée.
            </p>

            <div className="my-3 p-3 rounded-xl bg-[#efedf4] shadow-[inset_3px_3px_6px_rgba(112,104,133,0.22),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#1b1b20] font-mono uppercase font-bold">
                  Auto-Branching Sync
                </span>
                <span className={`font-['Inter'] text-xs font-mono font-semibold ${syncActive ? 'text-[#00746a]' : 'text-[#7b7487]'}`}>
                  {syncActive ? 'Bi-Directional Continuous' : 'Offline-First Queue Only'}
                </span>
              </div>
              <button
                onClick={() => setSyncActive(!syncActive)}
                className="relative w-14 h-8 rounded-full bg-[#e3e1e8] shadow-[inset_2px_2px_4px_rgba(112,104,133,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] p-1 transition-all cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-[2px_2px_5px_rgba(112,104,133,0.35),-2px_-2px_4px_rgba(255,255,255,1)] flex items-center justify-center transition-transform ${
                    syncActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      syncActive ? 'bg-[#00746a] shadow-[0_0_6px_#00746a]' : 'bg-[#7b7487]'
                    }`}
                  />
                </div>
              </button>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-[#1b1b20] font-mono">
                <span className="text-[#4a4455]">Cloud Neon PG 16</span>
                <span className="text-[#00746a] font-bold">12 Read Replicas</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#efedf4] shadow-[inset_1px_1px_2px_rgba(112,104,133,0.2)]">
                <div className="h-full bg-[#00746a] rounded-full w-full" />
              </div>
              <div className="flex items-center justify-between text-xs text-[#1b1b20] font-mono mt-1">
                <span className="text-[#4a4455]">Dexie Local Storage</span>
                <span className="text-[#630ed4] font-bold">Zero-Copy Memory</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#efedf4] shadow-[inset_1px_1px_2px_rgba(112,104,133,0.2)]">
                <div className="h-full bg-[#7c3aed] rounded-full w-4/5" />
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between border-t border-[#706885]/10">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-mono">
                Conflict Engine
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-[#00746a] font-mono font-bold">
                CRDT State-Vector
              </span>
            </div>
          </div>

          {/* TIER 4 */}
          <div className="flex flex-col rounded-2xl bg-[#f5f2fa] p-5 shadow-[8px_8px_18px_rgba(112,104,133,0.16),-8px_-8px_18px_rgba(255,255,255,0.95)] transition-all">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-[#7c3aed] text-white font-['Space_Grotesk'] text-[10px] font-bold">
                  04
                </span>
                <span className="font-['Space_Grotesk'] text-sm text-[#1b1b20] font-bold">
                  Moteur Inférence IA Gemini
                </span>
              </div>
              <div className="w-3 h-3 rounded-full bg-[#7c3aed] animate-pulse shadow-[0_0_10px_#7c3aed]" />
            </div>
            <p className="font-['Inter'] text-xs text-[#4a4455] min-h-[44px] leading-relaxed">
              Modèle thermodynamique prédictif &amp; détection d'anomalies aérauliques. Dispatching automatique de macros HVAC.
            </p>

            <div className="my-3 p-3 rounded-xl bg-[#efedf4] shadow-[inset_3px_3px_6px_rgba(112,104,133,0.22),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-mono font-bold">
                  Confidence Level
                </span>
                <span className="font-['Space_Grotesk'] text-xs text-[#630ed4] font-mono font-bold">
                  99.84%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#dbd9e0] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#712edd] to-[#7c3aed] w-[99.8%]" />
              </div>
              <div className="font-['Inter'] text-[11px] text-[#4a4455] font-mono mt-0.5">
                Modèle: <span className="text-[#1b1b20] font-semibold">Gemini 1.5 Pro Telemetry Tuning</span>
              </div>
            </div>

            <div className="flex flex-col pt-1">
              <button
                onClick={handleRunPredictivePass}
                className="w-full py-2.5 rounded-xl bg-[#7c3aed] text-white font-['Space_Grotesk'] text-xs uppercase tracking-wider font-bold shadow-[4px_4px_12px_rgba(112,104,133,0.25),-3px_-3px_8px_rgba(255,255,255,0.9),0_0_14px_rgba(124,58,237,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-105"
              >
                {predictiveState === 'calculating' ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    <span>CALCULATING VECTOR...</span>
                  </>
                ) : predictiveState === 'done' ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>MACROS DISPATCHED (0 ERR)</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    <span>Trigger Predictive Pass</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between border-t border-[#706885]/10">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-mono">
                Cycle Inférence
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-[#630ed4] font-mono font-bold">
                120ms Quantum Pass
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SPLIT SECTION: INSET CODE TERMINAL + HARDWARE HSM ENCLAVE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CODE TERMINAL - 7 cols */}
        <div className="lg:col-span-7 rounded-2xl bg-[#f5f2fa] p-5 sm:p-6 shadow-[8px_8px_20px_rgba(112,104,133,0.14),-8px_-8px_20px_rgba(255,255,255,0.95)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#dbd9e0] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]" />
              <div className="w-3 h-3 rounded-full bg-[#dbd9e0] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]" />
              <div className="w-3 h-3 rounded-full bg-[#dbd9e0] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]" />
              <span className="ml-2 font-['Space_Grotesk'] text-xs text-[#4a4455] font-mono">
                telemetryStream.schema.ts
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#efedf4] shadow-[inset_1px_1px_3px_rgba(112,104,133,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#00746a] animate-ping" />
              <span className="font-['Space_Grotesk'] text-[10px] font-mono text-[#00746a] font-bold">
                STREAMING 14,890 PKTS/S
              </span>
            </div>
          </div>

          {/* Debossed CRT Terminal Window */}
          <div className="relative w-full rounded-xl bg-[#303035] p-5 shadow-[inset_4px_4px_12px_rgba(0,0,0,0.7),inset_-2px_-2px_6px_rgba(255,255,255,0.08)] overflow-x-auto font-mono text-xs leading-relaxed select-text text-[#f2f0f7]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20" />
            <div className="flex flex-col gap-1 relative z-10 text-slate-300">
              <div>
                <span className="text-[#ebddff]">import</span> &#123; <span className="text-[#89f5e7]">z</span> &#125; <span className="text-[#ebddff]">from</span> <span className="text-amber-200">'zod'</span>;
              </div>
              <div>
                <span className="text-[#ebddff]">import</span> &#123; <span className="text-[#89f5e7]">BACnetFrame</span>, <span className="text-[#89f5e7]">HSMSigner</span> &#125; <span className="text-[#ebddff]">from</span> <span className="text-amber-200">'@beecarbonat/edge-mesh'</span>;
              </div>
              <div className="text-slate-500">// Schema spatial validé à la volée sur les 300+ Edge Nodes Cloudflare</div>
              <div className="mt-1">
                <span className="text-[#ebddff]">export const</span> <span className="text-[#6bd8cb]">TelemetryPayloadSchema</span> = z.object(&#123;
              </div>
              <div className="pl-4">nodeId: z.string().uuid(),</div>
              <div className="pl-4">buildingRef: z.string().regex(<span className="text-amber-200">/^BLD-[A-Z0-9]&#123;4&#125;$/</span>),</div>
              <div className="pl-4">spatialZoneGuid: z.string().length(<span className="text-amber-200">36</span>),</div>
              <div className="pl-4">hvacVector: z.object(&#123;</div>
              <div className="pl-8">staticPressurePa: z.number().min(<span className="text-amber-200">0</span>).max(<span className="text-amber-200">2500</span>),</div>
              <div className="pl-8">thermalC: z.number().refine(v =&gt; v &gt; <span className="text-amber-200">-15</span> &amp;&amp; v &lt; <span className="text-amber-200">60</span>),</div>
              <div className="pl-8">co2Ppm: z.number().int().positive(),</div>
              <div className="pl-8">refrigerantLoopDeltaT: z.number(),</div>
              <div className="pl-4">&#125;),</div>
              <div className="pl-4">zeroTrustAttestation: z.string().startsWith(<span className="text-amber-200">'0x_SEC_L4_'</span>),</div>
              <div className="pl-4">geminiMacroDispatched: z.boolean().default(<span className="text-amber-200">false</span>)</div>
              <div>&#125;);</div>
              <div className="mt-2 text-slate-500">// Direct execution trace:</div>
              <div className="text-[#6bd8cb] flex items-center gap-1">
                <span>&gt;&gt; [INGEST] PACKET #049281 VALIDATED. ZERO ANOMALY.</span>
                <span className="inline-block w-2 h-3.5 bg-[#89f5e7] animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="font-['Inter'] text-xs text-[#4a4455]">
              Validation temps-réel Zod optimisée WebAssembly (V8 Isolated)
            </span>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-[#f5f2fa] text-[#1b1b20] font-['Space_Grotesk'] text-xs font-bold shadow-[3px_3px_8px_rgba(112,104,133,0.18),-3px_-3px_8px_rgba(255,255,255,0.9)] active:shadow-[inset_2px_2px_4px_rgba(112,104,133,0.25)] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copiedCode ? 'check' : 'content_copy'}
              </span>
              <span>{copiedCode ? 'Copied Contract' : 'Copy Contract'}</span>
            </button>
          </div>
        </div>

        {/* HARDWARE HSM ENCLAVE - 5 cols */}
        <div className="lg:col-span-5 rounded-2xl bg-[#f5f2fa] p-5 sm:p-6 shadow-[8px_8px_20px_rgba(112,104,133,0.14),-8px_-8px_20px_rgba(255,255,255,0.95)] relative">
          {/* Machine corner screws */}
          <div className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full bg-[#dbd9e0] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4),1px_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center">
            <div className="w-2 h-[1px] bg-[#ccc3d8] rotate-45" />
          </div>
          <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-[#dbd9e0] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4),1px_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center">
            <div className="w-2 h-[1px] bg-[#ccc3d8] -rotate-12" />
          </div>
          <div className="absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full bg-[#dbd9e0] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4),1px_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center">
            <div className="w-2 h-[1px] bg-[#ccc3d8] -rotate-45" />
          </div>
          <div className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full bg-[#dbd9e0] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4),1px_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center">
            <div className="w-2 h-[1px] bg-[#ccc3d8] rotate-60" />
          </div>

          <div className="flex flex-col gap-4 px-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#630ed4]">security</span>
                <span className="font-['Space_Grotesk'] text-sm text-[#1b1b20] font-bold uppercase tracking-tight">
                  Hardware Secure Module (HSM)
                </span>
              </div>
              <span className="font-['Space_Grotesk'] text-[10px] px-2 py-0.5 rounded bg-[#005952]/10 text-[#005952] font-mono font-bold">
                FIPS 140-3 L-4
              </span>
            </div>

            <p className="font-['Inter'] text-xs text-[#4a4455] leading-relaxed">
              Puce de sécurité inviolable embarquée. Isolation matérielle assurant qu'aucun vecteur d'attaque ne pénètre l'infrastructure CVC.
            </p>

            {/* Diodes Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#efedf4] shadow-[inset_2px_2px_5px_rgba(112,104,133,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00746a] shadow-[0_0_8px_#00746a]" />
                <div className="flex flex-col text-left">
                  <span className="font-['Space_Grotesk'] text-[11px] font-mono text-[#1b1b20] font-bold">RSA-PSS 4096</span>
                  <span className="font-['Space_Grotesk'] text-[9px] text-[#7b7487]">Attestation Active</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00746a] shadow-[0_0_8px_#00746a]" />
                <div className="flex flex-col text-left">
                  <span className="font-['Space_Grotesk'] text-[11px] font-mono text-[#1b1b20] font-bold">Zero-Leak Tamper</span>
                  <span className="font-['Space_Grotesk'] text-[9px] text-[#7b7487]">Circuit Scellé</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#7c3aed] shadow-[0_0_8px_#7c3aed]" />
                <div className="flex flex-col text-left">
                  <span className="font-['Space_Grotesk'] text-[11px] font-mono text-[#1b1b20] font-bold">Diffie-Hellman</span>
                  <span className="font-['Space_Grotesk'] text-[9px] text-[#7b7487]">Ephemeral Keyring</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00746a] shadow-[0_0_8px_#00746a]" />
                <div className="flex flex-col text-left">
                  <span className="font-['Space_Grotesk'] text-[11px] font-mono text-[#1b1b20] font-bold">PTP Grandmaster</span>
                  <span className="font-['Space_Grotesk'] text-[9px] text-[#7b7487]">Atomic Sync Lock</span>
                </div>
              </div>
            </div>

            {/* Knurled Rotary Dial */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#efedf4] shadow-[3px_3px_8px_rgba(112,104,133,0.12),-3px_-3px_8px_rgba(255,255,255,0.9)]">
              <div className="flex flex-col text-left">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#7b7487] uppercase font-mono font-bold">
                  Air-Gap Shutter Level
                </span>
                <span className="font-['Space_Grotesk'] text-sm sm:text-base text-[#1b1b20] font-mono font-bold">
                  {dialLabels[dialState]}
                </span>
                <span className="font-['Inter'] text-[11px] text-[#4a4455]">
                  Zero inbound remote exploit surface
                </span>
              </div>
              <div
                onClick={handleCycleAirGap}
                className="relative w-14 h-14 rounded-full bg-[#f5f2fa] shadow-[5px_5px_10px_rgba(112,104,133,0.22),-4px_-4px_8px_rgba(255,255,255,0.95)] flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform"
                title="Cliquer pour ajuster le niveau de fermeture physique"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-[#dbd9e0] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(0,0,0,0.15)] flex items-center justify-center">
                  <div
                    className="w-1 h-3 bg-[#630ed4] rounded-full transition-transform duration-300"
                    style={{ transform: `rotate(${dialState * 90}deg) translateY(-8px)` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-[#4a4455]">
              <span>ENCLAVE DIGEST: 8F2A-CC01-998E</span>
              <span className="text-[#00746a] font-bold">TAMPER PROOF OK</span>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTOREALISTIC INDUSTRIAL ASSET INJECTION STRIP */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group rounded-2xl bg-[#f5f2fa] p-4 shadow-[6px_6px_16px_rgba(112,104,133,0.12),-6px_-6px_16px_rgba(255,255,255,0.95)] flex flex-col gap-3">
          <div className="w-full h-44 rounded-xl overflow-hidden shadow-[inset_2px_2px_6px_rgba(0,0,0,0.15)] bg-slate-900">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="Data center Edge racks"
              src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
            />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <span className="font-['Space_Grotesk'] text-sm sm:text-base text-[#1b1b20] font-bold">
              Centres de Calcul Edge
            </span>
            <p className="font-['Inter'] text-xs text-[#4a4455] leading-relaxed">
              Topologie distribuée de passerelles matérielles mTLS réparties dans les colonnes techniques de chaque actif immobilier.
            </p>
          </div>
        </div>

        <div className="group rounded-2xl bg-[#f5f2fa] p-4 shadow-[6px_6px_16px_rgba(112,104,133,0.12),-6px_-6px_16px_rgba(255,255,255,0.95)] flex flex-col gap-3">
          <div className="w-full h-44 rounded-xl overflow-hidden shadow-[inset_2px_2px_6px_rgba(0,0,0,0.15)] bg-slate-900">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="Centrale Technique CVC"
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
            />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <span className="font-['Space_Grotesk'] text-sm sm:text-base text-[#1b1b20] font-bold">
              Centrale Technique CVC
            </span>
            <p className="font-['Inter'] text-xs text-[#4a4455] leading-relaxed">
              Réseaux hydrauliques et aérauliques asservis en boucle fermée via nos régulateurs BACnet/IP de précision.
            </p>
          </div>
        </div>

        <div className="group rounded-2xl bg-[#f5f2fa] p-4 shadow-[6px_6px_16px_rgba(112,104,133,0.12),-6px_-6px_16px_rgba(255,255,255,0.95)] flex flex-col gap-3">
          <div className="w-full h-44 rounded-xl overflow-hidden shadow-[inset_2px_2px_6px_rgba(0,0,0,0.15)] bg-slate-900">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="Cockpit d'Ingénierie Spatial"
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
            />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <span className="font-['Space_Grotesk'] text-sm sm:text-base text-[#1b1b20] font-bold">
              Cockpit d'Ingénierie Spatial
            </span>
            <p className="font-['Inter'] text-xs text-[#4a4455] leading-relaxed">
              Rendu immersif Three.js des jumeaux numériques 3D avec superposition des gradients thermiques calculés par Gemini.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
