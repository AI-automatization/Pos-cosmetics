const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres:IexyvkdDvSVlXcVFCzlsuuQReOpKFrEM@interchange.proxy.rlwy.net:29292/railway"
});

async function main() {
  // Find user first to get tenantId
  const user = await prisma.user.findFirst({
    where: { email: 'owner@kosmetika.uz' },
    select: { id: true, tenantId: true, email: true, firstName: true, lastName: true, role: true, tenant: { select: { slug: true } } },
  });
  console.log('Found user:', JSON.stringify(user, null, 2));

  if (!user) { console.log('User not found!'); return; }

  const newPassword = 'Demo2026!';
  const hash = await bcrypt.hash(newPassword, 12);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash },
    select: { email: true, firstName: true, role: true },
  });

  console.log('Password reset done:', updated.email);
  console.log('New password:', newPassword);
  console.log('Tenant slug:', user.tenant.slug);
}

main().catch(console.error).finally(() => prisma.$disconnect());
