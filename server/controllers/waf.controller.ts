import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { WafService } from "../services/waf.service.js";

/**
 * Contrôleur WAF & Sécurité (Sprint 3: Security)
 */
export const getWafEvents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const events = await WafService.getEvents(tenantPrisma, limit);

    res.status(200).json({
      success: true,
      data: events,
      meta: {
        tenantId: req.tenantId,
        count: events.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "WAF_EVENTS_FETCH_FAILED", message: error.message }
    });
  }
};

export const simulateSecurityChallenge = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tenantPrisma = req.tenantPrisma!;
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "127.0.0.1";
    const { threatType, ruleId } = req.body;

    const event = await WafService.recordEvent(tenantPrisma, {
      clientIp,
      threatType: threatType || "bot_heuristic_detected",
      ruleId: ruleId || "WAF_CUSTOM_01",
      action: "block",
      blocked: true
    });

    res.status(200).json({
      success: true,
      message: "Menace interceptée et bloquée par le pare-feu applicatif WAF.",
      data: event,
      meta: { tenantId: req.tenantId }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "SECURITY_INTERCEPTION_FAILED", message: error.message }
    });
  }
};
