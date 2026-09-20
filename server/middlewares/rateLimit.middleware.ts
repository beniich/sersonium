import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { metricsCollector } from "../services/metrics.service.js";
import { WafService } from "../services/waf.service.js";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory high performance store with sliding reset
const memoryStore = new Map<string, RateLimitEntry>();

// Clean expired entries regularly
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 30 * 1000).unref();

export interface RateLimiterOptions {
  maxRequests: number;
  windowSeconds: number;
  tierMultiplier?: boolean; // If true, authenticated tenants/admins get higher quotas
  endpointName?: string;
}

/**
 * Enterprise Adaptive Rate Limiter Middleware
 * Features:
 * - Differentiates anonymous vs authenticated tenant calls
 * - Standard IETF RateLimit headers
 * - Auto-blocks abusive IPs via WAF service
 */
export const createRateLimiter = (options: RateLimiterOptions) => {
  const { maxRequests, windowSeconds, tierMultiplier = true, endpointName = "api" } = options;

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    
    // Determine user tier & key
    let limit = maxRequests;
    let identifier = `ip:${clientIp}`;

    if (req.user?.userId) {
      identifier = `user:${req.user.userId}`;
      if (tierMultiplier) {
        // Boost quotas for enterprise accounts / admins
        if (req.user.role === "admin") {
          limit = maxRequests * 5;
        } else if (req.user.role === "operator" || req.user.role === "technician") {
          limit = maxRequests * 2;
        }
      }
    } else if (req.tenantId) {
      identifier = `tenant:${req.tenantId}`;
      if (tierMultiplier) {
        limit = maxRequests * 3;
      }
    }

    const key = `rl:${endpointName}:${identifier}`;
    const now = Date.now();

    let record = memoryStore.get(key);

    if (!record || record.resetAt <= now) {
      record = {
        count: 1,
        resetAt: now + windowSeconds * 1000
      };
      memoryStore.set(key, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, limit - record.count);
    const resetTimeSeconds = Math.ceil((record.resetAt - now) / 1000);

    // Standard IETF & Custom Headers
    res.setHeader("RateLimit-Limit", limit);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", resetTimeSeconds);
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetTimeSeconds);

    if (record.count > limit) {
      metricsCollector.recordSecurityEvent("rate_limit_hit");

      // Record WAF incident if client repeatedly breaches threshold
      if (req.tenantPrisma && record.count > limit * 1.5) {
        WafService.recordEvent(req.tenantPrisma, {
          clientIp,
          threatType: "rate_limit_exceeded",
          ruleId: "WAF_RL_DOS_PROTECT",
          action: "block",
          blocked: true
        }).catch(() => {});
      }

      res.setHeader("Retry-After", resetTimeSeconds);
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Quota d'appels API dépassé (${limit} req / ${windowSeconds}s). Veuillez ralentir.`,
          retryAfterSeconds: resetTimeSeconds,
          policy: endpointName
        }
      });
      return;
    }

    next();
  };
};

/**
 * Predefined Rate Limiters for various security zones
 */
export const apiRateLimiter = createRateLimiter({ 
  maxRequests: 120, 
  windowSeconds: 60, 
  endpointName: "general_api" 
});

export const strictRateLimiter = createRateLimiter({ 
  maxRequests: 10, 
  windowSeconds: 60, 
  tierMultiplier: false,
  endpointName: "auth_strict" 
});

export const telemetryRateLimiter = createRateLimiter({ 
  maxRequests: 300, 
  windowSeconds: 60, 
  endpointName: "telemetry_ingestion" 
});
