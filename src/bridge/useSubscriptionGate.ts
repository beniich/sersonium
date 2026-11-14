/**
 * @file useSubscriptionGate.ts
 * @description Hook React gérant le sas / pont d'abonnement pour l'accès au Cockpit SENSORIUM.
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import axios from 'axios';
import authService from '../services/auth.service';

// Intercepteur global Axios : détecte 402 PAYMENT_REQUIRED, 429 QUOTA_EXCEEDED et 401 SESSION_EXPIRED
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
      if (error?.response?.status === 429 && error?.response?.data?.error?.code === 'TOKEN_QUOTA_EXCEEDED') {
        window.dispatchEvent(
          new CustomEvent('sensorium:quota_exhausted', {
            detail: error.response.data?.error || {
              code: 'TOKEN_QUOTA_EXCEEDED',
              message: 'Quota de jetons IA/API mensuel épuisé. Veuillez recharger votre solde.'
            }
          })
        );
      }
      if (error?.response?.status === 401 && error?.response?.data?.error?.code === 'TOKEN_EXPIRED') {
        window.dispatchEvent(
          new CustomEvent('sensorium:session_expired', {
            detail: { message: 'Session expirée. Veuillez vous reconnecter.' }
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

    const effectiveUser = user || (authService.isAuthenticated() ? { uid: authService.getSession().user?.userId, email: authService.getSession().user?.email } : null);

    if (!effectiveUser) {
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
      // Obtenir le Bearer Token (Firebase ID Token ou JWT Session Sensorium)
      let bearerToken = '';
      try {
        if (user && typeof (user as any).getIdToken === 'function') {
          bearerToken = await (user as any).getIdToken();
        }
      } catch {
        // fallback
      }
      if (!bearerToken) {
        bearerToken = authService.getAccessToken() || '';
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
      }

      const uidToQuery = effectiveUser.uid || user?.uid || '';
      const res = await fetch(`/api/v1/bridge/subscription-status?uid=${encodeURIComponent(uidToQuery)}`, {
        headers,
        credentials: 'include',
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
        // En cas d'échec d'autorisation API (401, 402, 403), accès formellement refusé
        const trialExpires = localStorage.getItem('sensorium_trial_expires_at');
        const isTrialActive = trialExpires ? Date.now() < new Date(trialExpires).getTime() : false;

        setSubState({
          status: isTrialActive ? 'trialing' : 'none',
          tier: isTrialActive ? 'STARTER' : 'FREE',
          planName: isTrialActive ? 'Essai Démo (14 jours)' : 'Offre Découverte',
          hasAccessToCockpit: isTrialActive,
          has3dDigitalTwin: false,
          hasRealtimeKafka: false,
          hasZtnaHardware: false,
          tokenBalance: isTrialActive ? 1000 : 0,
          expiresAt: isTrialActive ? trialExpires : null,
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

  // BUG-02 CORRIG\u00c9 : Re-v\u00e9rifier l'abonnement quand le tier change dans n'importe quel composant
  useEffect(() => {
    const handleTierChange = () => checkSubscription();
    window.addEventListener('sensorium:subscription_changed', handleTierChange);
    window.addEventListener('sensorium:quota_updated', handleTierChange);
    return () => {
      window.removeEventListener('sensorium:subscription_changed', handleTierChange);
      window.removeEventListener('sensorium:quota_updated', handleTierChange);
    };
  }, [checkSubscription]);

  return {
    ...subState,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    upgradeReason,
    refreshSubscription: checkSubscription,
  };
}
