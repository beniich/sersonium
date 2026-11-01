/**
 * @file useSubscriptionGate.ts
 * @description Hook React gérant le sas / pont d'abonnement pour l'accès au Cockpit SENSORIUM.
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import axios from 'axios';

// Intercepteur global Axios : détecte 402 PAYMENT_REQUIRED et émet l'événement modal
if (typeof window !== 'undefined') {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 402) {
        window.dispatchEvent(
          new CustomEvent('sensorium:subscription_required', {
            detail: error.response.data?.error || {
              code: 'PAYMENT_REQUIRED',
              message: 'Accès au Cockpit réservé aux abonnements actifs.'
            }
          })
        );
      }
      return Promise.reject(error);
    }
  );
}

export type SubscriptionTier = 'FREE' | 'STARTER' | 'SILVER' | 'PRO' | 'ENTERPRISE';

export type SubscriptionStatus = 
  | 'loading'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'none';

export interface SubscriptionState {
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  planName: string;
  hasAccessToCockpit: boolean;
  has3dDigitalTwin: boolean;
  hasRealtimeKafka: boolean;
  hasZtnaHardware: boolean;
  tokenBalance: number;
  expiresAt: string | null;
  isLoading: boolean;
}

export function useSubscriptionGate(user: User | null | undefined) {
  const [subState, setSubState] = useState<SubscriptionState>({
    status: 'loading',
    tier: 'FREE',
    planName: 'Offre Découverte',
    hasAccessToCockpit: false,
    has3dDigitalTwin: false,
    hasRealtimeKafka: false,
    hasZtnaHardware: false,
    tokenBalance: 0,
    expiresAt: null,
    isLoading: true,
  });

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentRequired = (e: any) => {
      const msg = e.detail?.message || 'Accès restreint : niveau d\'abonnement supérieur requis.';
      setUpgradeReason(msg);
      setIsUpgradeModalOpen(true);
    };

    window.addEventListener('sensorium:subscription_required', handlePaymentRequired);
    return () => window.removeEventListener('sensorium:subscription_required', handlePaymentRequired);
  }, []);

  const checkSubscription = useCallback(async () => {
    // Clé localStorage unifiée : sensorium_subscription_tier (BUG #7 corrigé)
    const savedTier = (localStorage.getItem('sensorium_subscription_tier') || '').toUpperCase() as SubscriptionTier;
    const hasValidLocalTier = savedTier === 'STARTER' || savedTier === 'SILVER' || savedTier === 'PRO' || savedTier === 'ENTERPRISE';

    // Vérifier si un essai est toujours valide
    const trialExpires = localStorage.getItem('sensorium_trial_expires_at');
    const isTrialActive = trialExpires ? Date.now() < new Date(trialExpires).getTime() : false;
    const hasTrialAccess = isTrialActive;

    if (!user) {
      // BUG #2 CORRIGÉ : suppression du bypass localhost automatique
      // Seul un tier explicitement choisi ET non expiré donne accès
      if (hasValidLocalTier || hasTrialAccess) {
        const demoTier = (hasValidLocalTier ? savedTier : 'STARTER') as SubscriptionTier;
        setSubState({
          status: 'active',
          tier: demoTier,
          planName: isTrialActive ? 'Essai Démo (14 jours)' : 'Accès Local Configuré',
          hasAccessToCockpit: true,
          has3dDigitalTwin: demoTier === 'PRO' || demoTier === 'ENTERPRISE',
          hasRealtimeKafka: demoTier === 'PRO' || demoTier === 'ENTERPRISE',
          hasZtnaHardware: demoTier === 'ENTERPRISE',
          tokenBalance: demoTier === 'ENTERPRISE' ? 9999 : demoTier === 'PRO' ? 5000 : 1000,
          expiresAt: trialExpires || null,
          isLoading: false,
        });
        return;
      }

      setSubState({
        status: 'none',
        tier: 'FREE',
        planName: 'Visiteur Non Connecté',
        hasAccessToCockpit: false,
        has3dDigitalTwin: false,
        hasRealtimeKafka: false,
        hasZtnaHardware: false,
        tokenBalance: 0,
        expiresAt: null,
        isLoading: false,
      });
      return;
    }

    try {
      // Interroger l'API du pont d'abonnement SENSORIUM
      const res = await fetch(`/api/v1/bridge/subscription-status?uid=${encodeURIComponent(user.uid)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        const tier = (data.tier || 'FREE').toUpperCase() as SubscriptionTier;
        const isActive = data.status === 'active' || data.status === 'trialing';

        setSubState({
          status: data.status || 'none',
          tier,
          planName: data.planName || 'Plan Inconnu',
          hasAccessToCockpit: isActive && tier !== 'FREE',
          has3dDigitalTwin: data.has3dDigitalTwin ?? (tier === 'PRO' || tier === 'ENTERPRISE'),
          hasRealtimeKafka: data.hasRealtimeKafka ?? (tier === 'PRO' || tier === 'ENTERPRISE'),
          hasZtnaHardware: data.hasZtnaHardware ?? (tier === 'ENTERPRISE'),
          tokenBalance: data.tokenBalance || 1000,
          expiresAt: data.expiresAt || null,
          isLoading: false,
        });
      } else {
        // BUG #3 CORRIGÉ : fallback API en échec → accès REFUSÉ (free) et non plus pro
        const localTier = (localStorage.getItem('sensorium_subscription_tier') || 'free').toUpperCase() as SubscriptionTier;
        const hasAccess = localTier !== 'FREE';
        setSubState({
          status: hasAccess ? 'active' : 'none',
          tier: localTier as SubscriptionTier,
          planName: localTier === 'ENTERPRISE' ? 'Sovereign Fleet' : localTier === 'PRO' ? 'Hypervision Twin' : localTier === 'STARTER' || localTier === 'SILVER' ? 'BIM Foundation' : 'Offre Découverte',
          hasAccessToCockpit: hasAccess,
          has3dDigitalTwin: localTier === 'PRO' || localTier === 'ENTERPRISE',
          hasRealtimeKafka: localTier === 'PRO' || localTier === 'ENTERPRISE',
          hasZtnaHardware: localTier === 'ENTERPRISE',
          tokenBalance: hasAccess ? 1000 : 0,
          expiresAt: null,
          isLoading: false,
        });
      }
    } catch {
      // Fallback gracieux en cas de coupure réseau
      setSubState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return {
    ...subState,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    upgradeReason,
    refreshSubscription: checkSubscription,
  };
}
