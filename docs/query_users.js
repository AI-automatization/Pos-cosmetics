const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) { console.error('DATABASE_URL env required'); process.exit(1); }
const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      tenant: { select: { name: true, slug: true } },
    },
    take: 20,
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
