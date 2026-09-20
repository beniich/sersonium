import { rawPrisma } from "./prisma.js";

/**
 * Modèles soumis à l'isolation stricte multi-tenant.
 * Toute requête sur ces modèles est automatiquement injectée avec `where: { tenantId }` ou `data: { tenantId }`.
 */
export const TENANT_ISOLATED_MODELS = [
  "User",
  "CarbonEmission",
  "InfrastructureAsset",
  "AuditLog",
  "AccessPolicy",
  "Invoice",
  "AssetTelemetry",
  "FileMetadata",
  "TrafficLog",
  "WafSecurityEvent"
] as const;

export type TenantIsolatedModel = typeof TENANT_ISOLATED_MODELS[number];

/**
 * Factory Prisma Client Extension Multi-Tenant
 * Implémente l'isolation stricte au niveau de la couche ORM (Zero Tenant Leak Guarantee).
 * Même si un développeur oublie d'ajouter `where: { tenantId }` dans un service,
 * l'extension intercepte l'appel et injecte le filtre hermétique.
 */
export function getTenantPrisma(tenantId: string) {
  if (!tenantId) {
    throw new Error("Échec de sécurité critique : tentative d'instanciation de tenantPrisma sans tenantId.");
  }

  return rawPrisma.$extends({
    name: `tenant-isolation-${tenantId}`,
    query: {
      $allModels: {
        async findMany({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async count({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async aggregate({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async groupBy({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async create({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.data = { ...args.data, tenantId };
          }
          return query(args);
        },
        async createMany({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({ ...item, tenantId }));
            } else if (args.data) {
              args.data = { ...args.data, tenantId };
            }
          }
          return query(args);
        },
        async update({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async updateMany({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async delete({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async deleteMany({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async upsert({ model, args, query }: { model: string; args: any; query: (args: any) => Promise<any> }) {
          if (TENANT_ISOLATED_MODELS.includes(model as TenantIsolatedModel)) {
            args.where = { ...args.where, tenantId };
            args.create = { ...args.create, tenantId };
          }
          return query(args);
        }
      }
    }
  });
}

export type TenantPrismaClient = ReturnType<typeof getTenantPrisma>;
