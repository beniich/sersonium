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

  private static bannedIps = new Map<string, number>(); // ip -> expiresAt timestamp

  private static ATTACK_PATTERNS = {
    SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|TRUNCATE)\b\s+.*?(FROM|INTO|TABLE|DATABASE|WHERE|SET)|--|\/\*|\*\/|;\s*SHUTDOWN|;\s*DROP)/i,
    XSS: /(<script\b[^>]*>([\s\S]*?)<\/script>|javascript:\s*|onload\s*=|onerror\s*=|document\.cookie|window\.location|<iframe\b)/i,
    PATH_TRAVERSAL: /(\.\.\/|\.\.\\)/i,
  };

  /**
   * Vérifie si une IP est actuellement bannie
   */
  static isBanned(ip: string): boolean {
    const expiresAt = this.bannedIps.get(ip);
    if (!expiresAt) return false;
    if (Date.now() > expiresAt) {
      this.bannedIps.delete(ip);
      return false;
    }
    return true;
  }

  /**
   * Bannit une adresse IP pour une durée déterminée (par défaut 3600 secondes)
   */
  static blockIp(ip: string, durationSeconds: number = 3600): void {
    const expiresAt = Date.now() + durationSeconds * 1000;
    this.bannedIps.set(ip, expiresAt);
    metricsCollector.recordSecurityEvent("rate_limit_hit");
    console.log(`🚫 [WAF] IP ${ip} bannie jusqu'à ${new Date(expiresAt).toLocaleTimeString()}`);
  }

  /**
   * Lève le bannissement d'une IP
   */
  static unblockIp(ip: string): void {
    this.bannedIps.delete(ip);
    console.log(`🔓 [WAF] IP ${ip} débannie`);
  }

  /**
   * Inspecte la requête pour détecter des motifs malveillants OWASP
   */
  static inspectRequest(ip: string, path: string, body: any): { isMalicious: boolean; type?: string } {
    if (this.isBanned(ip)) {
      return { isMalicious: true, type: "BANNED_IP" };
    }

    const payload = (typeof body === "object" ? JSON.stringify(body) : String(body || "")) + " " + path;

    for (const [type, pattern] of Object.entries(this.ATTACK_PATTERNS)) {
      if (pattern.test(payload)) {
        metricsCollector.recordSecurityEvent("rate_limit_hit");
        return { isMalicious: true, type };
      }
    }

    return { isMalicious: false };
  }

  /**
   * Récupère la liste des IP actuellement bannies
   */
  static getBannedIps(): Array<{ ip: string; expiresAt: string }> {
    const now = Date.now();
    const result: Array<{ ip: string; expiresAt: string }> = [];
    for (const [ip, exp] of this.bannedIps.entries()) {
      if (exp > now) {
        result.push({ ip, expiresAt: new Date(exp).toISOString() });
      } else {
        this.bannedIps.delete(ip);
      }
    }
    return result;
  }
}
