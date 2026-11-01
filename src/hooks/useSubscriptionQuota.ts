import { useState, useEffect, useCallback } from "react";
import { SubscriptionTier } from "../types";

export interface QuotaTierConfig {
  name: string;
  monthlyTokens: number;
  dailyTokens: number;
  requestsPerMinute: number;
  entitlementLimit: number; // -1 for unlimited
  badgeColor: string;
  badgeBg: string;
  borderClass: string;
}

export const TIER_QUOTA_CONFIGS: Record<SubscriptionTier, QuotaTierConfig> = {
  free: {
    name: "Free Trial",
    monthlyTokens: 10_000,
    dailyTokens: 5_000,
    requestsPerMinute: 10,
    entitlementLimit: 100,
    badgeColor: "text-slate-400",
    badgeBg: "bg-slate-500/10",
    borderClass: "border-slate-500/20",
  },
  silver: {
    name: "Starter / Silver",
    monthlyTokens: 100_000,
    dailyTokens: 30_000,
    requestsPerMinute: 30,
    entitlementLimit: 2_000,
    badgeColor: "text-blue-400",
    badgeBg: "bg-blue-500/10",
    borderClass: "border-blue-500/20",
  },
  pro: {
    name: "Hypervision Pro",
    monthlyTokens: 1_000_000,
    dailyTokens: 150_000,
    requestsPerMinute: 100,
    entitlementLimit: 10_000,
    badgeColor: "text-orange-400",
    badgeBg: "bg-orange-500/10",
    borderClass: "border-orange-500/20",
  },
  enterprise: {
    name: "Sovereign Enterprise",
    monthlyTokens: 100_000_000,
    dailyTokens: 1_000_000,
    requestsPerMinute: 300,
    entitlementLimit: -1, // Unlimited
    badgeColor: "text-purple-400",
    badgeBg: "bg-purple-500/10",
    borderClass: "border-purple-500/20",
  },
};

const DEFAULT_CONSUMED: Record<SubscriptionTier, { tokensMonth: number; tokensDay: number; reqMin: number; entitlements: number }> = {
  free: { tokensMonth: 1_500, tokensDay: 850, reqMin: 3, entitlements: 14 },
  silver: { tokensMonth: 28_000, tokensDay: 8_400, reqMin: 8, entitlements: 240 },
  pro: { tokensMonth: 450_000, tokensDay: 48_500, reqMin: 24, entitlements: 3_820 },
  enterprise: { tokensMonth: 12_500_000, tokensDay: 180_000, reqMin: 68, entitlements: 14_900 },
};

export interface QuotaState {
  tier: SubscriptionTier;
  config: QuotaTierConfig;
  monthlyTokensUsed: number;
  monthlyTokensLimit: number;
  monthlyTokensRemaining: number;
  monthlyTokensPercent: number;
  dailyTokensUsed: number;
  dailyTokensLimit: number;
  dailyTokensPercent: number;
  requestsInWindow: number;
  requestsLimit: number;
  requestsPercent: number;
  entitlementsUsed: number;
  entitlementsLimit: number;
  entitlementsPercent: number;
  isNearLimit: boolean; // > 80%
  isExceeded: boolean; // >= 100%
  daysUntilReset: number;
}

export function useSubscriptionQuota(propTier?: SubscriptionTier) {
  const getActiveTier = useCallback((): SubscriptionTier => {
    if (propTier) return propTier;
    if (typeof window !== "undefined") {
      const saved = (localStorage.getItem("sensorium_subscription_tier") || "").toLowerCase();
      if (saved in TIER_QUOTA_CONFIGS) return saved as SubscriptionTier;
    }
    return "free";
  }, [propTier]);

  const [tier, setTier] = useState<SubscriptionTier>(getActiveTier);

  // Storage Keys
  const storageKey = `sensorium_quota_${tier}`;

  // Read stored consumption or default
  const getStoredUsage = useCallback(() => {
    if (typeof window === "undefined") {
      return DEFAULT_CONSUMED[tier];
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONSUMED[tier];
  }, [tier, storageKey]);

  const [usage, setUsage] = useState(getStoredUsage);

  // Keep in sync with external tier changes
  useEffect(() => {
    const current = getActiveTier();
    setTier(current);
  }, [getActiveTier, propTier]);

  useEffect(() => {
    setUsage(getStoredUsage());
  }, [tier, getStoredUsage]);

  // Listen to cross-component quota updates
  useEffect(() => {
    const handleUpdate = () => {
      const current = getActiveTier();
      setTier(current);
      setUsage(getStoredUsage());
    };

    window.addEventListener("sensorium:quota_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("sensorium:quota_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [getActiveTier, getStoredUsage]);

  const config = TIER_QUOTA_CONFIGS[tier] || TIER_QUOTA_CONFIGS.free;

  // Save changes
  const saveUsage = useCallback((newUsage: typeof usage) => {
    setUsage(newUsage);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(newUsage));
      window.dispatchEvent(new CustomEvent("sensorium:quota_updated", { detail: { tier, usage: newUsage } }));
    }
  }, [storageKey, tier]);

  // Action: Consume tokens (e.g. Gemini inference or report)
  const consumeTokens = useCallback((amount: number = 350, reason: string = "INFERENCE"): { success: boolean; remaining: number } => {
    const nextMonth = usage.tokensMonth + amount;
    const nextDay = usage.tokensDay + amount;
    const nextReq = Math.min(config.requestsPerMinute, usage.reqMin + 1);

    if (nextMonth > config.monthlyTokens) {
      return { success: false, remaining: Math.max(0, config.monthlyTokens - usage.tokensMonth) };
    }

    const updated = {
      ...usage,
      tokensMonth: nextMonth,
      tokensDay: nextDay,
      reqMin: nextReq,
    };
    saveUsage(updated);
    return { success: true, remaining: config.monthlyTokens - nextMonth };
  }, [usage, config, saveUsage]);

  // Action: Increment request
  const recordApiCall = useCallback((count: number = 1) => {
    const updated = {
      ...usage,
      reqMin: Math.min(config.requestsPerMinute, usage.reqMin + count),
    };
    saveUsage(updated);
  }, [usage, config, saveUsage]);

  // Action: Reset usage back to defaults
  const resetQuotas = useCallback(() => {
    const defaults = DEFAULT_CONSUMED[tier];
    saveUsage(defaults);
  }, [tier, saveUsage]);

  // Calculation of percentages and limits
  const monthlyTokensUsed = usage.tokensMonth;
  const monthlyTokensLimit = config.monthlyTokens;
  const monthlyTokensRemaining = Math.max(0, monthlyTokensLimit - monthlyTokensUsed);
  const monthlyTokensPercent = Math.min(100, Math.round((monthlyTokensUsed / monthlyTokensLimit) * 100));

  const dailyTokensUsed = usage.tokensDay;
  const dailyTokensLimit = config.dailyTokens;
  const dailyTokensPercent = Math.min(100, Math.round((dailyTokensUsed / dailyTokensLimit) * 100));

  const requestsInWindow = usage.reqMin;
  const requestsLimit = config.requestsPerMinute;
  const requestsPercent = Math.min(100, Math.round((requestsInWindow / requestsLimit) * 100));

  const entitlementsUsed = usage.entitlements;
  const entitlementsLimit = config.entitlementLimit;
  const entitlementsPercent = entitlementsLimit === -1 ? 0 : Math.min(100, Math.round((entitlementsUsed / entitlementsLimit) * 100));

  const isNearLimit = monthlyTokensPercent >= 80 || dailyTokensPercent >= 80;
  const isExceeded = monthlyTokensUsed >= monthlyTokensLimit || dailyTokensUsed >= dailyTokensLimit;

  // Calculate days until 1st of next month
  const now = new Date();
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil((nextMonthDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const quotaState: QuotaState = {
    tier,
    config,
    monthlyTokensUsed,
    monthlyTokensLimit,
    monthlyTokensRemaining,
    monthlyTokensPercent,
    dailyTokensUsed,
    dailyTokensLimit,
    dailyTokensPercent,
    requestsInWindow,
    requestsLimit,
    requestsPercent,
    entitlementsUsed,
    entitlementsLimit,
    entitlementsPercent,
    isNearLimit,
    isExceeded,
    daysUntilReset,
  };

  return {
    ...quotaState,
    consumeTokens,
    recordApiCall,
    resetQuotas,
  };
}
