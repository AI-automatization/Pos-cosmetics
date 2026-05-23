/**
 * RAOS Dev Seed — Kosmetika Demo (idempotent)
 *
 * Ishlatish:
 *   cd apps/api
 *   SEED_PASSWORD=YourPass123! npx ts-node prisma/seed.ts
 *
 * Yoki:
 *   pnpm --filter api prisma:seed
 *
 * Tenant slug: kosmetika-demo
 * Parol: SEED_PASSWORD env orqali beriladi
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
if (!process.env.SEED_PASSWORD) {
  throw new Error('SEED_PASSWORD environment variable is required. Set it in .env before running seed.');
}
const PASSWORD = process.env.SEED_PASSWORD;
const BCRYPT_ROUNDS = 12;

// ─── Products ────────────────────────────────────────────────────
// initialQty: fixed stock quantity (used for low-stock demo items).
// If omitted, randBetween(20, 80) is used.
// category: maps to category name for assignment
const PRODUCTS: Array<{ name: string; sku: string; cost: number; sell: number; minStock: number; initialQty?: number; category: string }> = [
  // ── Kosmetika (11 ta) ──────────────────────────────────────────
  { name: "Chanel No.5 EDP 100ml",   sku: "CH-N5-100",    cost: 850000,  sell: 1200000, minStock: 5,  category: "Kosmetika" },
  { name: "Dior Sauvage EDT 100ml",  sku: "DR-SAU-100",   cost: 780000,  sell: 1100000, minStock: 5,  category: "Kosmetika" },
  { name: "L'Oreal Elvive Shampoo",  sku: "LOR-ELV-400",  cost: 45000,   sell: 72000,   minStock: 20, category: "Kosmetika" },
  { name: "Nivea Soft Cream 300ml",  sku: "NIV-SOFT-300", cost: 38000,   sell: 58000,   minStock: 20, category: "Kosmetika" },
  { name: "MAC Lipstick Ruby Woo",   sku: "MAC-LIP-RW",   cost: 280000,  sell: 420000,  minStock: 10, category: "Kosmetika" },
  { name: "Versace Eros EDT 100ml",  sku: "VER-ERO-100",  cost: 920000,  sell: 1350000, minStock: 3,  category: "Kosmetika" },
  { name: "Garnier Vitamin C Serum", sku: "GAR-VIT-30",   cost: 65000,   sell: 98000,   minStock: 15, category: "Kosmetika" },
  { name: "NYX Eyeshadow Palette",   sku: "NYX-PAL-ULT",  cost: 185000,  sell: 275000,  minStock: 8,  category: "Kosmetika" },
  { name: "Maybelline Mascara",      sku: "MAY-MAS-BIG",  cost: 55000,   sell: 82000,   minStock: 20, category: "Kosmetika" },
  { name: "KIKO Milano Lipstick",    sku: "KIK-LIP-315",  cost: 95000,   sell: 148000,  minStock: 10, category: "Kosmetika" },
  // T-339: Low-stock demo — currentStock(7) < minStockLevel(10) → POS toast trigger
  { name: "La Roche-Posay SPF50+",   sku: "LRP-SPF-50",   cost: 185000,  sell: 278000,  minStock: 10, initialQty: 7, category: "Kosmetika" },
  // ── Kiyim (12 ta) ─────────────────────────────────────────────
  { name: "Erkaklar T-shirt (M)",    sku: "KIY-TSHRT-M",  cost: 50000,   sell: 85000,   minStock: 15, category: "Kiyim" },
  { name: "Erkaklar T-shirt (L)",    sku: "KIY-TSHRT-L",  cost: 50000,   sell: 85000,   minStock: 15, category: "Kiyim" },
  { name: "Ayollar Ko'ylak (M)",     sku: "KIY-KOYL-M",   cost: 120000,  sell: 195000,  minStock: 10, category: "Kiyim" },
  { name: "Ayollar Ko'ylak (L)",     sku: "KIY-KOYL-L",   cost: 120000,  sell: 195000,  minStock: 10, category: "Kiyim" },
  { name: "Erkaklar Shim (32)",      sku: "KIY-SHIM-32",  cost: 160000,  sell: 265000,  minStock: 10, category: "Kiyim" },
  { name: "Erkaklar Shim (34)",      sku: "KIY-SHIM-34",  cost: 160000,  sell: 265000,  minStock: 10, category: "Kiyim" },
  { name: "Ayollar Shim (M)",        sku: "KIY-ASHIM-M",  cost: 145000,  sell: 235000,  minStock: 8,  category: "Kiyim" },
  { name: "Erkaklar Kurtka",         sku: "KIY-KURT-M",   cost: 280000,  sell: 450000,  minStock: 5,  category: "Kiyim" },
  { name: "Ayollar Kurtka",          sku: "KIY-AKURT-M",  cost: 260000,  sell: 420000,  minStock: 5,  category: "Kiyim" },
  { name: "Futbolka (S)",            sku: "KIY-FUTB-S",   cost: 45000,   sell: 75000,   minStock: 20, category: "Kiyim" },
  { name: "Yozgi Ko'ylak",           sku: "KIY-YKOY-M",   cost: 85000,   sell: 140000,  minStock: 12, category: "Kiyim" },
  { name: "Sport Kostyum",           sku: "KIY-SPORT-M",  cost: 220000,  sell: 360000,  minStock: 6,  category: "Kiyim" },
  // ── Oziq-ovqat (10 ta) ────────────────────────────────────────
  { name: "Choy (100g qora)",        sku: "OZQ-CHOY-100", cost: 18000,   sell: 28000,   minStock: 30, category: "Oziq-ovqat" },
  { name: "Choy (200g yashil)",      sku: "OZQ-CHOY-200", cost: 22000,   sell: 35000,   minStock: 25, category: "Oziq-ovqat" },
  { name: "Shokolad (Milka 90g)",    sku: "OZQ-SHOK-90",  cost: 12000,   sell: 19000,   minStock: 40, category: "Oziq-ovqat" },
  { name: "Shokolad (Snickers)",     sku: "OZQ-SNIK-50",  cost: 8000,    sell: 13000,   minStock: 50, category: "Oziq-ovqat" },
  { name: "Suv (Nestle 1.5L)",       sku: "OZQ-SUV-15",   cost: 5000,    sell: 8000,    minStock: 60, category: "Oziq-ovqat" },
  { name: "Suv (Akva 0.5L)",         sku: "OZQ-SUV-05",   cost: 3000,    sell: 5000,    minStock: 80, category: "Oziq-ovqat" },
  { name: "Qahva (Nescafe 95g)",     sku: "OZQ-QAHV-95",  cost: 28000,   sell: 45000,   minStock: 20, category: "Oziq-ovqat" },
  { name: "Gaz. Ichimlik (Cola 1L)", sku: "OZQ-COLA-1L",  cost: 9000,    sell: 15000,   minStock: 30, category: "Oziq-ovqat" },
  { name: "Limon (1kg)",             sku: "OZQ-LIM-1KG",  cost: 15000,   sell: 25000,   minStock: 20, category: "Oziq-ovqat" },
  { name: "Konfet (Assorted 200g)",  sku: "OZQ-KONF-200", cost: 20000,   sell: 32000,   minStock: 25, category: "Oziq-ovqat" },
  // ── Elektronika (10 ta) ───────────────────────────────────────
  { name: "Quloqchin (Basic)",       sku: "ELK-QULOQ-B",  cost: 30000,   sell: 52000,   minStock: 15, category: "Elektronika" },
  { name: "Quloqchin (Bluetooth)",   sku: "ELK-QULOQ-BT", cost: 120000,  sell: 195000,  minStock: 8,  category: "Elektronika" },
  { name: "Powerbank 10000mAh",      sku: "ELK-PWR-10",   cost: 150000,  sell: 245000,  minStock: 8,  category: "Elektronika" },
  { name: "Powerbank 20000mAh",      sku: "ELK-PWR-20",   cost: 220000,  sell: 360000,  minStock: 5,  category: "Elektronika" },
  { name: "USB-C Kabel (1m)",        sku: "ELK-USB-C1",   cost: 18000,   sell: 32000,   minStock: 25, category: "Elektronika" },
  { name: "Lightning Kabel (1m)",    sku: "ELK-LTN-1M",   cost: 20000,   sell: 35000,   minStock: 20, category: "Elektronika" },
  { name: "Telefon Holster",         sku: "ELK-HOLS-UNI", cost: 35000,   sell: 60000,   minStock: 15, category: "Elektronika" },
  { name: "Simsiz Zaryadlovchi",     sku: "ELK-WCH-15W",  cost: 90000,   sell: 148000,  minStock: 10, category: "Elektronika" },
  { name: "USB Hub (4-port)",        sku: "ELK-HUB-4P",   cost: 65000,   sell: 108000,  minStock: 8,  category: "Elektronika" },
  { name: "Selfi Ring Light",        sku: "ELK-RING-6IN", cost: 85000,   sell: 145000,  minStock: 6,  category: "Elektronika" },
  // ── Parfyumeriya (7 ta) ───────────────────────────────────────
  { name: "Hugo Boss EDT 100ml",     sku: "PRF-HUGO-100",  cost: 320000,  sell: 520000,  minStock: 5,  category: "Parfyumeriya" },
  { name: "Armani Code EDP 75ml",    sku: "PRF-ARMC-75",   cost: 450000,  sell: 720000,  minStock: 4,  category: "Parfyumeriya" },
  { name: "Dolce Gabbana Light 50ml",sku: "PRF-DGL-50",    cost: 380000,  sell: 610000,  minStock: 4,  category: "Parfyumeriya" },
  { name: "Calvin Klein CK One",     sku: "PRF-CK-ONE",    cost: 260000,  sell: 420000,  minStock: 6,  category: "Parfyumeriya" },
  { name: "Davidoff Cool Water 100", sku: "PRF-DCW-100",   cost: 210000,  sell: 340000,  minStock: 6,  category: "Parfyumeriya" },
  { name: "Paco Rabanne 1M EDT",     sku: "PRF-PR1M-100",  cost: 480000,  sell: 780000,  minStock: 3,  category: "Parfyumeriya" },
  { name: "Lacoste L.12.12 Blanc",   sku: "PRF-LAC-100",   cost: 290000,  sell: 465000,  minStock: 5,  category: "Parfyumeriya" },
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
  { name: "Malika Xasanova",    phone: "+998901234567" },
  { name: "Dilnoza Karimova",   phone: "+998901234568" },
  { name: "Feruza Umarova",     phone: "+998901234569" },
  { name: "Nodira Tojiboyeva",  phone: "+998901234570" },
  { name: "Barno Mirzayeva",    phone: "+998901234571" },
  { name: "Gulnora Hasanova",   phone: "+998901234572" },
  { name: "Shahnoza Abdullayeva", phone: "+998911234573" },
  { name: "Mohira Yusupova",    phone: "+998931234574" },
  { name: "Zulfiya Ergasheva",  phone: "+998941234575" },
  { name: "Nafisa Qodirov",     phone: "+998951234576" },
  { name: "Maftuna Tursunova",  phone: "+998971234577" },
  { name: "Sarvinoz Xoliqova",  phone: "+998981234578" },
  { name: "Oydin Nazarova",     phone: "+998991234579" },
  { name: "Hulkar Rajabova",    phone: "+998901234580" },
  { name: "Aziza Sobirov",      phone: "+998911234581" },
  { name: "Dilorom Isoqova",    phone: "+998931234582" },
  { name: "Muazzam Aliyeva",    phone: "+998941234583" },
  { name: "Iroda Hamidova",     phone: "+998951234584" },
  { name: "Nozima Baxtiyorova", phone: "+998971234585" },
  { name: "Kamola Razzaqova",   phone: "+998981234586" },
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
    { email: 'owner@raos.uz',     firstName: 'Sardor',  lastName: 'Karimov',        role: UserRole.OWNER },
    { email: 'admin@raos.uz',     firstName: 'Dilnoza', lastName: 'Yusupova',        role: UserRole.ADMIN },
    { email: 'manager@raos.uz',   firstName: 'Jasur',   lastName: 'Toshmatov',       role: UserRole.MANAGER },
    { email: 'cashier@raos.uz',   firstName: 'Malika',  lastName: 'Rahimova',        role: UserRole.CASHIER },
    { email: 'viewer@raos.uz',    firstName: 'Bobur',   lastName: 'Nazarov',         role: UserRole.VIEWER },
    { email: 'warehouse@raos.uz', firstName: 'Sherzod', lastName: 'Ergashev',        role: UserRole.WAREHOUSE },
    // T-458: Demo Tenant user
    { email: 'demo@raos.uz',      firstName: 'Demo',    lastName: 'Foydalanuvchi',   role: UserRole.OWNER },
  ];
  for (const u of legacyUsers) {
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
      update: {},
      create: { tenantId: tenant.id, passwordHash, ...u },
    });
  }
  console.log(`✅ Legacy raos-demo users (7 ta)`);

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

  // ─── 5. Categories + Products ────────────────────────────────
  const CATEGORY_NAMES = ['Kosmetika', 'Kiyim', 'Oziq-ovqat', 'Elektronika', 'Parfyumeriya'];
  const categoryMap: Map<string, string> = new Map(); // name → id
  for (const catName of CATEGORY_NAMES) {
    let cat = await prisma.category.findFirst({
      where: { tenantId: tenant.id, name: catName },
    });
    if (!cat) {
      cat = await prisma.category.create({
        data: { tenantId: tenant.id, name: catName },
      });
    }
    categoryMap.set(catName, cat.id);
  }
  console.log(`✅ Kategoriyalar: ${CATEGORY_NAMES.join(', ')}`);

  const products: Array<{ id: string; sell: number; cost: number; name: string; initialQty?: number }> = [];
  for (const p of PRODUCTS) {
    const catId = categoryMap.get(p.category);
    if (!catId) throw new Error(`Category not found: ${p.category}`);
    let product = await prisma.product.findFirst({
      where: { tenantId: tenant.id, sku: p.sku },
    });
    if (!product) {
      product = await prisma.product.create({
        data: {
          tenantId: tenant.id,
          categoryId: catId,
          name: p.name,
          sku: p.sku,
          costPrice: p.cost,
          sellPrice: p.sell,
          minStockLevel: p.minStock,
          isActive: true,
        },
      });
    }
    products.push({ id: product.id, sell: p.sell, cost: p.cost, name: p.name, initialQty: p.initialQty });
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

  // ─── 7b. Loyalty Config ──────────────────────────────────────
  await prisma.loyaltyConfig.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      isActive: true,
      earnRate: 1000,   // 1 ball per 1000 so'm
      redeemRate: 100,  // 1 ball = 100 so'm
      minRedeem: 100,
    },
  });
  console.log(`✅ Loyalty config yaratildi`);

  // ─── 7c. Loyalty Accounts for customers ──────────────────────
  for (const customerId of customerIds) {
    const existing = await prisma.loyaltyAccount.findUnique({
      where: { customerId },
    });
    if (!existing) {
      await prisma.loyaltyAccount.create({
        data: {
          tenantId: tenant.id,
          customerId,
          points: randBetween(50, 500),
        },
      });
    }
  }
  console.log(`✅ Loyalty accountlar: ${customerIds.length} ta`);

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
  console.log(`Parol       : [SEED_PASSWORD env dan]`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`👑 OWNER    | owner@kosmetika.uz`);
  console.log(`👑 OWNER    | demo@raos.uz (T-458 demo user)`);
  for (const c of CASHIERS) {
    console.log(`💰 CASHIER  | ${c.email}`);
  }
  console.log(`${'─'.repeat(60)}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed xato:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
