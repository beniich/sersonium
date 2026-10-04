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

  /**
   * Calcul de l'empreinte carbone multi-énergie temps réel (Facteurs ADEME / GHG Protocol)
   */
  static calculateFootprint(consumption: { electricityKwh: number; gasKwh: number; fuelLitres: number }) {
    const EMISSION_FACTORS = {
      electricity_fr: 0.056, // France (0.056 kg CO2e / kWh)
      gas_natural: 0.202,    // Gaz naturel (0.202 kg CO2e / kWh)
      diesel: 2.670,         // Diesel (2.670 kg CO2e / L)
    };

    const scope1Kg = (consumption.gasKwh * EMISSION_FACTORS.gas_natural) + (consumption.fuelLitres * EMISSION_FACTORS.diesel);
    const scope2Kg = consumption.electricityKwh * EMISSION_FACTORS.electricity_fr;
    const totalCarbonKg = scope1Kg + scope2Kg;

    return {
      totalTons: +(totalCarbonKg / 1000).toFixed(3),
      totalKg: Math.round(totalCarbonKg),
      breakdown: {
        scope1: Math.round(scope1Kg),
        scope2: Math.round(scope2Kg)
      },
      unit: "tCO2e",
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyse de la qualité de l'air intérieur (Norme environnementale WELL v2)
   */
  static checkAirQuality(co2Ppm: number, vocPpb: number) {
    const isCompliant = co2Ppm < 800 && vocPpb < 500;
    return {
      isCompliant,
      co2Ppm,
      vocPpb,
      status: isCompliant ? "EXCELLENT" : "VENTILATION_REQUIRED",
      recommendation: co2Ppm > 800 
        ? "Augmenter le débit de renouvellement d'air frais (VMC CVC) de +20%" 
        : "Qualité d'air optimale conforme WELL v2"
    };
  }
}
