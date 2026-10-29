import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { metricsCollector } from "../services/metrics.service.js";

interface TenantQuotaEntry {
  requestsInWindow: number;
  tokensConsumedToday: number;
  windowResetAt: number;
  dayResetAt: number;
}

const tenantStore = new Map<string, TenantQuotaEntry>();

// Clean expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of tenantStore.entries()) {
    if (entry.dayResetAt <= now) {
      tenantStore.delete(key);
    }
  }
}, 60 * 1000).unref();

export interface AiTierLimits {
  requestsPerMinute: number;
  tokensPerDay: number;
}

const TIER_LIMITS: Record<string, AiTierLimits> = {
  free: { requestsPerMinute: 10, tokensPerDay: 5000 },
  silver: { requestsPerMinute: 30, tokensPerDay: 30000 },
  pro: { requestsPerMinute: 100, tokensPerDay: 150000 },
  enterprise: { requestsPerMinute: 300, tokensPerDay: 1000000 },
};

/**
 * Enterprise AI Rate Limiter & Token Budget Guard (VULN-05 Mitigation)
 * Prevents economic Denial-of-Service and runaway billing on Google Gemini API.
 */
export const aiRateLimiter = (estimatedTokensPerCall = 350) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const tenantId = req.tenantId || req.user?.tenantId || `anon_${clientIp.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const userTier = req.user?.subscriptionTier || (req as any).subscriptionTier || "pro";
    const limits = TIER_LIMITS[userTier] || TIER_LIMITS.pro;

    const now = Date.now();
    let entry = tenantStore.get(tenantId);

    if (!entry) {
      entry = {
        requestsInWindow: 0,
        tokensConsumedToday: 0,
        windowResetAt: now + 60 * 1000,
        dayResetAt: now + 24 * 3600 * 1000,
      };
      tenantStore.set(tenantId, entry);
    }

    // Reset sliding minute window if passed
    if (entry.windowResetAt <= now) {
      entry.requestsInWindow = 0;
      entry.windowResetAt = now + 60 * 1000;
    }

    // Reset daily token quota if 24 hours passed
    if (entry.dayResetAt <= now) {
      entry.tokensConsumedToday = 0;
      entry.dayResetAt = now + 24 * 3600 * 1000;
    }

    // 1. Check minute rate limit
    if (entry.requestsInWindow >= limits.requestsPerMinute) {
      const retryAfter = Math.ceil((entry.windowResetAt - now) / 1000);
      metricsCollector.recordSecurityEvent("rate_limit_hit");
      res.setHeader("Retry-After", retryAfter);
      res.setHeader("X-RateLimit-Policy", `AI-PerMinute-${userTier}`);
      return res.status(429).json({
        success: false,
        error: {
          code: "AI_RATE_LIMIT_EXCEEDED",
          message: `Quota de requêtes IA dépassé (${limits.requestsPerMinute} req/min pour le tier ${userTier}).`,
          retryAfterSeconds: retryAfter,
        },
      }) as any;
    }

    // 2. Check daily token budget
    if (entry.tokensConsumedToday + estimatedTokensPerCall > limits.tokensPerDay) {
      const hoursUntilReset = Math.ceil((entry.dayResetAt - now) / (3600 * 1000));
      metricsCollector.recordSecurityEvent("rate_limit_hit");
      res.setHeader("X-RateLimit-Policy", `AI-TokenBudget-${userTier}`);
      return res.status(429).json({
        success: false,
        error: {
          code: "AI_TOKEN_BUDGET_EXCEEDED",
          message: `Budget quotidien de tokens IA Gemini atteint (${limits.tokensPerDay} tokens/jour). Réinitialisation dans ${hoursUntilReset}h.`,
          tokensConsumedToday: entry.tokensConsumedToday,
          limit: limits.tokensPerDay,
          tier: userTier,
        },
      }) as any;
    }

    // Increment usage
    entry.requestsInWindow++;
    entry.tokensConsumedToday += estimatedTokensPerCall;

    res.setHeader("X-AI-Tokens-Remaining-Today", Math.max(0, limits.tokensPerDay - entry.tokensConsumedToday));
    res.setHeader("X-AI-Requests-Remaining-Min", Math.max(0, limits.requestsPerMinute - entry.requestsInWindow));

    next();
  };
};
