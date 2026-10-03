import React, { useState } from 'react';

interface PricingViewProps {
  onUnlockCockpit: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onUnlockCockpit }) => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedTier, setSelectedTier] = useState({
    name: 'Pro - Hypervision Twin',
    basePrice: 99,
  });

  const [notification, setNotification] = useState<{ title: string; desc: string } | null>(null);

  const discount = isYearly ? 0.8 : 1.0;
  const starterPrice = Math.round(49 * discount);
  const proPrice = Math.round(99 * discount);
  const enterprisePrice = Math.round(299 * discount);

  const currentPricePerMonth = selectedTier.basePrice * discount;
  const netTotal = isYearly ? currentPricePerMonth * 12 : currentPricePerMonth;
  const vat = netTotal * 0.2;
  const totalWithVat = (netTotal + vat).toFixed(2);

  const showNotification = (title: string, desc: string) => {
    setNotification({ title, desc });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelectTier = (tierName: string, basePrice: number) => {
    setSelectedTier({ name: tierName, basePrice });
    showNotification('Plan Actualisé', 'Sélection : ' + tierName);
    const terminalEl = document.getElementById('payment-terminal');
    if (terminalEl) {
      terminalEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePaypalAction = (actionTitle: string, desc: string) => {
    showNotification(actionTitle, desc);
    setTimeout(() => {
      onUnlockCockpit();
    }, 1800);
  };

  return (
    <div className="w-full min-h-screen bg-[#fbf8ff] pt-20 pb-16 flex flex-col justify-between">
      <div className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10 max-w-7xl mx-auto">
        {/* Glow ambient spots */}
        <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-[#630ed4]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-[#8b4ef7]/10 blur-3xl pointer-events-none"></div>

        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-4 relative z-10">
          <div className="tactile-debossed px-4 py-1.5 rounded-full flex items-center gap-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#630ed4] animate-pulse"></span>
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#630ed4] font-bold">
              Système d'Accréditation Télémesure CAFM
            </span>
            <span className="text-[#ccc3d8] text-[10px]">/</span>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-semibold">
              Tier-4 Sovereign Enclave
            </span>
          </div>

          <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold text-[#1b1b20] tracking-tight">
            Plans Tarifaires &amp; Souscription SaaS Décentralisée
          </h1>

          <p className="text-base text-[#4a4455] max-w-2xl leading-relaxed">
            Déployez votre jumeau numérique Spider CAFM en quelques secondes. Infrastructure hybride BIM 4.0, pilotage énergétique net-zéro et jetons d'accès chiffrés sur hardware HSM.
          </p>

          {/* Billing Switcher */}
          <div className="tactile-plate p-2 rounded-2xl flex items-center gap-4 mt-2 shadow-xl">
            <span
              onClick={() => setIsYearly(false)}
              className={`font-['Space_Grotesk'] text-xs font-bold transition-colors cursor-pointer select-none ${
                !isYearly ? 'text-[#630ed4]' : 'text-[#4a4455]'
              }`}
            >
              Mensuel
            </span>

            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              className="tactile-debossed w-16 h-8 rounded-full p-1 relative flex items-center transition-all cursor-pointer"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${
                  isYearly ? 'translate-x-8' : 'translate-x-0'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isYearly ? 'bg-[#630ed4]' : 'bg-[#7b7487]'
                  }`}
                ></span>
              </div>
            </button>

            <div
              onClick={() => setIsYearly(true)}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <span
                className={`font-['Space_Grotesk'] text-xs font-medium transition-colors ${
                  isYearly ? 'text-[#630ed4] font-bold' : 'text-[#4a4455]'
                }`}
              >
                Annuel
              </span>
              <div className="tactile-btn px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-amber-950 font-bold">verified</span>
                <span className="font-['Space_Grotesk'] text-[10px] font-bold text-amber-950 tracking-wider">
                  -20% TACTILE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full relative z-10 items-stretch">
          {/* Plan 1: Starter */}
          <div className="tactile-plate rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#4a4455] font-bold">
                    Site Unique
                  </span>
                  <h2 className="font-['Space_Grotesk'] text-xl text-[#1b1b20] font-bold">
                    Starter - Smart Facility
                  </h2>
                </div>
                <div className="tactile-debossed w-10 h-10 rounded-xl flex items-center justify-center text-[#4a4455]">
                  <span className="material-symbols-outlined text-[20px]">apartment</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="font-['Space_Grotesk'] text-4xl text-[#1b1b20] font-extrabold">
                  ${starterPrice}
                </span>
                <span className="font-['Space_Grotesk'] text-xs text-[#4a4455] font-semibold">
                  {isYearly ? '/mois (facturé annuellement)' : '/mois'}
                </span>
              </div>

              <p className="text-xs text-[#4a4455] leading-relaxed">
                Idéal pour un projet pilote ou un immeuble commercial autonome jusqu'à 15 000 m².
              </p>

              <div className="tactile-debossed p-4 rounded-xl flex flex-col gap-2.5 mt-2">
                <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#4a4455] uppercase tracking-wider">
                  Capacités Incluses
                </span>
                <ul className="flex flex-col gap-2.5">
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs">
                    <span className="w-5 h-5 rounded-full tactile-btn flex items-center justify-center text-[#630ed4] shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Jusqu'à 1 500 points BACnet / Modbus</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs">
                    <span className="w-5 h-5 rounded-full tactile-btn flex items-center justify-center text-[#630ed4] shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Modélisation 3D IFC/Revit simplifiée</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs">
                    <span className="w-5 h-5 rounded-full tactile-btn flex items-center justify-center text-[#630ed4] shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Monitoring Carbone Scope 1 &amp; 2</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#4a4455] text-xs opacity-60">
                    <span className="w-5 h-5 rounded-full tactile-debossed flex items-center justify-center text-[#7b7487] shrink-0">
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </span>
                    <span>Jumeau prédictif Gemini IA</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTier('Starter - Smart Facility', 49)}
              className="tactile-btn w-full mt-6 py-3 rounded-xl font-['Space_Grotesk'] text-sm font-bold text-[#1b1b20] hover:text-[#630ed4] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Sélectionner Starter</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {/* Plan 2: Pro (Best Value) */}
          <div className="relative tactile-plate rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 transform lg:-translate-y-3 bg-gradient-to-b from-white to-[#f5f2fa]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 tactile-btn-primary px-4 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
              <span className="material-symbols-outlined text-amber-300 text-[14px]">stars</span>
              <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-white font-bold">
                BEST VALUE / RECOMMANDÉ
              </span>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#630ed4] font-bold">
                    Multiplex &amp; Campus
                  </span>
                  <h2 className="font-['Space_Grotesk'] text-xl text-[#1b1b20] font-bold">
                    Pro - Hypervision Twin
                  </h2>
                </div>
                <div className="tactile-plate w-10 h-10 rounded-xl bg-[#630ed4]/10 flex items-center justify-center text-[#630ed4]">
                  <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="font-['Space_Grotesk'] text-4xl text-[#630ed4] font-extrabold">
                  ${proPrice}
                </span>
                <span className="font-['Space_Grotesk'] text-xs text-[#4a4455] font-semibold">
                  {isYearly ? '/mois (facturé annuellement)' : '/mois'}
                </span>
              </div>

              <p className="text-xs text-[#4a4455] leading-relaxed">
                Le standard d'hypervision industrielle avec IA prédictive, jumeau 3D complet et balancement dynamique.
              </p>

              <div className="tactile-debossed p-4 rounded-xl flex flex-col gap-2.5 mt-2">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#630ed4] font-bold uppercase tracking-wider">
                  Matrice Opérationnelle Complète
                </span>
                <ul className="flex flex-col gap-2.5">
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs font-medium">
                    <span className="w-5 h-5 rounded-full tactile-btn-primary flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Télémétrie illimitée BACnet/IP, MQTT, LoRaWAN</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs font-medium">
                    <span className="w-5 h-5 rounded-full tactile-btn-primary flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Moteur 3D BIM Spider Engine temps réel</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs font-medium">
                    <span className="w-5 h-5 rounded-full tactile-btn-primary flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Diagnostic prédictif Gemini 3.8 Flash / Pro</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs font-medium">
                    <span className="w-5 h-5 rounded-full tactile-btn-primary flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Jetons d'authentification éphémères rotatifs</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs font-medium">
                    <span className="w-5 h-5 rounded-full tactile-btn-primary flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Pistes d'audit ESG &amp; rapport CSRD automatique</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTier('Pro - Hypervision Twin', 99)}
              className="tactile-btn-primary w-full mt-6 py-3 rounded-xl font-['Space_Grotesk'] text-sm font-bold text-white shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Déployer Hypervision Pro</span>
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </button>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="tactile-plate rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#4a4455] font-bold">
                    Parc Souverain
                  </span>
                  <h2 className="font-['Space_Grotesk'] text-xl text-[#1b1b20] font-bold">
                    Enterprise - Sovereign Fleet
                  </h2>
                </div>
                <div className="tactile-debossed w-10 h-10 rounded-xl flex items-center justify-center text-[#4a4455]">
                  <span className="material-symbols-outlined text-[20px]">domain</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="font-['Space_Grotesk'] text-4xl text-[#1b1b20] font-extrabold">
                  ${enterprisePrice}
                </span>
                <span className="font-['Space_Grotesk'] text-xs text-[#4a4455] font-semibold">
                  {isYearly ? '/mois (facturé annuellement)' : '/mois'}
                </span>
              </div>

              <p className="text-xs text-[#4a4455] leading-relaxed">
                Isolation physique stricte, conformité critique OIV / NIS 2 et instance edge dédiée sans latence.
              </p>

              <div className="tactile-debossed p-4 rounded-xl flex flex-col gap-2.5 mt-2">
                <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#4a4455] uppercase tracking-wider">
                  Infrastructure Dédiée
                </span>
                <ul className="flex flex-col gap-2.5">
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs">
                    <span className="w-5 h-5 rounded-full tactile-btn flex items-center justify-center text-[#630ed4] shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Point de Présence Edge Cloudflare dédié</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs">
                    <span className="w-5 h-5 rounded-full tactile-btn flex items-center justify-center text-[#630ed4] shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Chiffrement hardware mTLS &amp; Clé HSM</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs">
                    <span className="w-5 h-5 rounded-full tactile-btn flex items-center justify-center text-[#630ed4] shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Garantie de service SLA 99.999% contractuelle</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#1b1b20] text-xs">
                    <span className="w-5 h-5 rounded-full tactile-btn flex items-center justify-center text-[#630ed4] shrink-0">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Ingénieur système CAFM dédié 24/7/365</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTier('Enterprise - Sovereign Fleet', 299)}
              className="tactile-btn w-full mt-6 py-3 rounded-xl font-['Space_Grotesk'] text-sm font-bold text-[#1b1b20] hover:text-[#630ed4] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Configurer Flotte Dédiée</span>
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </button>
          </div>
        </div>

        {/* Terminal de Règlement Certifié PayPal */}
        <div
          id="payment-terminal"
          className="w-full max-w-5xl mx-auto tactile-plate rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 scroll-mt-24"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-[#e3e1e8]/60 gap-4">
            <div className="flex items-center gap-3">
              <div className="tactile-debossed w-12 h-12 rounded-2xl flex items-center justify-center text-[#630ed4]">
                <span className="material-symbols-outlined text-[24px]">point_of_sale</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-xl text-[#1b1b20] font-bold">
                  Terminal de Règlement Certifié
                </span>
                <span className="text-xs text-[#4a4455]">
                  Passerelle officielle PayPal Merchant v2 • Chiffrement bancaire TLS 1.3
                </span>
              </div>
            </div>

            <div className="tactile-debossed px-3 py-1.5 rounded-xl flex items-center gap-2 self-start md:self-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
              <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#1b1b20] uppercase">
                Session Sécurisée HSM
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* Left summary column */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="tactile-debossed p-5 rounded-2xl flex flex-col gap-3">
                <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#4a4455] font-bold">
                  Récapitulatif de Commande
                </span>

                <div className="flex justify-between items-center py-1">
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-[#1b1b20]">
                    {selectedTier.name}
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] px-2 py-0.5 rounded-full bg-[#eaddff] text-[#25005a] font-bold">
                    RECOMMANDÉ
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#4a4455] text-xs">
                  <span>Fréquence d'accréditation</span>
                  <span className="font-medium text-[#1b1b20]">
                    {isYearly ? 'Annuelle (-20% Remise Accordée)' : 'Mensuelle'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#4a4455] text-xs">
                  <span>Frais de mise en service réseau</span>
                  <span className="text-emerald-600 font-bold">Offerts ($0)</span>
                </div>

                <div className="flex justify-between items-center text-[#4a4455] text-xs">
                  <span>TVA / Taxes déductibles (20%)</span>
                  <span className="font-medium text-[#1b1b20] font-mono">
                    ${vat.toFixed(2)}
                  </span>
                </div>

                <div className="tactile-plate p-3.5 rounded-xl flex justify-between items-center mt-2">
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-[#1b1b20]">
                    Total à régler
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Space_Grotesk'] text-xl text-[#630ed4] font-extrabold font-mono">
                      ${totalWithVat}
                    </span>
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-semibold">
                      TTC
                    </span>
                  </div>
                </div>
              </div>

              <div className="tactile-plate p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#efedf4] flex items-center justify-center text-[#630ed4] shrink-0">
                  <span className="material-symbols-outlined text-[22px]">shield_person</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-[#1b1b20]">
                    Protection des Achats PayPal
                  </span>
                  <span className="text-[11px] text-[#4a4455]">
                    Remboursement intégral garanti en cas de défaillance réseau ou interruption SLA.
                  </span>
                </div>
              </div>
            </div>

            {/* Right checkout column with official PayPal Buttons */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {/* 1. Instant Paypal */}
                <button
                  type="button"
                  onClick={() =>
                    handlePaypalAction(
                      'Passerelle PayPal Instant',
                      'Connexion au coffre-fort PayPal Checkout sécurisé...'
                    )
                  }
                  className="w-full h-14 rounded-xl font-['Space_Grotesk'] text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-98 shadow-[4px_4px_12px_rgba(255,196,57,0.35),-2px_-2px_8px_#ffffff] hover:brightness-105"
                  style={{ background: 'linear-gradient(180deg, #ffc439 0%, #f6b520 100%)', color: '#003087' }}
                >
                  <span className="font-black tracking-tight" style={{ color: '#003087' }}>Pay</span>
                  <span className="font-black tracking-tight" style={{ color: '#0079c1' }}>Pal</span>
                  <span className="text-[#1b1b20] text-sm font-semibold ml-2">Paiement Immédiat</span>
                </button>

                {/* 2. Paypal Subscription */}
                <button
                  type="button"
                  onClick={() =>
                    handlePaypalAction(
                      'Souscription Automatisée',
                      'Mise en place du mandat récurrent PayPal certifié...'
                    )
                  }
                  className="w-full h-14 rounded-xl font-['Space_Grotesk'] text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-98 text-white shadow-[4px_4px_12px_rgba(0,121,193,0.35),-2px_-2px_8px_#ffffff] hover:brightness-105"
                  style={{ background: 'linear-gradient(180deg, #0079c1 0%, #00457c 100%)' }}
                >
                  <span className="material-symbols-outlined text-[20px] text-white">autorenew</span>
                  <span>S'abonner avec PayPal</span>
                  <span className="font-['Space_Grotesk'] text-[10px] bg-white/20 px-2 py-0.5 rounded-full ml-1 font-normal">
                    Récurrent
                  </span>
                </button>

                {/* 3. Paypal 4x */}
                <button
                  type="button"
                  onClick={() =>
                    handlePaypalAction(
                      'Facilité PayPal 4x',
                      'Éligibilité confirmée. Échéancier instantané en cours...'
                    )
                  }
                  className="w-full h-12 rounded-xl font-['Space_Grotesk'] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-98 shadow-md hover:bg-[#efedf4]"
                  style={{ background: '#efedf4', color: '#003087' }}
                >
                  <span className="font-black" style={{ color: '#003087' }}>Pay</span>
                  <span className="font-black" style={{ color: '#0079c1' }}>Pal</span>
                  <span className="text-xs font-semibold text-[#1b1b20] ml-1">Payez en 4x sans frais</span>
                  <span className="material-symbols-outlined text-[16px] text-[#4a4455]">arrow_forward</span>
                </button>
              </div>

              {/* Or separator */}
              <div className="flex items-center gap-3 my-1">
                <div className="h-px bg-[#e3e1e8] flex-1"></div>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] uppercase tracking-wider font-semibold">
                  Ou Carte Bancaire Via PayPal
                </span>
                <div className="h-px bg-[#e3e1e8] flex-1"></div>
              </div>

              {/* Direct Card Inputs */}
              <div className="tactile-plate p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="w-10 h-7 rounded bg-gradient-to-r from-amber-200 to-amber-400 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-4 rounded-xs border border-amber-600/40 grid grid-cols-2 gap-0.5 p-0.5">
                      <div className="bg-amber-600/30 rounded-xs"></div>
                      <div className="bg-amber-600/30 rounded-xs"></div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-[#4a4455]">
                    <span className="material-symbols-outlined text-[20px]">credit_card</span>
                    <span className="material-symbols-outlined text-[20px]">contactless</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <label className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-bold uppercase tracking-wider">
                    Numéro de Carte Virtuelle / Physique
                  </label>
                  <div className="tactile-debossed px-3.5 py-2.5 rounded-xl flex items-center justify-between">
                    <input
                      type="text"
                      readOnly
                      value="4532 9012 8841 8920"
                      className="bg-transparent font-['Space_Grotesk'] text-sm text-[#1b1b20] outline-none w-full tracking-wider"
                    />
                    <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#630ed4]">VISA/CB</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-bold uppercase tracking-wider">
                      Expiration
                    </label>
                    <div className="tactile-debossed px-3 py-2 rounded-xl">
                      <input
                        type="text"
                        readOnly
                        value="09 / 28"
                        className="bg-transparent font-['Space_Grotesk'] text-sm text-[#1b1b20] outline-none w-full text-center"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-['Space_Grotesk'] text-[10px] text-[#4a4455] font-bold uppercase tracking-wider">
                      CVC Crypté
                    </label>
                    <div className="tactile-debossed px-3 py-2 rounded-xl flex items-center justify-between">
                      <input
                        type="password"
                        readOnly
                        value="884"
                        className="bg-transparent font-['Space_Grotesk'] text-sm text-[#1b1b20] outline-none w-full text-center tracking-widest"
                      />
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handlePaypalAction(
                      'Débit Carte Enregistré',
                      'Tokenisation mTLS validée pour ' + selectedTier.name
                    )
                  }
                  className="tactile-btn-primary w-full mt-2 py-3 rounded-xl font-['Space_Grotesk'] text-sm font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Confirmer le Débit Via Passerelle PayPal</span>
                </button>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[#4a4455] text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#630ed4]">key</span>
                  <span className="font-['Space_Grotesk'] text-[10px]">Jetons mTLS Déployés à la validation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
                  <span className="font-['Space_Grotesk'] text-[10px]">Enclave SSL 256-Bit Conforme OIV</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#630ed4]">speed</span>
                  <span className="font-['Space_Grotesk'] text-[10px]">Activation Immédiate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 tactile-plate p-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50 max-w-md bg-white border border-[#e3e1e8]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] text-sm font-bold text-[#1b1b20]">
              {notification.title}
            </span>
            <span className="text-xs text-[#4a4455]">{notification.desc}</span>
          </div>
        </div>
      )}
    </div>
  );
};
