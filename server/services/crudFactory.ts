import { TenantPrismaClient } from "../db/tenantPrisma.js";
import { AuditService } from "./audit.service.js";

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * Union exhaustive de tous les modèles Prisma soumis à l'isolation tenant.
 * ⚠️  Étendre cette liste à chaque nouveau modèle ajouté dans `tenantPrisma.ts`.
 */
export type TenantModelName =
  // Identité & Accès
  | "user"
  | "accessPolicy"
  | "auditLog"
  // Facturation
  | "invoice"
  // Infrastructure
  | "infrastructureAsset"
  | "assetTelemetry"
  // Carbone & ESG
  | "carbonEmission"
  // Stockage
  | "fileMetadata"
  // Réseau & Sécurité
  | "trafficLog"
  | "wafSecurityEvent"
  // Stratégie & OKR
  | "strategicObjective"
  | "kpi"
  // Conformité & Documents
  | "certification"
  | "permit"
  | "insurance";

export interface PaginationOptions {
  /** Page demandée (1-indexé). Défaut : 1 */
  page?: number;
  /** Nombre d'éléments par page (max 100). Défaut : 20 */
  limit?: number;
  /** Champ de tri. Défaut : createdAt */
  sortBy?: string;
  /** Direction du tri. Défaut : desc */
  sortOrder?: "asc" | "desc";
  /** Filtres Prisma `where` supplémentaires */
  where?: Record<string, any>;
  /** Sélection de champs (projection) */
  select?: Record<string, any>;
  /** Relations à inclure */
  include?: Record<string, any>;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CrudServiceOptions {
  /** Si true, les suppressions deviennent des soft-deletes (champ `deletedAt`) */
  softDelete?: boolean;
  /** Champ utilisé pour le tri par défaut si `createdAt` n'existe pas */
  defaultSortField?: string;
}

// ─── Factory ────────────────────────────────────────────────────────────────

/**
 * `createCrudService` — Usine CRUD Multi-Tenant Générique
 *
 * Génère un service complet de CRUD pour n'importe quel modèle Prisma soumis
 * à l'isolation tenant. La sécurité est garantie à deux niveaux :
 *
 *  1. **Extension Prisma** (`tenantPrisma.ts`) : injecte automatiquement
 *     `where: { tenantId }` sur CHAQUE requête ORM, même si le développeur oublie.
 *
 *  2. **Vérification d'appartenance explicite** : avant tout `update` ou `delete`,
 *     le service fait un `findFirst` pour confirmer que la ressource appartient
 *     bien au tenant actif — garantissant un 404 propre au lieu d'une erreur 500.
 *
 * @example
 * ```typescript
 * // Instanciation pour les équipements infrastructure
 * const assetService = createCrudService("infrastructureAsset");
 * const assetController = createCrudController(assetService, "Équipement");
 *
 * // Instanciation pour les certifications (soft-delete activé)
 * const certService = createCrudService("certification", { softDelete: true });
 * ```
 */
export function createCrudService<TModelName extends TenantModelName>(
  modelName: TModelName,
  options: CrudServiceOptions = {}
) {
  const defaultSortField = options.defaultSortField ?? "createdAt";

  return {
    /**
     * Recherche paginée avec filtres dynamiques et tri configurable.
     * L'isolation tenant est garantie par l'extension Prisma.
     */
    async findAll<T = any>(
      tenantPrisma: TenantPrismaClient,
      opts: PaginationOptions = {}
    ): Promise<PaginatedResult<T>> {
      const page  = Math.max(1, Number(opts.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(opts.limit) || 20));
      const skip  = (page - 1) * limit;

      const model = (tenantPrisma as any)[modelName];

      const whereClause   = opts.where ?? {};
      const orderByClause = opts.sortBy
        ? { [opts.sortBy]: opts.sortOrder ?? "desc" }
        : { [defaultSortField]: "desc" as const };

      const queryArgs: Record<string, any> = {
        where:   whereClause,
        skip,
        take:    limit,
        orderBy: orderByClause,
      };
      if (opts.select)  queryArgs.select  = opts.select;
      if (opts.include) queryArgs.include = opts.include;

      const [total, items] = await Promise.all([
        model.count({ where: whereClause }),
        model.findMany(queryArgs),
      ]);

      return {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages:  Math.ceil(total / limit) || 1,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      };
    },

    /**
     * Récupère un élément unique par ID.
     * L'extension Prisma garantit que `where.tenantId` est toujours injecté.
     * Retourne `null` si l'élément n'existe pas OU n'appartient pas au tenant.
     */
    async findById<T = any>(
      tenantPrisma: TenantPrismaClient,
      id: string,
      opts: Pick<PaginationOptions, "select" | "include"> = {}
    ): Promise<T | null> {
      const model = (tenantPrisma as any)[modelName];
      const args: Record<string, any> = { where: { id } };
      if (opts.select)  args.select  = opts.select;
      if (opts.include) args.include = opts.include;
      return model.findFirst(args);
    },

    /**
     * Crée une nouvelle entité.
     * Le `tenantId` est automatiquement injecté par l'extension Prisma —
     * il n'est donc PAS nécessaire de le passer dans `data`.
     */
    async create<T = any>(
      tenantPrisma: TenantPrismaClient,
      userId: string | undefined,
      data: Record<string, any>,
      reqInfo?: { ipAddress?: string; userAgent?: string }
    ): Promise<T> {
      const model = (tenantPrisma as any)[modelName];
      const record = await model.create({ data });

      // 🔥 Audit automatique de la création
      await AuditService.logEvent(tenantPrisma, userId, {
        action: 'CREATE',
        resource: modelName,
        resourceId: record.id,
        newValue: record,
        ipAddress: reqInfo?.ipAddress,
        userAgent: reqInfo?.userAgent,
      });

      return record;
    },

    /**
     * Met à jour une entité existante.
     * Vérifie d'abord l'appartenance au tenant avant toute modification.
     * Retourne `null` si la ressource n'existe pas ou n'appartient pas au tenant.
     */
    async update<T = any>(
      tenantPrisma: TenantPrismaClient,
      userId: string | undefined,
      id: string,
      data: Record<string, any>,
      reqInfo?: { ipAddress?: string; userAgent?: string }
    ): Promise<T | null> {
      const model = (tenantPrisma as any)[modelName];

      // Double sécurité : findFirst utilise l'extension qui filtre par tenantId
      const existing = await model.findFirst({ where: { id } });
      if (!existing) return null;

      const updatedRecord = await model.update({ where: { id }, data });

      // 🔥 Audit automatique de la modification
      await AuditService.logEvent(tenantPrisma, userId, {
        action: 'UPDATE',
        resource: modelName,
        resourceId: id,
        oldValue: existing,
        newValue: updatedRecord,
        ipAddress: reqInfo?.ipAddress,
        userAgent: reqInfo?.userAgent,
      });

      return updatedRecord;
    },

    /**
     * Supprime une entité (hard ou soft selon les options).
     * Retourne `true` si supprimé, `false` si inexistant ou hors-tenant.
     *
     * Avec `softDelete: true` dans les options : met `deletedAt` à now() au lieu
     * de supprimer la ligne — utile pour l'audit trail et la récupération.
     */
    async delete(
      tenantPrisma: TenantPrismaClient,
      userId: string | undefined,
      id: string,
      reqInfo?: { ipAddress?: string; userAgent?: string }
    ): Promise<boolean> {
      const model = (tenantPrisma as any)[modelName];
      const existing = await model.findFirst({ where: { id } });
      if (!existing) return false;

      if (options.softDelete) {
        const updatedRecord = await model.update({ where: { id }, data: { deletedAt: new Date() } });
        await AuditService.logEvent(tenantPrisma, userId, {
          action: 'SOFT_DELETE',
          resource: modelName,
          resourceId: id,
          oldValue: existing,
          newValue: updatedRecord,
          ipAddress: reqInfo?.ipAddress,
          userAgent: reqInfo?.userAgent,
        });
        return true;
      }

      // deleteMany : l'extension injecte `{ id, tenantId }` dans le where
      const result = await model.deleteMany({ where: { id } });
      if (result.count > 0) {
        await AuditService.logEvent(tenantPrisma, userId, {
          action: 'DELETE',
          resource: modelName,
          resourceId: id,
          oldValue: existing,
          ipAddress: reqInfo?.ipAddress,
          userAgent: reqInfo?.userAgent,
        });
        return true;
      }
      return false;
    },

    /**
     * Compte les entités correspondant aux filtres fournis.
     * Utile pour les tableaux de bord / métriques sans charger les données.
     */
    async count(
      tenantPrisma: TenantPrismaClient,
      where: Record<string, any> = {}
    ): Promise<number> {
      const model = (tenantPrisma as any)[modelName];
      return model.count({ where });
    },

    /**
     * Vérifie si une entité appartenant au tenant actif existe par ID.
     * Plus léger qu'un `findById` complet — utilise `select: { id: true }`.
     */
    async exists(
      tenantPrisma: TenantPrismaClient,
      id: string
    ): Promise<boolean> {
      const model = (tenantPrisma as any)[modelName];
      const item = await model.findFirst({ where: { id }, select: { id: true } });
      return item !== null;
    },
  };
}

// ─── Type helper ─────────────────────────────────────────────────────────────

/** Type du service retourné par la factory — utilisé pour l'injection de dépendance */
export type CrudService = ReturnType<typeof createCrudService>;
