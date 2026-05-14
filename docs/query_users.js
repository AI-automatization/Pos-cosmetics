const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres:IexyvkdDvSVlXcVFCzlsuuQReOpKFrEM@interchange.proxy.rlwy.net:29292/railway"
});

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
