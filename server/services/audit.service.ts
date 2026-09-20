import { rawPrisma } from "../db/prisma.js";
import { TenantPrismaClient } from "../db/tenantPrisma.js";

export interface AuditEventInput {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export class AuditService {
  /**
   * Enregistre un événement audité au sein de la base de données (isolé par tenant)
   */
  static async logEvent(
    tenantPrisma: TenantPrismaClient,
    userId: string | undefined,
    data: AuditEventInput
  ) {
    try {
      return await tenantPrisma.auditLog.create({
        data: {
          userId: userId || null,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId || null,
          details: data.details ? JSON.stringify(data.details) : null,
          ipAddress: data.ipAddress || null
        } as any
      });
    } catch (err) {
      console.error("[AuditService] Erreur lors de l'enregistrement de l'audit:", err);
      return null;
    }
  }

  /**
   * Récupère l'historique des audits pour le tenant actif
   */
  static async getTenantAuditLogs(
    tenantPrisma: TenantPrismaClient,
    options: { limit?: number; page?: number } = {}
  ) {
    const limit = Math.min(100, options.limit || 30);
    const page = Math.max(1, options.page || 1);
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      tenantPrisma.auditLog.count(),
      tenantPrisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
    ]);

    return {
      items: logs.map(l => ({
        ...l,
        parsedDetails: l.details ? JSON.parse(l.details) : null
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * Récupère tous les audits de la plateforme (Réservé au super-admin global)
   */
  static async getGlobalAuditLogs(limit: number = 50) {
    return rawPrisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        organization: {
          select: { id: true, name: true, slug: true }
        }
      }
    });
  }
}
