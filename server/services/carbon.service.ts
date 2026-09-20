import { TenantPrismaClient } from "../db/tenantPrisma.js";
import { createCrudService } from "./crudFactory.js";
import { CreateCarbonEmissionInput, UpdateCarbonEmissionInput } from "../schemas/carbon.schema.js";

/**
 * Service Métier Carbone (Clean Architecture)
 * Combine la puissance de la fabrique générique `createCrudService` et la logique analytique Scope 1/2/3.
 * C'est l'extension `tenantPrisma` qui injecte et filtre automatiquement le tenant.
 */
export class CarbonService {
  // Fabrique CRUD standardisée pour les émissions carbone
  static crud = createCrudService("carbonEmission");

  /**
   * Récupère la liste de toutes les émissions du tenant actif (optionnellement filtrées)
   */
  static async getEmissions(tenantPrisma: TenantPrismaClient, where?: Record<string, any>) {
    return tenantPrisma.carbonEmission.findMany({
      where,
      orderBy: { activityDate: "desc" }
    });
  }

  /**
   * Récupère une émission par son ID
   */
  static async getEmissionById(tenantPrisma: TenantPrismaClient, id: string) {
    return this.crud.findById(tenantPrisma, id);
  }

  /**
   * Calcule les métriques globales et récapitulatives par Scope (1, 2, 3) pour le tenant actif
   */
  static async getMetrics(tenantPrisma: TenantPrismaClient) {
    const emissions = await tenantPrisma.carbonEmission.findMany();

    const totalKg = emissions.reduce((sum, item) => sum + item.co2EquivalentKg, 0);
    const scope1Kg = emissions.filter(e => e.scope === 1).reduce((sum, item) => sum + item.co2EquivalentKg, 0);
    const scope2Kg = emissions.filter(e => e.scope === 2).reduce((sum, item) => sum + item.co2EquivalentKg, 0);
    const scope3Kg = emissions.filter(e => e.scope === 3).reduce((sum, item) => sum + item.co2EquivalentKg, 0);

    return {
      totalEmissionsTonnes: parseFloat((totalKg / 1000).toFixed(2)),
      totalEmissionsKg: totalKg,
      breakdownByScope: {
        scope1: { kg: scope1Kg, pct: totalKg > 0 ? Math.round((scope1Kg / totalKg) * 100) : 0 },
        scope2: { kg: scope2Kg, pct: totalKg > 0 ? Math.round((scope2Kg / totalKg) * 100) : 0 },
        scope3: { kg: scope3Kg, pct: totalKg > 0 ? Math.round((scope3Kg / totalKg) * 100) : 0 },
      },
      recordsCount: emissions.length
    };
  }

  /**
   * Crée une nouvelle émission validée par Zod
   */
  static async createEmission(tenantPrisma: TenantPrismaClient, data: CreateCarbonEmissionInput) {
    return this.crud.create(tenantPrisma, data);
  }

  /**
   * Met à jour une émission existante
   */
  static async updateEmission(tenantPrisma: TenantPrismaClient, id: string, data: UpdateCarbonEmissionInput) {
    return this.crud.update(tenantPrisma, id, data);
  }

  /**
   * Supprime une émission en garantissant qu'elle appartient bien au tenant actif
   */
  static async deleteEmission(tenantPrisma: TenantPrismaClient, id: string) {
    return this.crud.delete(tenantPrisma, id);
  }
}
