/**
 * RAOS Dev Seed — Kosmetika Demo (idempotent)
 *
 * Ishlatish:
 *   cd apps/api
 *   npx ts-node prisma/seed.ts
 *
 * Yoki:
 *   pnpm --filter api prisma:seed
 *
 * Tenant slug: kosmetika-demo
 * Barcha accountlar paroli: Demo1234!
 */

import {
  PrismaClient,
  UserRole,
  ShiftStatus,
  OrderStatus,
  PaymentMethod,
  PaymentIntentStatus,
  DebtStatus,
  NotificationType,
  StockMovementType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TENANT_SLUG = 'kosmetika-demo';
const TENANT_NAME = 'Kosmetika Savdosi';
const PASSWORD = 'Demo1234!';
const BCRYPT_ROUNDS = 12;

// ─── Products ────────────────────────────────────────────────────
// initialQty: fixed stock quantity (used for low-stock demo items).
// If omitted, randBetween(20, 80) is used.
const PRODUCTS: Array<{ name: string; sku: string; cost: number; sell: number; minStock: number; initialQty?: number }> = [
  { name: "Chanel No.5 EDP 100ml",   sku: "CH-N5-100",   cost: 850000,  sell: 1200000, minStock: 5 },
  { name: "Dior Sauvage EDT 100ml",  sku: "DR-SAU-100",  cost: 780000,  sell: 1100000, minStock: 5 },
  { name: "L'Oreal Elvive Shampoo",  sku: "LOR-ELV-400", cost: 45000,   sell: 72000,   minStock: 20 },
  { name: "Nivea Soft Cream 300ml",  sku: "NIV-SOFT-300", cost: 38000,  sell: 58000,   minStock: 20 },
  { name: "MAC Lipstick Ruby Woo",   sku: "MAC-LIP-RW",  cost: 280000,  sell: 420000,  minStock: 10 },
  { name: "Versace Eros EDT 100ml",  sku: "VER-ERO-100", cost: 920000,  sell: 1350000, minStock: 3 },
  { name: "Garnier Vitamin C Serum", sku: "GAR-VIT-30",  cost: 65000,   sell: 98000,   minStock: 15 },
  { name: "NYX Eyeshadow Palette",   sku: "NYX-PAL-ULT", cost: 185000,  sell: 275000,  minStock: 8 },
  { name: "Maybelline Mascara",      sku: "MAY-MAS-BIG", cost: 55000,   sell: 82000,   minStock: 20 },
  { name: "KIKO Milano Lipstick",    sku: "KIK-LIP-315", cost: 95000,   sell: 148000,  minStock: 10 },
  // T-339: Low-stock demo — currentStock(7) < minStockLevel(10) → POS toast trigger
  { name: "La Roche-Posay SPF50+",   sku: "LRP-SPF-50",  cost: 185000,  sell: 278000,  minStock: 10, initialQty: 7 },
];

// ─── Branches ────────────────────────────────────────────────────
const BRANCHES = [
  { name: "Chilonzor filiali",       address: "Chilonzor tumani, Bunyodkor ko'ch 12" },
  { name: "Yunusabad filiali",       address: "Yunusabad tumani, Amir Temur ko'ch 45" },
  { name: "Mirzo Ulug'bek filiali",  address: "Mirzo Ulug'bek tumani, Ko'yluk bozor" },
  { name: "Sergeli filiali",         address: "Sergeli tumani, Sergeli ko'ch 7" },
];

// ─── Cashier names ───────────────────────────────────────────────
const CASHIERS = [
  { firstName: "Sarvar",    lastName: "Toshmatov",  email: "sarvar@kosmetika.uz" },
  { firstName: "Jahongir",  lastName: "Rahimov",    email: "jahongir@kosmetika.uz" },
  { firstName: "Zulfiya",   lastName: "Nazarova",   email: "zulfiya@kosmetika.uz" },
  { firstName: "Muhabbat",  lastName: "Yusupova",   email: "muhabbat@kosmetika.uz" },
];

// ─── Customer names ──────────────────────────────────────────────
const CUSTOMERS = [
  { name: "Malika Xasanova",   phone: "+998901234567" },
  { name: "Dilnoza Karimova",  phone: "+998901234568" },
  { name: "Feruza Umarova",    phone: "+998901234569" },
  { name: "Nodira Tojiboyeva", phone: "+998901234570" },
  { name: "Barno Mirzayeva",   phone: "+998901234571" },
  { name: "Gulnora Hasanova",  phone: "+998901234572" },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 3600000);
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 RAOS Kosmetika seed boshlandi...\n');

  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

  // ─── 1. Tenant ───────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {},
    create: { name: TENANT_NAME, slug: TENANT_SLUG },
  });
  console.log(`✅ Tenant: "${tenant.name}" (${tenant.slug})`);

  // ─── 2. Owner user ───────────────────────────────────────────
  const owner = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'owner@kosmetika.uz' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'owner@kosmetika.uz',
      passwordHash,
      firstName: 'Akbar',
      lastName: 'Tursunov',
      role: UserRole.OWNER,
    },
  });
  console.log(`✅ Owner: owner@kosmetika.uz`);

  // Also create the original raos-demo users for backwards compat
  const legacyUsers = [
    { email: 'owner@raos.uz',     firstName: 'Sardor',  lastName: 'Karimov',   role: UserRole.OWNER },
    { email: 'admin@raos.uz',     firstName: 'Dilnoza', lastName: 'Yusupova',  role: UserRole.ADMIN },
    { email: 'manager@raos.uz',   firstName: 'Jasur',   lastName: 'Toshmatov', role: UserRole.MANAGER },
    { email: 'cashier@raos.uz',   firstName: 'Malika',  lastName: 'Rahimova',  role: UserRole.CASHIER },
    { email: 'viewer@raos.uz',    firstName: 'Bobur',   lastName: 'Nazarov',   role: UserRole.VIEWER },
    { email: 'warehouse@raos.uz', firstName: 'Sherzod', lastName: 'Ergashev',  role: UserRole.WAREHOUSE },
  ];
  for (const u of legacyUsers) {
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
      update: {},
      create: { tenantId: tenant.id, passwordHash, ...u },
    });
  }
  console.log(`✅ Legacy raos-demo users (5 ta)`);

  // ─── 3. Branches ─────────────────────────────────────────────
  const branches: Array<{ id: string; name: string }> = [];
  for (const b of BRANCHES) {
    // Upsert by name+tenantId (no unique constraint, use findFirst+create)
    let branch = await prisma.branch.findFirst({
      where: { tenantId: tenant.id, name: b.name },
    });
    if (!branch) {
      branch = await prisma.branch.create({
        data: { tenantId: tenant.id, name: b.name, address: b.address },
      });
    }
    branches.push(branch);
  }
  console.log(`✅ Filiallar: ${branches.map((b) => b.name).join(', ')}`);

  // ─── 4. Cashiers ─────────────────────────────────────────────
  const cashiers: Array<{ id: string }> = [];
  for (let i = 0; i < CASHIERS.length; i++) {
    const c = CASHIERS[i];
    const cashier = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: c.email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: c.email,
        passwordHash,
        firstName: c.firstName,
        lastName: c.lastName,
        role: UserRole.CASHIER,
      },
    });
    cashiers.push(cashier);
  }
  console.log(`✅ Kassirlar: ${CASHIERS.map((c) => c.firstName).join(', ')}`);

  // ─── 5. Products + Category ───────────────────────────────────
  let category = await prisma.category.findFirst({
    where: { tenantId: tenant.id, name: 'Kosmetika' },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { tenantId: tenant.id, name: 'Kosmetika' },
    });
  }

  const products: Array<{ id: string; sell: number; cost: number; name: string }> = [];
  for (const p of PRODUCTS) {
    let product = await prisma.product.findFirst({
      where: { tenantId: tenant.id, sku: p.sku },
    });
    if (!product) {
      product = await prisma.product.create({
        data: {
          tenantId: tenant.id,
          categoryId: category.id,
          name: p.name,
          sku: p.sku,
          costPrice: p.cost,
          sellPrice: p.sell,
          minStockLevel: p.minStock,
          isActive: true,
        },
      });
    }
    products.push({ id: product.id, sell: p.sell, cost: p.cost, name: p.name });
  }
  console.log(`✅ Mahsulotlar: ${products.length} ta`);

  // ─── 6. Warehouses + Stock ────────────────────────────────────
  const warehouses: Map<string, string> = new Map(); // branchId → warehouseId
  for (const branch of branches) {
    let wh = await prisma.warehouse.findFirst({
      where: { tenantId: tenant.id, branchId: branch.id },
    });
    if (!wh) {
      wh = await prisma.warehouse.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          name: `${branch.name} ombori`,
        },
      });
    }
    warehouses.set(branch.id, wh.id);

    // Add initial stock for each product in this branch
    for (const p of products) {
      const existing = await prisma.stockMovement.findFirst({
        where: { tenantId: tenant.id, warehouseId: wh.id, productId: p.id, type: StockMovementType.IN },
      });
      if (!existing) {
        await prisma.stockMovement.create({
          data: {
            tenantId: tenant.id,
            warehouseId: wh.id,
            productId: p.id,
            userId: owner.id,
            type: StockMovementType.IN,
            quantity: p.initialQty ?? randBetween(20, 80),
            costPrice: p.cost,
            note: p.initialQty ? 'Boshlang\'ich qoldiq — low-stock demo (seed)' : 'Boshlang\'ich qoldiq (seed)',
          },
        });
      }
    }
  }
  console.log(`✅ Omborlar va stock harakatlari`);

  // ─── 7. Customers ────────────────────────────────────────────
  const customerIds: string[] = [];
  for (const c of CUSTOMERS) {
    let customer = await prisma.customer.findFirst({
      where: { tenantId: tenant.id, phone: c.phone },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { tenantId: tenant.id, name: c.name, phone: c.phone },
      });
    }
    customerIds.push(customer.id);
  }
  console.log(`✅ Mijozlar: ${customerIds.length} ta`);

  // ─── 8. Shifts ───────────────────────────────────────────────
  // Check how many shifts already exist
  const existingShiftCount = await prisma.shift.count({ where: { tenantId: tenant.id } });

  const shiftIds: string[] = [];

  if (existingShiftCount < 5) {
    console.log('📅 Smenalar yaratilmoqda...');

    const paymentMethods = [PaymentMethod.CASH, PaymentMethod.TERMINAL, PaymentMethod.CLICK, PaymentMethod.PAYME];

    // 8 ta yopiq smena (so'nggi 7 kun)
    for (let day = 7; day >= 1; day--) {
      for (let b = 0; b < Math.min(2, branches.length); b++) {
        const branch = branches[b];
        const cashier = cashiers[b % cashiers.length];
        const openedAt = daysAgo(day);
        openedAt.setHours(9, 0, 0, 0);
        const closedAt = new Date(openedAt);
        closedAt.setHours(21, 0, 0, 0);

        const shift = await prisma.shift.create({
          data: {
            tenantId: tenant.id,
            userId: cashier.id,
            branchId: branch.id,
            status: ShiftStatus.CLOSED,
            openedAt,
            closedAt,
            openingCash: 500000,
            closingCash: randBetween(800000, 3000000),
          },
        });
        shiftIds.push(shift.id);

        // 5-8 orders per shift
        const orderCount = randBetween(5, 8);
        for (let oi = 0; oi < orderCount; oi++) {
          const orderNumber = await prisma.order.count({ where: { tenantId: tenant.id } }) + 1;
          const product = pick(products);
          const qty = randBetween(1, 3);
          const total = product.sell * qty;

          const order = await prisma.order.create({
            data: {
              tenantId: tenant.id,
              shiftId: shift.id,
              userId: cashier.id,
              branchId: branch.id,
              orderNumber,
              status: OrderStatus.COMPLETED,
              subtotal: total,
              total,
              createdAt: new Date(openedAt.getTime() + oi * 3600000),
            },
          });

          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              productName: product.name,
              quantity: qty,
              unitPrice: product.sell,
              costPrice: product.cost,
              total,
            },
          });

          const method = pick(paymentMethods);
          await prisma.paymentIntent.create({
            data: {
              tenantId: tenant.id,
              orderId: order.id,
              method,
              status: PaymentIntentStatus.SETTLED,
              amount: total,
            },
          });
        }
      }
    }

    // 2 ochiq smena (bugun)
    for (let b = 0; b < 2; b++) {
      const branch = branches[b];
      const cashier = cashiers[b % cashiers.length];
      const openedAt = new Date();
      openedAt.setHours(9, 0, 0, 0);

      const shift = await prisma.shift.create({
        data: {
          tenantId: tenant.id,
          userId: cashier.id,
          branchId: branch.id,
          status: ShiftStatus.OPEN,
          openedAt,
          openingCash: 500000,
        },
      });
      shiftIds.push(shift.id);

      // 3-5 orders today
      for (let oi = 0; oi < randBetween(3, 5); oi++) {
        const orderNumber = await prisma.order.count({ where: { tenantId: tenant.id } }) + 1;
        const product = pick(products);
        const qty = randBetween(1, 2);
        const total = product.sell * qty;

        const order = await prisma.order.create({
          data: {
            tenantId: tenant.id,
            shiftId: shift.id,
            userId: cashier.id,
            branchId: branch.id,
            orderNumber,
            status: OrderStatus.COMPLETED,
            subtotal: total,
            total,
            createdAt: hoursAgo(randBetween(1, 4)),
          },
        });

        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            quantity: qty,
            unitPrice: product.sell,
            costPrice: product.cost,
            total,
          },
        });

        await prisma.paymentIntent.create({
          data: {
            tenantId: tenant.id,
            orderId: order.id,
            method: pick([PaymentMethod.CASH, PaymentMethod.TERMINAL]),
            status: PaymentIntentStatus.SETTLED,
            amount: total,
          },
        });
      }
    }

    console.log(`✅ Smenalar va buyurtmalar yaratildi`);
  } else {
    console.log(`⏩  Smenalar mavjud (${existingShiftCount} ta)`);
  }

  // ─── 9. Debt Records ─────────────────────────────────────────
  const existingDebts = await prisma.debtRecord.count({ where: { tenantId: tenant.id } });
  if (existingDebts < 3) {
    const debtData = [
      { custIdx: 0, amount: 350000,  daysOverdue: 5,  note: 'Iyun qoldig\'i' },
      { custIdx: 1, amount: 890000,  daysOverdue: 12, note: 'Parfumeriya' },
      { custIdx: 2, amount: 1250000, daysOverdue: 31, note: 'Ulgurji to\'lov' },
      { custIdx: 3, amount: 540000,  daysOverdue: 42, note: 'Kosmetika to\'plami' },
      { custIdx: 4, amount: 2100000, daysOverdue: 65, note: 'Katta buyurtma' },
      { custIdx: 5, amount: 780000,  daysOverdue: 78, note: 'Muddati o\'tgan' },
    ];

    for (const d of debtData) {
      const dueDate = daysAgo(d.daysOverdue);
      await prisma.debtRecord.create({
        data: {
          tenantId: tenant.id,
          customerId: customerIds[d.custIdx % customerIds.length],
          totalAmount: d.amount,
          paidAmount: 0,
          remaining: d.amount,
          dueDate,
          status: d.daysOverdue > 0 ? DebtStatus.OVERDUE : DebtStatus.ACTIVE,
          notes: d.note,
        },
      });
    }
    console.log(`✅ Nasiya yozuvlar: 6 ta`);
  } else {
    console.log(`⏩  Nasiya yozuvlar mavjud (${existingDebts} ta)`);
  }

  // ─── 10. Notifications (Alerts) ──────────────────────────────
  const existingNotifs = await prisma.notification.count({ where: { tenantId: tenant.id } });
  if (existingNotifs < 4) {
    const alerts = [
      { type: NotificationType.LOW_STOCK,           title: 'Kam qoldiq',         body: 'Chanel No.5 — faqat 3 dona qoldi' },
      { type: NotificationType.LOW_STOCK,           title: 'Kam qoldiq',         body: 'Versace Eros — faqat 2 dona qoldi' },
      { type: NotificationType.ERROR_ALERT,         title: 'Kassa xatosi',       body: 'Chilonzor filialdagi kassa sinxronlashtirilmadi' },
      { type: NotificationType.NASIYA_OVERDUE,      title: 'Nasiya muddati o\'tdi', body: 'Malika Xasanova — 350,000 so\'m muddati 5 kun o\'tdi' },
      { type: NotificationType.NASIYA_OVERDUE,      title: 'Nasiya muddati o\'tdi', body: 'Feruza Umarova — 1,250,000 so\'m muddati 31 kun o\'tdi' },
      { type: NotificationType.LARGE_REFUND,        title: 'Katta qaytarildi',   body: 'Sarvar Toshmatov — 1,100,000 so\'mlik qaytarish' },
      { type: NotificationType.SYSTEM,              title: 'Tizim yangilandi',   body: 'RAOS v2.1.0 — yangi funksiyalar qo\'shildi' },
      { type: NotificationType.EXPIRY_WARNING,      title: 'Muddati yaqin',      body: 'L\'Oreal Elvive — 15 dona 30 kun ichida muddati tugaydi' },
    ];

    for (const a of alerts) {
      await prisma.notification.create({
        data: {
          tenantId: tenant.id,
          userId: owner.id,
          type: a.type,
          title: a.title,
          body: a.body,
          isRead: false,
        },
      });
    }
    console.log(`✅ Bildirnomalар: ${alerts.length} ta`);
  } else {
    console.log(`⏩  Bildirnomalар mavjud (${existingNotifs} ta)`);
  }

  // ─── Summary ─────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Seed muvaffaqiyatli yakunlandi!');
  console.log('='.repeat(60));
  console.log(`\nTenant slug : ${TENANT_SLUG}`);
  console.log(`Parol       : ${PASSWORD}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`👑 OWNER    | owner@kosmetika.uz`);
  for (const c of CASHIERS) {
    console.log(`💰 CASHIER  | ${c.email}`);
  }
  console.log(`${'─'.repeat(60)}`);
  console.log('\n📱 Mobile app (mobile-owner) login:');
  console.log(`  Tenant slug : ${TENANT_SLUG}`);
  console.log(`  Email       : owner@kosmetika.uz`);
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
