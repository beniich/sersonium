import { TenantPrismaClient } from "../db/tenantPrisma.js";
import { metricsCollector } from "./metrics.service.js";

// ─── Threat Intelligence Partagée (inter-tenants, en mémoire) ────────────────
// Si une IP attaque le tenant A, elle est pré-marquée pour tous les tenants.
interface ThreatEntry {
  score: number;         // 0-100 : score de menace cumulatif
  eventCount: number;    // Nombre d'événements hostiles
  firstSeenAt: number;   // Timestamp première détection
  lastSeenAt: number;    // Timestamp dernier événement
  bannedUntil?: number;  // Timestamp expiration du ban adaptatif
  reasons: string[];     // Historique des types d'attaque
}

const globalThreatMap = new Map<string, ThreatEntry>(); // ip -> ThreatEntry

// Nettoyage automatique toutes les heures (entrées inactives > 24h)
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [ip, entry] of globalThreatMap.entries()) {
    if (entry.lastSeenAt < cutoff && (!entry.bannedUntil || entry.bannedUntil < Date.now())) {
      globalThreatMap.delete(ip);
    }
  }
}, 60 * 60 * 1000);

export class WafService {
  /**
   * Récupère la liste des événements WAF récents pour le tenant courant
   */
  static async getEvents(tenantPrisma: TenantPrismaClient, limit: number = 50) {
    return tenantPrisma.wafSecurityEvent.findMany({
      take: Math.min(limit, 200),
      orderBy: { timestamp: "desc" }
    });
  }

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

    // Mise à jour du score de menace global pour cette IP
    const threatEntry = this.updateThreatScore(data.clientIp, data.threatType);

    // Diffusion temps réel SSE à l'ensemble du cockpit
    import("./sse.service.js").then(({ SseService }) => {
      SseService.broadcastSecurityEvent({
        clientIp: data.clientIp,
        threatType: data.threatType,
        ruleId: data.ruleId,
        action: data.action,
        threatScore: threatEntry.score,
        banned: !!threatEntry.bannedUntil
      });
    }).catch(() => {});

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

  // ─── Score de Menace Dynamique ─────────────────────────────────────────────

  private static readonly THREAT_WEIGHTS: Record<string, number> = {
    SQL_INJECTION:   35,
    XSS:             30,
    PATH_TRAVERSAL:  25,
    BRUTE_FORCE:     20,
    BOT_FINGERPRINT: 15,
    RATE_LIMIT:      10,
    BANNED_IP:        5,
  };

  /**
   * Met à jour le score de menace d'une IP.
   * Accepte soit un code de menace OWASP (ex: 'SQL_INJECTION'), soit des points directs avec raison.
   * Auto-ban de 15 minutes si score >= 80.
   */
  static updateThreatScore(ip: string, threatTypeOrPoints: string | number, customReason?: string): ThreatEntry {
    const isPoints = typeof threatTypeOrPoints === "number";
    const weight = isPoints ? threatTypeOrPoints : (this.THREAT_WEIGHTS[threatTypeOrPoints] ?? 10);
    const reasonTag = isPoints ? (customReason || `CUSTOM_${weight}_PTS`) : threatTypeOrPoints;
    const now = Date.now();

    const existing = globalThreatMap.get(ip);
    if (existing) {
      existing.score = Math.min(100, existing.score + weight);
      existing.eventCount++;
      existing.lastSeenAt = now;
      if (!existing.reasons.includes(reasonTag)) existing.reasons.push(reasonTag);

      // Auto-ban adaptatif 15min si score dépasse 80
      if (existing.score >= 80 && (!existing.bannedUntil || existing.bannedUntil < now)) {
        existing.bannedUntil = now + 15 * 60 * 1000;
        console.warn(`🚫 [WAF Adaptatif] Auto-ban 15min: IP ${ip} (score=${existing.score}, raisons=${existing.reasons.join(",")})`);
      }

      globalThreatMap.set(ip, existing);
      return existing;
    }

    const entry: ThreatEntry = {
      score: Math.min(100, weight),
      eventCount: 1,
      firstSeenAt: now,
      lastSeenAt: now,
      reasons: [reasonTag],
      bannedUntil: weight >= 80 ? now + 15 * 60 * 1000 : undefined
    };
    if (entry.bannedUntil) {
      console.warn(`🚫 [WAF Adaptatif] Auto-ban 15min immédiat: IP ${ip} (score=${entry.score})`);
    }
    globalThreatMap.set(ip, entry);
    return entry;
  }

  /** Retourne le score de menace actuel d'une IP (0 si inconnue) */
  static getThreatScore(ip: string): number {
    return globalThreatMap.get(ip)?.score ?? 0;
  }

  /** Retourne la vue complète de la Threat Intelligence pour le dashboard */
  static getThreatIntelligence(): Array<ThreatEntry & { ip: string }> {
    return [...globalThreatMap.entries()]
      .map(([ip, entry]) => ({ ip, ...entry }))
      .sort((a, b) => b.score - a.score);
  }

  // ─── Ban / Unban ───────────────────────────────────────────────────────────

  private static bannedIps = new Map<string, number>(); // ip -> expiresAt timestamp

  private static ATTACK_PATTERNS = {
    SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|TRUNCATE)\b\s+.*?(FROM|INTO|TABLE|DATABASE|WHERE|SET)|--|\/\*|\*\/|;\s*SHUTDOWN|;\s*DROP)/i,
    XSS: /(<script\b[^>]*>([\s\S]*?)<\/script>|javascript:\s*|onload\s*=|onerror\s*=|document\.cookie|window\.location|<iframe\b)/i,
    PATH_TRAVERSAL: /(\.\.\/|\.\.\\)/i,
  };

  /**
   * Vérifie si une IP est bannie (legacy + Threat Intelligence adaptatif)
   */
  static isBanned(ip: string): boolean {
    const legacyExp = this.bannedIps.get(ip);
    if (legacyExp) {
      if (Date.now() > legacyExp) {
        this.bannedIps.delete(ip);
      } else {
        return true;
      }
    }
    const entry = globalThreatMap.get(ip);
    return !!(entry?.bannedUntil && entry.bannedUntil > Date.now());
  }

  /**
   * Alias de compatibilité pour isBanned
   */
  static isIpBanned(ip: string): boolean {
    return this.isBanned(ip);
  }

  /**
   * Bannit une adresse IP pour une durée déterminée (par défaut 3600 secondes)
   */
  static blockIp(ip: string, durationSeconds: number = 3600): void {
    const expiresAt = Date.now() + durationSeconds * 1000;
    this.bannedIps.set(ip, expiresAt);
    this.updateThreatScore(ip, "BANNED_IP");
    metricsCollector.recordSecurityEvent("rate_limit_hit");
    console.log(`🚫 [WAF] IP ${ip} bannie jusqu'à ${new Date(expiresAt).toLocaleTimeString()}`);
  }

  /**
   * Lève le bannissement d'une IP
   */
  static unblockIp(ip: string): void {
    this.bannedIps.delete(ip);
    const entry = globalThreatMap.get(ip);
    if (entry) {
      entry.bannedUntil = undefined;
      entry.score = Math.max(0, entry.score - 50);
      globalThreatMap.set(ip, entry);
    }
    console.log(`🔓 [WAF] IP ${ip} débannie`);
  }

  /**
   * Inspecte la requête pour détecter des motifs malveillants OWASP + bots
   */
  static inspectRequest(ip: string, path: string, body: any, headers?: Record<string, string | string[] | undefined>): {
    isMalicious: boolean;
    type?: string;
    threatScore?: number;
  } {
    if (this.isBanned(ip)) {
      return { isMalicious: true, type: "BANNED_IP", threatScore: this.getThreatScore(ip) };
    }

    const payload = (typeof body === "object" ? JSON.stringify(body) : String(body || "")) + " " + path;

    for (const [type, pattern] of Object.entries(this.ATTACK_PATTERNS)) {
      if (pattern.test(payload)) {
        metricsCollector.recordSecurityEvent("rate_limit_hit");
        const entry = this.updateThreatScore(ip, type);
        return { isMalicious: true, type, threatScore: entry.score };
      }
    }

    // Détection de bots via fingerprinting des headers HTTP
    if (headers) {
      const ua = String(headers["user-agent"] || "").toLowerCase();
      const isBot = /^(curl|wget|python|go-http|scrapy|bot|crawler|spider|headless)/i.test(ua);
      const missingAccept = !headers["accept"];
      const missingLang = !headers["accept-language"];
      if (isBot || (missingAccept && missingLang && path.includes("/api/"))) {
        const entry = this.updateThreatScore(ip, "BOT_FINGERPRINT");
        if (entry.score >= 80) {
          return { isMalicious: true, type: "BOT_FINGERPRINT", threatScore: entry.score };
        }
      }
    }

    return { isMalicious: false, threatScore: this.getThreatScore(ip) };
  }

  /**
   * Récupère la liste des IP bannies (legacy + adaptatif)
   */
  static getBannedIps(): Array<{ ip: string; expiresAt: string; score: number; reasons: string[] }> {
    const now = Date.now();
    const result: Array<{ ip: string; expiresAt: string; score: number; reasons: string[] }> = [];

    for (const [ip, exp] of this.bannedIps.entries()) {
      if (exp > now) {
        const entry = globalThreatMap.get(ip);
        result.push({ ip, expiresAt: new Date(exp).toISOString(), score: entry?.score ?? 0, reasons: entry?.reasons ?? [] });
      } else {
        this.bannedIps.delete(ip);
      }
    }

    for (const [ip, entry] of globalThreatMap.entries()) {
      if (entry.bannedUntil && entry.bannedUntil > now && !this.bannedIps.has(ip)) {
        result.push({ ip, expiresAt: new Date(entry.bannedUntil).toISOString(), score: entry.score, reasons: entry.reasons });
      }
    }

    return result;
  }
}


