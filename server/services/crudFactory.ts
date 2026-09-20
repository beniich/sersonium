import { TenantPrismaClient } from "../db/tenantPrisma.js";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  where?: Record<string, any>;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Fabrique générique de services CRUD multi-tenant (Clean Architecture)
 * S'appuie sur le client étendu `tenantPrisma` pour garantir l'étanchéité des requêtes.
 */
export function createCrudService<TModelName extends "carbonEmission" | "infrastructureAsset" | "user" | "auditLog">(
  modelName: TModelName
) {
  return {
    /**
     * Recherche paginée avec filtres et tri
     */
    async findAll<T = any>(
      tenantPrisma: TenantPrismaClient,
      options: PaginationOptions = {}
    ): Promise<PaginatedResult<T>> {
      const page = Math.max(1, Number(options.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
      const skip = (page - 1) * limit;

      const modelDelegate = (tenantPrisma as any)[modelName];

      const whereClause = options.where || {};
      const orderByClause = options.sortBy
        ? { [options.sortBy]: options.sortOrder || "desc" }
        : { createdAt: "desc" };

      const [total, items] = await Promise.all([
        modelDelegate.count({ where: whereClause }),
        modelDelegate.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: orderByClause
        })
      ]);

      return {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1
        }
      };
    },

    /**
     * Récupération d'un élément unique par ID (avec garantie d'appartenance au tenant actif)
     */
    async findById<T = any>(
      tenantPrisma: TenantPrismaClient,
      id: string
    ): Promise<T | null> {
      const modelDelegate = (tenantPrisma as any)[modelName];
      return modelDelegate.findFirst({
        where: { id }
      });
    },

    /**
     * Création d'une nouvelle entité (le tenantId est automatiquement injecté par l'extension)
     */
    async create<T = any>(
      tenantPrisma: TenantPrismaClient,
      data: any
    ): Promise<T> {
      const modelDelegate = (tenantPrisma as any)[modelName];
      return modelDelegate.create({
        data
      });
    },

    /**
     * Mise à jour d'une entité existante
     */
    async update<T = any>(
      tenantPrisma: TenantPrismaClient,
      id: string,
      data: any
    ): Promise<T | null> {
      const modelDelegate = (tenantPrisma as any)[modelName];

      // Vérifier d'abord si l'élément existe dans ce tenant
      const existing = await modelDelegate.findFirst({ where: { id } });
      if (!existing) {
        return null;
      }

      return modelDelegate.update({
        where: { id },
        data
      });
    },

    /**
     * Suppression d'une entité du tenant actif
     */
    async delete(
      tenantPrisma: TenantPrismaClient,
      id: string
    ): Promise<boolean> {
      const modelDelegate = (tenantPrisma as any)[modelName];

      // L'extension Prisma applique where: { id, tenantId }
      const deleteResult = await modelDelegate.deleteMany({
        where: { id }
      });

      return deleteResult.count > 0;
    }
  };
}
