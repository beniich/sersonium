import React, { useState } from 'react';

interface SixPillarsViewProps {
  onNavigate: (path: any) => void;
  onOpenPillar?: (pillarIndex: number) => void;
}

export const SixPillarsView: React.FC<SixPillarsViewProps> = ({ onNavigate, onOpenPillar }) => {
  // Rocker switch state for Pillar 1
  const [rockerActive, setRockerActive] = useState(true);

  // Bench simulator mode & slider values
  const [benchMode, setBenchMode] = useState<'datacenter' | 'campus' | 'industry'>('datacenter');
  const [nodesCount, setNodesCount] = useState(14800);

  // Bench options checkboxes
  const [benchMesh3d, setBenchMesh3d] = useState(true);
  const [benchBacnet, setBenchBacnet] = useState(true);
  const [benchHsm, setBenchHsm] = useState(true);

  // Slicing active button in Pillar 4
  const [activeSlice, setActiveSlice] = useState<'R+1' | 'R+2' | 'R+3'>('R+1');

  // Deploy button feedback
  const [deploying, setDeploying] = useState(false);

  const handleSwitchBenchMode = (mode: 'datacenter' | 'campus' | 'industry') => {
    setBenchMode(mode);
    if (mode === 'datacenter') {
      setNodesCount(14800);
    } else if (mode === 'campus') {
      setNodesCount(45000);
    } else if (mode === 'industry') {
      setNodesCount(82000);
    }
  };

  const handleDeployPillars = () => {
    setDeploying(true);
    setTimeout(() => {
      setDeploying(false);
      onNavigate('cockpit');
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 py-8 gap-8 max-w-7xl mx-auto">
      {/* Top Ambient Specular Gradient Fill & Header Section */}
      <div className="relative w-full overflow-hidden">
        {/* Subtle Ambient Energy Orbs */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-[#7c3aed]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#6bd8cb]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5f2fa] shadow-[inset_2px_2px_5px_rgba(112,104,133,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.95)] mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#630ed4] animate-ping" />
            <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] uppercase tracking-widest font-bold">
              Architecture Industrielle L4
            </span>
            <span className="text-[#ccc3d8]">•</span>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono uppercase font-bold">
              Version Core 4.9.2-Prod
            </span>
          </div>

          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl lg:text-5xl text-[#1b1b20] font-bold tracking-tight leading-tight mb-3">
            Les 6 Piliers Industriels de{' '}
            <span className="text-[#630ed4] underline decoration-[#630ed4]/30 decoration-wavy decoration-2">
              Spider CAFM
            </span>
          </h1>

          <p className="font-['Inter'] text-sm sm:text-base text-[#4a4455] max-w-3xl leading-relaxed">
            Cadre modulaire interconnectant le matériel physique brut, l'hypervision spatiale 3D et les audits réglementaires. Conçu pour résister aux ruptures réseau avec une fidélité d'instrumentation de classe avionique.
          </p>

          {/* Live Bus Telemetry Summary Bar */}
          <div className="mt-6 p-4 rounded-2xl bg-[#f5f2fa] shadow-[inset_3px_3px_7px_rgba(112,104,133,0.18),inset_-3px_-3px_7px_rgba(255,255,255,0.95)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#005952] shadow-[0_0_10px_#00746a] ring-2 ring-[#89f5e7]" />
                <div className="flex flex-col text-left">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase font-bold">
                    Protocole Bus
                  </span>
                  <span className="font-['Space_Grotesk'] text-xs sm:text-sm text-[#1b1b20] font-mono font-bold">
                    KNX/BACnet/IP Actif
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-[#ccc3d8]/40 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#630ed4] text-[20px]">sync_alt</span>
                <div className="flex flex-col text-left">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase font-bold">
                    Débit Télémétrique
                  </span>
                  <span className="font-['Space_Grotesk'] text-xs sm:text-sm text-[#1b1b20] font-mono font-bold">
                    1 248 190 pts/sec
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-[#ccc3d8]/40 hidden md:block" />

              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#00746a] text-[20px]">verified</span>
                <div className="flex flex-col text-left">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase font-bold">
                    Souveraineté L-4
                  </span>
                  <span className="font-['Space_Grotesk'] text-xs sm:text-sm text-[#1b1b20] font-mono font-bold">
                    Cloudflare + HSM
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono font-bold">
                SYNCHRO ATOMIQUE:
              </span>
              <span className="px-2 py-1 rounded bg-[#fbf8ff] shadow-[inset_1px_1px_3px_rgba(112,104,133,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.8)] font-['Space_Grotesk'] text-xs text-[#712edd] font-mono font-bold">
                ±0.82 ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The 6 Industrial Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* PILLAR 01: Smart Utilities & BMS */}
        <div className="rounded-2xl p-6 bg-[#fbf8ff] shadow-[8px_8px_20px_rgba(112,104,133,0.16),-8px_-8px_20px_rgba(255,255,255,0.95)] flex flex-col justify-between relative group hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 shadow-[0_1px_0_rgba(112,104,133,0.1)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#630ed4] shadow-[0_0_8px_#7c3aed]" />
                <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-mono uppercase tracking-wider font-bold">
                  PILL-01 // BMS
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#efedf4] font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono">
                BACnet 52.8k
              </span>
            </div>

            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#f5f2fa] shadow-[4px_4px_10px_rgba(112,104,133,0.16),-4px_-4px_10px_rgba(255,255,255,0.95)] flex items-center justify-center text-[#630ed4] shrink-0">
                <span className="material-symbols-outlined text-[28px]">electric_meter</span>
              </div>
              <div className="text-left">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#1b1b20] leading-snug">
                  Smart Utilities &amp; BMS
                </h2>
                <p className="font-['Inter'] text-xs text-[#4a4455] mt-1 leading-relaxed">
                  Bus universel KNX, BACnet/IP, Modbus RTU avec pilotage d'organes physiques.
                </p>
              </div>
            </div>

            <div className="my-4 space-y-2">
              <div className="p-3 rounded-xl bg-[#f5f2fa] shadow-[inset_2px_2px_4px_rgba(112,104,133,0.14),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] flex items-center justify-between">
                <span className="font-['Inter'] text-xs text-[#1b1b20]">Circadien CityPulse DALI</span>
                <span className="font-['Space_Grotesk'] text-xs text-[#005952] font-mono font-bold">4 200K / 98% CRI</span>
              </div>
              <div className="p-3 rounded-xl bg-[#f5f2fa] shadow-[inset_2px_2px_4px_rgba(112,104,133,0.14),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] flex items-center justify-between">
                <span className="font-['Inter'] text-xs text-[#1b1b20]">Vannes HydroSync Actives</span>
                <span className="font-['Space_Grotesk'] text-xs text-[#630ed4] font-mono font-bold">3.4 Bar ΔP</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 shadow-[0_-1px_0_rgba(112,104,133,0.08)] flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="font-['Space_Grotesk'] text-xs text-[#1b1b20] uppercase font-bold">
                Auto-Balancing
              </span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono">
                Boucle fermée PID
              </span>
            </div>
            <button
              onClick={() => setRockerActive(!rockerActive)}
              className="w-16 h-8 rounded-full bg-[#e9e7ee] shadow-[inset_3px_3px_6px_rgba(112,104,133,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] p-1 flex items-center transition-all cursor-pointer"
            >
              <div
                className={`w-6 h-6 rounded-full bg-[#fbf8ff] shadow-[3px_3px_6px_rgba(112,104,133,0.22),-2px_-2px_5px_rgba(255,255,255,1)] flex items-center justify-center transition-transform ${
                  rockerActive ? 'translate-x-8' : 'translate-x-0'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    rockerActive ? 'bg-[#7c3aed] shadow-[0_0_6px_#7c3aed]' : 'bg-[#ccc3d8]'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* PILLAR 02: CMMS & Maintenance Prédictive */}
        <div className="rounded-2xl p-6 bg-[#fbf8ff] shadow-[8px_8px_20px_rgba(112,104,133,0.16),-8px_-8px_20px_rgba(255,255,255,0.95)] flex flex-col justify-between relative group hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 shadow-[0_1px_0_rgba(112,104,133,0.1)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#005952] shadow-[0_0_8px_#00746a]" />
                <span className="font-['Space_Grotesk'] text-[10px] text-[#005952] font-mono uppercase tracking-wider font-bold">
                  PILL-02 // CMMS AI
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#efedf4] font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono">
                Gemini-Health 1.5
              </span>
            </div>

            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#f5f2fa] shadow-[4px_4px_10px_rgba(112,104,133,0.16),-4px_-4px_10px_rgba(255,255,255,0.95)] flex items-center justify-center text-[#005952] shrink-0">
                <span className="material-symbols-outlined text-[28px]">precision_manufacturing</span>
              </div>
              <div className="text-left">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#1b1b20] leading-snug">
                  CMMS &amp; Prédictif
                </h2>
                <p className="font-['Inter'] text-xs text-[#4a4455] mt-1 leading-relaxed">
                  Diagnostic vibratoire spectral et délivrance automatique d'OT par QR/NFC.
                </p>
              </div>
            </div>

            <div className="my-4 p-3 rounded-xl bg-[#f5f2fa] shadow-[inset_2px_2px_5px_rgba(112,104,133,0.16),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#e9e7ee]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#00746a]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="88, 100"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute font-['Space_Grotesk'] text-xs text-[#1b1b20] font-mono font-bold">
                    88%
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-['Space_Grotesk'] text-sm text-[#1b1b20] font-bold">
                    MTBF Flotte CVC
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#00746a] font-mono font-semibold">
                    +340 h vs Standard
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase font-bold">
                  Stock MRO
                </span>
                <span className="font-['Space_Grotesk'] text-xs text-[#1b1b20] font-mono font-bold">
                  99.4% dispo
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 shadow-[0_-1px_0_rgba(112,104,133,0.08)] flex items-center justify-between">
            <span className="font-['Inter'] text-xs text-[#4a4455]">Badgeage Technicien NFC</span>
            <span className="px-3 py-1 rounded-lg bg-[#fbf8ff] shadow-[3px_3px_7px_rgba(112,104,133,0.18),-3px_-3px_7px_rgba(255,255,255,0.9)] font-['Space_Grotesk'] text-xs text-[#630ed4] uppercase font-mono font-bold">
              Prêt (Scan)
            </span>
          </div>
        </div>

        {/* PILLAR 03: ESG & Stratégie Carbone */}
        <div className="rounded-2xl p-6 bg-[#fbf8ff] shadow-[8px_8px_20px_rgba(112,104,133,0.16),-8px_-8px_20px_rgba(255,255,255,0.95)] flex flex-col justify-between relative group hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 shadow-[0_1px_0_rgba(112,104,133,0.1)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#712edd] shadow-[0_0_8px_#712edd]" />
                <span className="font-['Space_Grotesk'] text-[10px] text-[#712edd] font-mono uppercase tracking-wider font-bold">
                  PILL-03 // ESG CSRD
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#efedf4] font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono">
                WELL v2 Platine
              </span>
            </div>

            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#f5f2fa] shadow-[4px_4px_10px_rgba(112,104,133,0.16),-4px_-4px_10px_rgba(255,255,255,0.95)] flex items-center justify-center text-[#712edd] shrink-0">
                <span className="material-symbols-outlined text-[28px]">eco</span>
              </div>
              <div className="text-left">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#1b1b20] leading-snug">
                  ESG &amp; Carbone
                </h2>
                <p className="font-['Inter'] text-xs text-[#4a4455] mt-1 leading-relaxed">
                  Audit continu Scopes 1, 2, 3 certifié Taxonomie UE et registre immuable.
                </p>
              </div>
            </div>

            {/* Skeuomorphic Odometer */}
            <div className="my-4 p-3 rounded-xl bg-[#f5f2fa] shadow-[inset_2px_2px_5px_rgba(112,104,133,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] flex flex-col gap-1 text-left">
              <div className="flex justify-between items-center">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase font-bold">
                  tCO2e Évitées (2025 YTD)
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#005952] font-mono font-bold">
                  Audit Synchrone
                </span>
              </div>
              <div className="flex items-center gap-1.5 py-1">
                {['1', '4', '8'].map((n, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1 rounded bg-[#fbf8ff] shadow-[inset_1px_1px_3px_rgba(112,104,133,0.25),inset_-1px_-1px_3px_rgba(255,255,255,0.9)] font-['Space_Grotesk'] text-lg text-[#1b1b20] font-mono font-bold"
                  >
                    {n}
                  </div>
                ))}
                <div className="px-1 text-[#4a4455] font-bold">.</div>
                {['6', '2'].map((n, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1 rounded bg-[#fbf8ff] shadow-[inset_1px_1px_3px_rgba(112,104,133,0.25),inset_-1px_-1px_3px_rgba(255,255,255,0.9)] font-['Space_Grotesk'] text-lg text-[#712edd] font-mono font-bold"
                  >
                    {n}
                  </div>
                ))}
                <span className="ml-2 font-['Space_Grotesk'] text-xs text-[#4a4455] font-mono font-bold">
                  T / An
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 shadow-[0_-1px_0_rgba(112,104,133,0.08)] flex items-center justify-between">
            <span className="font-['Inter'] text-xs text-[#4a4455]">Livre CSRD Automatique</span>
            <span className="flex items-center gap-1 font-['Space_Grotesk'] text-xs text-[#005952] uppercase font-bold">
              <span className="material-symbols-outlined text-[16px]">verified</span> Immuable
            </span>
          </div>
        </div>

        {/* PILLAR 04: 3D Digital Twin & Ingénierie BIM */}
        <div className="rounded-2xl p-6 bg-[#fbf8ff] shadow-[8px_8px_20px_rgba(112,104,133,0.16),-8px_-8px_20px_rgba(255,255,255,0.95)] flex flex-col justify-between relative group hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 shadow-[0_1px_0_rgba(112,104,133,0.1)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] shadow-[0_0_8px_#7c3aed]" />
                <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-mono uppercase tracking-wider font-bold">
                  PILL-04 // BIM 3D
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#efedf4] font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono">
                IFC 4.3 ISO 19650
              </span>
            </div>

            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#f5f2fa] shadow-[4px_4px_10px_rgba(112,104,133,0.16),-4px_-4px_10px_rgba(255,255,255,0.95)] flex items-center justify-center text-[#630ed4] shrink-0">
                <span className="material-symbols-outlined text-[28px]">view_in_ar</span>
              </div>
              <div className="text-left">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#1b1b20] leading-snug">
                  3D Digital Twin &amp; BIM
                </h2>
                <p className="font-['Inter'] text-xs text-[#4a4455] mt-1 leading-relaxed">
                  Interconnexion Autodesk Revit / IFC avec moteur WebGL à 60 FPS.
                </p>
              </div>
            </div>

            <div className="my-4 p-2 rounded-xl bg-[#f5f2fa] shadow-[inset_2px_2px_5px_rgba(112,104,133,0.16),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] flex flex-col gap-2">
              <div
                onClick={() => onNavigate('3d-digital-twin')}
                className="relative w-full h-24 rounded-lg overflow-hidden flex items-center justify-center bg-slate-900 cursor-pointer group"
                title="Ouvrir le jumeau 3D"
              >
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="BIM wireframe slice"
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute inset-0 bg-[#630ed4]/20 mix-blend-color" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#fbf8ff]/90 backdrop-blur-md shadow font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-mono font-bold">
                  60 FPS
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono">
                  Coupe Thermique Z: +18.4m
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#712edd] font-mono font-bold">
                  1.4M Facettes
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 shadow-[0_-1px_0_rgba(112,104,133,0.08)] flex items-center justify-between">
            <span className="font-['Inter'] text-xs text-[#4a4455]">Tranche Étage</span>
            <div className="inline-flex p-1 rounded-xl bg-[#f5f2fa] shadow-[inset_2px_2px_4px_rgba(112,104,133,0.18),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] gap-1">
              {(['R+1', 'R+2', 'R+3'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveSlice(r)}
                  className={`px-2 py-0.5 rounded-lg font-['Space_Grotesk'] text-[10px] font-bold cursor-pointer transition-all ${
                    activeSlice === r
                      ? 'bg-[#fbf8ff] text-[#630ed4] shadow-[2px_2px_4px_rgba(112,104,133,0.15),-2px_-2px_4px_rgba(255,255,255,0.9)]'
                      : 'text-[#4a4455] hover:text-[#1b1b20]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PILLAR 05: Observabilité Industrielle Grafana */}
        <div className="rounded-2xl p-6 bg-[#fbf8ff] shadow-[8px_8px_20px_rgba(112,104,133,0.16),-8px_-8px_20px_rgba(255,255,255,0.95)] flex flex-col justify-between relative group hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 shadow-[0_1px_0_rgba(112,104,133,0.1)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#630ed4] shadow-[0_0_8px_#7c3aed]" />
                <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-mono uppercase tracking-wider font-bold">
                  PILL-05 // TELEMETRY
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#efedf4] font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono">
                PromQL &amp; Victoria
              </span>
            </div>

            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#f5f2fa] shadow-[4px_4px_10px_rgba(112,104,133,0.16),-4px_-4px_10px_rgba(255,255,255,0.95)] flex items-center justify-center text-[#630ed4] shrink-0">
                <span className="material-symbols-outlined text-[28px]">query_stats</span>
              </div>
              <div className="text-left">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#1b1b20] leading-snug">
                  Observabilité Grafana
                </h2>
                <p className="font-['Inter'] text-xs text-[#4a4455] mt-1 leading-relaxed">
                  Moteur de séries temporelles haute vélocité avec exportateurs Edge natifs.
                </p>
              </div>
            </div>

            {/* Oscilloscope Sparkline */}
            <div className="my-4 p-2 rounded-xl bg-[#f5f2fa] shadow-[inset_2px_2px_5px_rgba(112,104,133,0.18),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[#4a4455] font-mono text-[10px] px-1">
                <span>CANAL A: CHARGE HVAC</span>
                <span className="text-[#005952] font-bold">STABLE 50.04 Hz</span>
              </div>
              <div className="h-16 w-full rounded bg-[#fbf8ff] px-2 py-1 shadow-[inset_1px_1px_3px_rgba(112,104,133,0.15)] flex items-end">
                <svg className="w-full h-full text-[#630ed4]" fill="none" preserveAspectRatio="none" viewBox="0 0 100 30">
                  <path d="M0 15 Q 10 5, 20 18 T 40 12 T 60 25 T 80 8 T 100 14" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M0 15 Q 10 5, 20 18 T 40 12 T 60 25 T 80 8 T 100 14 L 100 30 L 0 30 Z" fill="currentColor" fillOpacity="0.08" />
                </svg>
              </div>
              <div className="flex justify-between items-center font-mono text-[10px] text-[#4a4455] px-1">
                <span>Fenêtre: 500ms</span>
                <span className="text-[#712edd] font-bold">1 000 000+ pts/sec</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 shadow-[0_-1px_0_rgba(112,104,133,0.08)] flex items-center justify-between">
            <span className="font-['Inter'] text-xs text-[#4a4455]">Alerting PagerDuty</span>
            <span className="px-3 py-1 rounded bg-[#fbf8ff] shadow-[2px_2px_5px_rgba(112,104,133,0.15),-2px_-2px_5px_rgba(255,255,255,0.9)] font-['Space_Grotesk'] text-xs text-[#005952] font-mono font-bold">
              0 Incidents Actifs
            </span>
          </div>
        </div>

        {/* PILLAR 06: Zero-Trust & Edge Résilient */}
        <div className="rounded-2xl p-6 bg-[#fbf8ff] shadow-[8px_8px_20px_rgba(112,104,133,0.16),-8px_-8px_20px_rgba(255,255,255,0.95)] flex flex-col justify-between relative group hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 shadow-[0_1px_0_rgba(112,104,133,0.1)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#005952] shadow-[0_0_8px_#00746a]" />
                <span className="font-['Space_Grotesk'] text-[10px] text-[#005952] font-mono uppercase tracking-wider font-bold">
                  PILL-06 // SECURITY
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#efedf4] font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-mono">
                HW SEC L-4
              </span>
            </div>

            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#f5f2fa] shadow-[4px_4px_10px_rgba(112,104,133,0.16),-4px_-4px_10px_rgba(255,255,255,0.95)] flex items-center justify-center text-[#005952] shrink-0">
                <span className="material-symbols-outlined text-[28px]">shield_lock</span>
              </div>
              <div className="text-left">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#1b1b20] leading-snug">
                  Zero-Trust &amp; Edge
                </h2>
                <p className="font-['Inter'] text-xs text-[#4a4455] mt-1 leading-relaxed">
                  Isolation Cloudflare Workers et réplication offline bi-directionnelle Dexie.
                </p>
              </div>
            </div>

            <div className="my-4 space-y-2 text-left">
              <div className="p-3 rounded-xl bg-[#f5f2fa] shadow-[inset_2px_2px_4px_rgba(112,104,133,0.14),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#005952]">key</span>
                  <span className="font-['Inter'] text-xs text-[#1b1b20]">Puce HSM Locale</span>
                </div>
                <span className="font-['Space_Grotesk'] text-xs text-[#005952] font-mono font-bold">
                  Ed25519 Clé Validée
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f5f2fa] shadow-[inset_2px_2px_4px_rgba(112,104,133,0.14),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#630ed4]">cloud_off</span>
                  <span className="font-['Inter'] text-xs text-[#1b1b20]">Autonomie Hors-Ligne</span>
                </div>
                <span className="font-['Space_Grotesk'] text-xs text-[#712edd] font-mono font-bold">
                  14 Jours Dexie Buffer
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 shadow-[0_-1px_0_rgba(112,104,133,0.08)] flex items-center justify-between">
            <span className="font-['Inter'] text-xs text-[#4a4455]">Intégrité Matérielle</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#005952] shadow-[0_0_8px_#00746a]" />
              <span className="font-['Space_Grotesk'] text-xs text-[#1b1b20] font-mono font-bold">
                100% CONFORME
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Matrix & Deployment Bench */}
      <div className="rounded-3xl p-6 sm:p-10 bg-[#f5f2fa] shadow-[12px_12px_28px_rgba(112,104,133,0.18),-12px_-12px_28px_rgba(255,255,255,0.95)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 pb-6 shadow-[0_1px_0_rgba(112,104,133,0.1)]">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#630ed4] text-[22px]">tune</span>
              <span className="font-['Space_Grotesk'] text-xs text-[#630ed4] uppercase tracking-widest font-mono font-bold">
                Simulateur d'Empreinte &amp; Déploiement
              </span>
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl text-[#1b1b20] font-bold">
              Banc de Déploiement Industriel
            </h2>
            <p className="font-['Inter'] text-xs sm:text-sm text-[#4a4455] mt-1">
              Configurez la charge de votre infrastructure et testez l'interopérabilité des 6 modules en temps réel.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="p-1.5 rounded-2xl bg-[#efedf4] shadow-[inset_3px_3px_6px_rgba(112,104,133,0.15),inset_-3px_-3px_6px_rgba(255,255,255,0.95)] flex flex-wrap gap-1">
            <button
              onClick={() => handleSwitchBenchMode('datacenter')}
              className={`px-4 py-2 rounded-xl font-['Space_Grotesk'] text-xs font-bold transition-all cursor-pointer ${
                benchMode === 'datacenter'
                  ? 'bg-[#fbf8ff] shadow-[3px_3px_8px_rgba(112,104,133,0.16),-3px_-3px_8px_rgba(255,255,255,0.95)] text-[#630ed4]'
                  : 'text-[#4a4455] hover:text-[#1b1b20]'
              }`}
            >
              Data Centers &amp; Labos
            </button>
            <button
              onClick={() => handleSwitchBenchMode('campus')}
              className={`px-4 py-2 rounded-xl font-['Space_Grotesk'] text-xs font-bold transition-all cursor-pointer ${
                benchMode === 'campus'
                  ? 'bg-[#fbf8ff] shadow-[3px_3px_8px_rgba(112,104,133,0.16),-3px_-3px_8px_rgba(255,255,255,0.95)] text-[#630ed4]'
                  : 'text-[#4a4455] hover:text-[#1b1b20]'
              }`}
            >
              Campus Tertiaire &gt; 50k m²
            </button>
            <button
              onClick={() => handleSwitchBenchMode('industry')}
              className={`px-4 py-2 rounded-xl font-['Space_Grotesk'] text-xs font-bold transition-all cursor-pointer ${
                benchMode === 'industry'
                  ? 'bg-[#fbf8ff] shadow-[3px_3px_8px_rgba(112,104,133,0.16),-3px_-3px_8px_rgba(255,255,255,0.95)] text-[#630ed4]'
                  : 'text-[#4a4455] hover:text-[#1b1b20]'
              }`}
            >
              Usines &amp; Sites Seveso
            </button>
          </div>
        </div>

        {/* Bench Instrument Controls & Live Projection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders & Switches - 7 cols */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-[#fbf8ff] shadow-[4px_4px_10px_rgba(112,104,133,0.12),-4px_-4px_10px_rgba(255,255,255,0.9)] flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-['Space_Grotesk'] text-sm sm:text-base text-[#1b1b20] font-bold">
                  Nœuds Télémétriques Déployés
                </span>
                <span className="font-['Space_Grotesk'] text-sm sm:text-base text-[#630ed4] font-mono font-bold">
                  {nodesCount.toLocaleString('fr-FR')} nœuds
                </span>
              </div>
              <div className="relative w-full py-2">
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={nodesCount}
                  onChange={(e) => setNodesCount(Number(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none bg-[#efedf4] shadow-[inset_2px_2px_4px_rgba(112,104,133,0.22),inset_-2px_-2px_4px_rgba(255,255,255,0.95)] accent-[#630ed4] cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#4a4455]">
                <span>1k (Micro-site)</span>
                <span>50k (Multiplexe)</span>
                <span>100k+ (Hyper-campus)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#fbf8ff] shadow-[4px_4px_10px_rgba(112,104,133,0.12),-4px_-4px_10px_rgba(255,255,255,0.9)] flex flex-col justify-between h-28">
                <div className="flex justify-between items-start">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase font-bold">
                    Jumeau 3D IFC
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#630ed4] shadow-[0_0_6px_#7c3aed]" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-['Space_Grotesk'] text-xs text-[#1b1b20] font-bold">Mesh WebGL</span>
                  <input
                    type="checkbox"
                    checked={benchMesh3d}
                    onChange={(e) => setBenchMesh3d(e.target.checked)}
                    className="w-4 h-4 rounded text-[#630ed4] accent-[#630ed4] cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#fbf8ff] shadow-[4px_4px_10px_rgba(112,104,133,0.12),-4px_-4px_10px_rgba(255,255,255,0.9)] flex flex-col justify-between h-28">
                <div className="flex justify-between items-start">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase font-bold">
                    Liaison BACnet
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#00746a] shadow-[0_0_6px_#00746a]" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-['Space_Grotesk'] text-xs text-[#1b1b20] font-bold">Modbus Master</span>
                  <input
                    type="checkbox"
                    checked={benchBacnet}
                    onChange={(e) => setBenchBacnet(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00746a] accent-[#00746a] cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#fbf8ff] shadow-[4px_4px_10px_rgba(112,104,133,0.12),-4px_-4px_10px_rgba(255,255,255,0.9)] flex flex-col justify-between h-28">
                <div className="flex justify-between items-start">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase font-bold">
                    Replication HSM
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#712edd] shadow-[0_0_6px_#712edd]" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-['Space_Grotesk'] text-xs text-[#1b1b20] font-bold">Zero-Trust L4</span>
                  <input
                    type="checkbox"
                    checked={benchHsm}
                    onChange={(e) => setBenchHsm(e.target.checked)}
                    className="w-4 h-4 rounded text-[#712edd] accent-[#712edd] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Projected Metrics & Deploy CTA - 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-4 text-left">
            <div className="p-6 rounded-2xl bg-[#fbf8ff] shadow-[inset_3px_3px_8px_rgba(112,104,133,0.18),inset_-3px_-3px_8px_rgba(255,255,255,0.95)] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk'] text-xs text-[#4a4455] uppercase font-bold">
                  Temps d'Intégration Estimé
                </span>
                <span className="font-['Space_Grotesk'] text-sm sm:text-base text-[#005952] font-mono font-bold">
                  ≤ 48 HEURES
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs text-[#1b1b20]">
                <div className="flex justify-between py-1 shadow-[0_1px_0_rgba(112,104,133,0.06)]">
                  <span className="text-[#4a4455]">Audit Conformité CSRD:</span>
                  <span className="text-[#1b1b20] font-semibold">Instantané</span>
                </div>
                <div className="flex justify-between py-1 shadow-[0_1px_0_rgba(112,104,133,0.06)]">
                  <span className="text-[#4a4455]">Baisse Énergétique Observée:</span>
                  <span className="text-[#005952] font-semibold">-26.4% Moyenne</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#4a4455]">Gain Opérationnel Technicien:</span>
                  <span className="text-[#630ed4] font-semibold">+4.2 hrs / sem.</span>
                </div>
              </div>

              <button
                onClick={handleDeployPillars}
                disabled={deploying}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#630ed4] to-[#7c3aed] text-white font-['Space_Grotesk'] text-sm font-bold shadow-[6px_6px_14px_rgba(112,104,133,0.28),-4px_-4px_10px_rgba(255,255,255,0.95),0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] hover:scale-[0.99] active:scale-[0.97] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-45 transition-transform">
                  bolt
                </span>
                <span>
                  {deploying ? 'Initialisation...' : 'Déployer les 6 Piliers en 48 Heures'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Compliance & Trust Verification Strip */}
      <div className="p-6 rounded-2xl bg-[#fbf8ff] shadow-[6px_6px_16px_rgba(112,104,133,0.12),-6px_-6px_16px_rgba(255,255,255,0.95)] flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col text-left">
          <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[#1b1b20]">
            Validations Physiques &amp; Souveraineté Européenne
          </span>
          <span className="font-['Inter'] text-xs text-[#4a4455]">
            Toutes les sondes et nœuds répondent aux standards stricts d'isolation matérielle.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-[#f5f2fa] shadow-[3px_3px_6px_rgba(112,104,133,0.14),-3px_-3px_6px_rgba(255,255,255,0.95)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#005952]">gavel</span>
            <div className="flex flex-col text-left">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#1b1b20] font-bold leading-tight">
                EU CSRD 2024
              </span>
              <span className="font-['Space_Grotesk'] text-[9px] text-[#4a4455] leading-tight">
                Taxonomie Prête
              </span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-[#f5f2fa] shadow-[3px_3px_6px_rgba(112,104,133,0.14),-3px_-3px_6px_rgba(255,255,255,0.95)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#005952]">encrypted</span>
            <div className="flex flex-col text-left">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#1b1b20] font-bold leading-tight">
                ISO 27001 / SOC 2
              </span>
              <span className="font-['Space_Grotesk'] text-[9px] text-[#4a4455] leading-tight">
                Type II Permanent
              </span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-[#f5f2fa] shadow-[3px_3px_6px_rgba(112,104,133,0.14),-3px_-3px_6px_rgba(255,255,255,0.95)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#005952]">public</span>
            <div className="flex flex-col text-left">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#1b1b20] font-bold leading-tight">
                RGPD Souverain
              </span>
              <span className="font-['Space_Grotesk'] text-[9px] text-[#4a4455] leading-tight">
                Hébergement UE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
