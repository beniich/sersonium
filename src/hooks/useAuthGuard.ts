/**
 * @file useAuthGuard.ts
 * @description Hook unifié de contrôle d'accès : vérifie la triple couche (Authentification -> Abonnement Actif -> Quota Tokens & API)
 * avant toute navigation ou accès au Dashboard et au Cockpit SENSORIUM.
 */

import { useCallback } from "react";
import type { User } from "firebase/auth";
import { useSubscriptionGate, SubscriptionTier } from "../bridge/useSubscriptionGate";
import { useSubscriptionQuota } from "./useSubscriptionQuota";
import authService from "../services/auth.service";

export type AccessDenialReason = 
  | "NOT_AUTHENTICATED"
  | "NO_SUBSCRIPTION"
  | "QUOTA_EXCEEDED"
  | "LOADING"
  | "OK";

export interface AuthGuardEvaluation {
  canAccess: boolean;
  reason: AccessDenialReason;
  tier: SubscriptionTier;
  tokenBalance: number;
  message: string;
}

export function useAuthGuard(user: User | null | undefined) {
  const {
    status,
    tier,
    hasAccessToCockpit,
    isLoading: isSubscriptionLoading,
    refreshSubscription,
  } = useSubscriptionGate(user);

  const {
    isExceeded,
    monthlyTokensRemaining,
    monthlyTokensUsed,
    monthlyTokensLimit,
  } = useSubscriptionQuota(tier);

  const evaluateAccess = useCallback((): AuthGuardEvaluation => {
    // 1. Vérification Authentification (Firebase ou session JWT locale)
    const isLocalAuth = authService.isAuthenticated();
    if (!user && !isLocalAuth) {
      return {
        canAccess: false,
        reason: "NOT_AUTHENTICATED",
        tier: "FREE",
        tokenBalance: 0,
        message: "Authentification requise pour accéder à l'application SENSORIUM.",
      };
    }

    // 2. Vérification pendant le chargement du statut
    if (isSubscriptionLoading) {
      return {
        canAccess: false,
        reason: "LOADING",
        tier: tier || "FREE",
        tokenBalance: monthlyTokensRemaining,
        message: "Vérification des accréditations et licences en cours...",
      };
    }

    // 3. Vérification de l'Abonnement Actif (Plan payant requis ou essai actif)
    if (!hasAccessToCockpit || tier === "FREE") {
      return {
        canAccess: false,
        reason: "NO_SUBSCRIPTION",
        tier: tier || "FREE",
        tokenBalance: monthlyTokensRemaining,
        message: "Accès réservé aux abonnements actifs (Starter, Silver, Pro, Enterprise).",
      };
    }

    // 4. Vérification du Quota de Tokens & Jetons API
    if (isExceeded || monthlyTokensRemaining <= 0) {
      return {
        canAccess: false,
        reason: "QUOTA_EXCEEDED",
        tier,
        tokenBalance: 0,
        message: `Quota mensuel de tokens épuisé (${monthlyTokensUsed.toLocaleString()} / ${monthlyTokensLimit.toLocaleString()}). Veuillez recharger vos jetons.`,
      };
    }

    // 5. Tout est validé
    return {
      canAccess: true,
      reason: "OK",
      tier,
      tokenBalance: monthlyTokensRemaining,
      message: "Accès autorisé.",
    };
  }, [user, isSubscriptionLoading, hasAccessToCockpit, tier, isExceeded, monthlyTokensRemaining, monthlyTokensUsed, monthlyTokensLimit]);

  return {
    evaluateAccess,
    isLoading: isSubscriptionLoading,
    tier,
    refreshSubscription,
  };
}

