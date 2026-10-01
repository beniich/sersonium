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

    // 4. Initialiser le Registre de Conformité Souverain (Niveau 3)
    const countCerts = await rawPrisma.certification.count();
    if (countCerts === 0) {
      console.log("[DB Seed] Seeding sovereign compliance registry (Certifications, Permits, Insurances)...");
      const defaultTenant = "tenant_enterprise_lacaza";

      // Ensure tenant organization exists
      await rawPrisma.organization.upsert({
        where: { id: defaultTenant },
        update: {},
        create: {
          id: defaultTenant,
          name: "LACAZA ClouIndustrie Group",
          slug: "lacaza-group",
          plan: "enterprise",
          subscriptionStatus: "active",
        },
      });

      // Seed Certifications
      await rawPrisma.certification.createMany({
        data: [
          {
            tenantId: defaultTenant,
            name: "ISO 39001 (Sécurité Routière)",
            issuer: "AFNOR Certification",
            expiry: new Date("2026-12-31"),
            status: "Valid",
            fileUrl: "/docs/cert-iso39001-lacaza.pdf",
          },
          {
            tenantId: defaultTenant,
            name: "ISO 14001 (Environnement & Carbone)",
            issuer: "Bureau Veritas",
            expiry: new Date("2025-11-15"),
            status: "Valid",
            fileUrl: "/docs/cert-iso14001.pdf",
          },
          {
            tenantId: defaultTenant,
            name: "FIPS 140-3 Cryptographic HSM",
            issuer: "NIST / ANSSI",
            expiry: new Date("2025-06-30"),
            status: "Warning",
            fileUrl: "/docs/fips-140-3-hsm.pdf",
          },
        ],
      });

      // Seed Permis
      await rawPrisma.permit.createMany({
        data: [
          {
            tenantId: defaultTenant,
            driver: "Jean Dupont",
            category: "CE (Poids Lourds & Super-Lourds)",
            expiry: new Date("2024-06-15"),
            status: "Warning",
          },
          {
            tenantId: defaultTenant,
            driver: "Marc Vasseur",
            category: "ADR (Matières Dangereuses Cl. 3)",
            expiry: new Date("2027-04-10"),
            status: "Valid",
          },
          {
            tenantId: defaultTenant,
            driver: "Sophie Lambert",
            category: "C (Poids Lourds Urbain)",
            expiry: new Date("2026-09-01"),
            status: "Valid",
          },
        ],
      });

      // Seed Assurances
      await rawPrisma.insurance.createMany({
        data: [
          {
            tenantId: defaultTenant,
            company: "AXA Entreprise Flotte",
            policy: "POL-AXA-998244-FR",
            coverageType: "Tous Risques Flotte + Marchandises",
            vehicle: "Camion Silicium X1 (Lyon)",
            premium: 2450.0,
            expiry: new Date("2024-12-31"),
            status: "Valid",
          },
          {
            tenantId: defaultTenant,
            company: "Allianz Global Corporate",
            policy: "ALL-7781-EDGE",
            coverageType: "Responsabilité Civile Exploitation & Cyber",
            vehicle: "Flotte Logistique Paris-Nord",
            premium: 3800.0,
            expiry: new Date("2025-08-30"),
            status: "Valid",
          },
          {
            tenantId: defaultTenant,
            company: "Groupama Transport",
            policy: "GP-CAM-4201",
            coverageType: "Tiers Collision & Rapatriement",
            vehicle: "Camion 42 (Immobilisation Test)",
            premium: 1100.0,
            expiry: new Date("2024-05-01"),
            status: "Expired",
          },
        ],
      });
    }

    console.log("[DB Seed] Multi-tenant initial data ready.");
  } catch (err) {
    console.error("[DB Seed] Seeding error:", err);
  }
}
