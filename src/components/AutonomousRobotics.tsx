import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Sun, 
  Recycle, 
  Flame, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Droplet, 
  Eye, 
  Zap,
  Layers
} from 'lucide-react';

interface AutonomousRoboticsProps {
  onExploreRobotics?: () => void;
}

interface ShowcaseModule {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  imageJpg: string;
  imageWebp: string;
  altText: string;
  kpis: { label: string; value: string; detail: string; icon: any; color: string }[];
  huds: { title: string; subtitle: string; position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }[];
  tags: string[];
}

const SHOWCASE_MODULES: ShowcaseModule[] = [
  {
    id: 'robotics',
    badge: 'SENSORIUM CAFM PRO // ROBOTICS & SANITIZATION',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    title: 'Autonomous Cleaning Robots & Surface Disinfection',
    subtitle: 'LiDAR SLAM Coverage Optimizer · 99.4% Surface Sanitization · Closed-Loop Water Recycling',
    description: 'Autonomous cleaning robots synchronized directly to building spatial twin occupancy maps. Features dynamic trajectory calculation, obstacle bypass, and verified sanitization ledgers.',
    imageJpg: '/assets/showcase/sensorium-robot-cafm.jpg',
    imageWebp: '/assets/showcase/sensorium-robot-cafm.webp',
    altText: 'SENSORIUM CAFM Pro Autonomous Cleaning Robots with LiDAR SLAM Coverage Path Optimizer, 99.4% Surface Sanitization Verified and Water Recycling Filtration Telemetry',
    kpis: [
      { label: 'TRAJECTORY SLAM', value: '100% LIDAR', detail: 'Real-time multi-room path replanning', icon: Bot, color: 'text-orange-500' },
      { label: 'SANITIZATION RATE', value: '99.4%', detail: 'Hospital-grade certified disinfection', icon: ShieldCheck, color: 'text-emerald-500' },
      { label: 'WATER SAVINGS', value: '-82%', detail: 'Continuous filtration loop recirculation', icon: Droplet, color: 'text-blue-500' },
      { label: 'TWIN INGESTION', value: '< 0.4s', detail: 'Direct telemetry to Master Cockpit', icon: Cpu, color: 'text-purple-500' }
    ],
    huds: [
      { title: 'LiDAR SLAM Coverage & Path Optimizer', subtitle: 'Trajectory mesh & speed calibration locked', position: 'top-left' },
      { title: '99.4% Surface Sanitization Verified', subtitle: 'Telemetry index & bacterial load: 0.0 ppm', position: 'top-right' }
    ],
    tags: ['LiDAR SLAM 3D', 'Water Micro-Filtration', 'DORA Compliant', 'Hospital-Grade Clean']
  },
  {
    id: 'dali-lighting',
    badge: 'PILLAR 01 // DALI-2 CIRCADIAN & DAYLIGHT HARVESTING',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    title: 'Circadian DALI-2 Lux Balancer & Daylight Harvesting',
    subtitle: 'Adaptive Architectural Photometry · -42% Energy Waste · Circadian Rhythm Optimization',
    description: 'Dynamic daylight harvesting balancing solar lumen contributions against LED dimming curves across grand atriums and workstations, reducing lighting load by 42%.',
    imageJpg: '/assets/showcase/sensorium-dali-circadian.jpg',
    imageWebp: '/assets/showcase/sensorium-dali-circadian.webp',
    altText: 'SENSORIUM CAFM Pro DALI-2 Circadian Lux Balancer and Daylight Harvesting -42% Energy Optimization in corporate atrium',
    kpis: [
      { label: 'ENERGY SHAVING', value: '-42%', detail: 'Automated daylight harvesting offset', icon: Zap, color: 'text-amber-500' },
      { label: 'COLOR SPECTRUM', value: '2700K - 6500K', detail: 'Dynamic circadian Kelvin shifting', icon: Sun, color: 'text-orange-500' },
      { label: 'LUX HOMOGENEITY', value: '98.6%', detail: 'No glare or eye-strain lux gradient', icon: Eye, color: 'text-emerald-500' },
      { label: 'STANDARDS', value: 'WELL v2', detail: 'Certified Indoor Visual Comfort', icon: ShieldCheck, color: 'text-blue-500' }
    ],
    huds: [
      { title: 'DALI-2 Circadian Lux Balancer', subtitle: 'Circadian kelvin ramp synchronized to solar zenith', position: 'bottom-left' },
      { title: 'Daylight Harvesting (-42% Energy)', subtitle: 'Natural solar photodiode feedback loop active', position: 'bottom-right' }
    ],
    tags: ['DALI-2 Multi-Master', 'KNX Bus', 'Circadian Kelvin', 'WELL v2 Platinum']
  },
  {
    id: 'smart-waste',
    badge: 'PILLAR 03 // SMART WASTE & CIRCULAR RECOVERY',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    title: 'Smart Waste Management, Compactors & Circular Economy',
    subtitle: 'IoT Ultrasonic Fill-Level Matrix · 94.2% Circular Recovery · CSRD Scope 3 Proofs',
    description: 'Ultrasonic volume measurement in compactors and sorting bays predicting fill rates, scheduling automated collection dispatches, and exporting CSRD circularity proofs.',
    imageJpg: '/assets/showcase/sensorium-smart-waste.jpg',
    imageWebp: '/assets/showcase/sensorium-smart-waste.webp',
    altText: 'SENSORIUM CAFM Pro Smart Waste Management Compactors & Circular Material Recovery with IoT Ultrasonic Fill-Level Matrix and CSRD Rate 94.2%',
    kpis: [
      { label: 'CIRCULAR RECOVERY', value: '94.2%', detail: 'Verified recyclable material stream', icon: Recycle, color: 'text-emerald-500' },
      { label: 'COMPACTOR FILL', value: 'Real-time', detail: 'Ultrasonic volumetric IoT grid', icon: Activity, color: 'text-orange-500' },
      { label: 'TRUCK MILEAGE', value: '-34%', detail: 'On-demand routing saves fuel OPEX', icon: Zap, color: 'text-blue-500' },
      { label: 'CSRD REPORTING', value: 'ESRS E5', detail: 'Circular economy audit ready', icon: ShieldCheck, color: 'text-purple-500' }
    ],
    huds: [
      { title: 'IoT Ultrasonic Fill-Level Matrix', subtitle: 'Sensor grid predictive compaction trigger', position: 'bottom-left' },
      { title: 'CSRD Circular Recovery Rate (94.2%)', subtitle: 'Immutable ledger entry timestamped for auditor', position: 'bottom-right' }
    ],
    tags: ['IoT Ultrasonic', 'CSRD ESRS E5', 'Automatic Compactor SLA', 'Scope 3 Audited']
  },
  {
    id: 'thermal-substation',
    badge: 'PILLAR 01 // DISTRICT HEATING & CALORIC METERING',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    title: 'District Thermal Substation & High Delta-T Heat Exchange',
    subtitle: 'Caloric Metering & Primary Grid Feed · Delta-T 42°C Optimization · Anti-Waste Hydronics',
    description: 'High-temperature plate heat exchangers with algorithmic valve modulation ensuring maximum heat transfer efficiency and return temperature cooling to meet urban district heating SLAs.',
    imageJpg: '/assets/showcase/sensorium-thermal-substation.jpg',
    imageWebp: '/assets/showcase/sensorium-thermal-substation.webp',
    altText: 'SENSORIUM CAFM Pro District Thermal Substation Delta-T 42C with Caloric Metering & Primary Grid Feed telemetry',
    kpis: [
      { label: 'HEAT DELTA-T', value: '42°C ΔT', detail: 'Maximized thermal drop to grid specs', icon: Flame, color: 'text-orange-500' },
      { label: 'CALORIC METERING', value: 'Class 2 MID', detail: 'Billing-grade ultrasonic telemetry', icon: Activity, color: 'text-emerald-500' },
      { label: 'PRIMARY RETURN', value: '38.2°C', detail: 'Prevents utility supplier penalty fines', icon: Zap, color: 'text-blue-500' },
      { label: 'COP FACTOR', value: '4.85', detail: 'Heat recovery efficiency index', icon: Cpu, color: 'text-purple-500' }
    ],
    huds: [
      { title: 'District Thermal Substation (Delta-T 42°C)', subtitle: 'districtHeating.service.ts real-time PID valve loop', position: 'top-left' },
      { title: 'Caloric Metering & Primary Grid Feed', subtitle: 'caloricTelemetry.service.ts continuous pulse capture', position: 'top-right' }
    ],
    tags: ['Modbus TCP', 'MID Class 2 Heat', 'Delta-T Maximizer', 'Substation Telemetry']
  },
  {
    id: 'biometric-access',
    badge: 'PILLAR 06 // SOVEREIGN BIOMETRICS & PHYSICAL SECURITY',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    title: 'Sovereign Biometric Access Matrix & Spatial Clearance',
    subtitle: 'Palm Vein · Facial Recognition · NFC · Anti-Passback & Dynamic Zero-Trust Clearances',
    description: 'Zero-trust physical entrance speed-gates utilizing contactless palm-vein biometrics and encrypted NFC tokens to guarantee sterile zones, prevent tailgating, and enforce spatial RBAC.',
    imageJpg: '/assets/showcase/sensorium-biometric-access.jpg',
    imageWebp: '/assets/showcase/sensorium-biometric-access.webp',
    altText: 'SENSORIUM CAFM Pro Sovereign Biometric Access Matrix Anti-Passback and Spatial Clearance Zone 04 Speed Gates',
    kpis: [
      { label: 'MATCH SPEED', value: '< 180 ms', detail: 'Local edge biometric template match', icon: Zap, color: 'text-indigo-500' },
      { label: 'SECURITY MODEL', value: 'Zero-Trust', detail: 'Continuous spatial clearance (Zone 04)', icon: ShieldCheck, color: 'text-emerald-500' },
      { label: 'AUTHENTICATION', value: 'Palm + NFC', detail: 'Sub-epidermal infrared vascular check', icon: Cpu, color: 'text-blue-500' },
      { label: 'ANTI-PASSBACK', value: '100% Spatial', detail: 'Optical LiDAR person tracking in lane', icon: Eye, color: 'text-purple-500' }
    ],
    huds: [
      { title: 'Sovereign Biometric Access Matrix', subtitle: 'accessControl.service.ts fast edge validation', position: 'top-right' },
      { title: 'Anti-Passback & Spatial Clearance (Zone 04)', subtitle: 'physicalSecurity.service.ts optical lane verification', position: 'bottom-right' }
    ],
    tags: ['Palm Vein Infrared', 'Zero-Trust Physical', 'OSDP v2.2', 'Spatial Anti-Passback']
  }
];

export const AutonomousRobotics: React.FC<AutonomousRoboticsProps> = ({ onExploreRobotics }) => {
  const [activeModuleId, setActiveModuleId] = useState<string>('robotics');
  const activeModule = SHOWCASE_MODULES.find(m => m.id === activeModuleId) || SHOWCASE_MODULES[0];

  return (
    <section id="autonomous-robotics" className="py-20 scroll-mt-16 bg-slate-50 dark:bg-[#070709] border-t border-slate-200/80 dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-mono text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SENSORIUM CAFM PRO // FIELD INTELLIGENCE &amp; ROBOTICS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Physical Automation Meets Digital Spatial Twins
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-neutral-400 font-normal leading-relaxed">
            From autonomous LiDAR disinfection to circadian lighting, smart compactors, district heating substations, and biometric security — inspect how SENSORIUM orchestrates physical building infrastructure in real time.
          </p>
        </div>

        {/* 5-Item Navigation Segmented Pills */}
        <div className="flex items-center justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#121218] border border-slate-200/80 dark:border-white/[0.08] shadow-sm gap-1 max-w-full">
            {SHOWCASE_MODULES.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModuleId(mod.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeModuleId === mod.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                }`}
              >
                {mod.id === 'robotics' && <Bot className="w-4 h-4 text-emerald-500" />}
                {mod.id === 'dali-lighting' && <Sun className="w-4 h-4 text-amber-500" />}
                {mod.id === 'smart-waste' && <Recycle className="w-4 h-4 text-emerald-500" />}
                {mod.id === 'thermal-substation' && <Flame className="w-4 h-4 text-orange-500" />}
                {mod.id === 'biometric-access' && <ShieldCheck className="w-4 h-4 text-indigo-500" />}
                <span>{mod.id === 'robotics' ? 'Robotics & SLAM' : mod.id === 'dali-lighting' ? 'DALI-2 Circadian' : mod.id === 'smart-waste' ? 'Smart Waste' : mod.id === 'thermal-substation' ? 'Thermal Substation' : 'Biometric Security'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Animated Showcase View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-[#0c0c10] shadow-2xl"
          >
            {/* Top Bar Details */}
            <div className="p-6 sm:p-8 bg-slate-50 dark:bg-[#0f0f14] border-b border-slate-200/80 dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold border mb-2 ${activeModule.badgeColor}`}>
                  {activeModule.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activeModule.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-neutral-400 font-medium">
                  {activeModule.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 shrink-0">
                {activeModule.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* High-Resolution Photography Showcase with Interactive Ambient Overlays */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[580px] overflow-hidden bg-slate-950">
              <picture>
                <source srcSet={activeModule.imageWebp} type="image/webp" />
                <img
                  src={activeModule.imageJpg}
                  alt={activeModule.altText}
                  className="w-full h-full object-cover object-center filter contrast-[1.03] brightness-[0.98] transition-transform duration-700 hover:scale-[1.01]"
                  loading="lazy"
                />
              </picture>

              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 pointer-events-none" />

              {/* Status Indicator */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-mono text-white shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-400">TELEMETRY STREAMING</span>
                <span className="text-white/40">·</span>
                <span className="text-slate-300">Live 60 FPS</span>
              </div>

              {/* HUD Cards overlaid on the photograph */}
              {activeModule.huds.map((hud, idx) => {
                const posClass = 
                  hud.position === 'top-left' ? 'top-4 left-4 sm:top-6 sm:left-6' :
                  hud.position === 'top-right' ? 'top-14 right-4 sm:top-16 sm:right-6' :
                  hud.position === 'bottom-left' ? 'bottom-4 left-4 sm:bottom-6 sm:left-6' :
                  'bottom-4 right-4 sm:bottom-6 sm:right-6';

                return (
                  <div
                    key={idx}
                    className={`absolute ${posClass} z-10 max-w-xs sm:max-w-sm p-3.5 sm:p-4 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 text-white shadow-2xl hidden md:block`}
                  >
                    <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="font-semibold">{hud.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {hud.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 4 Technical Feature Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-200/80 dark:border-white/[0.06]">
              {activeModule.kpis.map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white dark:bg-[#121218] border border-slate-200/80 dark:border-white/[0.06] shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-neutral-400 mb-2">
                      <span className="tracking-wide uppercase">{kpi.label}</span>
                      <Icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                    <div className={`text-xl sm:text-2xl font-bold font-mono ${kpi.color}`}>
                      {kpi.value}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-neutral-400 font-sans">
                      {kpi.detail}
                    </div>
                  </div>
                );
              })}
            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};
