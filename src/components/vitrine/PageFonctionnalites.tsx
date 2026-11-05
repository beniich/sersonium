import React from 'react';

interface PageFonctionnalitesProps {
  onOpenDemo: () => void;
  onEnterDashboard: () => void;
}

export const PageFonctionnalites: React.FC<PageFonctionnalitesProps> = ({ onOpenDemo, onEnterDashboard }) => {
  return (
    <div className="bg-[#f8fafc] font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Fonctionnalités Détaillées
          </div>
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Une plateforme complète,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-orange-600 to-amber-600">des fonctionnalités puissantes</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            SENSORIUM CAFM PRO vous offre un écosystème intégré pour gérer, superviser et sécuriser vos infrastructures avec une précision inégalée et une simplicité d'utilisation exceptionnelle.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={onOpenDemo} className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm px-6 py-3 rounded-full shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02]">
              <span>Découvrir toutes les fonctionnalités</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
            <button onClick={onEnterDashboard} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-300 px-6 py-3 rounded-full hover:bg-slate-100 transition">
              ▷ Voir la démo
            </button>
          </div>
        </div>

        {/* Right: Live Console Mockup */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
            {/* Console Header */}
            <div className="bg-slate-900 px-5 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-slate-400 text-xs font-mono ml-2">SENSORIUM CAFM - Live Console</span>
              <div className="ml-auto flex items-center gap-1 bg-slate-800 rounded-lg px-3 py-1">
                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span className="text-slate-400 text-xs">Rechercher...</span>
              </div>
            </div>
            {/* Metrics Row */}
            <div className="bg-slate-50 px-5 py-3 grid grid-cols-4 gap-4 border-b border-slate-200">
              {[
                { label: 'Actifs Totaux', val: '12,580', trend: '+12%', color: 'text-emerald-600' },
                { label: 'Interventions', val: '248', trend: '+48%', color: 'text-orange-600' },
                { label: 'Disponibilité', val: '99,98%', trend: '+0.1%', color: 'text-emerald-600' },
                { label: 'Alertes', val: '12', trend: '-25%', color: 'text-emerald-600' },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <div className="text-xs text-slate-500">{m.label}</div>
                  <div className="text-sm font-black text-slate-900">{m.val}</div>
                  <div className={`text-[10px] font-bold ${m.color}`}>{m.trend}</div>
                </div>
              ))}
            </div>
            {/* Chart Area */}
            <div className="p-5 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800">Performance des infrastructures</span>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Actuelle</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Prédictive</span>
                </div>
              </div>
              {/* Fake chart SVG */}
              <svg viewBox="0 0 400 100" className="w-full h-20">
                <path d="M0,70 Q50,30 100,50 T200,40 T300,55 T400,30" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,70 Q50,30 100,50 T200,40 T300,55 T400,30 L400,100 L0,100 Z" fill="rgba(249,115,22,0.07)" />
                <path d="M0,80 Q100,65 200,70 T400,60" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />
              </svg>
              <div className="mt-3 flex items-center justify-between">
                <div className="bg-slate-900 rounded-lg px-3 py-2 text-[10px] font-mono text-orange-400">CA404 (HQ) LIVE</div>
                <span className="text-[10px] text-slate-400">Supervision en temps réel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Feature Modules Grid */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Center Logo Badge */}
            <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none z-10">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex flex-col items-center justify-center shadow-2xl shadow-orange-500/40 text-white text-center">
                <span className="text-2xl font-black leading-none">S</span>
                <span className="text-[9px] font-bold tracking-widest">SENSORIUM</span>
                <span className="text-[8px] text-orange-200 mt-0.5">CAFM PRO</span>
              </div>
            </div>

            {[
              { icon: '🏢', title: 'Gestion Intelligente des Actifs', feats: ['Suivi en temps réel de tous vos actifs', 'Maintenance préventive et prédictive', "Optimisation du cycle de vie"], badge: '+98% Disponible', color: 'border-orange-200' },
              { icon: '🛡️', title: 'Conformité & Audit', feats: ['Conformes DORA, ISO 27001', 'Audit et reporting détaillé', 'Preuves et traçabilité'], badge: 'AUDIT OK Certifié', color: 'border-blue-200' },
              { icon: '🔐', title: 'Sécurité & Contrôle d\'Accès', feats: ['RBAC et SSO avancé', 'Authentification multifacteur (MFA)', 'Traçabilité complète'], badge: 'RBAC MTLS', color: 'border-purple-200' },
              { icon: '📈', title: 'Analytics & Reporting', feats: ['Tableaux de bord avancés', 'Rapports personnalisés', "IA pour l'aide à la décision"], badge: 'Smart BI', color: 'border-emerald-200' },
              { icon: '☁️', title: 'Cloud & Infrastructure', feats: ['Cloud hybride et multi-cloud', 'Haute disponibilité (99,99%)', 'Scalabilité à la demande'], badge: 'DO CLUSTER', color: 'border-sky-200' },
              { icon: '🔗', title: 'Intégrations & Écosystème', feats: ['API REST complète', 'Intégration tierces (Microsoft, Google)', 'Connecteurs sur mesure'], badge: '</API>', color: 'border-amber-200' },
            ].map((m) => (
              <div key={m.title} className={`bg-white rounded-2xl border ${m.color} border-2 p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl">{m.icon}</div>
                  <span className="text-[10px] font-mono bg-slate-900 text-white px-2 py-1 rounded-lg">{m.badge}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{m.title}</h3>
                <ul className="space-y-1">
                  {m.feats.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="text-orange-500 text-xs">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-10 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
            {[
              { icon: '⚡', val: '+70%', label: "d'efficacité opérationnelle" },
              { icon: '⏱️', val: '-50%', label: 'de temps de gestion' },
              { icon: '🛡️', val: '99,99%', label: 'de disponibilité' },
              { icon: '🌱', val: '-40%', label: "d'empreinte énergétique" },
              { icon: '🔒', val: '100%', label: 'sécurité des données' },
            ].map((s) => (
              <div key={s.label} className="p-4">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black text-slate-900">{s.val}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-black text-white">Passez à une gestion intelligente et sécurisée de vos infrastructures</h2>
            <p className="text-slate-400 text-sm mt-2">Découvrez dès maintenant la puissance de SENSORIUM CAFM PRO.</p>
          </div>
          <button onClick={onOpenDemo} className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition duration-200">
            Demander une démo →
          </button>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {['Microsoft Azure', 'AWS', 'Google Cloud', 'DORA', 'ISO 27001 CERTIFIED', 'RGPD COMPLIANT'].map((p) => (
              <span key={p} className="text-xs font-bold text-slate-500 uppercase tracking-wider">{p}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PageFonctionnalites;

