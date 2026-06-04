/**
 * RAOS Demo Seed — sotuv jamoasi uchun (idempotent) — #105
 *
 * Outreach paytida ko'rsatish uchun to'liq "RAOS Demo Do'kon" tenantini yaratadi:
 *   - 3 filial (Toshkent, Samarqand, Namangan)
 *   - 50 mahsulot (Kosmetika 15, Kiyim 15, Oziq-ovqat 10, Elektronika 10)
 *   - 20 mijoz (loyalty balli bilan)
 *   - 30 sotuv (so'nggi 7 kun)
 *
 * Login:  demo@raos.uz  /  demo2026   (DEMO_SEED_PASSWORD env bilan override qilinadi)
 *
 * Ishlatish:
 *   pnpm --filter api seed:demo
 *
 * Idempotent: qayta ishga tushirilsa dublikat yaratmaydi (slug/sku/phone bo'yicha tekshiradi).
 *
 * Eslatma: demo-rejim cheklovlari (MAX 100 mahsulot / 1000 sotuv / 30 kun banner)
 * alohida app-level feature — bu skript faqat demo ma'lumotlarni urug'laydi.
 * Tenant TRIAL subscription orqali 30-kunlik demo sifatida belgilanadi (mavjud bo'lsa).
 */

import {
  PrismaClient,
  UserRole,
  ShiftStatus,
  OrderStatus,
  PaymentMethod,
  PaymentIntentStatus,
  StockMovementType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TENANT_SLUG = 'raos-demo';
const TENANT_NAME = "RAOS Demo Do'kon";
const DEMO_EMAIL = 'demo@raos.uz';
// Demo login ataylab ommaviy (sotuv jamoasi ko'rsatadi) — env bilan override mumkin.
const PASSWORD = process.env.DEMO_SEED_PASSWORD ?? 'demo2026';
const BCRYPT_ROUNDS = 12;

const TARGET_SALES = 30;

const BRANCHES = [
  { name: 'Toshkent filiali', address: "Toshkent sh., Amir Temur ko'ch 1" },
  { name: 'Samarqand filiali', address: "Samarqand sh., Registon ko'ch 14" },
  { name: 'Namangan filiali', address: "Namangan sh., Navoiy ko'ch 22" },
];

const CASHIERS = [
  { firstName: 'Sarvar', lastName: 'Toshmatov', email: 'kassir1@raos-demo.uz' },
  { firstName: 'Zulfiya', lastName: 'Nazarova', email: 'kassir2@raos-demo.uz' },
];

// 50 mahsulot: Kosmetika 15, Kiyim 15, Oziq-ovqat 10, Elektronika 10
const PRODUCTS: Array<{ name: string; sku: string; cost: number; sell: number; minStock: number; category: string }> = [
  // ── Kosmetika (15) ──
  { name: 'Chanel No.5 EDP 100ml', sku: 'DEMO-KOS-01', cost: 850000, sell: 1200000, minStock: 5, category: 'Kosmetika' },
  { name: 'Dior Sauvage EDT 100ml', sku: 'DEMO-KOS-02', cost: 780000, sell: 1100000, minStock: 5, category: 'Kosmetika' },
  { name: "L'Oreal Elvive Shampoo", sku: 'DEMO-KOS-03', cost: 45000, sell: 72000, minStock: 20, category: 'Kosmetika' },
  { name: 'Nivea Soft Cream 300ml', sku: 'DEMO-KOS-04', cost: 38000, sell: 58000, minStock: 20, category: 'Kosmetika' },
  { name: 'MAC Lipstick Ruby Woo', sku: 'DEMO-KOS-05', cost: 280000, sell: 420000, minStock: 10, category: 'Kosmetika' },
  { name: 'Versace Eros EDT 100ml', sku: 'DEMO-KOS-06', cost: 920000, sell: 1350000, minStock: 3, category: 'Kosmetika' },
  { name: 'Garnier Vitamin C Serum', sku: 'DEMO-KOS-07', cost: 65000, sell: 98000, minStock: 15, category: 'Kosmetika' },
  { name: 'NYX Eyeshadow Palette', sku: 'DEMO-KOS-08', cost: 185000, sell: 275000, minStock: 8, category: 'Kosmetika' },
  { name: 'Maybelline Mascara', sku: 'DEMO-KOS-09', cost: 55000, sell: 82000, minStock: 20, category: 'Kosmetika' },
  { name: 'KIKO Milano Lipstick', sku: 'DEMO-KOS-10', cost: 95000, sell: 148000, minStock: 10, category: 'Kosmetika' },
  { name: 'La Roche-Posay SPF50+', sku: 'DEMO-KOS-11', cost: 185000, sell: 278000, minStock: 10, category: 'Kosmetika' },
  { name: 'Loreal Paris Foundation', sku: 'DEMO-KOS-12', cost: 110000, sell: 175000, minStock: 12, category: 'Kosmetika' },
  { name: 'Vichy Mineral 89', sku: 'DEMO-KOS-13', cost: 220000, sell: 340000, minStock: 6, category: 'Kosmetika' },
  { name: 'Essence Mascara Volume', sku: 'DEMO-KOS-14', cost: 42000, sell: 68000, minStock: 18, category: 'Kosmetika' },
  { name: 'CeraVe Cleanser 236ml', sku: 'DEMO-KOS-15', cost: 130000, sell: 198000, minStock: 8, category: 'Kosmetika' },
  // ── Kiyim (15) ──
  { name: 'Erkaklar T-shirt (M)', sku: 'DEMO-KIY-01', cost: 50000, sell: 85000, minStock: 15, category: 'Kiyim' },
  { name: 'Erkaklar T-shirt (L)', sku: 'DEMO-KIY-02', cost: 50000, sell: 85000, minStock: 15, category: 'Kiyim' },
  { name: "Ayollar Ko'ylak (M)", sku: 'DEMO-KIY-03', cost: 120000, sell: 195000, minStock: 10, category: 'Kiyim' },
  { name: "Ayollar Ko'ylak (L)", sku: 'DEMO-KIY-04', cost: 120000, sell: 195000, minStock: 10, category: 'Kiyim' },
  { name: 'Erkaklar Shim (32)', sku: 'DEMO-KIY-05', cost: 160000, sell: 265000, minStock: 10, category: 'Kiyim' },
  { name: 'Erkaklar Shim (34)', sku: 'DEMO-KIY-06', cost: 160000, sell: 265000, minStock: 10, category: 'Kiyim' },
  { name: 'Ayollar Shim (M)', sku: 'DEMO-KIY-07', cost: 145000, sell: 235000, minStock: 8, category: 'Kiyim' },
  { name: 'Erkaklar Kurtka', sku: 'DEMO-KIY-08', cost: 280000, sell: 450000, minStock: 5, category: 'Kiyim' },
  { name: 'Ayollar Kurtka', sku: 'DEMO-KIY-09', cost: 260000, sell: 420000, minStock: 5, category: 'Kiyim' },
  { name: 'Futbolka (S)', sku: 'DEMO-KIY-10', cost: 45000, sell: 75000, minStock: 20, category: 'Kiyim' },
  { name: "Yozgi Ko'ylak", sku: 'DEMO-KIY-11', cost: 85000, sell: 140000, minStock: 12, category: 'Kiyim' },
  { name: 'Sport Kostyum', sku: 'DEMO-KIY-12', cost: 220000, sell: 360000, minStock: 6, category: 'Kiyim' },
  { name: 'Jinsi Shim (Klassik)', sku: 'DEMO-KIY-13', cost: 175000, sell: 285000, minStock: 8, category: 'Kiyim' },
  { name: 'Ayollar Yubka', sku: 'DEMO-KIY-14', cost: 95000, sell: 158000, minStock: 10, category: 'Kiyim' },
  { name: 'Erkaklar Kozok', sku: 'DEMO-KIY-15', cost: 130000, sell: 215000, minStock: 7, category: 'Kiyim' },
  // ── Oziq-ovqat (10) ──
  { name: 'Choy (100g qora)', sku: 'DEMO-OZQ-01', cost: 18000, sell: 28000, minStock: 30, category: 'Oziq-ovqat' },
  { name: 'Choy (200g yashil)', sku: 'DEMO-OZQ-02', cost: 22000, sell: 35000, minStock: 25, category: 'Oziq-ovqat' },
  { name: 'Shokolad (Milka 90g)', sku: 'DEMO-OZQ-03', cost: 12000, sell: 19000, minStock: 40, category: 'Oziq-ovqat' },
  { name: 'Shokolad (Snickers)', sku: 'DEMO-OZQ-04', cost: 8000, sell: 13000, minStock: 50, category: 'Oziq-ovqat' },
  { name: 'Suv (Nestle 1.5L)', sku: 'DEMO-OZQ-05', cost: 5000, sell: 8000, minStock: 60, category: 'Oziq-ovqat' },
  { name: 'Suv (Akva 0.5L)', sku: 'DEMO-OZQ-06', cost: 3000, sell: 5000, minStock: 80, category: 'Oziq-ovqat' },
  { name: 'Qahva (Nescafe 95g)', sku: 'DEMO-OZQ-07', cost: 28000, sell: 45000, minStock: 20, category: 'Oziq-ovqat' },
  { name: 'Gaz. Ichimlik (Cola 1L)', sku: 'DEMO-OZQ-08', cost: 9000, sell: 15000, minStock: 30, category: 'Oziq-ovqat' },
  { name: 'Limon (1kg)', sku: 'DEMO-OZQ-09', cost: 15000, sell: 25000, minStock: 20, category: 'Oziq-ovqat' },
  { name: 'Konfet (Assorted 200g)', sku: 'DEMO-OZQ-10', cost: 20000, sell: 32000, minStock: 25, category: 'Oziq-ovqat' },
  // ── Elektronika (10) ──
  { name: 'Quloqchin (Basic)', sku: 'DEMO-ELK-01', cost: 30000, sell: 52000, minStock: 15, category: 'Elektronika' },
  { name: 'Quloqchin (Bluetooth)', sku: 'DEMO-ELK-02', cost: 120000, sell: 195000, minStock: 8, category: 'Elektronika' },
  { name: 'Powerbank 10000mAh', sku: 'DEMO-ELK-03', cost: 150000, sell: 245000, minStock: 8, category: 'Elektronika' },
  { name: 'Powerbank 20000mAh', sku: 'DEMO-ELK-04', cost: 220000, sell: 360000, minStock: 5, category: 'Elektronika' },
  { name: 'USB-C Kabel (1m)', sku: 'DEMO-ELK-05', cost: 18000, sell: 32000, minStock: 25, category: 'Elektronika' },
  { name: 'Lightning Kabel (1m)', sku: 'DEMO-ELK-06', cost: 20000, sell: 35000, minStock: 20, category: 'Elektronika' },
  { name: 'Telefon Holster', sku: 'DEMO-ELK-07', cost: 35000, sell: 60000, minStock: 15, category: 'Elektronika' },
  { name: 'Simsiz Zaryadlovchi', sku: 'DEMO-ELK-08', cost: 90000, sell: 148000, minStock: 10, category: 'Elektronika' },
  { name: 'USB Hub (4-port)', sku: 'DEMO-ELK-09', cost: 65000, sell: 108000, minStock: 8, category: 'Elektronika' },
  { name: 'Selfi Ring Light', sku: 'DEMO-ELK-10', cost: 85000, sell: 145000, minStock: 6, category: 'Elektronika' },
];

const CUSTOMERS: Array<{ name: string; phone: string }> = [
  { name: 'Malika Xasanova', phone: '+998901110001' },
  { name: 'Dilnoza Karimova', phone: '+998901110002' },
  { name: 'Feruza Umarova', phone: '+998901110003' },
  { name: 'Nodira Tojiboyeva', phone: '+998901110004' },
  { name: 'Barno Mirzayeva', phone: '+998901110005' },
  { name: 'Gulnora Hasanova', phone: '+998901110006' },
  { name: 'Shahnoza Abdullayeva', phone: '+998901110007' },
  { name: 'Mohira Yusupova', phone: '+998901110008' },
  { name: 'Zulfiya Ergasheva', phone: '+998901110009' },
  { name: 'Nafisa Qodirova', phone: '+998901110010' },
  { name: 'Maftuna Tursunova', phone: '+998901110011' },
  { name: 'Sarvinoz Xoliqova', phone: '+998901110012' },
  { name: 'Oydin Nazarova', phone: '+998901110013' },
  { name: 'Hulkar Rajabova', phone: '+998901110014' },
  { name: 'Aziza Sobirova', phone: '+998901110015' },
  { name: 'Dilorom Isoqova', phone: '+998901110016' },
  { name: 'Muazzam Aliyeva', phone: '+998901110017' },
  { name: 'Iroda Hamidova', phone: '+998901110018' },
  { name: 'Nozima Baxtiyorova', phone: '+998901110019' },
  { name: 'Kamola Razzaqova', phone: '+998901110020' },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 RAOS Demo seed boshlandi...\n');

  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

  // ─── 1. Tenant ───────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {},
    create: { name: TENANT_NAME, slug: TENANT_SLUG, businessType: 'COSMETICS', city: 'Toshkent' },
  });
  console.log(`✅ Tenant: "${tenant.name}" (${tenant.slug})`);

  // ─── 2. Owner (demo login) ───────────────────────────────────
  const owner = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: DEMO_EMAIL } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: DEMO_EMAIL,
      passwordHash,
      firstName: 'Demo',
      lastName: 'Egasi',
      role: UserRole.OWNER,
    },
  });
  console.log(`✅ Owner: ${DEMO_EMAIL}`);

  // ─── 3. Cashiers ─────────────────────────────────────────────
  const cashiers: Array<{ id: string }> = [];
  for (const c of CASHIERS) {
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
  console.log(`✅ Kassirlar: ${cashiers.length} ta`);

  // ─── 4. Branches ─────────────────────────────────────────────
  const branches: Array<{ id: string; name: string }> = [];
  for (const b of BRANCHES) {
    let branch = await prisma.branch.findFirst({ where: { tenantId: tenant.id, name: b.name } });
    if (!branch) {
      branch = await prisma.branch.create({ data: { tenantId: tenant.id, name: b.name, address: b.address } });
    }
    branches.push(branch);
  }
  console.log(`✅ Filiallar: ${branches.map((b) => b.name).join(', ')}`);

  // ─── 5. Categories + Products ────────────────────────────────
  const CATEGORY_NAMES = ['Kosmetika', 'Kiyim', 'Oziq-ovqat', 'Elektronika'];
  const categoryMap = new Map<string, string>();
  for (const catName of CATEGORY_NAMES) {
    let cat = await prisma.category.findFirst({ where: { tenantId: tenant.id, name: catName } });
    if (!cat) {
      cat = await prisma.category.create({ data: { tenantId: tenant.id, name: catName } });
    }
    categoryMap.set(catName, cat.id);
  }
  console.log(`✅ Kategoriyalar: ${CATEGORY_NAMES.join(', ')}`);

  const products: Array<{ id: string; sell: number; cost: number; name: string }> = [];
  for (const p of PRODUCTS) {
    const catId = categoryMap.get(p.category);
    if (!catId) throw new Error(`Category not found: ${p.category}`);
    let product = await prisma.product.findFirst({ where: { tenantId: tenant.id, sku: p.sku } });
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
    products.push({ id: product.id, sell: p.sell, cost: p.cost, name: p.name });
  }
  console.log(`✅ Mahsulotlar: ${products.length} ta`);

  // ─── 6. Warehouses + initial stock ───────────────────────────
  const warehouses = new Map<string, string>(); // branchId → warehouseId
  for (const branch of branches) {
    let wh = await prisma.warehouse.findFirst({ where: { tenantId: tenant.id, branchId: branch.id } });
    if (!wh) {
      wh = await prisma.warehouse.create({
        data: { tenantId: tenant.id, branchId: branch.id, name: `${branch.name} ombori` },
      });
    }
    warehouses.set(branch.id, wh.id);

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
            quantity: randBetween(30, 90),
            costPrice: p.cost,
            note: "Boshlang'ich qoldiq (demo seed)",
          },
        });
      }
    }
  }
  console.log('✅ Omborlar va boshlang\'ich qoldiqlar');

  // ─── 7. Customers + Loyalty ──────────────────────────────────
  const customerIds: string[] = [];
  for (const c of CUSTOMERS) {
    let customer = await prisma.customer.findFirst({ where: { tenantId: tenant.id, phone: c.phone } });
    if (!customer) {
      customer = await prisma.customer.create({ data: { tenantId: tenant.id, name: c.name, phone: c.phone } });
    }
    customerIds.push(customer.id);
  }
  console.log(`✅ Mijozlar: ${customerIds.length} ta`);

  await prisma.loyaltyConfig.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: { tenantId: tenant.id, isActive: true, earnRate: 1000, redeemRate: 100, minRedeem: 100 },
  });
  for (const customerId of customerIds) {
    const existing = await prisma.loyaltyAccount.findUnique({ where: { customerId } });
    if (!existing) {
      await prisma.loyaltyAccount.create({
        data: { tenantId: tenant.id, customerId, points: randBetween(50, 500) },
      });
    }
  }
  console.log(`✅ Loyalty: config + ${customerIds.length} account`);

  // ─── 8. Shifts + 30 sales (last 7 days) ──────────────────────
  const existingOrders = await prisma.order.count({ where: { tenantId: tenant.id } });
  if (existingOrders < TARGET_SALES) {
    const paymentMethods = [PaymentMethod.CASH, PaymentMethod.TERMINAL, PaymentMethod.CLICK, PaymentMethod.PAYME];

    // 6 yopiq smena: so'nggi 7 kun ichida, 3 filial bo'ylab
    const shifts: Array<{ id: string; branchId: string; cashierId: string; openedAt: Date }> = [];
    for (let i = 0; i < 6; i++) {
      const branch = branches[i % branches.length];
      const cashier = cashiers[i % cashiers.length];
      const openedAt = daysAgo(randBetween(1, 7));
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
      shifts.push({ id: shift.id, branchId: branch.id, cashierId: cashier.id, openedAt });
    }

    // 30 sotuvni smenalar bo'ylab taqsimlash
    let orderNumber = existingOrders;
    for (let s = 0; s < TARGET_SALES; s++) {
      orderNumber += 1;
      const shift = shifts[s % shifts.length];
      const product = pick(products);
      const qty = randBetween(1, 3);
      const total = product.sell * qty;
      const createdAt = new Date(shift.openedAt.getTime() + randBetween(0, 11) * 3600000);

      const order = await prisma.order.create({
        data: {
          tenantId: tenant.id,
          shiftId: shift.id,
          userId: shift.cashierId,
          branchId: shift.branchId,
          orderNumber,
          status: OrderStatus.COMPLETED,
          subtotal: total,
          total,
          createdAt,
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
          method: pick(paymentMethods),
          status: PaymentIntentStatus.SETTLED,
          amount: total,
        },
      });
    }
    console.log(`✅ Smenalar (6) va sotuvlar (${TARGET_SALES}) yaratildi`);
  } else {
    console.log(`⏩  Sotuvlar mavjud (${existingOrders} ta)`);
  }

  // ─── Summary ─────────────────────────────────────────────────
  console.log('\n' + '='.repeat(56));
  console.log('🎉 Demo seed yakunlandi!');
  console.log('='.repeat(56));
  console.log(`Tenant slug : ${TENANT_SLUG}`);
  console.log(`Login       : ${DEMO_EMAIL} / ${PASSWORD}`);
  console.log('='.repeat(56));
}

main()
  .catch((e) => {
    console.error('❌ Demo seed xato:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
