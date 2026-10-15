import React, { useState, useEffect } from 'react';

interface CockpitConsoleViewProps {
  onNavigate: (path: any) => void;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const CockpitConsoleView: React.FC<CockpitConsoleViewProps> = ({ onNavigate, onClose, isEmbedded = false }) => {
  const [activeFloor, setActiveFloor] = useState('Floor 04 - Core Automation Bay');
  const [activeFloorKey, setActiveFloorKey] = useState('FL04');
  const [wireframeOn, setWireframeOn] = useState(true);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [viewTiltDeg, setViewTiltDeg] = useState(45);
  const [depthCutDeg, setDepthCutDeg] = useState(90);
  const [daliLux, setDaliLux] = useState(320);
  const [purgeActive, setPurgeActive] = useState(false);
  const [aiDispatched, setAiDispatched] = useState(false);
  const [frequency, setFrequency] = useState(60.02);
  const [pressureVal, setPressureVal] = useState(4.2);
  const [, setSelectedHotspot] = useState<string | null>(null);

  const [logs, setLogs] = useState([
    { time: '13:30:02', channel: 'BIM_SYNC', msg: 'Mesh nodes 14,890 verified without drift.' },
    { time: '13:31:14', channel: 'CHILLER_B2', msg: 'COP calibrated to 6.22, chilled water setpoint locked.' },
    { time: '13:32:45', channel: 'DALI_BUS', msg: 'Circadian ramp to 4200K synchronized.' },
    { time: '13:33:10', channel: 'INSPECTION', msg: 'Acoustic leak sensor V-14 reported normal pressure 4.2 Bar.' },
  ]);

  // Frequency micro-jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setFrequency(Number((60.0 + (Math.random() * 0.05 - 0.025)).toFixed(2)));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const appendLog = (channel: string, msg: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs((prev) => [{ time: timeStr, channel, msg }, ...prev.slice(0, 19)]);
  };

  const handleSelectFloor = (key: string, label: string) => {
    setActiveFloorKey(key);
    setActiveFloor(label);
    appendLog('FLOOR_NAV', `Transferred BIM perspective to: ${label}`);
  };

  const handlePan = (dx: number, dy: number) => {
    setPanX((prev) => prev + dx);
    setPanY((prev) => prev + dy);
  };

  const handleExecuteAI = () => {
    setAiDispatched(true);
    appendLog('GEMINI_AI', 'Pre-cooling cycle initiated on Atrium Zone 02. Chiller COP holding.');
    setTimeout(() => {
      setAiDispatched(false);
    }, 4000);
  };

  const handleTogglePurge = () => {
    const next = !purgeActive;
    setPurgeActive(next);
    if (next) {
      appendLog('HVAC_CRITICAL', 'Emergency high-velocity smoke/air purge valves actuated across FL01-12.');
    } else {
      appendLog('HVAC_CRITICAL', 'Purge cycle terminated. Standard VAV balance restored.');
    }
  };

  return (
    <div className={`w-full min-h-screen bg-slate-50 dark:bg-[#070709] flex text-slate-900 dark:text-slate-100 transition-colors duration-200 ${isEmbedded ? 'rounded-2xl overflow-hidden' : ''}`}>
      {/* Fixed Left Sidebar - Standalone mode */}
      {!isEmbedded && (
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#0b0b10] border-r border-slate-200 dark:border-white/[0.08] shadow-sm z-50 flex-col justify-between p-4">
          <div className="flex flex-col gap-6">
            <div className="tactile-plate p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">Cockpit Console</span>
                <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 uppercase">SENSORIUM Twin Ops</span>
              </div>
            </div>

            <div className="tactile-debossed px-3 py-2 rounded-xl flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 font-bold">EDGE TELEMETRY</span>
              <span className="inline-flex items-center gap-1 font-['Space_Grotesk'] text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                14.8k Nodes
              </span>
            </div>

            <nav className="flex flex-col gap-1">
              <button
                onClick={() => onNavigate('cockpit')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl tactile-plate text-orange-600 dark:text-orange-400 font-['Space_Grotesk'] text-sm font-bold transition-all text-left"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                <span>Cockpit Master</span>
              </button>
              <button
                onClick={() => onNavigate('3d-digital-twin')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-all font-['Space_Grotesk'] text-sm font-medium text-left"
              >
                <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
                <span>3D Twin Visualizer</span>
              </button>
              <button
                onClick={() => onNavigate('grafana-observability')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-all font-['Space_Grotesk'] text-sm font-medium text-left"
              >
                <span className="material-symbols-outlined text-[20px]">query_stats</span>
                <span>Grafana Stream</span>
              </button>
              <button
                onClick={() => onNavigate('esg-carbon')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-all font-['Space_Grotesk'] text-sm font-medium text-left"
              >
                <span className="material-symbols-outlined text-[20px]">co2</span>
                <span>Carbon Telemetry</span>
              </button>
              <button
                onClick={() => onNavigate('6-core-pillars')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-all font-['Space_Grotesk'] text-sm font-medium text-left"
              >
                <span className="material-symbols-outlined text-[20px]">stacks</span>
                <span>Core Automation</span>
              </button>
              <button
                onClick={() => onNavigate('architecture')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-all font-['Space_Grotesk'] text-sm font-medium text-left"
              >
                <span className="material-symbols-outlined text-[20px]">schema</span>
                <span>System Topology</span>
              </button>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <div className="tactile-debossed p-3 rounded-xl flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 font-semibold">AUTH ROTATION</span>
                <span className="font-['Space_Grotesk'] text-[10px] text-orange-600 dark:text-orange-400 font-bold">23:59:59</span>
              </div>
              <span className="font-['Space_Grotesk'] text-[10px] text-slate-400">Hardware HSM Lock #420</span>
            </div>

            <div
              onClick={() => onNavigate('vault')}
              className="tactile-plate p-2.5 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-['Space_Grotesk'] text-[11px] text-slate-900 dark:text-white font-bold">Dr. A. Mercer</span>
                <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400">Facility SuperAdmin</span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen ${isEmbedded ? 'w-full' : 'lg:pl-72'}`}>
        {/* Top Header inside Cockpit */}
        <header className={`${isEmbedded ? 'sticky top-0 w-full' : 'fixed top-0 left-0 lg:left-72 right-0'} h-20 bg-white/95 dark:bg-[#070709]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] z-30 flex items-center justify-between px-4 sm:px-6`}>
          <div className="flex items-center gap-2">
            <div className="tactile-debossed px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 dark:text-orange-400 text-[18px]">domain</span>
              <span className="font-['Space_Grotesk'] text-[11px] text-slate-900 dark:text-white font-semibold">
                Enterprise Campus Node 01 • Frankfurt West
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="tactile-debossed px-3 py-1.5 rounded-full hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="font-['Space_Grotesk'] text-[10px] text-slate-900 dark:text-white font-bold">
                SYNC: 14,890 Edge Nodes
              </span>
            </div>
            <button
              onClick={() => onNavigate('architecture')}
              className="tactile-btn px-3 py-2 rounded-xl text-slate-900 dark:text-white font-['Space_Grotesk'] text-[11px] font-bold hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Topology Map
            </button>
            <button
              onClick={() => {
                appendLog('OVERRIDE', 'Global facility override sequence verified by Dr. A. Mercer');
              }}
              className="tactile-btn-primary px-4 py-2 rounded-xl text-white font-['Space_Grotesk'] text-[11px] font-bold flex items-center gap-1.5 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>Execute Override</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="tactile-btn-primary px-3.5 py-2 rounded-xl font-['Space_Grotesk'] text-[11px] font-bold text-white flex items-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
              title="Passer au Dashboard SENSORIUM"
            >
              <span className="material-symbols-outlined text-[14px] text-amber-300">workspace_premium</span>
              <span>Mode Pro</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="tactile-btn p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Fermer Cockpit"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </header>

        {/* Cockpit Canvas Body */}
        <main className={`${isEmbedded ? 'pt-4' : 'pt-24'} px-4 sm:px-6 py-4 flex flex-col gap-6 select-none max-w-7xl w-full mx-auto`}>
          {/* Top Hardware Deck HUD: BIM Level Selector & Actuator Knobs */}
          <section className="tactile-plate rounded-xl p-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
                <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  SPATIAL BIM TELEMETRY // SECTOR B4-FRANKFURT
                </span>
                <span className="tactile-debossed px-2 py-0.5 rounded-full font-['Space_Grotesk'] text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                  L3 CLOUD SYNC ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-[10px] text-slate-400 font-semibold">
                  GLOBAL BUS FREQUENCY
                </span>
                <div className="tactile-debossed px-3 py-1 rounded-xl text-orange-600 dark:text-orange-400 font-['Space_Grotesk'] text-sm font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">speed</span>
                  <span>{frequency}</span>
                  <span className="text-slate-400 text-[10px]">Hz</span>
                </div>
              </div>
            </div>

            {/* Hardware Bank: Floor buttons + Knobs */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
              {/* Floor selector rocker switches */}
              <div className="xl:col-span-8 flex items-center justify-between tactile-debossed p-2 rounded-xl overflow-x-auto gap-2">
                {[
                  { key: 'B2', label: 'B2 HYD', full: 'B2 - Hydro/Chiller Basement' },
                  { key: 'L0', label: 'L0 CNC', full: 'Level 00 - Main Concourse' },
                  { key: 'FL04', label: 'FL 04', full: 'Floor 04 - Core Automation Bay' },
                  { key: 'FL08', label: 'FL 08', full: 'Floor 08 - Server & Telecom Mezzanine' },
                  { key: 'FL12', label: 'FL 12', full: 'Floor 12 - Executive Operations' },
                  { key: 'RF', label: 'RF PLANT', full: 'Rooftop - Dual Adiabatic Chillers & Photovoltaics' },
                ].map((fl) => {
                  const isActive = activeFloorKey === fl.key;
                  return (
                    <button
                      key={fl.key}
                      onClick={() => handleSelectFloor(fl.key, fl.full)}
                      className={`group relative flex-1 min-w-[70px] py-2.5 px-3 rounded-lg flex flex-col items-center gap-1 transition-all active:scale-[0.97] cursor-pointer ${
                        isActive ? 'tactile-plate text-orange-600 dark:text-orange-400' : 'tactile-btn text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          isActive
                            ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.9)]'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className={`font-['Space_Grotesk'] text-[10px] font-bold ${isActive ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                        {fl.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Rotary Knobs */}
              <div className="xl:col-span-4 flex items-center justify-around gap-4">
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => {
                      setViewTiltDeg((prev) => (prev + 22.5) % 360);
                      appendLog('ROTARY_ACTUATOR', 'Adjusted View Tilt rotary knob');
                    }}
                    className="relative w-14 h-14 rounded-full tactile-plate flex items-center justify-center p-1 cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 rounded-full tactile-debossed flex items-center justify-center relative transition-transform duration-300 shadow-sm"
                      style={{ transform: `rotate(${viewTiltDeg}deg)` }}
                    >
                      <div className="absolute top-1 w-1.5 h-2 rounded-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.8)]" />
                      <span className="material-symbols-outlined text-[14px] text-slate-400">view_in_ar</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-[10px] text-slate-400 uppercase font-semibold">VIEW TILT</span>
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">35.26° ISO</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    onClick={() => {
                      setDepthCutDeg((prev) => (prev + 30) % 360);
                      appendLog('ROTARY_ACTUATOR', 'Adjusted Depth Cut slice knob');
                    }}
                    className="relative w-14 h-14 rounded-full tactile-plate flex items-center justify-center p-1 cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 rounded-full tactile-debossed flex items-center justify-center relative transition-transform duration-300 shadow-sm"
                      style={{ transform: `rotate(${depthCutDeg}deg)` }}
                    >
                      <div className="absolute top-1 w-1.5 h-2 rounded-full bg-orange-600 shadow-[0_0_4px_rgba(234,88,12,0.8)]" />
                      <span className="material-symbols-outlined text-[14px] text-slate-400">layers</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-[10px] text-slate-400 uppercase font-semibold">DEPTH CUT</span>
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">FL 04 SLICE</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Central 3D Spatial Digital Twin Viewer + Instrument Telemetry */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Visualizer Bezel Screen (8 cols) */}
            <div className="xl:col-span-8 tactile-debossed p-4 sm:p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-center justify-between z-10">
                <div className="tactile-plate px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500 dark:text-orange-400 text-[18px]">deployed_code</span>
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">
                    {activeFloor}
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold">
                    1:50 BIM
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setWireframeOn(!wireframeOn);
                      appendLog('CANVAS_RENDER', `3D wireframe mesh set to ${!wireframeOn ? 'enabled' : 'minimal'}.`);
                    }}
                    className="tactile-btn px-3 py-1.5 rounded-xl text-slate-900 dark:text-white font-['Space_Grotesk'] text-[10px] flex items-center gap-1 active:scale-95 cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-[16px] text-orange-500 dark:text-orange-400">grid_4x4</span>
                    <span>WIREFRAME: {wireframeOn ? 'ON' : 'OFF'}</span>
                  </button>
                  <div className="tactile-plate px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-['Space_Grotesk'] text-[10px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>AIR BALANCED</span>
                  </div>
                </div>
              </div>

              {/* 3D Canvas / Synthetic Spatial Stage */}
              <div className="relative w-full h-[460px] rounded-xl overflow-hidden bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/[0.06] flex items-center justify-center p-4">
                <svg
                  className="w-full h-full max-w-[650px] transition-transform duration-500"
                  fill="none"
                  viewBox="0 0 700 480"
                  style={{ transform: `translate(${panX}px, ${panY}px)`, opacity: wireframeOn ? 1 : 0.65 }}
                >
                  {/* Subtle Grid Floor Plane */}
                  <g opacity="0.35" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="0.8">
                    <path d="M120 280 L350 410 L580 280 L350 150 Z" />
                    <path d="M177 247 L407 377" />
                    <path d="M235 215 L465 345" />
                    <path d="M292 182 L522 312" />
                    <path d="M177 312 L407 182" />
                    <path d="M235 345 L465 215" />
                    <path d="M292 377 L522 247" />
                  </g>

                  {/* BIM Volumetric Slab Floor 04 Extrusion */}
                  <g>
                    <polygon fill="#e2e8f0" className="dark:fill-[#1e1e28]" opacity="0.75" points="150,290 350,405 550,290 350,175" />
                    <polygon fill="#cbd5e1" className="dark:fill-[#161620]" points="150,290 150,305 350,420 350,405" />
                    <polygon fill="#94a3b8" className="dark:fill-[#12121a]" points="550,290 550,305 350,420 350,405" />

                    <rect fill="#ea580c" height="70" opacity="0.3" width="12" x="230" y="210" />
                    <rect fill="#ea580c" height="70" opacity="0.3" width="12" x="460" y="210" />
                    <rect fill="#f97316" height="70" opacity="0.4" width="12" x="344" y="270" />

                    <polygon
                      fill="#f97316"
                      fillOpacity="0.1"
                      points="150,210 350,95 550,210 350,325"
                      stroke="#f97316"
                      strokeDasharray="6 3"
                      strokeWidth="1.8"
                    />

                    {/* HVAC conduits */}
                    <path
                      d="M180,225 L350,130 L520,225"
                      fill="none"
                      filter="drop-shadow(0px 0px 4px rgba(249,115,22,0.6))"
                      opacity="0.85"
                      stroke="#f97316"
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                    <path d="M350,130 L350,270" fill="none" stroke="#f97316" strokeDasharray="4 2" strokeWidth="2.5" />
                    <path d="M265,178 L265,248" fill="none" stroke="#10b981" strokeWidth="2" />
                    <path d="M435,178 L435,248" fill="none" stroke="#10b981" strokeWidth="2" />
                  </g>

                  {/* Hotspot Node 1: Chiller Feed Node */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedHotspot('Chiller-01');
                      appendLog('TELEMETRY_PIN', 'Focused node telemetry socket: [Chiller-01 7.4°C]');
                    }}
                  >
                    <circle className="animate-ping" cx="210" cy="245" fill="#f97316" fillOpacity="0.2" r="16" />
                    <circle cx="210" cy="245" fill="#ffffff" r="8" stroke="#ea580c" strokeWidth="3" />
                    <circle cx="210" cy="245" fill="#ea580c" r="3" />
                    <rect
                      className="fill-white dark:fill-[#14141c] stroke-slate-200 dark:stroke-white/10"
                      height="28"
                      rx="6"
                      width="110"
                      x="155"
                      y="195"
                    />
                    <text className="fill-slate-900 dark:fill-white font-mono text-[10px] font-bold" x="165" y="213">
                      CHILLER 7.4°C
                    </text>
                  </g>

                  {/* Hotspot Node 2: Air Flow Vector */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedHotspot('AQ-Vector');
                      appendLog('TELEMETRY_PIN', 'Focused node telemetry socket: [AQ-Vector CO2 412 PPM]');
                    }}
                  >
                    <circle className="animate-pulse" cx="350" cy="240" fill="#10b981" fillOpacity="0.2" r="18" />
                    <circle cx="350" cy="240" fill="#ffffff" r="9" stroke="#059669" strokeWidth="3" />
                    <circle cx="350" cy="240" fill="#059669" r="3.5" />
                    <rect
                      className="fill-white dark:fill-[#14141c] stroke-slate-200 dark:stroke-white/10"
                      height="28"
                      rx="6"
                      width="90"
                      x="305"
                      y="190"
                    />
                    <text className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[10px] font-bold" x="317" y="208">
                      CO2 412 PPM
                    </text>
                  </g>

                  {/* Hotspot Node 3: Lighting Matrix DALI */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedHotspot('DALI-Grid');
                      appendLog('TELEMETRY_PIN', 'Focused node telemetry socket: [DALI-Grid 320 LUX]');
                    }}
                  >
                    <circle cx="480" cy="250" fill="#f97316" fillOpacity="0.2" r="14" />
                    <circle cx="480" cy="250" fill="#ffffff" r="7.5" stroke="#f97316" strokeWidth="2.5" />
                    <circle cx="480" cy="250" fill="#f97316" r="3" />
                    <rect
                      className="fill-white dark:fill-[#14141c] stroke-slate-200 dark:stroke-white/10"
                      height="28"
                      rx="6"
                      width="105"
                      x="445"
                      y="280"
                    />
                    <text className="fill-slate-900 dark:fill-white font-mono text-[10px] font-bold" x="455" y="298">
                      DALI 320 LUX
                    </text>
                  </g>
                </svg>

                {/* Tactical HUD Badges */}
                <div className="absolute bottom-4 left-4 tactile-plate px-3 py-2 rounded-xl flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="font-['Space_Grotesk'] text-[10px] text-slate-900 dark:text-white font-bold">18 VAV TERMINALS</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600 text-[10px]">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-['Space_Grotesk'] text-[10px] text-slate-900 dark:text-white font-bold">ΔP 14.2 Pa NOMINAL</span>
                  </div>
                </div>

                {/* Pan Controls Pad */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => handlePan(0, -15)}
                    className="w-8 h-8 rounded-lg tactile-plate flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-orange-500 active:scale-90 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">north</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePan(-15, 0)}
                      className="w-8 h-8 rounded-lg tactile-plate flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-orange-500 active:scale-90 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">west</span>
                    </button>
                    <button
                      onClick={() => handlePan(15, 0)}
                      className="w-8 h-8 rounded-lg tactile-plate flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-orange-500 active:scale-90 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">east</span>
                    </button>
                  </div>
                  <button
                    onClick={() => handlePan(0, 15)}
                    className="w-8 h-8 rounded-lg tactile-plate flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-orange-500 active:scale-90 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">south</span>
                  </button>
                </div>
              </div>

              {/* Sub-bay Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="tactile-plate p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-orange-500 dark:text-orange-400">
                      <span className="material-symbols-outlined text-[16px]">thermostat</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 font-bold">PLANT DELTA T</span>
                      <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">5.82°C (Split Δ)</span>
                    </div>
                  </div>
                  <span className="tactile-debossed px-2 py-1 rounded font-['Space_Grotesk'] text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    OPTIMIZED
                  </span>
                </div>

                <div className="tactile-plate p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-orange-500 dark:text-orange-400">
                      <span className="material-symbols-outlined text-[16px]">water_voc</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 font-bold">CHILLED LOOP VOL.</span>
                      <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">1,420 L/min</span>
                    </div>
                  </div>
                  <span className="tactile-debossed px-2 py-1 rounded font-['Space_Grotesk'] text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                    MOD V-4 ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Right Instrument Rack: Tactile Telemetry Nodes (4 cols) */}
            <div className="xl:col-span-4 flex flex-col gap-4">
              {/* Node A: Chiller Loop B-02 */}
              <div className="tactile-plate rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">Chiller Loop B-02</span>
                  </div>
                  <span className="font-['Space_Grotesk'] text-[10px] text-slate-400 font-bold">NODE #429</span>
                </div>

                <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                      COEFFICIENT (COP)
                    </span>
                    <span className="font-['Space_Grotesk'] text-2xl font-bold text-orange-600 dark:text-orange-400">6.22</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Supply: 7.4°C Chilled</span>
                  </div>

                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" fill="transparent" r="28" stroke="currentColor" className="text-slate-200 dark:text-white/10" strokeWidth="6" />
                      <circle
                        cx="36"
                        cy="36"
                        fill="transparent"
                        r="28"
                        stroke="#f97316"
                        strokeDasharray="175.9"
                        strokeDashoffset="48"
                        strokeLinecap="round"
                        strokeWidth="6"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="font-['Space_Grotesk'] text-[10px] text-slate-900 dark:text-white font-bold">88%</span>
                      <span className="font-['Space_Grotesk'] text-[8px] text-slate-400 font-medium">LOAD</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-['Space_Grotesk'] text-[10px] px-1">
                  <span>Compressor RPM: 3,450</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">VFD Synchronized</span>
                </div>
              </div>

              {/* Node B: HydroSync Valve V-14 */}
              <div className="tactile-plate rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">HydroSync Valve V-14</span>
                  </div>
                  <span className="tactile-debossed px-2 py-0.5 rounded font-['Space_Grotesk'] text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    0 LEAKS
                  </span>
                </div>

                <div className="tactile-debossed p-3 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                      LINE PRESSURE
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">
                      {pressureVal} BAR
                    </span>
                  </div>

                  <div className="w-full h-4 rounded-full tactile-debossed p-0.5 flex items-center overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-orange-500 transition-all duration-500 shadow-sm"
                      style={{ width: `${(pressureVal / 6.0) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between font-['Space_Grotesk'] text-[9px] text-slate-400 font-semibold px-1">
                    <span>0.0 BAR</span>
                    <span>2.5 SAFE</span>
                    <span>4.2 NOMINAL</span>
                    <span>6.0 CRIT</span>
                  </div>
                </div>
              </div>

              {/* Node C: CityPulse DALI Lighting */}
              <div className="tactile-plate rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">CityPulse DALI Lighting</span>
                  </div>
                  <span className="font-['Space_Grotesk'] text-[10px] text-orange-600 dark:text-orange-400 font-bold">ZONE 4A</span>
                </div>

                <div className="tactile-debossed p-3 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                      ILLUMINANCE // CCT
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white">
                        {daliLux}
                      </span>
                      <span className="font-['Space_Grotesk'] text-[10px] text-slate-400">LUX</span>
                    </div>
                    <span className="font-['Space_Grotesk'] text-[10px] text-orange-600 dark:text-orange-400 font-bold">
                      Circadian 4200K Natural
                    </span>
                  </div>

                  <div className="w-28 flex flex-col items-center gap-1.5">
                    <input
                      type="range"
                      min="100"
                      max="600"
                      value={daliLux}
                      onChange={(e) => setDaliLux(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <span className="font-['Space_Grotesk'] text-[9px] text-slate-400">DIMMER INTENSITY</span>
                  </div>
                </div>
              </div>

              {/* Node D: IEQ Sensor Bay S-09 */}
              <div className="tactile-plate rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">IEQ Sensor Bay S-09</span>
                  </div>
                  <span className="tactile-plate px-2 py-0.5 rounded font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    WELL v2 CERT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="tactile-debossed p-2.5 rounded-xl flex flex-col">
                    <span className="font-['Space_Grotesk'] text-[10px] text-slate-400 font-semibold">CO2 LEVEL</span>
                    <span className="font-['Space_Grotesk'] text-base font-bold text-emerald-600 dark:text-emerald-400">
                      412 <span className="text-[10px] text-slate-400">ppm</span>
                    </span>
                    <div className="w-full bg-slate-200 dark:bg-white/[0.08] h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[38%] rounded-full" />
                    </div>
                  </div>

                  <div className="tactile-debossed p-2.5 rounded-xl flex flex-col">
                    <span className="font-['Space_Grotesk'] text-[10px] text-slate-400 font-semibold">PM2.5 DUST</span>
                    <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white">
                      3.1 <span className="text-[10px] text-slate-400">µg/m³</span>
                    </span>
                    <div className="w-full bg-slate-200 dark:bg-white/[0.08] h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-orange-500 h-full w-[20%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Deck: Gemini AI Autonomous Rebalancing & Live Telemetry Stream */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Gemini AI Prescriptive Rebalancing Module (7 cols) */}
            <div className="xl:col-span-7 tactile-plate rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">
                      Gemini AI Autonomous Rebalancing
                    </span>
                    <span className="font-['Space_Grotesk'] text-[10px] text-slate-400">
                      NEURAL THERMAL INFERENCE ENGINE // v4.2
                    </span>
                  </div>
                </div>

                <div className="tactile-debossed px-3 py-1 rounded-xl flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 font-bold">SAVINGS TARGET</span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-orange-600 dark:text-orange-400 font-bold">+18.4% kWh</span>
                </div>
              </div>

              {/* Prescriptive Action Card with Tactile Hardware Buttons */}
              <div className="tactile-debossed p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    <span className="font-['Space_Grotesk'] text-[11px] text-orange-600 dark:text-orange-400 font-bold">
                      RECOMMENDATION #R-882
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    Pre-cool Atrium Zone 02 by 1.2°C at 13:45 to shave peak load tariffs during Frankfurt grid bottleneck.
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Confidence Score: 98.7% • Estimated ROI: €1,280 / day
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => appendLog('PRESCRIPTION', 'Prescription #R-882 bypassed by operator.')}
                    className="tactile-btn flex-1 md:flex-initial px-4 py-2.5 rounded-xl font-['Space_Grotesk'] text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 active:scale-95 transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleExecuteAI}
                    className={`tactile-btn-primary flex-1 md:flex-initial px-5 py-2.5 rounded-xl font-['Space_Grotesk'] text-[11px] font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer ${
                      aiDispatched ? 'bg-emerald-600' : ''
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[16px] ${aiDispatched ? 'animate-spin' : ''}`}>
                      {aiDispatched ? 'refresh' : 'bolt'}
                    </span>
                    <span>{aiDispatched ? 'Executed' : 'Execute AI Flow'}</span>
                  </button>
                </div>
              </div>

              {/* Physical Emergency Actuation Bank */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePurge}
                    className={`px-4 py-2.5 rounded-xl font-['Space_Grotesk'] text-[11px] font-bold flex items-center gap-2 active:scale-95 transition-all cursor-pointer ${
                      purgeActive
                        ? 'tactile-btn-primary text-white bg-rose-600'
                        : 'tactile-btn text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">mode_fan</span>
                    <span>EMERGENCY HVAC PURGE</span>
                  </button>
                  <span
                    className={`font-['Space_Grotesk'] text-[10px] font-semibold ${
                      purgeActive ? 'text-rose-600 font-bold animate-pulse' : 'text-slate-400'
                    }`}
                  >
                    {purgeActive ? 'PURGE DAMPER ENGAGED 100%' : 'INTERLOCK ARMED'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => appendLog('CALIBRATION', 'Zero-point recalibration sent to all BACnet MSTP endpoints.')}
                    className="tactile-btn px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 font-['Space_Grotesk'] text-[11px] font-semibold active:scale-95 cursor-pointer"
                  >
                    Recalibrate All VAVs
                  </button>
                  <button
                    onClick={() => appendLog('SNAPSHOT', 'Captured full IFC-SPF spatial parameter matrix (hash: #0x8F8B2)')}
                    className="tactile-btn px-3 py-2 rounded-xl text-orange-600 dark:text-orange-400 font-['Space_Grotesk'] text-[11px] font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">ios_share</span>
                    <span>Snapshot</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Telemetry Log Stream (5 cols) */}
            <div className="xl:col-span-5 tactile-plate rounded-2xl p-4 sm:p-6 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500 dark:text-orange-400 text-[20px]">list_alt</span>
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">
                    Telemetry Audit Stream
                  </span>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="tactile-btn px-2.5 py-1 rounded-lg font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              </div>

              {/* Inset Terminal Screen */}
              <div className="tactile-debossed p-3 rounded-xl h-44 overflow-y-auto flex flex-col gap-1.5 font-['JetBrains_Mono'] text-[11px] text-slate-600 dark:text-slate-300">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 shrink-0">{log.time}</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold shrink-0">[{log.channel}]</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-slate-400 font-['Space_Grotesk'] text-[10px] px-1">
                <span>Hardware Serial: ST-994-DE-001</span>
                <span className="text-orange-600 dark:text-orange-400 font-bold">Latency: 4.8ms</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
