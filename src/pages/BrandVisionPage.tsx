import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Compass, 
  Globe, 
  Layers, 
  Zap, 
  Leaf, 
  Cpu, 
  Award, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  ArrowRight,
  Eye,
  Sliders,
  Code2,
  FileText,
  Share2,
  BookmarkCheck,
  Activity,
  Server
} from "lucide-react";
import brandVisionHero from "../assets/images/cafm_brand_vision_1789522330075.jpg";

interface BrandVisionPageProps {
  isDark: boolean;
  onExplorePublic?: () => void;
}

export default function BrandVisionPage({ isDark, onExplorePublic }: BrandVisionPageProps) {
  const [activeSection, setActiveSection] = useState<"manifesto" | "identity" | "logo" | "roadmap" | "sustainability" | "presskit">("manifesto");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [logoVariant, setLogoVariant] = useState<"gradient" | "dark" | "light" | "monochrome">("gradient");
  const [logoSize, setLogoSize] = useState<number>(64);
  const [svgCopied, setSvgCopied] = useState(false);
  const [boilerplateCopied, setBoilerplateCopied] = useState(false);

  const brandColors = [
    { name: "Solar Orange (Cloudflare)", hex: "#F38020", role: "Primary dominant brand color, energy, velocity", textDark: false },
    { name: "Amber Gold", hex: "#FAAD3F", role: "Accent shade, radiant illumination gradients", textDark: true },
    { name: "Obsidian Black", hex: "#070709", role: "Dark mode background, engineering depth", textDark: false },
    { name: "Titanium Slate", hex: "#1E293B", role: "High-contrast card surfaces and containers", textDark: false },
    { name: "Alabaster White", hex: "#F8FAFC", role: "Ultra-clean, luminous light mode background", textDark: true },
    { name: "Telemetry Emerald", hex: "#10B981", role: "Nominal statuses, POP node health", textDark: false },
    { name: "Sapphire Edge Blue", hex: "#3B82F6", role: "Planetary network and connectivity fabric", textDark: false },
    { name: "Gemini AI Violet", hex: "#8B5CF6", role: "Predictive intelligence and neural models", textDark: false }
  ];

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const getSvgCode = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${logoSize}" height="${logoSize}">
  <defs>
    <linearGradient id="sensoriumGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="45%" stop-color="#F5D061" />
      <stop offset="100%" stop-color="#E5A93B" />
    </linearGradient>
    <radialGradient id="sensorCoreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="100%" stop-color="#D97706" />
    </radialGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="${
    logoVariant === 'gradient' ? '#0e0e11' :
    logoVariant === 'dark' ? '#070709' :
    logoVariant === 'light' ? '#FFFFFF' : '#1E293B'
  }" stroke="${logoVariant === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.15)'}" stroke-width="2"/>
  <g transform="translate(18, 18) scale(2)">
    <path d="M16 3L27.25 9.5V22.5L16 29L4.75 22.5V9.5L16 3Z" stroke="url(#sensoriumGold)" stroke-width="1.5" fill="none"/>
    <circle cx="16" cy="16" r="3.5" fill="url(#sensorCoreGlow)"/>
    <path d="M16 3V12.5M16 29V19.5M4.75 9.5L13 14.2M27.25 22.5L19 17.8M4.75 22.5L13 17.8M27.25 9.5L19 14.2" stroke="url(#sensoriumGold)" stroke-width="1" stroke-opacity="0.8"/>
  </g>
</svg>`;
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(getSvgCode());
    setSvgCopied(true);
    setTimeout(() => setSvgCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const element = document.createElement("a");
    const file = new Blob([getSvgCode()], { type: "image/svg+xml" });
    element.href = URL.createObjectURL(file);
    element.download = `sensorium_logo_${logoVariant}.svg`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-16">
      
      {/* Header Banner with Custom Generated High-Tech Asset */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-lg shadow-orange-500/5 group">
        <div className="absolute inset-0 z-0">
          <img 
            src={brandVisionHero} 
            alt="CAFM Enterprise Network Vision" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.9] dark:brightness-[0.75] contrast-[1.05] group-hover:scale-[1.02] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent dark:from-[#070709] dark:via-[#070709]/70 dark:to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-12 text-white max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-300 text-xs font-mono font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Strategic Vision & Brand Universe • Horizon 2030</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Invisible Infrastructure, <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-amber-100 bg-clip-text text-transparent">
              Tangible Power.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-200 max-w-2xl leading-relaxed">
            SENSORIUM reinvents technical facilities management, sensory orchestration, and distributed Edge compute. 
            Explore our manifesto, visual grammar, design system, and the engineering ambition guiding every single Edge node.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveSection("manifesto")}
              className="px-5 py-2.5 bg-gradient-to-r from-[#F38020] to-[#FAAD3F] hover:from-[#e27218] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              Read Manifesto
            </button>
            <button
              onClick={() => setActiveSection("identity")}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              Explore Design System
            </button>
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/[0.08]">
        {[
          { id: "manifesto", label: "The Manifesto", icon: Compass },
          { id: "identity", label: "Identity & Colors", icon: Sliders },
          { id: "logo", label: "Studio Logo & Badges", icon: Award },
          { id: "roadmap", label: "Vision 2030 Roadmap", icon: Target },
          { id: "sustainability", label: "Eco-Design & Impact", icon: Leaf },
          { id: "presskit", label: "Press & Media Kit", icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.08]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION CONTENT */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: THE MANIFESTO */}
        {activeSection === "manifesto" && (
          <motion.div
            key="manifesto"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            {/* The 6 Axioms */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  number: "01",
                  title: "Invisibility of Complexity",
                  desc: "Truly advanced infrastructure recedes gracefully into the background. Our algorithms absorb cluster noise, disk degradations, and traffic spikes to deliver absolute operational peace.",
                  tag: "Radical Philosophy",
                  icon: Eye
                },
                {
                  number: "02",
                  title: "Speed of Light as Standard",
                  desc: "Every millisecond lost across undersea transit cables hinders human ingenuity. Our 150+ global POP nodes bring data under 14 ms away from connected endpoints worldwide.",
                  tag: "Ultra-Low Latency",
                  icon: Zap
                },
                {
                  number: "03",
                  title: "Proactive, Not Reactive Intelligence",
                  desc: "Waiting for server thermal distress before dispatching technicians belongs in the past. SENSORIUM Gemini AI models vibration and heat curves to intervene before failures manifest.",
                  tag: "Total Anticipation",
                  icon: Cpu
                },
                {
                  number: "04",
                  title: "Sovereignty & Zero-Trust Resilience",
                  desc: "Blind trust is an operational vulnerability. Every packet, datacenter operator action, and Kafka stream event is cryptographically verified without exception.",
                  tag: "Imperative Security",
                  icon: ShieldCheck
                },
                {
                  number: "05",
                  title: "Conscious Energy & Net-Zero Carbon",
                  desc: "We refuse to let computing power erode the biosphere. We engineer high-density racks targeting a minimal PUE of 1.12, reclaiming heat loops for surrounding communities.",
                  tag: "Planetary Stewardship",
                  icon: Leaf
                },
                {
                  number: "06",
                  title: "Harmonious Human-Machine Alliance",
                  desc: "Technology achieves purpose only when empowering engineering craft. Automated work orders return valuable time to technicians to innovate rather than merely repair.",
                  tag: "Human-Centric",
                  icon: Award
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="p-6 rounded-2xl glass-card relative overflow-hidden group hover:border-orange-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black font-mono text-orange-500/30 dark:text-orange-400/20 group-hover:text-orange-500 transition-colors">
                          {item.number}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Icon className="w-4 h-4 text-orange-500 shrink-0" />
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Founder / Engineering Quote Callout */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 relative overflow-hidden">
              <div className="max-w-3xl space-y-4">
                <p className="text-base md:text-lg italic text-slate-800 dark:text-neutral-200 font-serif leading-relaxed">
                  "We did not build SENSORIUM simply to be another monitoring dashboard. We created it to empower infrastructure directors and engineers with an omniscient digital nervous system at the core of critical facilities."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F38020] to-[#FAAD3F] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    SN
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Strategic Advisory & Architecture</h4>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">SENSORIUM Global Network Engineering Team</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: BRAND IDENTITY & COLORS */}
        {activeSection === "identity" && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chromatic Palette & Color System</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                The official design identity is inspired by active optical fiber incandescence and structural steel datacenter chassis. Click any swatch to copy its hexadecimal code.
              </p>
            </div>

            {/* Chromatic Palette Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {brandColors.map((color, i) => (
                <div 
                  key={i}
                  onClick={() => handleCopyHex(color.hex)}
                  className="rounded-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-neutral-900/60 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div 
                    className="h-28 flex items-end justify-between p-3 relative"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span 
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded backdrop-blur-md ${
                        color.textDark ? 'text-slate-900 bg-white/70' : 'text-white bg-black/40'
                      }`}
                    >
                      {color.hex}
                    </span>
                    <button 
                      className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy HEX Code"
                    >
                      {copiedHex === color.hex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{color.name}</h4>
                      {copiedHex === color.hex && (
                        <span className="text-[10px] text-emerald-500 font-mono font-semibold">Copied!</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">{color.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Typography & Golden Rules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <div className="p-6 rounded-2xl glass-panel space-y-4">
                <div className="flex items-center gap-2 text-orange-500">
                  <Code2 className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Official Typography</h3>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-neutral-800/60 space-y-1">
                    <span className="text-[10px] font-mono text-orange-500 font-bold uppercase">Headings & User Interface</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white font-sans">
                      Plus Jakarta Sans / Inter Variable
                    </p>
                    <p className="text-slate-500 dark:text-neutral-400">
                      Chosen for exceptional readability under dense dashboard views and balanced contemporary geometry.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-neutral-800/60 space-y-1">
                    <span className="text-[10px] font-mono text-orange-500 font-bold uppercase">Telemetry, Code & Data</span>
                    <p className="text-base font-bold text-slate-900 dark:text-white font-mono">
                      JetBrains Mono / Space Mono
                    </p>
                    <p className="text-slate-500 dark:text-neutral-400">
                      Crisp tabular alignment for IP addresses, latency figures, and geographic facility coordinates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-panel space-y-4">
                <div className="flex items-center gap-2 text-orange-500">
                  <BookmarkCheck className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">The 4 Golden Design Principles</h3>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 dark:text-neutral-400">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span><strong>Luminous Hierarchy:</strong> In light mode, maintain clean alabaster whites and soft neutral grays (#f8fafc). Avoid heavy dark drop-shadows.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span><strong>Orange as Operational Beacon:</strong> Accent #F38020 is dedicated to strategic triggers, critical alerts, and main energy vectors.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <span><strong>Measured Glassmorphism:</strong> Backdrop blur cleanly segments data layers without introducing cosmetic visual clutter.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                    <span><strong>Uncompromising Accessibility:</strong> Guarantee minimum 4.5:1 contrast ratios across all mission-critical hardware telemetry readouts.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: STUDIO LOGO & BADGES */}
        {activeSection === "logo" && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Brand Studio & Official Emblem</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Preview, customize, and export the official vector emblem. Distributed under open partner licensing for official documentation and hardware deployments.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Interactive Logo Stage */}
              <div className="lg:col-span-7 p-8 rounded-3xl glass-panel flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px]" />
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div 
                    className="transition-all duration-300 transform hover:scale-110 drop-shadow-xl"
                    style={{ width: `${logoSize * 1.5}px`, height: `${logoSize * 1.5}px` }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <defs>
                        <linearGradient id="liveLacazaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FF6C2C" />
                          <stop offset="100%" stopColor="#E04808" />
                        </linearGradient>
                      </defs>
                      <rect 
                        width="100" 
                        height="100" 
                        rx="22" 
                        fill={
                          logoVariant === 'gradient' ? 'url(#liveLacazaGrad)' :
                          logoVariant === 'dark' ? '#070709' :
                          logoVariant === 'light' ? '#FFFFFF' : '#1E293B'
                        } 
                        stroke={logoVariant === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.15)'} 
                        strokeWidth="2"
                      />
                      <text x="32" y="66" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontStyle="italic" fontSize="46" fill={logoVariant === 'light' ? '#FF6C2C' : '#FFFFFF'}>c</text>
                      <text x="52" y="66" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="50" fill={logoVariant === 'light' ? '#FF6C2C' : '#FFFFFF'}>P</text>
                      <circle cx="82" cy="78" r="5" fill="#34D399" />
                    </svg>
                  </div>

                  <div className="text-center">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">SENSORIUM Console Emblem</h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
                      Variant: {logoVariant.toUpperCase()} • Size: {logoSize}px
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls & Export */}
              <div className="lg:col-span-5 p-6 rounded-3xl glass-card space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Logo Parameters</h3>
                  
                  {/* Variant selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Emblem Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "gradient", label: "Solar Gradient" },
                        { id: "dark", label: "Obsidian Dark" },
                        { id: "light", label: "Alabaster Light" },
                        { id: "monochrome", label: "Monochrome Slate" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setLogoVariant(item.id as any)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                            logoVariant === item.id
                              ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                              : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/5"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-neutral-400 font-medium">Preview Scale</span>
                      <span className="font-mono font-bold text-orange-500">{logoSize} px</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" 
                      max="120" 
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDownloadSvg}
                      className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download SVG
                    </button>
                    <button
                      onClick={handleCopySvg}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white font-medium text-xs rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {svgCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Code2 className="w-3.5 h-3.5" />}
                      {svgCopied ? "Copied!" : "Copy SVG Code"}
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-slate-400">High-fidelity lossless vector format</p>
                </div>
              </div>
            </div>

            {/* Partner Integration Badges */}
            <div className="p-6 rounded-3xl glass-panel space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Partner Badges & Datacenter Badges</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                You may apply these verified badges in facility reports, rack labels, or corporate enterprise portals.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="px-4 py-2 rounded-xl bg-slate-900 text-white border border-white/10 flex items-center gap-2 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>MONITORED BY SENSORIUM KAFKA ENGINE</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-2 text-xs font-mono font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>SENSORIUM EDGE ACCELERATED • 14ms SLA</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-2 text-xs font-mono">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>ECO-CERTIFIED PUE &lt; 1.15</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: ROADMAP VISION 2030 */}
        {activeSection === "roadmap" && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Technology Horizons & Strategic Roadmap</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Our engineering timeline spans through 2030. Explore completed milestones and upcoming distributed infrastructure breakthroughs.
              </p>
            </div>

            {/* Interactive Timeline */}
            <div className="relative pl-6 md:pl-8 border-l-2 border-orange-500/30 space-y-8 my-6">
              {[
                {
                  year: "2024",
                  status: "ACCOMPLISHED",
                  badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                  title: "SENSORIUM Foundation & Real-Time Kafka Ingestion",
                  desc: "Commissioned the distributed Apache Kafka telemetry pipeline processing 500k hardware metrics/sec with isolated multi-tenant storage."
                },
                {
                  year: "2025",
                  status: "DEPLOYED",
                  badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
                  title: "Gemini AI Predictive Diagnostics & Global Heatmap",
                  desc: "Integrated the multimodal Gemini model for hardware failure syntheses and interactive geographic telemetry across global POP datacenters."
                },
                {
                  year: "2026",
                  status: "ACTIVE HORIZON",
                  badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                  title: "Autonomous Edge Cluster Self-Healing",
                  desc: "Zero-interruption autonomous traffic failover during local power sags and automated container state reassignment."
                },
                {
                  year: "2028",
                  status: "R&D INNOVATION",
                  badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                  title: "Submersible Datacenters & Passive Ocean Cooling",
                  desc: "Coastal server rack deployments utilizing natural deep-water current heat exchange targeting a breakthrough 1.04 PUE."
                },
                {
                  year: "2030",
                  status: "ULTIMATE VISION",
                  badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                  title: "Quantum Mesh & Sovereign Decentralized Interconnect",
                  desc: "Post-quantum cryptographic safeguards across transcontinental routes and automated zero-latency planetary equipment orchestration."
                }
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#070709] border-2 border-orange-500 group-hover:scale-125 transition-transform" />
                  
                  <div className="p-5 rounded-2xl glass-card space-y-2 hover:border-orange-500/40 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black font-mono text-orange-500">{item.year}</span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 5: ECO-DESIGN & SUSTAINABILITY */}
        {activeSection === "sustainability" && (
          <motion.div
            key="sustainability"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Eco-Responsibility & Digital Energy Sobriety</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Technical performance holds value only when operating within planetary boundaries. SENSORIUM is designed from the silicon layer up to minimize environmental footprint.
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl glass-card border-emerald-500/20 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-black font-mono text-emerald-500">1.12</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Certified Average PUE</h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Compared to global datacenter industry averages of 1.58. Over 40% chiller energy saved per kilowatt compute.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-card border-emerald-500/20 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-black font-mono text-emerald-500">100%</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Renewable Energy Matched</h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    European POP nodes (Paris, Frankfurt, London) are powered through direct wind and hydro power purchase contracts.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-card border-emerald-500/20 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-black font-mono text-emerald-500">+4 yrs</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Hardware Lifecycle Extension</h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Through predictive maintenance and thermal balancing, premature server deprecation is reduced, lowering e-waste by 38%.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 6: PRESS & MEDIA KIT */}
        {activeSection === "presskit" && (
          <motion.div
            key="presskit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Media Assets & Press Kit</h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Official brand materials for publications, press inquiries, and architectural documentation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl glass-panel space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  Official Boilerplate (Executive Summary)
                </h3>
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-neutral-800/60 font-mono text-xs text-slate-700 dark:text-neutral-300 leading-relaxed select-all">
                  "SENSORIUM is the sovereign platform for sensory intelligence, Edge AI orchestration, and real-time supervision of critical infrastructure. Combining real-time Apache Kafka streaming telemetry and Google Gemini intelligence, SENSORIUM delivers 99.999% availability and sub-14ms network latency across distributed edge nodes."
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("SENSORIUM is the sovereign platform for sensory intelligence, Edge AI orchestration, and real-time supervision of critical infrastructure. Combining real-time Apache Kafka streaming telemetry and Google Gemini intelligence, SENSORIUM delivers 99.999% availability and sub-14ms network latency across distributed edge nodes.");
                    setBoilerplateCopied(true);
                    setTimeout(() => setBoilerplateCopied(false), 2000);
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {boilerplateCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {boilerplateCopied ? "Copied to Clipboard!" : "Copy Summary Text"}
                </button>
              </div>

              <div className="p-6 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-orange-500" />
                    Brand Asset Package
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Includes vector emblems (SVG, transparent PNGs), HEX/CMYK color tokens, and typographic guides.
                  </p>
                </div>

                <div className="space-y-2 pt-4">
                  <button
                    onClick={handleDownloadSvg}
                    className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download Official SVG Emblem
                  </button>
                  <p className="text-[10px] text-center text-slate-400">Open license for press, documentation, and partner integrations</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
