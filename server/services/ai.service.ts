import { GoogleGenAI } from "@google/genai";
import { TenantPrismaClient } from "../db/tenantPrisma.js";
import { BillingService } from "./billing.service.js";
import { AuditService } from "./audit.service.js";

// ─── Circuit Breaker Pattern pour Résilience Google Gemini ───────────────────
interface CircuitBreakerOptions {
  failureThreshold?: number; // Nombre consécutif d'échecs avant ouverture
  resetTimeoutMs?: number;   // Délai avant passage en HALF-OPEN
  timeoutMs?: number;        // Timeout par requête
}

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

class AICircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly timeoutMs: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 3;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 30000;
    this.timeoutMs = options.timeoutMs ?? 5000;
  }

  async execute<T>(action: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
    const now = Date.now();

    // Vérifier si le circuit doit passer de OPEN à HALF_OPEN
    if (this.state === "OPEN") {
      if (now - this.lastFailureTime > this.resetTimeoutMs) {
        console.warn("[AICircuitBreaker] ⏱️ Reset timeout écoulé -> Passage en HALF_OPEN (Test de sonde API)");
        this.state = "HALF_OPEN";
      } else {
        console.warn("[AICircuitBreaker] ⚡ Circuit OPEN (API Gemini protégée). Exécution immédiate du fallback heuristique.");
        return fallback();
      }
    }

    try {
      // Exécution avec timeout strict de 5000ms
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI_CALL_TIMEOUT: Timeout 5000ms dépassé sur l'inférence")), this.timeoutMs)
      );
      const result = await Promise.race([action(), timeoutPromise]);

      // Si succès en HALF_OPEN, fermer le circuit
      if (this.state === "HALF_OPEN") {
        console.log("[AICircuitBreaker] ✅ Sonde réussie -> Circuit refermé (CLOSED)");
      }
      this.state = "CLOSED";
      this.failureCount = 0;
      return result;
    } catch (err: any) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.state === "HALF_OPEN" || this.failureCount >= this.failureThreshold) {
        this.state = "OPEN";
        console.error(`[AICircuitBreaker] 🚨 Seuil d'échecs atteint (${this.failureCount}/${this.failureThreshold}). Circuit basculé en OPEN.`);
      } else {
        console.warn(`[AICircuitBreaker] ⚠️ Échec d'appel IA (${this.failureCount}/${this.failureThreshold}):`, err?.message || err);
      }

      return fallback();
    }
  }

  getState(): { state: CircuitState; failureCount: number; lastFailureTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }

  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = 0;
    console.log("[AICircuitBreaker] 🔄 Circuit breaker Gemini manuellement réinitialisé en CLOSED.");
  }
}

const geminiCircuitBreaker = new AICircuitBreaker({
  failureThreshold: 3,
  resetTimeoutMs: 30000,
  timeoutMs: 5000
});

export class AIService {
  private static getAiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Retourne l'état actuel du Circuit Breaker pour l'observabilité
   */
  static getCircuitStatus() {
    return geminiCircuitBreaker.getState();
  }

  /**
   * Réinitialise manuellement le Circuit Breaker vers l'état CLOSED (Opération SRE / Cockpit)
   */
  static resetCircuit(): { state: CircuitState; message: string } {
    geminiCircuitBreaker.reset();
    return {
      state: "CLOSED",
      message: "Circuit Breaker Gemini réinitialisé avec succès en état opérationnel (CLOSED)."
    };
  }

  /**
   * Moteur d'analyse déterministe réelle des logs d'infrastructure (Fallback Circuit Breaker).
   * Analyse exhaustive des patterns d'erreur, seuils PUE et dérives thermiques sans hallucination.
   */
  static runDeterministicLogChecks(logs: string, context?: string): {
    severity: "CRITICAL" | "WARNING" | "OK";
    summary: string;
    rootCause: string;
    action: string;
  } {
    const lower = (logs + " " + (context || "")).toLowerCase();

    const criticalPatterns = [
      { pattern: /overtemp|overheating|surchauffe/i, reason: "Dépassement de seuil thermique critique détecté sur baie serveur/CVC." },
      { pattern: /kernel panic|segfault|hardware error/i, reason: "Défaillance matérielle bas niveau sur un nœud d'infrastructure." },
      { pattern: /unauthorized|brute[- ]?force|sql injection|attack/i, reason: "Tentative d'intrusion ou violation de politique WAF/Sécurité." },
      { pattern: /pue\s*[>:=]\s*([2-9]|\d{2})/i, reason: "Dérive anormale du PUE supérieure au seuil d'efficacité opérationnelle (PUE > 2.0)." }
    ];

    for (const item of criticalPatterns) {
      if (item.pattern.test(lower)) {
        return {
          severity: "CRITICAL",
          summary: `[Fallback Déterministe SRE] Alerte critique active : ${item.reason}`,
          rootCause: item.reason,
          action: "Déclencher l'isolement du nœud, basculer le trafic vers le cluster secondaire et contacter l'astreinte N2."
        };
      }
    }

    const warningPatterns = [
      { pattern: /warning|timeout|retry|slow query/i, reason: "Latence anormale ou micro-coupures de synchronisation réseau." },
      { pattern: /high load|cpu throttling|memory pressure/i, reason: "Saturation progressive des ressources système du nœud edge." },
      { pattern: /co2\s*spike|emission/i, reason: "Hausse inhabituelle de l'empreinte carbone instantanée." }
    ];

    for (const item of warningPatterns) {
      if (item.pattern.test(lower)) {
        return {
          severity: "WARNING",
          summary: `[Fallback Déterministe SRE] Avertissement opérationnel : ${item.reason}`,
          rootCause: item.reason,
          action: "Activer le rate-limiting adaptatif et consigner les métriques dans l'AuditLog."
        };
      }
    }

    return {
      severity: "OK",
      summary: "[Fallback Déterministe SRE] Contrôle déterministe validé : Aucun pattern d'anomalie critique identifié dans les logs.",
      rootCause: "Fonctionnement dans les tolérances nominales.",
      action: "Poursuivre la télémétrie continue."
    };
  }

  /**
   * Diagnostic déterministe réel pour la télémétrie des bâtiments et CVC
   */
  static runDeterministicBuildingChecks(telemetry: any[]): {
    status: "OK" | "WARNING" | "CRITICAL";
    diagnostic: string;
    recommendation: string;
    energySaving: number;
  } {
    if (!Array.isArray(telemetry) || telemetry.length === 0) {
      return {
        status: "OK",
        diagnostic: "Télémétrie CVC insuffisante pour établir une corrélation, valeurs nominales présumées.",
        recommendation: "Vérifier la connectivité des sondes LoRaWAN/BACnet.",
        energySaving: 0
      };
    }

    let maxTemp = -Infinity;
    let maxVibration = -Infinity;
    let highPowerCount = 0;

    for (const t of telemetry) {
      if (typeof t.temperatureC === "number" && t.temperatureC > maxTemp) maxTemp = t.temperatureC;
      if (typeof t.vibrationMmS === "number" && t.vibrationMmS > maxVibration) maxVibration = t.vibrationMmS;
      if (typeof t.powerKw === "number" && t.powerKw > 80) highPowerCount++;
    }

    if (maxTemp > 45 || maxVibration > 4.5) {
      return {
        status: "CRITICAL",
        diagnostic: `Seuils de rupture atteints : Température max ${maxTemp}°C ou vibration anormale ${maxVibration} mm/s.`,
        recommendation: "Arrêt d'urgence de la ligne CVC concernée et inspection du compresseur.",
        energySaving: 1200
      };
    }

    if (maxTemp > 30 || maxVibration > 2.0 || highPowerCount > 0) {
      return {
        status: "WARNING",
        diagnostic: `Dérive modérée : Température crête de ${maxTemp > -Infinity ? maxTemp + "°C" : "N/A"} et pic de consommation identifié.`,
        recommendation: "Purger l'échangeur, vérifier la tension des courroies et équilibrer les débits.",
        energySaving: 450
      };
    }

    return {
      status: "OK",
      diagnostic: "Paramètres thermodynamiques nominaux vérifiés par contrôle déterministe.",
      recommendation: "Maintien de la programmation horaire standard.",
      energySaving: 150
    };
  }

  /**
   * Analyse des logs d'infrastructure et détection d'anomalies via Gemini
   * Protégé par Circuit Breaker et bascule déterministe automatique.
   */
  static async analyzeLogs(
    tenantPrisma: TenantPrismaClient,
    userId: string,
    logs: string,
    tokenCost: number = 15,
    context?: string
  ) {
    // 1. Déduction transactionnelle des jetons de l'utilisateur
    const billingResult = await BillingService.consumeTokens(
      tenantPrisma,
      userId,
      tokenCost,
      "AI_GEMINI_LOG_ANALYSIS"
    );

    let analysisReport: string;

    const ai = this.getAiClient();
    if (ai) {
      const prompt = `Tu es l'ingénieur IA Principal SRE et Datacenter CAFM de la plateforme SENSORIUM.
Analyse les logs d'infrastructure et de télémétrie suivants :
${context ? `Contexte opérationnel : ${context}\n` : ""}
Logs bruts :
"""
${logs}
"""

Fournis un diagnostic technique concis et structuré :
1. Détection d'anomalies (thermique, saturation réseau, tentative d'intrusion ou pic PUE)
2. Cause racine probable (Root Cause)
3. Action corrective immédiate recommandée (Remediation)
4. Score d'urgence (Faible, Moyen, Critique)`;

      analysisReport = await geminiCircuitBreaker.execute(
        async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt
          });
          return response.text || "Analyse complétée : aucun rapport textuel renvoyé.";
        },
        () => {
          const checks = AIService.runDeterministicLogChecks(logs, context);
          return `[Mode Secours Circuit-Breaker / Diagnostic Déterministe Vérifié]
1. Détection d'anomalies : ${checks.summary}
2. Cause racine identifiée : ${checks.rootCause}
3. Action corrective recommandée : ${checks.action}
4. Score d'urgence : ${checks.severity === "CRITICAL" ? "Critique" : checks.severity === "WARNING" ? "Moyen" : "Faible"} (Contrôle déterministe actif, IA indisponible).`;
        }
      );
    } else {
      const checks = AIService.runDeterministicLogChecks(logs, context);
      analysisReport = `[Mode Déterministe SRE — Clé IA non configurée]
1. Analyse : ${checks.summary}
2. Cause racine : ${checks.rootCause}
3. Action recommandée : ${checks.action}
4. Score d'urgence : ${checks.severity === "CRITICAL" ? "Critique" : checks.severity === "WARNING" ? "Moyen" : "Faible"}`;
    }

    // Audit de l'opération
    AuditService.logEvent(tenantPrisma, userId, {
      action: "AI_LOGS_ANALYZED",
      resource: "Compute/Gemini",
      details: {
        tokenCost,
        remainingTokens: billingResult.remainingTokens,
        logLength: logs.length
      }
    }).catch(() => {});

    return {
      report: analysisReport,
      tokenUsage: {
        consumed: tokenCost,
        remainingTokens: billingResult.remainingTokens
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyse la télémétrie IoT d'un bâtiment pour générer un diagnostic de maintenance prédictive
   */
  static async analyzeBuildingHealth(tenantId: string, buildingId: string, telemetry: any[]) {
    const ai = this.getAiClient();

    const prompt = `Tu es l'expert IA de SENSORIUM, spécialisé en efficacité énergétique et maintenance CVC.
Analyse les données suivantes du bâtiment ${buildingId} : ${JSON.stringify(telemetry)}.

Tâches :
1. Identifie toute anomalie (ex: consommation électrique anormale la nuit ou dérive thermique).
2. Prédit la panne probable (ex: "Le moteur de la pompe P01 montre des signes de cavitation").
3. Donne une recommandation prescriptive (ex: "Remplacer le joint d'étanchéité secteur B").
4. Estime l'économie d'énergie possible en kWh.

Réponds au format JSON strict :
{ "status": "OK" | "WARNING" | "CRITICAL", "diagnostic": "...", "recommendation": "...", "energySaving": 0 }`;

    let jsonResponse: {
      status: "OK" | "WARNING" | "CRITICAL";
      diagnostic: string;
      recommendation: string;
      energySaving: number;
    } = AIService.runDeterministicBuildingChecks(telemetry);

    if (ai) {
      jsonResponse = await geminiCircuitBreaker.execute(
        async () => {
          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });
          if (response.text) {
            return JSON.parse(response.text);
          }
          return jsonResponse;
        },
        () => {
          const deterministic = AIService.runDeterministicBuildingChecks(telemetry);
          return {
            status: deterministic.status,
            diagnostic: `[Mode Secours Circuit Breaker Déterministe] ${deterministic.diagnostic}`,
            recommendation: deterministic.recommendation,
            energySaving: deterministic.energySaving
          };
        }
      );
    }

    if (jsonResponse.status === "CRITICAL") {
      console.log(`🚨 [AI CRITICAL ALERT] pour ${tenantId} sur ${buildingId}: ${jsonResponse.diagnostic}`);
    }

    return jsonResponse;
  }
}
