import { TenantPrismaClient } from "../db/tenantPrisma.js";

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
}
