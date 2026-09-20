import { TenantPrismaClient } from "../db/tenantPrisma.js";
import { metricsCollector } from "./metrics.service.js";

export class WafService {
  /**
   * Enregistre un événement de sécurité WAF / Rate Limit
   */
  static async recordEvent(
    tenantPrisma: TenantPrismaClient,
    data: {
      clientIp: string;
      threatType: string;
      ruleId: string;
      action: "block" | "challenge" | "log";
      blocked?: boolean;
    }
  ) {
    metricsCollector.recordSecurityEvent("rate_limit_hit");

    return tenantPrisma.wafSecurityEvent.create({
      data: {
        clientIp: data.clientIp,
        threatType: data.threatType,
        ruleId: data.ruleId,
        action: data.action,
        blocked: data.blocked !== undefined ? data.blocked : true
      } as any
    });
  }

  /**
   * Récupère les derniers événements de sécurité WAF
   */
  static async getEvents(tenantPrisma: TenantPrismaClient, limit: number = 50) {
    return tenantPrisma.wafSecurityEvent.findMany({
      orderBy: { timestamp: "desc" },
      take: limit
    });
  }
}
