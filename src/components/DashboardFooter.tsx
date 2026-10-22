import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  ArrowUp, 
  ShieldCheck, 
  Radio, 
  Layers, 
  Cpu, 
  Sparkles 
} from "lucide-react";
import { useLanguage } from "../App";

export interface DashboardFooterProps {
  className?: string;
  onNavigate?: (page: string) => void;
}

export default function DashboardFooter({ className = "", onNavigate }: DashboardFooterProps) {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Horloge temps réel synchronisée
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentYear = currentDate.getFullYear();

  // Formatage de la date en fonction de la langue sélectionnée
  const locale = language === "fr" ? "fr-FR" : "en-US";
  const formattedFullDate = currentDate.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Heure au format HH:mm:ss
  const formattedTime = currentDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const scrollToTop = () => {
    // Fait défiler le conteneur principal <main> ou la fenêtre vers le haut
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      className={`w-full shrink-0 mt-auto border-t border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#070709]/90 backdrop-blur-xl transition-colors duration-200 z-10 ${className}`}
      role="contentinfo"
      aria-label="Pied de page de l'application"
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        
        {/* Ligne principale : Logo + Nom + Date & Heure + Année + Bouton retour haut */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 pb-4 border-b border-slate-200/60 dark:border-white/[0.06]">
          
          {/* Bloc Marque : Logo & Nom de l'application */}
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="relative group cursor-pointer" onClick={scrollToTop}>
              {/* Effet halo glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl blur-xs opacity-40 group-hover:opacity-75 transition duration-300" />
              
              {/* Conteneur Logo avec image SVG officielle Sensorium */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 dark:from-[#0E0E12] dark:to-black border border-white/20 p-1 flex items-center justify-center shadow-md">
                <img 
                  src="/favicon.svg" 
                  alt="Logo SENSORIUM" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback vers le badge stylisé si l'image SVG n'est pas dispo
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                  SENSORIUM
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/25">
                  Cockpit Sovereign
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400 font-medium">
                Plateforme d'Hypervision Spatiale &amp; Télémétrie Autonome
              </p>
            </div>
          </div>

          {/* Bloc Date & Heure en direct (Synchronisation temps réel) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* Date Complète */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-700 dark:text-neutral-300 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="capitalize font-medium">{formattedFullDate}</span>
            </div>

            {/* Heure Temps Réel avec indicateur live */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-700 dark:text-neutral-300 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-mono font-semibold tracking-wider">{formattedTime}</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            {/* Année Capsule Dédiée */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold shadow-2xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Année {currentYear}</span>
            </div>
          </div>

          {/* Bouton Scroll vers le haut */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-neutral-300 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] transition-all cursor-pointer shadow-2xs group"
            title="Remonter en haut de la page"
          >
            <span>Haut de page</span>
            <ArrowUp className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Ligne inférieure : Copyright + Année + Certifications & Métriques */}
        <div className="pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-500 dark:text-neutral-400 font-sans">
          <div className="flex items-center gap-2">
            <span>
              &copy; {currentYear} <strong className="text-slate-800 dark:text-neutral-200">SENSORIUM Technologies</strong>. Tous droits r&eacute;serv&eacute;s.
            </span>
            <span className="hidden md:inline text-slate-300 dark:text-neutral-700">•</span>
            <span className="hidden md:inline font-mono text-[10px] text-slate-400 dark:text-neutral-500">
              Release v3.8-Enterprise (Build 2026.10)
            </span>
          </div>

          {/* Badges de résilience & conformité */}
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 text-slate-600 dark:text-neutral-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Zero-Trust HSM
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-neutral-300 font-medium">
              <Radio className="w-3.5 h-3.5 text-blue-500" />
              99.998% SLA
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              Cluster EU-North
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
