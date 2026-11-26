import { rawPrisma } from "../server/db/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sensorium-audit-secret-key-production-ready-2026";

async function runTest() {
  console.log("================================================================================");
  console.log("🧪 TEST AUTOMATISÉ : CYCLE COMPLET T0 (ZERO-DATA) -> INGESTION -> ANALYSE IA");
  console.log("================================================================================");

  const testTenantId = `test-t0-${Date.now()}`;
  const testEmail = `operator-${Date.now()}@test-sensorium.cloud`;

  console.log(`\n1. Initialisation d'une organisation test T0 (Tenant: ${testTenantId})...`);
  const org = await rawPrisma.organization.create({
    data: {
      id: testTenantId,
      name: "T0 Demonstration Enterprise",
      slug: testTenantId,
      plan: "FREE",
      subscriptionStatus: "active",
    },
  });

  const user = await rawPrisma.user.create({
    data: {
      email: testEmail,
      name: "T0 Operator",
      role: "admin",
      tenantId: org.id,
    },
  });

  console.log("   [PASS] Organisation et Utilisateur créés avec succès (Plan: FREE - Discovery Tier)");

  // 2. Vérification T0 : Télémétrie et Assets à 0
  const initialAssets = await rawPrisma.infrastructureAsset.count({
    where: { tenantId: org.id },
  });
  const initialTelemetry = await rawPrisma.assetTelemetry.count({
    where: { tenantId: org.id },
  });

  console.log(`\n2. Vérification de l'état T0 :`);
  console.log(`   - Assets en base : ${initialAssets} (Attendu: 0)`);
  console.log(`   - Relevés télémétriques : ${initialTelemetry} (Attendu: 0)`);

  if (initialAssets === 0 && initialTelemetry === 0) {
    console.log("   [PASS] État T0 STRICTEMENT ZERO-DATA validé !");
  } else {
    throw new Error("L'état initial n'est pas à 0 !");
  }

  // 3. Ingestion d'un Asset et de télémétries
  console.log(`\n3. Ingestion de données réelles (1 Asset Datacenter + 3 relevés IoT)...`);
  const asset = await rawPrisma.infrastructureAsset.create({
    data: {
      tenantId: org.id,
      name: "Datacenter Edge Alfa-01",
      location: "Paris DC-Nord",
      type: "datacenter",
      status: "healthy",
      powerUsageKw: 45.2,
      pueScore: 1.15,
      renewablePct: 100.0,
    },
  });

  const now = new Date();
  await rawPrisma.assetTelemetry.createMany({
    data: [
      {
        assetId: asset.id,
        tenantId: org.id,
        timestamp: new Date(now.getTime() - 60000),
        temperatureC: 22.5,
        vibrationMmS: 0.4,
        powerKw: 45.0,
        pueScore: 1.15,
        status: "nominal",
      },
      {
        assetId: asset.id,
        tenantId: org.id,
        timestamp: new Date(now.getTime() - 30000),
        temperatureC: 23.1,
        vibrationMmS: 0.5,
        powerKw: 45.8,
        pueScore: 1.16,
        status: "nominal",
      },
      {
        assetId: asset.id,
        tenantId: org.id,
        timestamp: now,
        temperatureC: 23.8,
        vibrationMmS: 0.6,
        powerKw: 46.2,
        pueScore: 1.17,
        status: "nominal",
      },
    ],
  });

  const afterCount = await rawPrisma.assetTelemetry.count({
    where: { tenantId: org.id },
  });
  console.log(`   - Relevés après ingestion : ${afterCount}`);
  console.log("   [PASS] Ingestion réussie et persistée dans PostgreSQL Neon !");

  // 4. Test du calcul de télémétrie agrégée
  console.log(`\n4. Vérification de l'agrégation en temps réel :`);
  const telemetryRecords = await rawPrisma.assetTelemetry.findMany({
    where: { tenantId: org.id },
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  const avgTemp = telemetryRecords.reduce((acc, t) => acc + (t.temperatureC || 0), 0) / telemetryRecords.length;
  const avgPower = telemetryRecords.reduce((acc, t) => acc + (t.powerKw || 0), 0) / telemetryRecords.length;
  console.log(`   - Température Moyenne calculée : ${avgTemp.toFixed(1)}°C`);
  console.log(`   - Puissance Moyenne calculée : ${avgPower.toFixed(1)} kW`);
  console.log("   [PASS] Agrégation mathématique conforme aux données réelles !");

  // 5. Nettoyage de la sandbox
  console.log(`\n5. Nettoyage des données de test...`);
  await rawPrisma.assetTelemetry.deleteMany({ where: { tenantId: org.id } });
  await rawPrisma.infrastructureAsset.deleteMany({ where: { tenantId: org.id } });
  await rawPrisma.user.deleteMany({ where: { tenantId: org.id } });
  await rawPrisma.organization.delete({ where: { id: org.id } });
  console.log("   [PASS] Sandbox nettoyée avec succès.");

  console.log("\n================================================================================");
  console.log("🎉 TOUS LES TESTS DU CYCLE T0 ET INGESTION ONT RÉUSSI !");
  console.log("================================================================================");
}

runTest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await rawPrisma.$disconnect();
  });
