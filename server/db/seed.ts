import { rawPrisma } from "./prisma.js";
import { getTenantPrisma } from "./tenantPrisma.js";

export async function seedDatabase() {
  try {
    // 1. Initialiser les organisations globales si nécessaire
    const countOrgs = await rawPrisma.organization.count();
    let orgGlobalId = "tenant_beecarbonat_global";
    let orgAlphaId = "tenant_client_alpha";

    if (countOrgs === 0) {
      console.log("[DB Seed] Seeding multi-tenant initial organizations...");

      await rawPrisma.organization.create({
        data: {
          id: orgGlobalId,
          name: "BeeCarbonat Enterprise",
          slug: "beecarbonat-global",
          plan: "enterprise"
        }
      });

      await rawPrisma.organization.create({
        data: {
          id: orgAlphaId,
          name: "Client Alpha SAS",
          slug: "client-alpha",
          plan: "pro"
        }
      });

      await rawPrisma.organization.create({
        data: {
          id: "tenant_client_beta",
          name: "Client Beta Corp",
          slug: "client-beta",
          plan: "standard"
        }
      });
    }

    const prismaGlobal = getTenantPrisma(orgGlobalId);
    const prismaAlpha = getTenantPrisma(orgAlphaId);

    // Initialiser les utilisateurs pour l'intégrité référentielle
    const countUsers = await rawPrisma.user.count();
    if (countUsers === 0) {
      console.log("[DB Seed] Seeding users...");
      await rawPrisma.user.createMany({
        data: [
          {
            id: "usr_carbon_001",
            email: "admin@beecarbonat.com",
            role: "admin",
            tenantId: "tenant_beecarbonat_global"
          },
          {
            id: "usr_ops_002",
            email: "operator@client-a.com",
            role: "operator",
            tenantId: "tenant_client_alpha"
          },
          {
            id: "usr_audit_003",
            email: "auditor@client-b.com",
            role: "auditor",
            tenantId: "tenant_client_beta"
          }
        ]
      });
    }

    // Initialiser les émissions si manquantes
    const countEmissions = await rawPrisma.carbonEmission.count();
    if (countEmissions === 0) {
      console.log("[DB Seed] Seeding carbon emissions...");
      await prismaGlobal.carbonEmission.create({
        data: {
          title: "Edge Compute Datacenter Paris (PAR-01)",
          scope: 2,
          category: "Datacenters & Cloud Compute",
          co2EquivalentKg: 1420.5,
          source: "realtime_telemetry",
          status: "verified"
        } as any
      });

      await prismaGlobal.carbonEmission.create({
        data: {
          title: "Refroidissement Liquide Frankfurt (FRA-02)",
          scope: 1,
          category: "Cooling & Facility",
          co2EquivalentKg: 640.2,
          source: "pue_telemetry",
          status: "verified"
        } as any
      });

      await prismaAlpha.carbonEmission.create({
        data: {
          title: "Flotte Véhicules Électriques Alpha",
          scope: 1,
          category: "Fleet Logistics",
          co2EquivalentKg: 310.0,
          source: "iot_telemetry",
          status: "verified"
        } as any
      });

      await prismaAlpha.carbonEmission.create({
        data: {
          title: "Consommation Bureaux Lyon",
          scope: 2,
          category: "Building Electricity",
          co2EquivalentKg: 890.4,
          source: "smart_meter",
          status: "verified"
        } as any
      });
    }

    // Initialiser les assets si manquants
    const countAssets = await rawPrisma.infrastructureAsset.count();
    if (countAssets === 0) {
      console.log("[DB Seed] Seeding infrastructure assets...");
      await prismaGlobal.infrastructureAsset.create({
        data: {
          name: "Datacenter Paris Est (PAR-01)",
          location: "Paris, France",
          type: "datacenter",
          status: "healthy",
          powerUsageKw: 1250.0,
          pueScore: 1.12,
          renewablePct: 98.5
        } as any
      });

      await prismaGlobal.infrastructureAsset.create({
        data: {
          name: "Cluster Edge Frankfurt (FRA-02)",
          location: "Frankfurt, Germany",
          type: "edge_node",
          status: "healthy",
          powerUsageKw: 480.0,
          pueScore: 1.18,
          renewablePct: 100.0
        } as any
      });

      await prismaAlpha.infrastructureAsset.create({
        data: {
          name: "Hub Logistique Lyon",
          location: "Lyon, France",
          type: "switch",
          status: "warning",
          powerUsageKw: 110.0,
          pueScore: 1.35,
          renewablePct: 75.0
        } as any
      });
    }

    console.log("[DB Seed] Multi-tenant initial data ready.");
  } catch (err) {
    console.error("[DB Seed] Seeding error:", err);
  }
}
