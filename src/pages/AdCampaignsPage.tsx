import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Megaphone, 
  Download, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  Maximize2, 
  Share2, 
  Sliders, 
  Layers, 
  Tv, 
  Monitor, 
  Smartphone, 
  Globe, 
  Zap, 
  Award, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  Film 
} from "lucide-react";

// Generated high-impact futuristic advertising assets
import adBillboardImg from "../assets/images/futuristic_ad_billboard_1789568578335.jpg";
import quantumMonolithImg from "../assets/images/quantum_edge_core_1789568592988.jpg";
import planetaryMeshImg from "../assets/images/planetary_edge_mesh_1789568609265.jpg";
import brandVisionImg from "../assets/images/cafm_brand_vision_1789522330075.jpg";
import SocialAdSimulator from "../components/SocialAdSimulator";

interface AdCampaignsPageProps {
  isDark: boolean;
  onExplorePublic?: () => void;
}

export default function AdCampaignsPage({ isDark, onExplorePublic }: AdCampaignsPageProps) {
  const [pageSection, setPageSection] = useState<"social-simulator" | "billboards" | "catalogue">("social-simulator");
  const [activeCampaignIdx, setActiveCampaignIdx] = useState<number>(0);
  const [selectedFormat, setSelectedFormat] = useState<"16:9" | "9:16" | "1:1" | "4:1">("16:9");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isPlayingSpot, setIsPlayingSpot] = useState<boolean>(true);
  const [spotProgress, setSpotProgress] = useState<number>(45);

  const campaigns = [
    {
      id: "neo-billboard",
      title: "Neo-Metropolis Campaign • 8K Giant Billboard",
      tagline: "Invisible Infrastructure. Absolute Velocity.",
      subtitle: "Monumental digital display across hyper-connected megacities",
      image: adBillboardImg,
      location: "Neo-Tokyo, Shinjuku District & Times Square Holographic",
      audience: "CIOs, Tech Executives, Cloud Architects & Network Engineers",
      metrics: {
        impressions: "4.8M views/day",
        ctr: "5.4% on dynamic QR Code",
        impact: "+48% spontaneous brand recall"
      },
      copywriting: "In the dizzying pace of the hyper-connected city, a single second of outage paralyzes millions of lives. SENSORIUM silently orchestrates the vital flows of your Edge clusters for flawless velocity.",
      aspectRatios: ["16:9", "9:16", "1:1"]
    },
    {
      id: "quantum-core",
      title: "The Quantum Monolith • Luxury Tech Studio Spot",
      tagline: "The Beating Core of Sovereign Computing.",
      subtitle: "High-precision commercial photography for flagship publications",
      image: quantumMonolithImg,
      location: "Business Publications (Forbes, MIT Tech Review, Wired) & Global Summits",
      audience: "CTOs, Zero-Trust Security Engineers & Datacenter Operators",
      metrics: {
        impressions: "1.2M C-Level Executives",
        ctr: "8.2% engagement rate",
        impact: "Sovereign Tier-IV Certified"
      },
      copywriting: "Forged in obsidian glass and aerospace alloys, our Edge chassis packs the densest compute per cubic decimeter. A technological fortress against operational volatility.",
      aspectRatios: ["16:9", "1:1", "4:1"]
    },
    {
      id: "planetary-mesh",
      title: "The Planetary Fabric • Orbital Campaign",
      tagline: "150+ POP Nodes. Sub-14ms from Every Connected Human.",
      subtitle: "Worldwide deployment of a sovereign transcontinental optical mesh",
      image: planetaryMeshImg,
      location: "International Hubs (CDG, JFK, Haneda) & VIP Digital Banners",
      audience: "Multinationals, High-Frequency FinTechs & Global Enterprises",
      metrics: {
        impressions: "12.5M travelers",
        ctr: "6.9% B2B acquisition",
        impact: "Active presence across 6 continents"
      },
      copywriting: "From London to Singapore, from São Paulo to Frankfurt: SENSORIUM optical laser pulses span continents to guarantee instantaneous synchronization for mission-critical workloads.",
      aspectRatios: ["16:9", "4:1", "9:16"]
    },
    {
      id: "laser-datacenter",
      title: "Shadow & Light • Industrial Craftsmanship Campaign",
      tagline: "Every Optical Fiber Holds a Destiny. We Master It.",
      subtitle: "A tribute to mechanical precision and thermodynamics in server racks",
      image: brandVisionImg,
      location: "R&D Centers, Engineering Academies & Cloud Expo Summits",
      audience: "Systems Engineers, DevOps & Infrastructure Specialists",
      metrics: {
        impressions: "850K professionals",
        ctr: "11.1% dev conversion",
        impact: "#1 Employer Brand in Critical Infra"
      },
      copywriting: "Datacenter excellence is not judged by marketing claims, but by the quiet hum of perfectly chilled aisles and the crystalline integrity of high-speed PCIe 5.0 buses.",
      aspectRatios: ["16:9", "1:1"]
    }
  ];

  const currentCamp = campaigns[activeCampaignIdx];

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownloadImage = (imgSrc: string, name: string) => {
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `${name}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-20">
      
      {/* Hero Header for Ads and Publicity */}
      <div className="text-center space-y-4 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md">
          <Megaphone className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
          <span>Advertising Campaigns & High-Impact Visual Universe</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
          Powerful Visuals for an <br />
          <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-amber-200 bg-clip-text text-transparent">
            Unforgettable Brand.
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Step inside the creative advertising universe. Discover our interactive 9:16 mobile campaign simulator (Instagram Reels & Stories), our monumental 8K city billboards, and international media spots.
        </p>

        {/* Section Navigation Tabs */}
        <div className="flex items-center justify-center pt-2">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 backdrop-blur-md gap-1.5 shadow-inner">
            <button
              onClick={() => setPageSection("social-simulator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                pageSection === "social-simulator"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 scale-102"
                  : "text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Smartphone className="w-4 h-4 text-cyan-300" />
              <span>Social Media Studio (Story & Reels 9:16)</span>
            </button>
            <button
              onClick={() => setPageSection("billboards")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                pageSection === "billboards"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 scale-102"
                  : "text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Tv className="w-4 h-4 text-amber-300" />
              <span>Urban Billboards & 8K Displays</span>
            </button>
            <button
              onClick={() => setPageSection("catalogue")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                pageSection === "catalogue"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 scale-102"
                  : "text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>Catalog & 30s Video Spots</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: SMARTPHONE SOCIAL MEDIA SIMULATOR (STORY & REELS 9:16) */}
      {pageSection === "social-simulator" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Center: The Phone Mockup */}
            <div className="lg:col-span-6 flex justify-center">
              <SocialAdSimulator 
                initialMode="story" 
                onActionClick={(action) => {
                  if (onExplorePublic) onExplorePublic();
                }}
              />
            </div>

            {/* Right: Technical Specs, Campaign Strategy & Asset Generator */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/[0.08] space-y-4">
                <div className="flex items-center gap-2 text-cyan-500">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    9:16 Advertising Specifications
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  High-Immersion Vertical Media for Tech Leaders
                </h3>

                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Tailor-made for sponsored campaigns on Instagram Reels, TikTok for Business, LinkedIn Stories, and YouTube Shorts. Engages engineers and decision-makers in under 1.8 seconds.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-1">
                    <div className="text-[10px] font-mono text-slate-500">Native Resolution</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">1080 x 1920 (9:16) 60fps</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-1">
                    <div className="text-[10px] font-mono text-slate-500">Video Retention Rate</div>
                    <div className="text-xs font-bold text-emerald-500 font-mono">78.4% through CTA</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-1">
                    <div className="text-[10px] font-mono text-slate-500">Countdown Trigger</div>
                    <div className="text-xs font-bold text-cyan-400 font-mono">Synchronized Launch Timer</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-1">
                    <div className="text-[10px] font-mono text-slate-500">Interactive Polling</div>
                    <div className="text-xs font-bold text-amber-400 font-mono">68% Lead Qualification</div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="/story-reels.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Standalone Full-Screen Mobile Reel</span>
                  </a>
                </div>
              </div>

              {/* Interactive Campaign Copy & Slogan Generator */}
              <div className="p-6 rounded-3xl glass-card border border-slate-200 dark:border-white/[0.08] space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Turnkey Campaign Hooks & Ad Copy</span>
                  <span className="text-[10px] font-mono text-orange-500 font-bold">1-Click Copy</span>
                </h4>

                <div className="space-y-3">
                  {[
                    {
                      label: "Silicon-DNA Hybrid Breakthrough",
                      text: "⚡ Silicon-DNA Hybrid Cluster: 1.18 PUE Achieved. Eliminate thermal throttling in your AI server racks with continuous thermodynamic HVAC orchestration."
                    },
                    {
                      label: "Neo-Metropolis Velocity Hook",
                      text: "🚀 In the frenzy of the megacity, 1 millisecond of downtime costs millions. SENSORIUM silently harmonizes your Edge clusters."
                    },
                    {
                      label: "Quantum Sovereignty Hook",
                      text: "🛡️ The SENSORIUM Quantum Monolith: obsidian shielding and post-quantum cryptography. Your data stays strictly sovereign within your borders."
                    }
                  ].map((hook, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                          {hook.label}
                        </span>
                        <p className="text-xs text-slate-700 dark:text-neutral-300 leading-snug">
                          {hook.text}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyText(hook.text, `hook-${i}`)}
                        className="p-2 rounded-lg bg-white dark:bg-white/10 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-neutral-300 transition-colors shrink-0 cursor-pointer shadow-xs"
                        title="Copy text"
                      >
                        {copiedText === `hook-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setPageSection("billboards");
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View 8K urban billboards
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 2: BILLBOARDS 8K */}
      {pageSection === "billboards" && (
        <div className="rounded-3xl overflow-hidden glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-2xl relative group">
        
        {/* Top bar with Campaign Switcher Tabs */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02] backdrop-blur-md overflow-x-auto gap-3">
          <div className="flex items-center gap-2">
            {campaigns.map((camp, idx) => (
              <button
                key={camp.id}
                onClick={() => setActiveCampaignIdx(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeCampaignIdx === idx
                    ? "bg-gradient-to-r from-[#F38020] to-[#FAAD3F] text-white shadow-md shadow-orange-500/20 scale-105"
                    : "bg-white dark:bg-white/[0.05] text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                <span>{camp.title.split("•")[0]}</span>
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">Active Ratio:</span>
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/10 p-1 rounded-lg">
              {(["16:9", "9:16", "1:1", "4:1"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    selectedFormat === fmt
                      ? "bg-orange-500 text-white"
                      : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cinematic Billboard Canvas */}
        <div className="relative min-h-[460px] md:min-h-[580px] flex items-center justify-center overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCamp.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={currentCamp.image}
                alt={currentCamp.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-all duration-700 filter brightness-[0.92] contrast-[1.05] ${
                  selectedFormat === "1:1" ? "max-w-2xl mx-auto" :
                  selectedFormat === "9:16" ? "max-w-sm mx-auto" :
                  selectedFormat === "4:1" ? "max-h-[300px] my-auto" : "w-full"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
            </motion.div>
          </AnimatePresence>

          {/* Holographic Watermark / Brand Badge */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <span className="font-bold tracking-wider">SENSORIUM // 8K MASTER SPOTLIGHT</span>
          </div>

          {/* Floating Cinema Overlay Controls */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button
              onClick={() => handleDownloadImage(currentCamp.image, currentCamp.id)}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
              title="Download high-resolution image"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline font-semibold">Download HD</span>
            </button>
            <button
              onClick={() => handleCopyText(currentCamp.tagline, "slogan")}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
              title="Copy campaign slogan"
            >
              {copiedText === "slogan" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
              <span className="hidden sm:inline font-semibold">{copiedText === "slogan" ? "Copied!" : "Copy Slogan"}</span>
            </button>
          </div>

          {/* Overlay Typography (Billboard Style) */}
          <div className="relative z-20 max-w-4xl p-6 md:p-12 mt-auto w-full text-white space-y-3">
            <div className="inline-block px-3 py-1 rounded-md bg-orange-500/80 backdrop-blur-md text-[10px] md:text-xs font-mono font-black uppercase tracking-widest text-white shadow-lg">
              {currentCamp.location}
            </div>

            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-lg leading-tight">
              {currentCamp.tagline}
            </h2>

            <p className="text-xs md:text-sm text-slate-200 drop-shadow max-w-2xl leading-relaxed">
              {currentCamp.copywriting}
            </p>

            {/* Campaign Key Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20 max-w-2xl">
              <div>
                <div className="text-[10px] uppercase font-mono text-orange-300">Global Audience</div>
                <div className="text-xs md:text-sm font-black font-mono text-white">{currentCamp.metrics.impressions}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono text-orange-300">Click-Through Rate (CTR)</div>
                <div className="text-xs md:text-sm font-black font-mono text-white">{currentCamp.metrics.ctr}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono text-orange-300">Awareness Lift</div>
                <div className="text-xs md:text-sm font-black font-mono text-white">{currentCamp.metrics.impact}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
      )}

      {/* SECTION 3: CATALOG & 30s TV SPOT */}
      {(pageSection === "catalogue" || pageSection === "billboards") && (
        <div className="space-y-12 animate-in fade-in duration-300">
          
          {/* Grid of 4 Complete Advertising Campaign Visuals with Copywriting */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-orange-500" />
                  SENSORIUM Creative Campaign Catalog
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Four major creative concepts designed for international media agencies, DOOH displays, and enterprise digital campaigns.
                </p>
              </div>
              <span className="text-xs font-mono text-orange-600 dark:text-orange-400 font-bold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 self-start md:self-auto">
                4 Ready-to-Deploy 8K Master Visuals
              </span>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {campaigns.map((camp, idx) => (
            <div 
              key={camp.id}
              className="rounded-3xl glass-card overflow-hidden border border-slate-200 dark:border-white/[0.08] shadow-md hover:shadow-2xl hover:border-orange-500/40 transition-all flex flex-col group"
            >
              {/* Image Frame */}
              <div className="relative h-64 md:h-72 overflow-hidden bg-slate-950">
                <img
                  src={camp.image}
                  alt={camp.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-orange-400 border border-white/10">
                    BILLBOARD {idx + 1} // MASTER
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="text-xs font-mono font-bold drop-shadow">{camp.location.split("&")[0]}</span>
                  <button
                    onClick={() => handleDownloadImage(camp.image, camp.id)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors cursor-pointer"
                    title="Download image"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Content Description */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {camp.tagline}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                    {camp.copywriting}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-neutral-400">Target Audience:</span>
                    <span className="font-semibold text-slate-800 dark:text-neutral-200 text-right">{camp.audience}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveCampaignIdx(idx);
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className="flex-1 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Fullscreen
                    </button>
                    <button
                      onClick={() => handleCopyText(camp.tagline, `slogan-${idx}`)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 cursor-pointer transition-colors"
                      title="Copy slogan"
                    >
                      {copiedText === `slogan-${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Video Ad Simulator (Spot TV & Digital Showcase) */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/[0.08] relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-500">
              <Film className="w-5 h-5" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Digital TV Commercial • 30 Seconds</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Broadcast & Voiceover Script Simulator</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Official script for global TV commercials airing across Bloomberg Tech, CNBC, and premium digital networks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlayingSpot(!isPlayingSpot)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              {isPlayingSpot ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlayingSpot ? "Pause Commercial" : "Play Commercial"}</span>
            </button>
          </div>
        </div>

        {/* Virtual Timeline & Script */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-orange-500 font-bold">
              <span>00:00 — 00:08</span>
              <span>SCENE 1</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">The Silence of the Megacities</h4>
            <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
              Aerial tracking shot over Tokyo at night under rain. Calm voiceover: <em>"Every day, 4 billion data packets decide the fate of entire economies."</em>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-orange-500 font-bold">
              <span>00:08 — 00:20</span>
              <span>SCENE 2</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">The Predictive Spark</h4>
            <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
              Macro close-up on the SENSORIUM Quantum Monolith. Amber circuits glow. <em>"We don't wait for downtime. We steer the light before it ever flickers."</em>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-orange-500 font-bold">
              <span>00:20 — 00:30</span>
              <span>SCENE 3</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">The SENSORIUM Signature</h4>
            <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
              Planetary orbital perspective. Golden emblem reveals with sound mark. Closing slogan: <em>"SENSORIUM. Invisible Infrastructure, Absolute Velocity."</em>
            </p>
          </div>
        </div>

        {/* Technical Media Pack Spec Bar */}
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-orange-700 dark:text-orange-300">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>CERTIFIED IAB FORMATS: Billboard 970x250, Half Page 300x600, 4K Cinema DCP 3840x2160</span>
          </div>
          <button
            onClick={() => handleCopyText("media@sensorium.network", "media-contact")}
            className="px-3 py-1 bg-white dark:bg-black/40 hover:bg-orange-500 hover:text-white rounded-lg transition-colors font-bold cursor-pointer"
          >
            {copiedText === "media-contact" ? "Email Copied!" : "Contact Media Desk"}
          </button>
        </div>
      </div>
      </div>
      )}

    </div>
  );
}
