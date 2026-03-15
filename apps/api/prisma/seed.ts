/**
 * RAOS Dev Seed — Barcha rollar uchun test accountlar
 *
 * Ishlatish:
 *   cd apps/api
 *   npx ts-node prisma/seed.ts
 *
 * Yoki:
 *   pnpm --filter api prisma:seed
 *
 * Tenant slug: raos-demo
 * Barcha accountlar paroli: Demo1234!
 */

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TENANT_SLUG = 'raos-demo';
const TENANT_NAME = 'RAOS Demo Do\'kon';
const PASSWORD = 'Demo1234!';
const BCRYPT_ROUNDS = 12;

const TEST_USERS: Array<{
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}> = [
  {
    email: 'owner@raos.uz',
    firstName: 'Sardor',
    lastName: 'Karimov',
    role: UserRole.OWNER,
  },
  {
    email: 'admin@raos.uz',
    firstName: 'Dilnoza',
    lastName: 'Yusupova',
    role: UserRole.ADMIN,
  },
  {
    email: 'manager@raos.uz',
    firstName: 'Jasur',
    lastName: 'Toshmatov',
    role: UserRole.MANAGER,
  },
  {
    email: 'cashier@raos.uz',
    firstName: 'Malika',
    lastName: 'Rahimova',
    role: UserRole.CASHIER,
  },
  {
    email: 'viewer@raos.uz',
    firstName: 'Bobur',
    lastName: 'Nazarov',
    role: UserRole.VIEWER,
  },
];

async function main() {
  console.log('🌱 RAOS seed boshlandi...\n');

  // Tenant yaratish yoki topish
  let tenant = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
  });

  if (tenant) {
    console.log(`✅ Tenant mavjud: "${tenant.name}" (slug: ${tenant.slug})`);
  } else {
    tenant = await prisma.tenant.create({
      data: {
        name: TENANT_NAME,
        slug: TENANT_SLUG,
      },
    });
    console.log(`✅ Tenant yaratildi: "${tenant.name}" (slug: ${tenant.slug})`);
  }

  console.log('\n👥 Foydalanuvchilar yaratilmoqda...\n');

  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

  for (const userData of TEST_USERS) {
    const existing = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: userData.email,
        },
      },
    });

    if (existing) {
      console.log(`⏩  Mavjud: ${userData.email} (${userData.role})`);
      continue;
    }

    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      },
    });

    console.log(`✅ Yaratildi: ${userData.email} → ${userData.role}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Seed muvaffaqiyatli yakunlandi!');
  console.log('='.repeat(60));
  console.log('\n📋 LOGIN MA\'LUMOTLARI:');
  console.log(`${'─'.repeat(60)}`);
  console.log(`Tenant slug : ${TENANT_SLUG}`);
  console.log(`Parol       : ${PASSWORD}`);
  console.log(`${'─'.repeat(60)}`);

  const roleEmojis: Record<string, string> = {
    OWNER:   '👑',
    ADMIN:   '🔑',
    MANAGER: '📊',
    CASHIER: '💰',
    VIEWER:  '👁️',
  };

  for (const u of TEST_USERS) {
    console.log(
      `${roleEmojis[u.role]} ${u.role.padEnd(8)} | ${u.firstName} ${u.lastName.padEnd(12)} | ${u.email}`,
    );
  }

  console.log(`${'─'.repeat(60)}`);
  console.log('\n📱 Mobile app login uchun:');
  console.log(`  Tenant slug : ${TENANT_SLUG}`);
  console.log(`  Email       : owner@raos.uz`);
  console.log(`  Parol       : ${PASSWORD}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed xato:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
