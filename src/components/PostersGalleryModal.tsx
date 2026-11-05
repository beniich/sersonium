import React, { useState, useMemo } from 'react';
import { 
  SENSORIUM_POSTERS, 
  BannerPoster 
} from '../data/postersData';
import { 
  Search, 
  Filter, 
  Sparkles, 
  ArrowRight, 
  Download, 
  Layers, 
  ShieldCheck, 
  Zap, 
  SlidersHorizontal,
  X,
  Maximize2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface PostersGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterDashboard?: () => void;
  onLaunchCockpit?: () => void;
}

export const PostersGalleryModal: React.FC<PostersGalleryModalProps> = ({
  isOpen,
  onClose,
  onEnterDashboard,
  onLaunchCockpit
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePoster, setActivePoster] = useState<BannerPoster | null>(null);

  const categories = [
    { id: 'all', label: `Toutes les affiches (${SENSORIUM_POSTERS.length})` },
    { id: 'supervision', label: 'Supervision & IoT' },
    { id: 'security', label: 'Sécurité & Zero-Trust' },
    { id: 'compliance', label: 'Conformité & DORA' },
    { id: 'energy', label: 'Énergie & Carbone' },
    { id: 'twin', label: 'Jumeaux 3D & BIM' },
    { id: 'robotics', label: 'Robotique Autonome' }
  ];

  const filteredPosters = useMemo(() => {
    return SENSORIUM_POSTERS.filter(poster => {
      const matchesCategory = selectedCategory === 'all' || poster.category === selectedCategory;
      const matchesSearch = 
        poster.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poster.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poster.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poster.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-7xl max-h-[92vh] bg-white dark:bg-[#0c0c12] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden flex flex-col text-slate-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#ea580c] dark:text-orange-400">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-['Manrope'] font-bold text-lg text-slate-900 dark:text-white">
                  Galerie Officielle des Bannières &amp; Affiches Haute Résolution
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                  28 VISUELS 16:9
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Explorez l'ensemble des écrans haute définition du système SENSORIUM CAFM PRO
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-500 dark:text-neutral-300 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#0c0c12] flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Categories pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#ea580c] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-600 dark:text-neutral-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une affiche, mot-clé..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-[#07070a]">
          {filteredPosters.map((poster) => (
            <div
              key={poster.id}
              className="group rounded-2xl bg-white dark:bg-[#0e0e16] border border-slate-200/90 dark:border-white/[0.07] shadow-2xs hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-500/40 transition-all overflow-hidden flex flex-col text-left cursor-pointer"
              onClick={() => setActivePoster(poster)}
            >
              {/* Image Frame with Aspect 16:9 */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={poster.image}
                  alt={poster.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
                  loading="lazy"
                />
                
                {/* Overlay Badge */}
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/75 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                  <span>Affiche #{poster.id}</span>
                </div>

                <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-lg">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              {/* Text Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {poster.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h4 className="font-['Manrope'] font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#ea580c] dark:group-hover:text-orange-400 transition-colors leading-snug">
                    {poster.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {poster.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-[#ea580c] dark:text-orange-400 font-semibold">
                  <span>Agrandir en haute résolution</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#0c0c12] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-neutral-400">
          <div>
            Affichage de <b className="text-slate-800 dark:text-neutral-200">{filteredPosters.length}</b> sur 28 affiches officielles SENSORIUM CAFM PRO
          </div>
          <div className="flex items-center gap-3">
            {onLaunchCockpit && (
              <button
                onClick={() => { onClose(); onLaunchCockpit(); }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-800 dark:text-neutral-200 font-semibold cursor-pointer"
              >
                Tester le Cockpit 3D
              </button>
            )}
            {onEnterDashboard && (
              <button
                onClick={() => { onClose(); onEnterDashboard(); }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#d97706] text-white font-semibold cursor-pointer shadow-xs hover:shadow-md"
              >
                Accéder à la console
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Active Poster */}
      {activePoster && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setActivePoster(null)}
        >
          <div 
            className="w-full max-w-6xl max-h-[95vh] bg-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-slate-900/60">
              <div className="text-left">
                <div className="text-[11px] font-mono text-orange-400 uppercase tracking-wider">
                  Affiche Officielle #{activePoster.id} · 16:9 Ultra HD
                </div>
                <h3 className="font-['Manrope'] font-bold text-base text-white">
                  {activePoster.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={activePoster.image}
                  download={`sensorium-affiche-${activePoster.id}.png`}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </a>
                <button
                  onClick={() => setActivePoster(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Big High-Res Image Display */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              <img
                src={activePoster.image}
                alt={activePoster.title}
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-white/5"
              />
            </div>

            {/* Bottom Details Panel */}
            <div className="p-6 bg-slate-900/80 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
              <div className="space-y-1 max-w-2xl">
                <div className="text-xs font-medium text-orange-300 font-mono">
                  {activePoster.subtitle}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activePoster.description}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  {activePoster.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const prevId = activePoster.id > 1 ? activePoster.id - 1 : 28;
                    const prevPoster = SENSORIUM_POSTERS.find(p => p.id === prevId);
                    if (prevPoster) setActivePoster(prevPoster);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
                >
                  ← Précédente
                </button>
                <button
                  onClick={() => {
                    const nextId = activePoster.id < 28 ? activePoster.id + 1 : 1;
                    const nextPoster = SENSORIUM_POSTERS.find(p => p.id === nextId);
                    if (nextPoster) setActivePoster(nextPoster);
                  }}
                  className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold cursor-pointer shadow-md"
                >
                  Suivante →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
