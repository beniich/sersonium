import React from 'react';

interface PageConformiteProps {
  onOpenDemo: () => void;
}

export const PageConformite: React.FC<PageConformiteProps> = ({ onOpenDemo }) => {
  return (
    <div className="bg-[#f8fafc] font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-slate-50">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                CONFORMITÉ & AUDIT
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 leading-[1.12] tracking-tight">
                Assurez votre conformité, gagnez en{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">confiance</span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                SENSORIUM CAFM PRO vous aide à respecter les normes les plus exigeantes et à prouver votre conformité en toute transparence grâce à une traçabilité complète.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button onClick={onOpenDemo} className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 hover:brightness-105 transition-all">
                  <span>Découvrir la conformité</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>

            {/* Right: DORA Shield Visual */}
            <div className="lg:col-span-7">
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                {/* Shield center */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-28 h-28 rounded-full bg-orange-500/20 border-4 border-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-pulse">
                    <span className="text-5xl">🛡️</span>
                  </div>
                  <div className="text-white font-black text-xl">DORA Art. 24 Compliance</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Risk Management', 'Incident Reporting', 'Testing & Resilience', 'Third-Party Management'].map((item) => (
                      <div key={item} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono">
                        <span className="text-emerald-400">✓</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Corner badges */}
                <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur-md rounded-xl px-3 py-2 text-xs text-orange-400 font-mono border border-orange-500/30">
                  Immutable Audit Trail
                </div>
                <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-md rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono border border-emerald-500/30">
                  audit.service.ts
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Pillars */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2 block">● NOS ATOUTS</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Une conformité maîtrisée à chaque étape</h2>
              <p className="text-slate-500 text-sm mt-1 max-w-xl">SENSORIUM CAFM PRO centralise vos preuves de conformité, simplifie vos audits et réduit vos risques réglementaires.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: '⚖️', title: 'DORA Compliance', desc: "Conformité aux exigences financières européennes" },
              { icon: '🛡️', title: 'ISO 27001', desc: "Management de la sécurité de l'information" },
              { icon: '🔒', title: 'RGPD', desc: "Protection et maîtrise de vos données" },
              { icon: '📄', title: 'Audit & Reporting', desc: "Traçabilité complète et rapports détaillés" },
              { icon: '📊', title: 'Conformité sectorielle', desc: "Adapté aux secteurs critiques et industriels" },
            ].map((p) => (
              <div key={p.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-orange-400/40 hover:bg-orange-50/20 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                    {p.icon}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-4 pt-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-500 text-white text-xs shadow-sm">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit Control Section */}
      <section className="py-16 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Card: 100% Traçabilité */}
            <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-700/50">
              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-orange-500/20 blur-2xl" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 text-3xl shadow-lg shadow-orange-500/30">✓</div>
                <div>
                  <div className="text-3xl font-black text-white">100%</div>
                  <div className="text-lg font-bold text-orange-400">Traçabilité</div>
                </div>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">Des actions aux preuves, en toute transparence continue et immuable.</p>
              <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300">🛡️ DORA Art. 24</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300">🔒 Horodatage certifié</span>
              </div>
            </div>

            {/* Center: Text */}
            <div className="lg:col-span-4 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-orange-600">● CONTRÔLE & AUDIT</div>
              <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">Préparez vos audits en toute sérénité</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Générez des rapports détaillés, suivez vos contrôles et démontrez votre conformité en quelques clics, avec des preuves fiables et infalsifiables.</p>
              <ul className="space-y-2 text-xs text-slate-700 pt-1 font-medium">
                {['Rapports automatisés et personnalisables', 'Journalisation complète des événements', 'Conservation sécurisée des données'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Mockup */}
            <div className="lg:col-span-4 bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-slate-200/90 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-800">Rapport de conformité</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Conforme</span>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="98, 100" strokeLinecap="round" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-slate-800">98%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-[11px]">
                {['Contrôles réalisés', 'Anomalies détectées', 'Actions correctives'].map((c) => (
                  <div key={c} className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <span className="text-emerald-500 font-bold">✓</span> {c}
                  </div>
                ))}
              </div>
              {/* Mini bar chart */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between h-14 px-2">
                {[4, 6, 8, 10, 12, 14].map((h, i) => (
                  <div key={i} style={{ height: `${h * 4}px` }} className="w-3 bg-orange-500 rounded-t opacity-70 hover:opacity-100 transition-opacity" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Infrastructure */}
      <section className="py-14 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-orange-500">● CLOUD & INFRASTRUCTURE</div>
              <h2 className="text-2xl font-extrabold leading-tight text-white">Une infrastructure cloud sécurisée et résiliente</h2>
              <p className="text-xs text-slate-400 leading-relaxed">Profitez d'une architecture cloud de dernière génération, garantissant performance, disponibilité et sécurité.</p>
              <button onClick={onOpenDemo} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors">
                Découvrir notre cloud →
              </button>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { icon: '☁️', label: 'Cloud Hybride & Multi-Cloud' },
                { icon: '⚡', label: 'Haute Disponibilité 99,99%' },
                { icon: '🛡️', label: 'Sécurité Avancée' },
                { icon: '📈', label: 'Performance Optimisée' },
              ].map((f) => (
                <div key={f.label} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center">
                  <span className="text-2xl mb-2">{f.icon}</span>
                  <span className="text-[11px] font-bold">{f.label}</span>
                </div>
              ))}
            </div>
            <div className="lg:col-span-3 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
              <h4 className="text-sm font-bold text-white mb-1">Votre partenaire pour un cloud de confiance</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-4">Une infrastructure flexible, sécurisée et évolutive pour soutenir votre croissance.</p>
              <button onClick={onOpenDemo} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md transition-colors w-full justify-center">
                En savoir plus →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PageConformite;

