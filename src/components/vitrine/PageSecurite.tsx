import React from 'react';

interface PageSecuriteProps {
  onOpenDemo: () => void;
  onEnterDashboard: () => void;
}

export const PageSecurite: React.FC<PageSecuriteProps> = ({ onOpenDemo, onEnterDashboard }) => {
  return (
    <div className="bg-[#f8fafc] font-['Inter',sans-serif]">

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-[#f8fafc]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 font-semibold text-xs tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                SÉCURITÉ & IDENTITÉ
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                Une sécurité de niveau entreprise, une{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">confiance totale</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                SENSORIUM CAFM PRO protège vos infrastructures, vos données et vos utilisateurs grâce à une sécurité avancée et une gestion des identités de pointe.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button onClick={onOpenDemo} className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02]">
                  <span>Découvrir la sécurité</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
                <button onClick={onEnterDashboard} className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-700 font-semibold text-sm transition-all hover:border-slate-300">
                  <svg className="w-4 h-4 fill-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Voir la démo</span>
                </button>
              </div>
            </div>

            {/* Right: Shield Visual */}
            <div className="lg:col-span-6 relative flex justify-center items-center py-6 min-h-[460px]">
              {/* Orbit Rings */}
              <div className="absolute w-[360px] h-[360px] rounded-full border border-orange-500/20 animate-spin" style={{ animationDuration: '24s' }} />
              <div className="absolute w-[300px] h-[300px] rounded-full border border-dashed border-orange-400/40 pointer-events-none" />

              {/* Central Image Area */}
              <div className="relative z-20 w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-orange-500/30 p-8 flex flex-col items-center gap-6">
                <div className="text-7xl animate-pulse">🔐</div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg">RBAC Dynamic Matrix</div>
                  <div className="text-slate-400 text-sm mt-1">3D Geometric Identity Matrix</div>
                </div>
                {/* Role badges */}
                <div className="grid grid-cols-2 gap-2 w-full text-xs">
                  {['Super Admin', 'Tenant Admin', 'Facility Manager', 'Sovereign SSO'].map((role) => (
                    <div key={role} className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white font-mono text-center">{role}</div>
                  ))}
                </div>
              </div>

              {/* Floating Cards */}
              {[
                { label: 'RBAC', desc: 'Contrôle d\'accès granulaire', icon: '👥', pos: 'absolute -top-3 left-4' },
                { label: 'MFA', desc: 'Double Facteur', icon: '🛡️', pos: 'absolute -top-3 right-4' },
                { label: 'SSO', desc: 'Authentification Unifiée', icon: '👆', pos: 'absolute bottom-2 left-4' },
                { label: 'mTLS', desc: 'Communication Sécurisée', icon: '🔑', pos: 'absolute bottom-2 right-4' },
              ].map((card) => (
                <div key={card.label} className={`${card.pos} z-20 bg-white/85 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-white/80 flex items-center gap-3.5 w-48 hover:-translate-y-1 transition-transform`}>
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{card.label}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/70" id="atouts">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Bullet Points */}
            <div className="lg:col-span-4 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-orange-600 uppercase bg-orange-100/70 px-3 py-1 rounded-full">
                ✨ NOS ATOUTS
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">Une gestion d'identité intelligente et sécurisée</h2>
              <p className="text-slate-600 text-sm leading-relaxed">Contrôlez qui accède à quoi, quand et comment, tout en garantissant une expérience fluide pour vos équipes.</p>
              <ul className="space-y-3.5 pt-2">
                {[
                  'Contrôle d\'accès basé sur les rôles (RBAC)',
                  'Authentification unique (SSO)',
                  'Authentification multifacteur (MFA)',
                  'Chiffrement de bout en bout',
                  'Audit et traçabilité complète',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={onOpenDemo} className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-orange-600 transition-colors border border-slate-300 hover:border-orange-500 px-5 py-2.5 rounded-full">
                <span>En savoir plus</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>

            {/* Center: Access Management Table */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">🛡️</div>
                    <h3 className="font-bold text-slate-900 text-base">Gestion des accès</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs px-2.5 py-1 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Système sécurisé
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/75 text-slate-500 font-semibold border-y border-slate-100 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Utilisateur</th>
                        <th className="py-2.5 px-3">Rôle</th>
                        <th className="py-2.5 px-3">Statut</th>
                        <th className="py-2.5 px-3">Dernière connexion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {[
                        { initials: 'SA', name: 'SuperAdmin', role: 'SuperAdmin', roleColor: 'bg-orange-100 text-orange-700 border-orange-200', time: "Aujourd'hui, 14:32" },
                        { initials: 'TA', name: 'Tenant Admin', role: 'Tenant Admin', roleColor: 'bg-blue-50 text-blue-700 border-blue-200', time: "Aujourd'hui, 12:18" },
                        { initials: 'FM', name: 'Facility Manager', role: 'Facility Manager', roleColor: 'bg-purple-50 text-purple-700 border-purple-200', time: 'Hier, 18:45' },
                      ].map((u) => (
                        <tr key={u.name} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-medium">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">{u.initials}</div>
                              <span className="font-semibold text-slate-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`${u.roleColor} border text-[11px] px-2 py-0.5 rounded-md font-semibold`}>{u.role}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Actif
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">{u.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Feature Cards */}
            <div className="lg:col-span-3 space-y-4">
              {[
                { icon: '🛡️', title: 'Protection avancée', desc: 'Défense contre les menaces (DDoS, malware, intrusions).' },
                { icon: '📋', title: 'Traçabilité totale', desc: 'Journalisation et audit en temps réel.' },
                { icon: '⚡', title: 'Conformité réglementaire', desc: 'DORA, ISO 27001, RGPD.' },
                { icon: '☁️', title: 'Infrastructure sécurisée', desc: 'Hébergement cloud hautement sécurisé.' },
              ].map((f) => (
                <div key={f.title} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-3.5 hover:border-orange-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0 text-xl">{f.icon}</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{f.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certification Banner */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-slate-50 via-white to-orange-50/40 border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4 max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-300 text-orange-600 flex items-center justify-center shrink-0 text-3xl">🛡️</div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">Votre sécurité, notre priorité</h3>
                <p className="text-xs text-slate-500 mt-1">Une plateforme conçue pour répondre aux exigences des environnements critiques.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { label: 'ISO 27001', sub: 'CERTIFIED', color: 'bg-slate-100 border-slate-300 text-slate-700' },
                { label: 'RGPD', sub: 'COMPLIANT', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { label: 'DORA', sub: 'COMPLIANT', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center text-center">
                  <div className={`w-11 h-11 rounded-full ${badge.color} border flex items-center justify-center font-bold mb-1`}>✓</div>
                  <span className="text-xs font-black text-slate-900 uppercase">{badge.label}</span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">{badge.sub}</span>
                </div>
              ))}
            </div>
            <button onClick={onOpenDemo} className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm px-6 py-3.5 rounded-full shadow-lg shadow-orange-500/25 transition-transform hover:-translate-y-0.5 shrink-0">
              <span>Demander une démonstration</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PageSecurite;

