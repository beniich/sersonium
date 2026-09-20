import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft,
  ChevronRight,
  Sparkles, 
  Film, 
  Layers, 
  Hourglass,
  Bell,
  Star,
  AlertTriangle,
  Flame,
  Zap,
  Activity,
  Calendar,
  Rocket,
  ExternalLink,
  Maximize2
} from "lucide-react";

import brandVisionImg from "../assets/images/cafm_brand_vision_1789522330075.jpg";
import adBillboardImg from "../assets/images/futuristic_ad_billboard_1789568578335.jpg";

interface SocialAdSimulatorProps {
  initialMode?: "story" | "reels";
  onActionClick?: (action: string) => void;
}

export interface SlideItem {
  id: number;
  category: string;
  badge: string;
  caption: string;
  cta: string;
  bg: string;
  title?: string;
  subtitle?: string;
}

const REMOTE_BG_1 = "https://lh3.googleusercontent.com/aida/AEtjO1UAf9EQwvLs44rV1bBj92GF5SjbZXhmlmH_cUBl37qWAYJmYht37btglQ-v4EFjRLtL2xe0RijRkiw-ilQkUls6a6sskFCqDulULCO6J7ZhEk1CAjCBrca6h-iByntJ7kUYcEFR_Dmw-EyD2PiYYTjRrV8-KPSU3cLLBmnspgEVcEzXJWwtRsQPQ0JuJgxGntrRz-E1uHwlWHe8MstWEQd8HAtZlgd7nfRli630U0XKZNRcDI5GMd_sBYw";
const REMOTE_BG_2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuAR09mXPe3wxhYN5cSRYb5EGGkeJsyHbo03JaFPGijto4W6zNHKoDom3WB2hDiKLd_vXSl8iSdTG-EIwGGT6MtwtyQTlRSBYHIEFfUk6CbnS1mBxo-_PvqtPu0SMZuI9gA3fxxBD0d3bHLooeRQHWnKX6mLD6rwTxquBVT438KZ1a0388A3hjG32biCJs9RUgyzdIpXWYoupey-8rzNG4V2sD14_YJHrW50uG2aBboZYdSzduM93UKe";
const LOGO_URL = "https://lh3.googleusercontent.com/aida/AEtjO1Wco7tKKlJ5dsxG4zeIieLZSDrZutEo7C2ornhFPYT6AvRQIwUmHgofrdfgJZDRM9qMXMq_qUIyRNnFLW7v_-3LgjsdC5BdTqLJNTeGYHXA6_1ay1T_h_3xWlsktaC-8A05KWgnurMTORFwX9uX9crmS6ZiJCsBKqoYoes6chqlSnUO8HtvRWAGELTJNBLzJHugnwDxKPkIlgnO-oEPEXJdHNIzMbxyIojIdsRPcKeABiOmMxh2OUe34w";

export const SLIDES_DATA: SlideItem[] = [
  {
    id: 0,
    category: "Tech Breakthrough",
    badge: "Slide 01 / 10 • Tech Hook",
    caption: "No more overheating in your AI server racks. Predictive HVAC monitoring and continuous thermodynamic control. #Datacenter #BioCompute #PUE118",
    cta: "Book a deployment slot",
    bg: REMOTE_BG_1
  },
  {
    id: 1,
    category: "Energy Alert",
    badge: "Slide 02 / 10 • The Problem",
    caption: "Global average PUE at 1.58: 40% of electricity bills are wasted on non-optimized cooling. #GreenIT #PUE",
    cta: "Analyze my current PUE",
    bg: REMOTE_BG_2
  },
  {
    id: 2,
    category: "Architecture",
    badge: "Slide 03 / 10 • Silicon-DNA",
    caption: "Combining neuromorphic silicon and DNA macromolecules to compress 1 PB per gram. #BioCompute #Hardware",
    cta: "Discover the architecture",
    bg: REMOTE_BG_1
  },
  {
    id: 3,
    category: "Telemetry",
    badge: "Slide 04 / 10 • Live Data",
    caption: "Second-by-second telemetry: inlet/outlet temperature deltas and micro-channel monitoring. #IoT #Supervision",
    cta: "View live console",
    bg: REMOTE_BG_2
  },
  {
    id: 4,
    category: "Predictive AI",
    badge: "Slide 05 / 10 • CAFM CMMS",
    caption: "Our algorithms predict HVAC bearing and compressor wear 48 hours before failure occurs. #Maintenance #Predictive",
    cta: "Schedule my CMMS audit",
    bg: REMOTE_BG_1
  },
  {
    id: 5,
    category: "Live Poll",
    badge: "Slide 06 / 10 • Live Poll",
    caption: "Vote to see how 1,800+ engineering directors surveyed this week are positioned. #Poll #CIO",
    cta: "Share my perspective",
    bg: REMOTE_BG_2
  },
  {
    id: 6,
    category: "Case Study",
    badge: "Slide 07 / 10 • Key Figures",
    caption: "Verified results after 6 months at a Tier III operator in Paris region. #Metrics #ROI #CAFM",
    cta: "Calculate my annual savings",
    bg: REMOTE_BG_1
  },
  {
    id: 7,
    category: "Launch",
    badge: "Slide 08 / 10 • Countdown",
    caption: "The next-generation cluster opens its first private slots in 3 days. #Event #ClusterLaunch",
    cta: "Reserve my early-access pass",
    bg: REMOTE_BG_2
  },
  {
    id: 8,
    category: "Testimonial",
    badge: "Slide 09 / 10 • CIO Review",
    caption: "Feedback: certified thermal safety and eliminated unexpected GPU frequency throttling. #Testimonial #Enterprise",
    cta: "Read the full case study",
    bg: REMOTE_BG_1
  },
  {
    id: 9,
    category: "Sandbox CTA",
    badge: "Slide 10 / 10 • 14-Day Trial",
    caption: "Test the platform with your own live sensor streams with no commitment for 14 days. #FreeTrial #CloudCAFM",
    cta: "Start my 14-day free trial",
    bg: REMOTE_BG_2
  }
];

export default function SocialAdSimulator({ initialMode = "story", onActionClick }: SocialAdSimulatorProps) {
  const [activeMode, setActiveMode] = useState<"story" | "reels">(initialMode);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Audio mute state
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Social interactions state
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(4210);
  const [shareCount, setShareCount] = useState<number>(912);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isReminderActive, setIsReminderActive] = useState<boolean>(false);

  // Poll state for Slide 5
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votedOpt, setVotedOpt] = useState<"optA" | "optB" | null>(null);

  // Video progress states for Reels mode
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSeconds, setCurrentSeconds] = useState<number>(4.0);
  const totalSeconds = 15.0;

  // Countdown timer for Slide 7
  const [countdown, setCountdown] = useState({
    days: 3,
    hours: 14,
    mins: 28,
    secs: 45
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Countdown clock interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        let secs = prev.secs - 1;
        let mins = prev.mins;
        let hours = prev.hours;
        let days = prev.days;

        if (secs < 0) {
          secs = 59;
          mins -= 1;
          if (mins < 0) {
            mins = 59;
            hours -= 1;
            if (hours < 0) {
              hours = 23;
              days = Math.max(0, days - 1);
            }
          }
        }
        return { days, hours, mins, secs };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Video playback timer (for Reels mode)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && activeMode === "reels") {
      interval = setInterval(() => {
        setCurrentSeconds(prev => {
          if (prev >= totalSeconds) return 0;
          return Number((prev + 0.2).toFixed(1));
        });
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeMode]);

  const currentSlide = SLIDES_DATA[currentSlideIndex];

  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
      if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
        if (deltaX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
  };

  const nextSlide = () => {
    setCurrentSlideIndex(prev => (prev + 1) % SLIDES_DATA.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex(prev => (prev - 1 + SLIDES_DATA.length) % SLIDES_DATA.length);
  };

  const goToSlide = (idx: number) => {
    setCurrentSlideIndex(idx);
    showToast(`Slide ${idx + 1} / 10: ${SLIDES_DATA[idx].category}`);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setLikeCount(prev => prev + 1);
      showToast("You liked this sponsored post ❤️");
    } else {
      setLikeCount(prev => prev - 1);
    }
  };

  const handleShare = () => {
    setShareCount(prev => prev + 1);
    navigator.clipboard?.writeText?.(window.location.href);
    showToast("Link copied to clipboard! 🚀");
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    showToast(!isBookmarked ? "Post saved to your bookmarks 📌" : "Removed from bookmarks");
  };

  const toggleAudio = () => {
    setIsMuted(!isMuted);
    showToast(isMuted ? "Audio enabled: Tech Beats (Stereo) 🔊" : "Audio muted 🔇");
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    showToast(!isFollowing ? "You are now following @jeton_cafm ✓" : "Unfollowed");
  };

  const handleVote = (opt: "optA" | "optB") => {
    if (hasVoted) return;
    setHasVoted(true);
    setVotedOpt(opt);
    showToast("Your vote has been recorded! Thank you 📊");
  };

  const toggleReminder = () => {
    setIsReminderActive(!isReminderActive);
    showToast(!isReminderActive ? "Reminder set: notification on Day 0 🔔" : "Reminder cancelled");
  };

  const handlePrimaryAction = () => {
    if (onActionClick) {
      onActionClick(currentSlide.cta);
    }
    showToast(`Action: ${currentSlide.cta}`);
  };

  const renderSlideContent = () => {
    switch (currentSlideIndex) {
      case 0:
        return (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/60 via-cyan-500/60 to-amber-500/60 border border-cyan-400/50 backdrop-blur-md text-white text-[11px] font-extrabold tracking-wide uppercase shadow-lg shadow-cyan-500/20 mb-2 animate-soft-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
              <span>⚡ DATACENTER TECH BREAKTHROUGH 2025</span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight drop-shadow-lg max-w-[300px] mb-2">
              Silicon-DNA Hybrid Cluster:{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-amber-300">
                PUE 1.18 Achieved
              </span>
            </h2>
            <p className="text-xs text-slate-300 max-w-[290px] mb-3 drop-shadow">
              100x density per rack with two-phase direct immersion cooling.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-950/70 border border-cyan-400/40 text-cyan-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Thermal saturation prevented</span>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300 w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold mb-3 backdrop-blur-md animate-pulse">
              <span>🚨</span>
              <span>ENERGY COST ESCALATION</span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight mb-2">
              Your GPUs overheat,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
                your energy bills surge.
              </span>
            </h2>
            <div className="w-full max-w-[310px] bg-slate-900/90 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-3.5 my-2 shadow-2xl text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300 font-semibold">Traditional PUE</span>
                <span className="text-xs font-mono font-bold text-rose-400">1.58 (38% Waste)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2.5">
                <div className="h-full bg-rose-500 w-[78%]" />
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300 font-semibold">Sensorium CAFM Target</span>
                <span className="text-xs font-mono font-bold text-emerald-400">1.18 (96% Efficiency)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[22%]" />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300 w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold mb-3 backdrop-blur-md">
              <span>🧬</span>
              <span>GLOBAL PATENT 2025</span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight mb-2">
              Silicon-DNA Hybrid Technology
            </h2>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[310px] my-2 text-left">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                <div className="text-cyan-400 font-bold text-sm font-mono">100x</div>
                <div className="text-[10px] text-slate-300 leading-tight mt-0.5">Compute density per m²</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30">
                <div className="text-amber-400 font-bold text-sm font-mono">-65%</div>
                <div className="text-[10px] text-slate-300 leading-tight mt-0.5">Coolant requirements</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 max-w-[290px]">
              Seamless integration with BACnet, Modbus, and SNMP protocols.
            </p>
          </div>
        );

      case 3:
        return (
          <div className="w-full max-w-[315px] bg-slate-900/95 backdrop-blur-xl border border-cyan-400/50 rounded-2xl p-3 shadow-2xl text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono text-cyan-300 font-bold">CONTINUOUS TELEMETRY</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">12ms LATENCY</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Rack #04 Temperature</span>
                <span className="text-emerald-400 font-bold">23.4 °C (Stable)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Coolant Flow Rate</span>
                <span className="text-cyan-300 font-bold">48.2 L/min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Current Global PUE</span>
                <span className="text-amber-300 font-bold text-sm">1.178</span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>84 thermal probes</span>
              <span className="text-emerald-400 font-semibold">100% Operational</span>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300 w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold mb-3 backdrop-blur-md">
              <span>🤖</span>
              <span>PREDICTIVE CMMS 4.0</span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight mb-2">
              Zero Unplanned Downtime
            </h2>
            <div className="w-full max-w-[310px] bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 mb-2 text-left space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white leading-none">Early Thermal Drift Alert</p>
                  <p className="text-[10px] text-slate-300 mt-1">HVAC Pump B2: anomalous vibration predicted within 48h.</p>
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center justify-between">
                <span>On-call technician ticket created</span>
                <span>Auto-assigned</span>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="w-full max-w-[310px] bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                📊 Live Poll 2025
              </span>
              <span className="text-[10px] text-slate-400">2,140 votes</span>
            </div>
            <p className="text-xs font-semibold text-white mb-2.5">
              What is your biggest thermal bottleneck today?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleVote("optA")}
                className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between group cursor-pointer ${
                  hasVoted && votedOpt === "optA"
                    ? "bg-blue-900/40 border-blue-500"
                    : "border-slate-700 hover:border-blue-500 bg-slate-800/70 hover:bg-blue-900/30"
                }`}
              >
                <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                  ❄️ Legacy chillers & outdated HVAC
                </span>
                {hasVoted && (
                  <span className="text-xs font-bold text-blue-400 font-mono">64%</span>
                )}
              </button>

              <button
                onClick={() => handleVote("optB")}
                className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between group cursor-pointer ${
                  hasVoted && votedOpt === "optB"
                    ? "bg-blue-900/40 border-blue-500"
                    : "border-slate-700 hover:border-blue-500 bg-slate-800/70 hover:bg-blue-900/30"
                }`}
              >
                <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                  🔥 Hotspots on AI GPU racks
                </span>
                {hasVoted && (
                  <span className="text-xs font-bold text-blue-400 font-mono">36%</span>
                )}
              </button>
            </div>
            {hasVoted && (
              <p className="text-[10px] text-emerald-400 text-center font-medium mt-2 animate-in fade-in">
                ✓ Vote recorded! Thank you for your feedback.
              </p>
            )}
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300 w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-3 backdrop-blur-md">
              <Activity className="w-3.5 h-3.5" />
              <span>MEASURED PRODUCTION IMPACT</span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight mb-3">
              Certified Metrics
            </h2>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[310px] text-left">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-400/30">
                <div className="text-2xl font-mono font-black text-cyan-300">-42%</div>
                <div className="text-[10px] text-slate-300">Overall HVAC electricity spend</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-400/30">
                <div className="text-2xl font-mono font-black text-amber-300">5 months</div>
                <div className="text-[10px] text-slate-300">Net ROI break-even</div>
              </div>
            </div>
            <div className="w-full max-w-[310px] mt-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 text-center">
              <span>🏢 <strong>2.4M</strong> assets supervised continuously</span>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="w-full max-w-[315px] bg-slate-900/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-3 shadow-2xl relative overflow-hidden text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Hourglass className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider text-cyan-300 uppercase font-mono">
                  Official Cluster Launch
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold">
                D-0{countdown.days}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center mb-2.5">
              <div className="bg-black/50 border border-white/10 rounded-lg py-1 px-0.5">
                <span className="block text-sm font-bold text-white font-mono leading-none">
                  {countdown.days.toString().padStart(2, "0")}
                </span>
                <span className="text-[8px] text-slate-400 uppercase">Days</span>
              </div>
              <div className="bg-black/50 border border-white/10 rounded-lg py-1 px-0.5">
                <span className="block text-sm font-bold text-white font-mono leading-none">
                  {countdown.hours.toString().padStart(2, "0")}
                </span>
                <span className="text-[8px] text-slate-400 uppercase">Hours</span>
              </div>
              <div className="bg-black/50 border border-white/10 rounded-lg py-1 px-0.5">
                <span className="block text-sm font-bold text-cyan-300 font-mono leading-none">
                  {countdown.mins.toString().padStart(2, "0")}
                </span>
                <span className="text-[8px] text-slate-400 uppercase">Mins</span>
              </div>
              <div className="bg-black/50 border border-white/10 rounded-lg py-1 px-0.5">
                <span className="block text-sm font-bold text-amber-400 font-mono leading-none">
                  {countdown.secs.toString().padStart(2, "0")}
                </span>
                <span className="text-[8px] text-slate-400 uppercase">Secs</span>
              </div>
            </div>
            <button
              onClick={toggleReminder}
              className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer ${
                isReminderActive
                  ? "bg-emerald-600 text-white"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white"
              }`}
            >
              {isReminderActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Reminder Set ✓</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify me on launch</span>
                </>
              )}
            </button>
          </div>
        );

      case 8:
        return (
          <div className="w-full max-w-[310px] bg-slate-900/90 backdrop-blur-xl border border-amber-400/40 rounded-2xl p-3.5 shadow-2xl text-left animate-in fade-in duration-300">
            <div className="flex items-center gap-1 text-amber-400 mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-[10px] font-bold text-white ml-1 font-mono">5.0 / 5</span>
            </div>
            <p className="text-xs text-slate-100 italic leading-relaxed mb-3">
              &ldquo;Thanks to Sensorium CAFM, our 64 H100 server racks run at 100% load with zero thermal throttling. An engineering feat.&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                MC
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Marc C.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Director of Cloud & AI Infrastructure</p>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300 w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold mb-3 backdrop-blur-md animate-soft-pulse">
              <Rocket className="w-3.5 h-3.5" />
              <span>INSTANT SANDBOX ACCESS</span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight mb-2">
              Take Action
            </h2>
            <p className="text-xs text-slate-300 max-w-[290px] mb-3">
              Connect your first cluster or explore simulated data in 3 clicks.
            </p>
            <div className="w-full max-w-[310px] space-y-2 mb-2">
              <button
                onClick={() => {
                  if (onActionClick) onActionClick("sandbox");
                  showToast("Opening 14-day Sandbox portal...");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95"
              >
                <Rocket className="w-4 h-4" />
                <span>Launch my Demo Sandbox (14 days)</span>
              </button>
              <button
                onClick={() => {
                  if (onActionClick) onActionClick("audit");
                  showToast("Thermal audit request submitted!");
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Request a free thermal audit</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercent = (currentSeconds / totalSeconds) * 100;

  return (
    <div className="flex flex-col items-center justify-start w-full py-2">
      
      {/* Simulation Control Header */}
      <header className="w-full max-w-[420px] mb-3 flex flex-col gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              IG
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">CAFM Social Media Studio</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Instagram / Facebook Story & Reels Mockup</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{activeMode === "story" ? "Story 10 Slides Active" : "Video Reels Mode"}</span>
          </div>
        </div>

        {/* Format Switcher Tabs + Standalone Preview Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex-1">
            <button
              onClick={() => setActiveMode("story")}
              className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 font-medium cursor-pointer ${
                activeMode === "story"
                  ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Story 10 Slides</span>
            </button>

            <button
              onClick={() => setActiveMode("reels")}
              className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 font-medium cursor-pointer ${
                activeMode === "reels"
                  ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Reels Mode</span>
            </button>
          </div>

          <a
            href="/story-reels.html"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
            title="Open mockup in full screen new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Full Screen</span>
          </a>
        </div>

        {/* Quick Slide Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar text-[11px]">
          {SLIDES_DATA.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToSlide(idx)}
              className={`px-2 py-1 rounded-lg text-xs font-mono transition shrink-0 cursor-pointer ${
                currentSlideIndex === idx
                  ? "text-white font-bold bg-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60"
              }`}
              title={s.category}
            >
              {idx + 1}. {s.category}
            </button>
          ))}
        </div>
      </header>

      {/* Main Smartphone Shell (Aspect ratio 9:16) */}
      <main 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-[380px] sm:w-[410px] h-[720px] max-h-[92vh] bg-slate-950 text-slate-100 rounded-[44px] border-[10px] border-slate-850 dark:border-slate-800 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col justify-between select-none"
      >
        
        {/* Dynamic Background Image & Particle Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          <img
            src={currentSlide.bg}
            alt={currentSlide.category}
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback to bundled image if external link is restricted
              (e.currentTarget as HTMLImageElement).src = currentSlideIndex % 2 === 0 ? brandVisionImg : adBillboardImg;
            }}
            className="w-full h-full object-cover animate-video-ambient transition-all duration-700 brightness-90"
          />
          {/* Scanline Tech Overlay */}
          <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent tech-scanline pointer-events-none" />
          
          {/* Floating Quantum Particles */}
          <div className="absolute top-1/3 left-10 w-2 h-2 rounded-full bg-cyan-400 blur-[1px] particle-1 pointer-events-none" />
          <div className="absolute top-1/2 right-12 w-2.5 h-2.5 rounded-full bg-amber-400 blur-[1px] particle-2 pointer-events-none" />
          <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-blue-300 blur-[0.5px] particle-1 pointer-events-none" />

          {/* Gradients for UI readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-transparent via-50% to-[#070d1e]/95 pointer-events-none" />
          <div className="absolute inset-0 bg-blue-950/20 mix-blend-color-dodge pointer-events-none" />
        </div>

        {/* Invisible Click Zones for Slide Navigation */}
        <div
          onClick={prevSlide}
          className="absolute inset-y-16 left-0 w-1/3 z-20 cursor-pointer"
          title="Previous slide (Left Arrow)"
        />
        <div
          onClick={nextSlide}
          className="absolute inset-y-16 right-0 w-2/3 z-20 cursor-pointer"
          title="Next slide (Right Arrow)"
        />

        {/* TOP SECTION : 10 Story Progress Segments & Navigation Header */}
        <div className="relative z-30 w-full p-3 pt-3 flex flex-col gap-2">
          
          {/* 10-Segment Progress Bar */}
          <div className="flex items-center gap-1 w-full" id="story-bar-segments">
            {SLIDES_DATA.map((_, i) => {
              let segClass = "h-full transition-all duration-300 ";
              if (i < currentSlideIndex) {
                segClass += "w-full bg-white";
              } else if (i === currentSlideIndex) {
                segClass += "w-full bg-cyan-400";
              } else {
                segClass += "w-0 bg-white";
              }

              return (
                <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                  <div className={segClass} />
                </div>
              );
            })}
          </div>

          {/* Header Row: Badge, Category Tag, Prev/Next Arrows & Audio Toggle */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider font-mono text-cyan-300">
                {currentSlide.badge}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-[10px] font-semibold text-white bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                {currentSlide.category}
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={prevSlide}
                className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={nextSlide}
                className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={toggleAudio}
                className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
                title={isMuted ? "Audio muted" : "Audio enabled"}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CENTER SECTION : Dynamic Slide Card Content */}
        <div className="relative z-30 flex flex-col items-center justify-center text-center my-auto px-3 pointer-events-auto w-full transition-all duration-300">
          {renderSlideContent()}
        </div>

        {/* RIGHT ASIDE : Social Interaction Bar (Like, Comment, Share, Save, Vinyl) */}
        <aside className="absolute right-2.5 sm:right-3 bottom-32 z-40 flex flex-col items-center gap-3 pointer-events-auto">
          {/* Heart / Like Button */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center group active:scale-125 transition-transform cursor-pointer"
            title="Like"
          >
            <div className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition ${
              isLiked
                ? "bg-rose-500/20 border-rose-500/50 text-rose-500"
                : "bg-black/40 border-white/20 text-white group-hover:text-rose-500"
            }`}>
              <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
            </div>
            <span className="text-[11px] font-semibold text-white mt-1">
              {(likeCount / 1000).toFixed(1)}k
            </span>
          </button>

          {/* Comments Button */}
          <button
            onClick={() => showToast("Comments open: 240 expert reviews")}
            className="flex flex-col items-center group active:scale-110 transition-transform cursor-pointer"
            title="Comments"
          >
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:text-cyan-400 transition">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-white mt-1">240</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center group active:scale-110 transition-transform cursor-pointer"
            title="Share"
          >
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:text-emerald-400 transition">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-white mt-1">{shareCount}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className="flex flex-col items-center group active:scale-110 transition-transform cursor-pointer"
            title="Save"
          >
            <div className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition ${
              isBookmarked
                ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                : "bg-black/40 border-white/20 text-white group-hover:text-amber-400"
            }`}>
              <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
            </div>
            <span className="text-[11px] font-semibold text-white mt-1">Save</span>
          </button>

          {/* Spinning Vinyl Disc with Tech Beats */}
          <div
            className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-900 p-1 flex items-center justify-center relative overflow-hidden animate-spin-slow mt-1 shadow-lg"
            title="Stereo audio playing"
          >
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <div className="absolute inset-0 border border-white/20 rounded-full" />
          </div>
        </aside>

        {/* BOTTOM SECTION : Account, Caption, Primary CTA Button & Equalizer */}
        <div className="relative z-30 w-full pr-16 pl-3.5 pb-2.5 pointer-events-auto">
          
          {/* Profile Row */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-slate-900 border border-cyan-400 p-0.5 overflow-hidden flex items-center justify-center">
              <img
                src={LOGO_URL}
                alt="Sensorium CAFM Logo"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = brandVisionImg;
                }}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">sensorium_cafm</span>
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
            <button
              onClick={toggleFollow}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition cursor-pointer ${
                isFollowing
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                  : "text-white bg-white/20 hover:bg-white/30 border-white/30"
              }`}
            >
              {isFollowing ? "Following ✓" : "Follow"}
            </button>
          </div>

          {/* Caption with hashtags */}
          <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed mb-2">
            {currentSlide.caption}
          </p>

          {/* Slide CTA Button */}
          <button
            onClick={handlePrimaryAction}
            className="w-full mb-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold flex items-center justify-between shadow-lg shadow-blue-500/25 active:scale-[0.98] transition cursor-pointer"
          >
            <span>{currentSlide.cta}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Original Audio Equalizer Pill */}
          <div className="flex items-center gap-2 text-[10px] text-slate-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 w-fit max-w-full">
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-cyan-400 eq-1" />
              <span className="w-0.5 bg-cyan-400 eq-2" />
              <span className="w-0.5 bg-cyan-400 eq-3" />
            </div>
            <span className="truncate">Original Audio • Sensorium CAFM x Tech Beats</span>
          </div>

          {/* Footer Controls: Restart + Prev/Next Buttons */}
          <div className="w-full pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <button
              onClick={() => goToSlide(0)}
              className="hover:text-white transition flex items-center gap-1 text-[9px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Restart
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevSlide}
                className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-white hover:bg-slate-700 transition cursor-pointer"
              >
                ◀ Prev
              </button>
              <button
                onClick={nextSlide}
                className="px-2 py-0.5 rounded bg-blue-600 border border-blue-400 text-white font-bold hover:bg-blue-500 transition cursor-pointer"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Interactive Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 px-4 py-2 rounded-full bg-slate-900/95 border border-cyan-400/40 text-cyan-300 text-xs font-semibold shadow-2xl backdrop-blur-md z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
