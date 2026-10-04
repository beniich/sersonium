import crypto from "crypto";
import { TenantPrismaClient } from "../db/tenantPrisma.js";

// ─── Pilier 1: RBAC — Définition des rôles Zero-Trust ─────────────────────────
/**
 * Enum UserRole aligné sur les RoleType de server/types/auth.ts.
 * Les valeurs de chaîne correspondent exactement aux rôles JWT existants
 * pour une compatibilité totale avec auth.middleware.ts et verifyAccessToken().
 */
export enum UserRole {
  SUPER_ADMIN  = "admin",       // Accès total
  TENANT_ADMIN = "admin",       // Alias admin niveau tenant
  OPERATOR     = "operator",    // Maintenance et alertes
  AUDITOR      = "auditor",     // Lecture seule ESG / Carbone
  TECHNICIAN   = "technician",  // Exécution des ordres de travail
  VIEWER       = "viewer",      // Lecture seule basique
}

/**
 * Contexte de sécurité enrichi, injecté dans req.user par secureRoute()
 */
export interface SecurityContext {
  userId: string;
  tenantId: string;
  role: UserRole;
  deviceId?: string;
  email?: string;
}

export interface AccessEvaluationResult {
  allowed: boolean;
  reason: string;
  matchedPolicy?: any;
  resourceId: string;
  action: string;
  userId: string;
}

export class ZeroTrustService {
  /**
   * Valide si l'utilisateur a le droit d'accéder à une ressource spécifique (Pattern Blueprint)
   */
  static async validateAccess(
    tenantPrisma: TenantPrismaClient,
    userId: string,
    resourceId: string,
    action: string = "read"
  ): Promise<boolean> {
    const result = await this.evaluateAccess(tenantPrisma, { userId, resourceId, action });
    if (!result.allowed) {
      const err: any = new Error(`Accès refusé : Politique Zero Trust (${result.reason})`);
      err.statusCode = 403;
      err.code = "ZERO_TRUST_ACCESS_DENIED";
      throw err;
    }
    return true;
  }

  /**
   * Évalue contextuellement une demande d'accès Zero Trust
   * Gère les wildcards resourceId: "*" et action: "*"
   */
  static async evaluateAccess(
    tenantPrisma: TenantPrismaClient,
    params: { userId: string; resourceId: string; action: string }
  ): Promise<AccessEvaluationResult> {
    const { userId, resourceId, action } = params;

    // Chercher les politiques explicites pour cet utilisateur ou pour toute l'organisation (userId: null)
    const policies = await tenantPrisma.accessPolicy.findMany({
      where: {
        OR: [
          { userId },
          { userId: null }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    if (policies.length === 0) {
      // Par défaut dans une architecture Zero Trust stricte : refus par défaut (Default Deny)
      // sauf si super-admin organisationnel
      return {
        allowed: false,
        reason: "Aucune politique d'accès explicite trouvée (Default Deny Zero Trust).",
        resourceId,
        action,
        userId
      };
    }

    // Recherche de la politique la plus spécifique
    const matchingPolicy = policies.find(p => {
      const matchResource = p.resourceId === "*" || p.resourceId === resourceId || resourceId.startsWith(p.resourceId);
      const matchAction = p.action === "*" || p.action === action;
      return matchResource && matchAction;
    });

    if (!matchingPolicy) {
      return {
        allowed: false,
        reason: "Aucune règle correspondante pour cette ressource/action spécifique.",
        resourceId,
        action,
        userId
      };
    }

    if (!matchingPolicy.allowed) {
      return {
        allowed: false,
        reason: `Règle d'interdiction explicite : ${matchingPolicy.description || "Accès bloqué"}`,
        matchedPolicy: matchingPolicy,
        resourceId,
        action,
        userId
      };
    }

    return {
      allowed: true,
      reason: `Autorisé par la politique Zero Trust (${matchingPolicy.description || matchingPolicy.id})`,
      matchedPolicy: matchingPolicy,
      resourceId,
      action,
      userId
    };
  }

  /**
   * Récupère toutes les politiques Zero Trust du tenant
   */
  static async getPolicies(tenantPrisma: TenantPrismaClient) {
    return tenantPrisma.accessPolicy.findMany({
      include: {
        user: {
          select: { id: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Crée une nouvelle politique Zero Trust
   */
  static async createPolicy(
    tenantPrisma: TenantPrismaClient,
    data: {
      userId?: string;
      resourceId: string;
      action: string;
      allowed: boolean;
      description?: string;
    }
  ) {
    return tenantPrisma.accessPolicy.create({
      data: {
        userId: data.userId || null,
        resourceId: data.resourceId,
        action: data.action,
        allowed: data.allowed,
        description: data.description || null
      } as any
    });
  }

  /**
   * Supprime une politique Zero Trust
   */
  static async deletePolicy(tenantPrisma: TenantPrismaClient, id: string) {
    return tenantPrisma.accessPolicy.delete({
      where: { id }
    });
  }

  // ─── Pilier 2: RBAC Stateless (sans DB) ─────────────────────────────────────

  /**
   * Contrôle RBAC rapide, sans accès à la base de données.
   * Utilisé par secureRoute() pour une vérification synchrone sur chaque requête.
   *
   * "Never Trust, Always Verify" — chaque requête est vérifiée indépendamment.
   *
   * @param userRole     Rôle courant de l'utilisateur (extrait du JWT par verifyAccessToken)
   * @param allowedRoles Liste des rôles autorisés pour cette opération
   * @throws Error 403 avec code RBAC_INSUFFICIENT_ROLE si le rôle est insuffisant
   */
  static authorize(userRole: string, allowedRoles: string[]): true {
    if (!allowedRoles.includes(userRole)) {
      const err: any = new Error(
        `Access Denied: Your role (${userRole}) is not authorized for this operation.`
      );
      err.statusCode = 403;
      err.code = "RBAC_INSUFFICIENT_ROLE";
      throw err;
    }
    return true;
  }

  // ─── Pilier 3: Validation de nœud Edge (Simulation mTLS) ────────────────────

  /**
   * Vérifie l'empreinte cryptographique d'un capteur ou d'une passerelle IoT.
   * Simulation mTLS : en production, on vérifierait le certificat X.509 client
   * signé par la CA interne de Sensorium.
   *
   * Utilise crypto.timingSafeEqual() pour prévenir les timing attacks.
   *
   * @param nodeId    Identifiant unique du nœud edge (capteur / gateway IoT)
   * @param signature HMAC-SHA256 en hex calculé côté edge sur "<nodeId>:<payload>"
   * @param payload   Données brutes transmises par le nœud
   * @returns true si la signature est cryptographiquement valide
   */
  static validateEdgeNode(nodeId: string, signature: string, payload: string): boolean {
    const edgeSecret = process.env.EDGE_SECRET || "edge_secret_sensorium_iot_dev";
    const expectedSignature = crypto
      .createHmac("sha256", edgeSecret)
      .update(`${nodeId}:${payload}`)
      .digest("hex");

    try {
      // Comparaison en temps constant — résistance aux timing attacks
      const sigBuffer = Buffer.from(signature.padEnd(expectedSignature.length, "0"), "hex");
      const expBuffer = Buffer.from(expectedSignature, "hex");
      return (
        sigBuffer.length === expBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, expBuffer)
      );
    } catch {
      return false;
    }
  }

  // ─── Pilier 4: Chiffrement AES-256-CBC des secrets sensibles ────────────────

  /**
   * Chiffre un secret (clé API, token OAuth, mot de passe) avec AES-256-CBC.
   * Un IV aléatoire de 16 octets est généré pour chaque appel (sécurité sémantique).
   *
   * Format de sortie : "<iv_hex>:<ciphertext_hex>" — stockable en base de données.
   *
   * @param text Texte en clair à chiffrer
   * @returns Chaîne opaque au format iv:data
   */
  static encryptSecret(text: string): string {
    const key = ZeroTrustService._getEncryptionKey();
    const iv  = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let encrypted = cipher.update(text, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  }

  /**
   * Déchiffre un secret préalablement chiffré par encryptSecret().
   *
   * @param encryptedText Chaîne au format "<iv_hex>:<ciphertext_hex>"
   * @returns Texte en clair original
   * @throws Error si le format est invalide ou si ENCRYPTION_KEY est incorrecte
   */
  static decryptSecret(encryptedText: string): string {
    const parts = encryptedText.split(":");
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      throw new Error("ZeroTrust: Invalid encrypted format. Expected '<iv_hex>:<data_hex>'.");
    }
    const [ivHex, dataHex] = parts;

    const key             = ZeroTrustService._getEncryptionKey();
    const iv              = Buffer.from(ivHex, "hex");
    const encryptedBuffer = Buffer.from(dataHex, "hex");
    const decipher        = crypto.createDecipheriv("aes-256-cbc", key, iv);

    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  }

  /**
   * Construit et valide la clé AES-256 (32 bytes) depuis ENCRYPTION_KEY.
   * Fail-fast au démarrage si la variable est absente ou trop courte.
   */
  private static _getEncryptionKey(): Buffer {
    const raw = process.env.ENCRYPTION_KEY;
    if (!raw || raw.length < 32) {
      throw new Error(
        "ZeroTrust Config Error: ENCRYPTION_KEY must be at least 32 characters long. " +
        "Please add it to your .env file: ENCRYPTION_KEY=<32+ char string>"
      );
    }
    return Buffer.from(raw.slice(0, 32));
  }
}
