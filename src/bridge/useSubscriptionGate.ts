/**
 * @file useSubscriptionGate.ts
 * @description Hook React gérant le sas / pont d'abonnement pour l'accès au Cockpit SENSORIUM.
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

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

  const checkSubscription = useCallback(async () => {
    if (!user) {
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
        // Mode fallback local (ex: développement ou simulation hors ligne)
        // Vérification par attribut ou stockage local
        const localTier = (localStorage.getItem('sensorium_user_tier') || 'pro').toUpperCase() as SubscriptionTier;
        setSubState({
          status: 'active',
          tier: localTier,
          planName: localTier === 'ENTERPRISE' ? 'Sovereign Fleet' : localTier === 'PRO' ? 'Hypervision Twin' : 'BIM Foundation',
          hasAccessToCockpit: true,
          has3dDigitalTwin: true,
          hasRealtimeKafka: true,
          hasZtnaHardware: localTier === 'ENTERPRISE',
          tokenBalance: 5000,
          expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
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
    refreshSubscription: checkSubscription,
  };
}
