// Script temporaire pour lister les utilisateurs en DB
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      tokens: true,
      tenantId: true,
    },
    take: 10,
  });
  console.log('=== USERS ===');
  console.log(JSON.stringify(users, null, 2));

  const subs = await prisma.subscription.findMany({
    include: { plan: true, organization: { select: { id: true, name: true } } },
    take: 10,
  });
  console.log('\n=== SUBSCRIPTIONS ===');
  console.log(JSON.stringify(subs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
