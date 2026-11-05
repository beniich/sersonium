import React from 'react';

interface PageCloudProps {
  onOpenDemo: () => void;
}

export const PageCloud: React.FC<PageCloudProps> = ({ onOpenDemo }) => {
  return (
    <div className="bg-[#f8fafc] font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                CLOUD & INFRASTRUCTURE
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Une infrastructure cloud{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">puissante et souveraine</span>
              </h1>
              <p className="text-base text-slate-600 leading-relaxed">
                Bénéficiez d'une infrastructure cloud de dernière génération, sécurisée, scalable et haute performance, pour une disponibilité maximale de vos services.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={onOpenDemo} className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 hover:brightness-105 transition-all">
                  Découvrir notre cloud →
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
                  ▷ Voir la vidéo
                </button>
              </div>
            </div>

            {/* Right: Cloud Visual */}
            <div className="lg:col-span-7">
              <div className="relative bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800">
                {/* Central Cloud Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-2xl shadow-orange-500/50">
                      <span className="text-5xl font-black text-white">S</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                </div>

                {/* 4 corner feature cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '☁️', label: 'Cloud Hybride', sub: 'Multi-Cloud' },
                    { icon: '⚡', label: 'Haute', sub: 'Performance' },
                    { icon: '🛡️', label: 'Sécurité', sub: 'Avancée' },
                    { icon: '📈', label: 'Scalabilité', sub: 'Illimitée' },
                  ].map((f) => (
                    <div key={f.label} className="bg-slate-800 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50">
                      <span className="text-2xl">{f.icon}</span>
                      <div>
                        <div className="text-white font-bold text-xs">{f.label}</div>
                        <div className="text-slate-400 text-[11px]">{f.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Cloud Features */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              { icon: '☁️', title: 'Cloud Hybride & Multi-Cloud', desc: 'Flexibilité totale (AWS, Azure, Google Cloud)' },
              { icon: '🖥️', title: 'Gestion des Serveurs', desc: 'Administration simplifiée et automatisée' },
              { icon: '📦', title: 'Virtualisation & Ressources', desc: 'Allocation intelligente des ressources' },
              { icon: '🛡️', title: 'Haute Disponibilité', desc: '99,99% de disponibilité garantie' },
              { icon: '🔒', title: 'Sécurité Réseau', desc: 'Protection avancée DDoS et pare-feu nouvelle génération' },
              { icon: '📈', title: 'Scalabilité', desc: 'Adaptez vos ressources en temps réel' },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-bold text-slate-900 text-xs text-center">{f.title}</h3>
                <p className="text-[11px] text-slate-500 text-center leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left */}
            <div className="lg:col-span-4 space-y-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 block">● NOTRE ARCHITECTURE CLOUD</span>
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Une architecture moderne et résiliente</h2>
              <p className="text-sm text-slate-600 leading-relaxed">Une infrastructure conçue pour la performance, la sécurité et la continuité de service, avec une réplication multi-zones et une supervision 24/7.</p>
              <ul className="space-y-2 text-sm text-slate-700">
                {['Datacenters redondants', 'Backup automatique', 'Réplication géographique', 'Supervision en temps réel'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={onOpenDemo} className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 border border-slate-300 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                En savoir plus →
              </button>
            </div>

            {/* Center: Architecture Diagram */}
            <div className="lg:col-span-4 relative flex flex-col items-center gap-4 py-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 px-6 py-3 text-center shadow-sm">
                <span className="text-xs font-bold text-slate-800">Utilisateurs & Applications</span>
              </div>
              <div className="w-0.5 h-6 bg-orange-400" />
              <div className="bg-gradient-to-tr from-orange-500 to-amber-400 rounded-2xl w-16 h-16 flex items-center justify-center shadow-xl shadow-orange-500/40">
                <span className="text-white font-black text-2xl">S</span>
              </div>
              <div className="w-0.5 h-6 bg-orange-400" />
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 text-center shadow-sm text-xs text-slate-700 font-semibold">Datacenters Sécurisés</div>
                <div className="bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 text-center shadow-sm text-xs text-slate-700 font-semibold">Services Cloud AWS / Azure / GCP</div>
              </div>
            </div>

            {/* Right: Performance */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-800">Performance & Fiabilité</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">En temps réel</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: '99.99%', label: 'Disponibilité' },
                    { val: '< 60 ms', label: 'Latence' },
                    { val: '10 Tbps', label: 'Bande passante' },
                    { val: '24/7', label: 'Supervision' },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-sm font-black text-slate-900">{m.val}</div>
                      <div className="text-[10px] text-slate-500">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Partners + CTA */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Partners */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">PARTENAIRES CLOUD DE CONFIANCE</p>
              <div className="flex flex-wrap items-center gap-6 opacity-60">
                {['Microsoft Azure', 'AWS', 'Google Cloud', 'ORACLE Cloud', 'cPanel'].map((p) => (
                  <span key={p} className="text-xs font-bold text-slate-600 uppercase tracking-wider">{p}</span>
                ))}
              </div>
            </div>
            {/* CTA Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">🛡️</div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Votre infrastructure, notre expertise</h3>
                  <p className="text-xs text-slate-500">Une solution cloud fiable, sécurisée et performante.</p>
                </div>
              </div>
              <button onClick={onOpenDemo} className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition hover:brightness-105">
                Demander une démo →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PageCloud;

