import React, { useState } from 'react';

interface PageEnergieProps {
  onOpenDemo: () => void;
}

export const PageEnergie: React.FC<PageEnergieProps> = ({ onOpenDemo }) => {
  const [surface, setSurface] = useState(25000);
  const [kwh, setKwh] = useState(160);
  const [enr, setEnr] = useState(35);

  const totalKwh = surface * kwh;
  const savedKwh = totalKwh * (0.18 + (enr / 100) * 0.25);
  const co2 = Math.round((savedKwh * 0.095) / 1000);
  const savings = Math.round((savedKwh * 0.19) / 1000);
  const compliance = Math.min(100, Math.round(55 + enr * 0.5));

  return (
    <div className="bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Hero Dark Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white pt-12 pb-24">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-br from-emerald-500/20 via-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-md">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-300 font-mono">Transition Énergétique & Conformité CSRD</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center max-w-4xl mx-auto space-y-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Pilotez votre efficacité énergétique et auditez vos émissions carbone en{' '}
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">temps réel</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
              SENSORIUM CAFM PRO déploie un jumeau numérique prédictif pour optimiser votre production solaire, monitorer vos consommations multi-fluides et automatiser vos audits CSRD Scope 1, 2 et 3 avec traçabilité auditable au niveau sous-compteur.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button onClick={onOpenDemo} className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg transition duration-200">
              <span>Demander une démo</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
            <button 
              onClick={onOpenDemo}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-md shadow-sm transition duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              <span>Simuler vos gains énergétiques</span>
            </button>
          </div>

          {/* Hero Visual */}
          <div className="mt-14 relative max-w-6xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900/80">
              <div className="relative w-full aspect-video overflow-hidden bg-slate-800 flex items-center justify-center">
                <div className="text-center space-y-2 opacity-50">
                  <div className="text-6xl">⚡</div>
                  <p className="text-slate-400 text-sm">Supervision Énergétique & CSRD Live</p>
                </div>
                {/* Telemetry HUD */}
                <div className="absolute top-5 left-5 hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950/80 backdrop-blur-xl shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div className="text-left font-mono">
                    <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">CSRD Stream Protocol</div>
                    <div className="text-xs font-semibold text-emerald-300">Live Telemetry: Active (Scope 1, 2, 3)</div>
                  </div>
                </div>
                {/* Carbon metric */}
                <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-4 p-4 rounded-xl bg-slate-950/85 backdrop-blur-xl shadow-lg">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">-38%</div>
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Empreinte carbone compensée</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Impact Badges */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '📉', label: '-38% Empreinte Carbone', sub: 'Audit CSRD conforme EFRAG', color: 'emerald' },
                { icon: '☀️', label: '99.8% Rendement Solaire', sub: 'Onduleurs PV & MPP Trackers', color: 'orange' },
                { icon: '🛡️', label: '100% Audité & Conforme', sub: 'Taxonomie UE & Décret Tertiaire', color: 'sky' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3.5 px-5 py-4 rounded-xl bg-slate-800/60 backdrop-blur-md shadow-sm">
                  <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/15 flex items-center justify-center`}>
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Ribbon */}
      <section className="w-full bg-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { val: '-38%', label: 'Émissions GES Globales', sub: 'Trajectoire SBTI validée', color: 'text-emerald-400' },
              { val: '+42%', label: 'Autoconsommation PV', sub: 'Gestion V2G et batteries BESS', color: 'text-orange-400' },
              { val: '100%', label: 'Conforme CSRD Art. 29', sub: 'Génération automatique des XBRL', color: 'text-amber-300' },
              { val: '< 24h', label: 'Audit Décret Tertiaire', sub: 'Export certifié direct plateforme OPERAT', color: 'text-sky-400' },
            ].map((m) => (
              <div key={m.label} className="p-4 rounded-xl bg-slate-800/50">
                <div className={`text-3xl lg:text-4xl font-black font-mono ${m.color}`}>{m.val}</div>
                <div className="text-xs uppercase font-bold tracking-wider text-slate-300 mt-1">{m.label}</div>
                <p className="text-[11px] text-slate-400 mt-1">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Pillars */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
              Architecture Décarbonation
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Les 6 piliers de la supervision énergétique opérationnelle</h2>
            <p className="text-sm sm:text-base text-slate-600">Une suite modulaire intégrée conçue pour les Facility Managers, Directeurs RSE et Exploitants d'infrastructures tertiaires ou industrielles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '☀️', title: 'Jumeau Numérique Solaire PV', desc: 'Suivi de la tension de chaîne (String Voltage Health à 680.4V), surveillance fine du rendement des onduleurs et prévision proactive de dégradation thermique.', badge: 'PV Telemetry 1.2 MW', stat: '99.8% Efficacité MPPT' },
              { icon: '📊', title: 'Audit Automatisé CSRD Scope 1-2-3', desc: "Traçabilité rigoureuse des facteurs d'émission, calcul en temps réel des bilans carbone et exportation instantanée conforme aux exigences de l'audit légal (CSRD ESRS E1).", badge: 'EFRAG Certified', stat: 'Rapports audités tiers certifiés' },
              { icon: '⚡', title: 'Microgrid & Recharge VE Intelligente (V2G)', desc: 'Pilotage dynamique de charge en flotte, écrêtage des pointes de puissance (Peak Shaving) et valorisation bidirectionnelle Vehicle-to-Grid avec batteries BESS.', badge: 'BESS 500 kWh', stat: '-35% Puissance souscrite' },
              { icon: '🤖', title: 'Détection des Dérives & Alertes IA', desc: "Algorithmes d'apprentissage automatique identifiant instantanément les dérives CVC, les fuites de fluides frigorigènes et les anomalies d'éclairage avant facturation.", badge: '⚠️ Dérive CVC Détectée', stat: 'Résolution prédictive 4.2x plus rapide' },
              { icon: '♻️', title: 'Gestion Éco-Circulaire & Déchets', desc: "Supervision connectée des compacteurs, valorisation matière et bilan certifié de l'économie circulaire avec traçabilité complète des bordereaux de suivi des déchets (BSD).", badge: '94.2% Recovery Rate', stat: 'Conforme CSRD ESRS E5' },
              { icon: '🏆', title: 'Certification BREEAM, LEED & Décret Tertiaire', desc: "Centralisation des preuves techniques pour l'obtention des labels environnementaux et transmission automatisée sans friction vers la plateforme OPERAT de l'ADEME.", badge: 'OPERAT READY', stat: 'Zéro risque de non-conformité' },
            ].map((p) => (
              <div key={p.title} className="group flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-32 w-full bg-slate-900 flex items-center justify-center">
                  <span className="text-5xl">{p.icon}</span>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono font-semibold">
                    {p.badge}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{p.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-xs font-semibold text-orange-600">
                    <span>{p.stat}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulator */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden" id="simulateur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase font-mono tracking-wider">
              Simulateur Dynamique d'Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Estimez votre potentiel de décarbonation & vos gains financiers</h2>
            <p className="text-sm text-slate-400">Ajustez les paramètres de votre parc immobilier pour prévisualiser instantanément la réduction d'émissions de CO2 et les économies annuelles.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Controls */}
            <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                <span className="text-sm font-bold text-white uppercase tracking-wider">⚙️ Paramètres du Parc</span>
                <span className="text-xs text-emerald-400 font-mono">Calcul en temps réel</span>
              </div>
              {[
                { id: 'surface', label: 'Surface totale du parc immobilier', val: surface, min: 2000, max: 150000, step: 1000, fmt: (v: number) => `${v.toLocaleString('fr-FR')} m²`, set: setSurface },
                { id: 'kwh', label: 'Consommation annuelle moyenne', val: kwh, min: 80, max: 350, step: 5, fmt: (v: number) => `${v} kWh/m²/an`, set: setKwh },
                { id: 'enr', label: "Taux d'intégration solaire / ENR ciblé", val: enr, min: 5, max: 90, step: 5, fmt: (v: number) => `${v} %`, set: setEnr },
              ].map((s) => (
                <div key={s.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <label className="text-slate-300">{s.label}</label>
                    <span className="text-white font-mono text-sm bg-slate-900 px-2 py-0.5 rounded">{s.fmt(s.val)}</span>
                  </div>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                    onChange={(e) => s.set(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              ))}
            </div>

            {/* Results */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl space-y-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Impact Prévisionnel Annuel</div>
              <div className="grid grid-cols-2 gap-5">
                <div className="p-5 rounded-xl bg-slate-900/90 shadow-sm flex flex-col justify-between space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">🌿</div>
                  <div>
                    <div className="text-xs text-slate-400">Réduction de CO2e</div>
                    <div className="text-3xl font-black text-white font-mono mt-1">{co2.toLocaleString('fr-FR')} t</div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">Évités chaque année</div>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-slate-900/90 shadow-sm flex flex-col justify-between space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-lg">€</div>
                  <div>
                    <div className="text-xs text-slate-400">Économies sur facture</div>
                    <div className="text-3xl font-black text-white font-mono mt-1">{savings.toLocaleString('fr-FR')} k€</div>
                    <div className="text-[11px] text-orange-400 font-semibold mt-0.5">ROI estimé en 14 mois</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Conformité Décret Tertiaire 2030 (-40%)</span>
                  <span className="text-emerald-400 font-mono">Sécurisée à {compliance}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${compliance}%` }} />
                </div>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <span className="text-xs text-slate-400">Rapport complet et audit d'éligibilité personnalisés gratuits.</span>
                <button onClick={onOpenDemo} className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition whitespace-nowrap">
                  Exporter mon bilan prédictif
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-slate-950 to-emerald-600/20 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono font-bold uppercase">⚡ Passez à l'action</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Accélérez votre trajectoire net zéro dès aujourd'hui</h2>
          <p className="text-base text-slate-300 max-w-2xl mx-auto">Bénéficiez d'une session de cadrage technique gratuite avec nos experts en efficacité énergétique et conformité CSRD.</p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button onClick={onOpenDemo} className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg transition duration-200 flex items-center gap-2.5">
              📅 Planifier un audit énergétique
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PageEnergie;

