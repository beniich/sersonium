// Script de seed pour les tests de sécurité
// Crée: plans FREE/PRO, organisations, users (FREE, PRO, zéro-tokens)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data for security scenarios...');

  // ── 1. Plans ──────────────────────────────────────────────────────────────
  const planFree = await prisma.plan.upsert({
    where: { code: 'FREE' },
    update: {},
    create: {
      code: 'FREE',
      name: 'Gratuit',
      priceMonthly: 0,
      priceYearly: 0,
      monthlyTokens: 100,
      maxAssets: 2,
      maxUsers: 1,
    },
  });

  const planStarter = await prisma.plan.upsert({
    where: { code: 'STARTER' },
    update: {},
    create: {
      code: 'STARTER',
      name: 'Starter',
      priceMonthly: 29,
      priceYearly: 290,
      monthlyTokens: 5000,
      maxAssets: 10,
      maxUsers: 5,
    },
  });

  const planPro = await prisma.plan.upsert({
    where: { code: 'PRO' },
    update: {},
    create: {
      code: 'PRO',
      name: 'Pro',
      priceMonthly: 99,
      priceYearly: 990,
      monthlyTokens: 50000,
      maxAssets: 100,
      maxUsers: 20,
      has3dDigitalTwin: true,
      hasEsgExport: true,
    },
  });

  console.log('✅ Plans created: FREE, STARTER, PRO');

  // ── 2. Organisations ──────────────────────────────────────────────────────
  const orgFree = await prisma.organization.upsert({
    where: { id: 'test_org_free' },
    update: {},
    create: {
      id: 'test_org_free',
      name: 'Test Org FREE',
      slug: 'test-org-free',
      plan: 'FREE',
      subscriptionStatus: 'active',
    },
  });

  const orgPro = await prisma.organization.upsert({
    where: { id: 'test_org_pro' },
    update: {},
    create: {
      id: 'test_org_pro',
      name: 'Test Org PRO',
      slug: 'test-org-pro',
      plan: 'PRO',
      subscriptionStatus: 'active',
    },
  });

  const orgNoTokens = await prisma.organization.upsert({
    where: { id: 'test_org_notokens' },
    update: {},
    create: {
      id: 'test_org_notokens',
      name: 'Test Org No Tokens',
      slug: 'test-org-notokens',
      plan: 'PRO',
      subscriptionStatus: 'active',
    },
  });

  console.log('✅ Organizations created');

  // ── 3. Users ──────────────────────────────────────────────────────────────
  // User FREE (plan gratuit, sans cockpit access)
  await prisma.user.upsert({
    where: { email: 'test.free@sensorium.test' },
    update: { tokens: 1000 },
    create: {
      id: 'test_user_free',
      email: 'test.free@sensorium.test',
      name: 'Test Free User',
      role: 'operator',
      tokens: 1000,
      tenantId: 'test_org_free',
    },
  });

  // User PRO (abonnement actif, cockpit access)
  await prisma.user.upsert({
    where: { email: 'test.pro@sensorium.test' },
    update: { tokens: 5000 },
    create: {
      id: 'test_user_pro',
      email: 'test.pro@sensorium.test',
      name: 'Test Pro User',
      role: 'admin',
      tokens: 5000,
      tenantId: 'test_org_pro',
    },
  });

  // User zéro tokens (PRO mais quota épuisé)
  await prisma.user.upsert({
    where: { email: 'test.notokens@sensorium.test' },
    update: { tokens: 0 },
    create: {
      id: 'test_user_notokens',
      email: 'test.notokens@sensorium.test',
      name: 'Test No Tokens User',
      role: 'admin',
      tokens: 0,
      tenantId: 'test_org_notokens',
    },
  });

  console.log('✅ Users created: test.free, test.pro, test.notokens');

  // ── 4. Subscriptions ──────────────────────────────────────────────────────
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);

  // FREE org → abonnement FREE (sans cockpit)
  const existingFreeSub = await prisma.subscription.findFirst({ where: { tenantId: 'test_org_free' } });
  if (!existingFreeSub) {
    await prisma.subscription.create({
      data: {
        tenantId: 'test_org_free',
        planId: planFree.id,
        status: 'active',
        billingCycle: 'monthly',
        provider: 'manual',
        currentPeriodEnd: futureDate,
      },
    });
  }

  // PRO org → abonnement PRO actif (avec cockpit)
  const existingProSub = await prisma.subscription.findFirst({ where: { tenantId: 'test_org_pro' } });
  if (!existingProSub) {
    await prisma.subscription.create({
      data: {
        tenantId: 'test_org_pro',
        planId: planPro.id,
        status: 'active',
        billingCycle: 'monthly',
        provider: 'manual',
        currentPeriodEnd: futureDate,
      },
    });
  }

  // No-tokens org → abonnement PRO actif mais user a 0 tokens
  const existingNoTokensSub = await prisma.subscription.findFirst({ where: { tenantId: 'test_org_notokens' } });
  if (!existingNoTokensSub) {
    await prisma.subscription.create({
      data: {
        tenantId: 'test_org_notokens',
        planId: planPro.id,
        status: 'active',
        billingCycle: 'monthly',
        provider: 'manual',
        currentPeriodEnd: futureDate,
      },
    });
  }

  console.log('✅ Subscriptions created');
  console.log('\n📋 TEST CREDENTIALS:');
  console.log('  FREE  user: test.free@sensorium.test  / Test@1234!  (tenantId: test_org_free)');
  console.log('  PRO   user: test.pro@sensorium.test   / Test@1234!  (tenantId: test_org_pro)');
  console.log('  ZERO  user: test.notokens@sensorium.test / Test@1234! (tenantId: test_org_notokens)');
  console.log('\n⚠️  NOTE: Les users de test n\'ont pas de password hash en DB car l\'auth se fait via Firebase/JWT.');
  console.log('   Pour tester l\'API, utilisez le endpoint /api/v1/auth/login avec un compte existant.');
  console.log('   Users existants en DB:');
  console.log('     admin@beecarbonat.com  (tenantId: tenant_beecarbonat_global)');
  console.log('     operator@client-a.com  (tenantId: tenant_client_alpha)');
  console.log('     auditor@client-b.com   (tenantId: tenant_client_beta)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
