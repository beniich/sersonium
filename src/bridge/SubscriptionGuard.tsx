/**
 * @file SubscriptionGuard.tsx
 * @description Le Pont / Sas de Sécurité : Intercepte l'accès à l'application SENSORIUM
 * et exige une authentification et un abonnement actif avant de déverrouiller le Cockpit.
 */

import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { useSubscriptionGate, SubscriptionTier } from './useSubscriptionGate';

interface SubscriptionGuardProps {
  user: User | null | undefined;
  children: React.ReactNode;
  onSignIn?: () => void;
  onSelectPlan?: (tier: SubscriptionTier) => void;
  onReturnToVitrine?: () => void;
  fallbackView?: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  user,
  children,
  onSignIn,
  onSelectPlan,
  onReturnToVitrine,
  fallbackView,
}) => {
  const {
    status,
    tier,
    hasAccessToCockpit,
    isLoading,
    refreshSubscription,
  } = useSubscriptionGate(user);

  const [licenseInput, setLicenseInput] = useState('');
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);

  // 1. Écran de chargement pendant la vérification du statut
  if (isLoading) {
    return (
      <div className="w-full min-h-[600px] flex flex-col items-center justify-center p-8 bg-[#0b0c10] text-white">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
        <p className="font-['Space_Grotesk'] text-sm tracking-wider uppercase text-slate-400">
          Vérification des Accréditations &amp; Abonnement...
        </p>
      </div>
    );
  }

  // 2. Si l'accès est autorisé et l'abonnement actif : On affiche l'application protégée !
  if (hasAccessToCockpit) {
    return <>{children}</>;
  }

  // Si une vue personnalisée de repli a été fournie
  if (fallbackView) {
    return <>{fallbackView}</>;
  }

  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseInput.trim()) return;

    setIsVerifyingLicense(true);
    setLicenseError(null);

    try {
      const res = await fetch('/api/v1/bridge/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: licenseInput.trim(), uid: user?.uid }),
      });

      if (res.ok) {
        localStorage.setItem('sensorium_user_tier', 'enterprise');
        refreshSubscription();
      } else {
        const data = await res.json();
        setLicenseError(data.error || 'Clé de licence invalide ou expirée.');
      }
    } catch {
      setLicenseError('Erreur de communication avec le serveur de licence.');
    } finally {
      setIsVerifyingLicense(false);
    }
  };

  // 3. LE PONT / SAS PAYWALL : Bloque l'accès et propose les options de souscription
  return (
    <div className="w-full min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Halos lumineux de fond */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center gap-6">
        
        {/* Badge statut */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 backdrop-blur-md shadow-inner">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Passerelle d'Accès Sécurisée — Cockpit Réservé
          </span>
        </div>

        {/* Titre & Description */}
        <div className="space-y-3">
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Passez à l'Abonnement Actif
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            L'accès aux jumeaux numériques 3D, à la télémétrie temps réel Kafka et aux contrôles CAFM Zero-Trust requiert une accréditation en cours de validité.
          </p>
        </div>

        {/* 3 Cartes de Plans du Pont */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-4">
          
          {/* Plan 1 : Starter */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-['Space_Grotesk']">Starter</div>
              <h3 className="text-xl font-bold text-white mt-1">BIM Foundation</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">49 €</span>
                <span className="text-xs text-slate-400">/ mois</span>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ 1 Jumeau spatial statique</li>
                <li className="flex items-center gap-2">✓ Télémétrie d'énergie basique</li>
                <li className="flex items-center gap-2">✓ 1 000 jetons IA mensuels</li>
              </ul>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('sensorium_user_tier', 'starter');
                if (onSelectPlan) onSelectPlan('STARTER');
                refreshSubscription();
              }}
              className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all text-center"
            >
              Choisir Starter (49 €)
            </button>
          </div>

          {/* Plan 2 : Pro (Recommandé) */}
          <div className="p-6 rounded-2xl border-2 border-indigo-500 bg-indigo-950/20 backdrop-blur-md flex flex-col justify-between shadow-2xl shadow-indigo-900/30 relative">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white">
              Le Plus Populaire
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-['Space_Grotesk']">Pro</div>
              <h3 className="text-xl font-bold text-white mt-1">Hypervision Twin</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">99 €</span>
                <span className="text-xs text-slate-400">/ mois</span>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">✓ Jumeaux 3D immersifs illimités</li>
                <li className="flex items-center gap-2">✓ Pipeline Kafka temps réel sub-seconde</li>
                <li className="flex items-center gap-2">✓ 10 000 jetons IA &amp; copilote</li>
                <li className="flex items-center gap-2">✓ Rapports d'émissions ESG CSRD</li>
              </ul>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('sensorium_user_tier', 'pro');
                if (onSelectPlan) onSelectPlan('PRO');
                refreshSubscription();
              }}
              className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white shadow-lg transition-all text-center"
            >
              Débloquer l'Accès Pro (99 €)
            </button>
          </div>

          {/* Plan 3 : Enterprise */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-['Space_Grotesk']">Enterprise</div>
              <h3 className="text-xl font-bold text-white mt-1">Sovereign Fleet</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">299 €</span>
                <span className="text-xs text-slate-400">/ mois</span>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ Appliance souveraine sur site</li>
                <li className="flex items-center gap-2">✓ ZTNA matériel HSM chiffré</li>
                <li className="flex items-center gap-2">✓ SLA 99.99% &amp; support dédié 24/7</li>
              </ul>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('sensorium_user_tier', 'enterprise');
                if (onSelectPlan) onSelectPlan('ENTERPRISE');
                refreshSubscription();
              }}
              className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all text-center"
            >
              Déployer Enterprise (299 €)
            </button>
          </div>

        </div>

        {/* Option Clé de Licence Entreprise Offline / Appliance */}
        <div className="w-full max-w-lg mt-6 p-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm">
          <p className="text-xs text-slate-400 mb-2 font-['Space_Grotesk']">
            Vous disposez d'un bon de commande ou d'une clé d'activation souveraine ?
          </p>
          <form onSubmit={handleVerifyLicense} className="flex gap-2">
            <input
              type="text"
              placeholder="ex: SENS-PRO-XXXX-YYYY"
              value={licenseInput}
              onChange={(e) => setLicenseInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              disabled={isVerifyingLicense}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              {isVerifyingLicense ? 'Validation...' : 'Activer'}
            </button>
          </form>
          {licenseError && (
            <p className="text-[11px] text-rose-400 mt-2 text-left">{licenseError}</p>
          )}
        </div>

        {/* Accès Découverte Immédiat / Essai 14 jours */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              localStorage.setItem('sensorium_user_tier', 'pro');
              if (onSelectPlan) onSelectPlan('PRO');
              refreshSubscription();
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4 flex items-center gap-1 font-['Space_Grotesk'] transition-colors"
          >
            <span>✨ Activer un essai Démo 14 jours (Accès immédiat sans carte bancaire)</span>
          </button>
        </div>

        {/* Liens de retour vers le Site Vitrine & Connexion */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-4">
          <a
            href="/site/index.html"
            className="hover:text-white underline underline-offset-4 transition-colors"
          >
            ← Revenir au Site Web Vitrine
          </a>
          <span>•</span>
          {!user ? (
            <button
              onClick={onSignIn}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
            >
              Se connecter à un compte existant
            </button>
          ) : (
            <span>Connecté en tant que <strong className="text-white">{user.email}</strong></span>
          )}
        </div>

      </div>
    </div>
  );
};
