/**
 * RAOS Database Cleanup + Beautiful Demo Seed
 * Uses raw SQL for deletion (reliable) + Prisma for seeding
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL env required'); process.exit(1); }
const prisma = new PrismaClient({ datasourceUrl: DB_URL });

const KEEP_SLUG = 'kosmetika-demo';
const DEMO_PASSWORD = 'Demo2026!';

async function q(sql) {
  try { await prisma.$executeRawUnsafe(sql); } catch (e) { /* table may not exist */ }
}

// ═══════════════════════════════════════════════════
// STEP 1 + 2: Delete all junk tenants & clean demo via raw SQL
// ═══════════════════════════════════════════════════
async function cleanDatabase() {
  console.log('=== CLEANING DATABASE ===');

  // Get tenant IDs to delete
  const junkTenants = await prisma.tenant.findMany({
    where: { slug: { not: KEEP_SLUG } },
    select: { id: true, name: true, slug: true },
  });
  console.log(`Junk tenants to delete: ${junkTenants.length}`);

  const keepTenant = await prisma.tenant.findFirst({ where: { slug: KEEP_SLUG } });
  if (!keepTenant) throw new Error('Demo tenant not found!');

  const allTenantIds = [...junkTenants.map(t => t.id), keepTenant.id];
  const junkIds = junkTenants.map(t => `'${t.id}'`).join(',');
  const allIds = allTenantIds.map(id => `'${id}'`).join(',');

  // Delete ALL data from all tenants (including demo — we'll re-seed)
  console.log('  Deleting all tenant data...');

  // Leaf tables first
  const deletionOrder = [
    // AI tables
    `DELETE FROM ai_token_ledger WHERE workflow_id IN (SELECT id FROM ai_workflows WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM ai_incidents WHERE workflow_id IN (SELECT id FROM ai_workflows WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM ai_tasks WHERE workflow_id IN (SELECT id FROM ai_workflows WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM ai_workflows WHERE tenant_id IN (${allIds})`,
    `DELETE FROM ai_audit_logs WHERE tenant_id IN (${allIds})`,
    `DELETE FROM ai_memories WHERE tenant_id IN (${allIds})`,
    `DELETE FROM ai_prompts WHERE tenant_id IN (${allIds})`,

    // Support
    `DELETE FROM ticket_messages WHERE ticket_id IN (SELECT id FROM support_tickets WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM support_tickets WHERE tenant_id IN (${allIds})`,

    // Ledger
    `DELETE FROM journal_lines WHERE entry_id IN (SELECT id FROM journal_entries WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM journal_entries WHERE tenant_id IN (${allIds})`,

    // Audit/Events
    `DELETE FROM audit_logs WHERE tenant_id IN (${allIds})`,
    `DELETE FROM event_logs WHERE tenant_id IN (${allIds})`,

    // Real Estate
    `DELETE FROM rental_payments WHERE tenant_id IN (${allIds})`,
    `DELETE FROM rental_contracts WHERE tenant_id IN (${allIds})`,
    `DELETE FROM properties WHERE tenant_id IN (${allIds})`,

    // Tasks
    `DELETE FROM tasks WHERE tenant_id IN (${allIds})`,

    // Notifications
    `DELETE FROM notifications WHERE tenant_id IN (${allIds})`,
    `DELETE FROM reminder_logs WHERE tenant_id IN (${allIds})`,
    `DELETE FROM telegram_link_tokens WHERE tenant_id IN (${allIds})`,

    // Warehouse invoices
    `DELETE FROM warehouse_invoice_items WHERE invoice_id IN (SELECT id FROM warehouse_invoices WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM warehouse_invoices WHERE tenant_id IN (${allIds})`,

    // Stock transfers
    `DELETE FROM stock_transfer_items WHERE transfer_id IN (SELECT id FROM stock_transfers WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM stock_transfers WHERE tenant_id IN (${allIds})`,

    // Returns
    `DELETE FROM return_items WHERE return_id IN (SELECT id FROM returns WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM returns WHERE tenant_id IN (${allIds})`,

    // Orders
    `DELETE FROM payment_intents WHERE tenant_id IN (${allIds})`,
    `DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM orders WHERE tenant_id IN (${allIds})`,

    // Shifts
    `DELETE FROM z_reports WHERE tenant_id IN (${allIds})`,
    `DELETE FROM shifts WHERE tenant_id IN (${allIds})`,

    // Expenses
    `DELETE FROM expenses WHERE tenant_id IN (${allIds})`,

    // Debts
    `DELETE FROM debt_payments WHERE debt_record_id IN (SELECT id FROM debt_records WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM debt_records WHERE tenant_id IN (${allIds})`,

    // Loyalty
    `DELETE FROM loyalty_transactions WHERE account_id IN (SELECT id FROM loyalty_accounts WHERE customer_id IN (SELECT id FROM customers WHERE tenant_id IN (${allIds})))`,
    `DELETE FROM loyalty_accounts WHERE customer_id IN (SELECT id FROM customers WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM customers WHERE tenant_id IN (${allIds})`,
    `DELETE FROM loyalty_configs WHERE tenant_id IN (${allIds})`,

    // Stock
    `DELETE FROM stock_movements WHERE tenant_id IN (${allIds})`,
    `DELETE FROM stock_snapshots WHERE tenant_id IN (${allIds})`,

    // Products
    `DELETE FROM product_barcodes WHERE product_id IN (SELECT id FROM products WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM product_prices WHERE product_id IN (SELECT id FROM products WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM product_suppliers WHERE product_id IN (SELECT id FROM products WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM bundle_items WHERE bundle_id IN (SELECT id FROM products WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM product_certificates WHERE product_id IN (SELECT id FROM products WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM price_changes WHERE product_id IN (SELECT id FROM products WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM discounts WHERE product_id IN (SELECT id FROM products WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM products WHERE tenant_id IN (${allIds})`,

    // Categories, Units, Suppliers
    `DELETE FROM categories WHERE tenant_id IN (${allIds})`,
    `DELETE FROM units WHERE tenant_id IN (${allIds})`,
    `DELETE FROM suppliers WHERE tenant_id IN (${allIds})`,

    // Promotions, Discounts
    `DELETE FROM promotions WHERE tenant_id IN (${allIds})`,
    `DELETE FROM discounts WHERE tenant_id IN (${allIds})`,

    // Sessions, FCM, API keys
    `DELETE FROM sessions WHERE tenant_id IN (${allIds})`,
    `DELETE FROM fcm_tokens WHERE user_id IN (SELECT id FROM users WHERE tenant_id IN (${allIds}))`,
    `DELETE FROM api_keys WHERE tenant_id IN (${allIds})`,

    // Subscription, Settings, Sync
    `DELETE FROM tenant_subscriptions WHERE tenant_id IN (${allIds})`,
    `DELETE FROM tenant_settings WHERE tenant_id IN (${allIds})`,
    `DELETE FROM sync_outbox WHERE tenant_id IN (${allIds})`,

    // Bot OTP
    `DELETE FROM bot_otp_tokens WHERE tenant_id IN (${allIds})`,

    // Warehouses
    `DELETE FROM warehouses WHERE tenant_id IN (${allIds})`,

    // Users
    `DELETE FROM users WHERE tenant_id IN (${allIds})`,

    // Branches
    `DELETE FROM branches WHERE tenant_id IN (${allIds})`,

    // Delete junk tenants (NOT demo)
    ...(junkIds ? [`DELETE FROM tenants WHERE id IN (${junkIds})`] : []),
  ];

  for (const sql of deletionOrder) {
    await q(sql);
  }

  console.log('  All data cleaned!');
  return keepTenant.id;
}

// ═══════════════════════════════════════════════════
// STEP 3: Create beautiful demo data
// ═══════════════════════════════════════════════════
async function seedDemoData(tid) {
  console.log('\n=== SEEDING DEMO DATA ===');
  const pwHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // Update tenant
  await prisma.tenant.update({ where: { id: tid }, data: { name: 'Kosmetika Savdosi', slug: 'kosmetika-demo' } });

  // --- Branches ---
  console.log('  Branches...');
  const branches = await Promise.all([
    prisma.branch.create({ data: { tenantId: tid, name: 'Chilonzor filiali', address: 'Chilonzor tumani, Bunyodkor ko\'chasi 12', isActive: true } }),
    prisma.branch.create({ data: { tenantId: tid, name: 'Mirzo Ulug\'bek filiali', address: 'Mirzo Ulug\'bek tumani, Buyuk Ipak Yo\'li 88', isActive: true } }),
    prisma.branch.create({ data: { tenantId: tid, name: 'Sergeli filiali', address: 'Sergeli tumani, Yangi Sergeli 7-mavze', isActive: true } }),
  ]);

  // --- Owner ---
  console.log('  Users...');
  const owner = await prisma.user.create({
    data: { tenantId: tid, email: 'owner@kosmetika.uz', passwordHash: pwHash, firstName: 'Akbar', lastName: 'Tursunov', role: 'OWNER', branchId: branches[0].id, isActive: true },
  });

  const usersData = [
    { email: 'admin@kosmetika.uz', firstName: 'Dilnoza', lastName: 'Yusupova', role: 'ADMIN', brIdx: 0 },
    { email: 'manager.chilonzor@kosmetika.uz', firstName: 'Jasur', lastName: 'Toshmatov', role: 'MANAGER', brIdx: 0 },
    { email: 'manager.mirzo@kosmetika.uz', firstName: 'Sardor', lastName: 'Karimov', role: 'MANAGER', brIdx: 1 },
    { email: 'kassir.malika@kosmetika.uz', firstName: 'Malika', lastName: 'Rahimova', role: 'CASHIER', brIdx: 0 },
    { email: 'kassir.zulfiya@kosmetika.uz', firstName: 'Zulfiya', lastName: 'Nazarova', role: 'CASHIER', brIdx: 1 },
    { email: 'kassir.muhabbat@kosmetika.uz', firstName: 'Muhabbat', lastName: 'Aliyeva', role: 'CASHIER', brIdx: 2 },
    { email: 'ombor@kosmetika.uz', firstName: 'Bobur', lastName: 'Xolmatov', role: 'WAREHOUSE', brIdx: 0 },
  ];

  const users = [owner];
  for (const u of usersData) {
    users.push(await prisma.user.create({
      data: { tenantId: tid, email: u.email, passwordHash: pwHash, firstName: u.firstName, lastName: u.lastName, role: u.role, branchId: branches[u.brIdx].id, isActive: true },
    }));
  }

  // --- Units ---
  console.log('  Units...');
  const [unitDona, unitQuti, unitKompl] = await Promise.all([
    prisma.unit.create({ data: { tenantId: tid, name: 'dona', shortName: 'dona' } }),
    prisma.unit.create({ data: { tenantId: tid, name: 'quti', shortName: 'quti' } }),
    prisma.unit.create({ data: { tenantId: tid, name: 'komplekt', shortName: 'kompl' } }),
  ]);

  // --- Categories ---
  console.log('  Categories...');
  const cats = await Promise.all([
    prisma.category.create({ data: { tenantId: tid, name: 'Yuz parvarishi', sortOrder: 1 } }),
    prisma.category.create({ data: { tenantId: tid, name: 'Soch parvarishi', sortOrder: 2 } }),
    prisma.category.create({ data: { tenantId: tid, name: 'Parfyumeriya', sortOrder: 3 } }),
    prisma.category.create({ data: { tenantId: tid, name: 'Dekorativ kosmetika', sortOrder: 4 } }),
    prisma.category.create({ data: { tenantId: tid, name: 'Tana parvarishi', sortOrder: 5 } }),
    prisma.category.create({ data: { tenantId: tid, name: 'Tirnoq kosmetikasi', sortOrder: 6 } }),
    prisma.category.create({ data: { tenantId: tid, name: 'Gigiena', sortOrder: 7 } }),
    prisma.category.create({ data: { tenantId: tid, name: 'Aksessuarlar', sortOrder: 8 } }),
  ]);

  // --- Suppliers ---
  console.log('  Suppliers...');
  await Promise.all([
    prisma.supplier.create({ data: { tenantId: tid, name: 'L\'Oréal Uzbekistan', company: 'L\'Oréal SA', phone: '+998 90 123 45 67', address: 'Toshkent, Amir Temur ko\'ch 15' } }),
    prisma.supplier.create({ data: { tenantId: tid, name: 'Nivea Distribution', company: 'Beiersdorf AG', phone: '+998 91 234 56 78', address: 'Toshkent, Navoiy ko\'ch 32' } }),
    prisma.supplier.create({ data: { tenantId: tid, name: 'Korean Beauty Import', company: 'K-Beauty Trade', phone: '+998 93 345 67 89', address: 'Toshkent, Bobur ko\'ch 88' } }),
    prisma.supplier.create({ data: { tenantId: tid, name: 'Procter & Gamble UZ', company: 'P&G', phone: '+998 94 456 78 90', address: 'Toshkent, Yunusabad 4' } }),
    prisma.supplier.create({ data: { tenantId: tid, name: 'Istanbul Cosmetics Trade', company: 'Istanbul Cos. LLC', phone: '+90 532 111 22 33', address: 'Istanbul, Turkiya' } }),
  ]);

  // --- Products ---
  console.log('  Products...');
  const prodsData = [
    { n: 'Nivea Krem SPF-50', s: 'NIV-001', sp: 89000, cp: 52000, c: 0 },
    { n: 'L\'Oréal Revitalift Serum', s: 'LOR-001', sp: 145000, cp: 85000, c: 0 },
    { n: 'Garnier Micellar Water 400ml', s: 'GAR-001', sp: 65000, cp: 38000, c: 0 },
    { n: 'CeraVe Moisturizing Cream', s: 'CER-001', sp: 178000, cp: 110000, c: 0 },
    { n: 'L\'Oréal Elseve Shampun 400ml', s: 'LOR-002', sp: 48000, cp: 28000, c: 1 },
    { n: 'Pantene Pro-V Konditsioner', s: 'PAN-001', sp: 42000, cp: 24000, c: 1 },
    { n: 'Argan Oil Hair Mask 250ml', s: 'ARG-001', sp: 95000, cp: 55000, c: 1 },
    { n: 'Head & Shoulders Classic 400ml', s: 'HNS-001', sp: 52000, cp: 30000, c: 1 },
    { n: 'Versace Bright Crystal 90ml', s: 'VER-001', sp: 850000, cp: 520000, c: 2 },
    { n: 'Dior Sauvage EDT 100ml', s: 'DIO-001', sp: 1200000, cp: 750000, c: 2 },
    { n: 'Chanel Coco Mademoiselle 50ml', s: 'CHA-001', sp: 1450000, cp: 900000, c: 2 },
    { n: 'Dolce & Gabbana Light Blue 75ml', s: 'DNG-001', sp: 780000, cp: 480000, c: 2 },
    { n: 'Maybelline Fit Me Foundation', s: 'MAY-001', sp: 125000, cp: 72000, c: 3 },
    { n: 'MAC Ruby Woo Lipstick', s: 'MAC-001', sp: 285000, cp: 170000, c: 3 },
    { n: 'Maybelline Sky High Mascara', s: 'MAY-002', sp: 98000, cp: 56000, c: 3 },
    { n: 'NYX Palette 16 rang', s: 'NYX-001', sp: 215000, cp: 130000, c: 3 },
    { n: 'Dove Body Lotion 400ml', s: 'DOV-001', sp: 55000, cp: 32000, c: 4 },
    { n: 'Vaseline Intensive Care 200ml', s: 'VAS-001', sp: 38000, cp: 22000, c: 4 },
    { n: 'Neutrogena Hand Cream 75ml', s: 'NEU-001', sp: 45000, cp: 26000, c: 4 },
    { n: 'OPI Red Nail Polish', s: 'OPI-001', sp: 135000, cp: 80000, c: 5 },
    { n: 'Essie Gel Couture Top Coat', s: 'ESS-001', sp: 115000, cp: 68000, c: 5 },
    { n: 'Colgate Total Tish pastasi', s: 'COL-001', sp: 28000, cp: 16000, c: 6 },
    { n: 'Oral-B Tish cho\'tkasi', s: 'ORL-001', sp: 35000, cp: 20000, c: 6 },
    { n: 'Rexona Dezodorant 150ml', s: 'REX-001', sp: 42000, cp: 24000, c: 6 },
    { n: 'Soch cho\'tkasi Professional', s: 'AKS-001', sp: 68000, cp: 38000, c: 7 },
    { n: 'Kosmetika sumkasi (Travel)', s: 'AKS-002', sp: 95000, cp: 55000, c: 7 },
  ];

  const prods = [];
  for (const p of prodsData) {
    prods.push(await prisma.product.create({
      data: { tenantId: tid, name: p.n, sku: p.s, sellPrice: Number(p.sp), costPrice: Number(p.cp), categoryId: cats[p.c].id, unitId: unitDona.id, minStockLevel: 10, isActive: true },
    }));
  }
  console.log(`  ${prods.length} products created`);

  // --- Warehouses ---
  console.log('  Warehouses...');
  const wh = await prisma.warehouse.create({ data: { tenantId: tid, branchId: branches[0].id, name: 'Asosiy ombor', isActive: true } });
  await prisma.warehouse.create({ data: { tenantId: tid, branchId: branches[1].id, name: 'Mirzo Ulug\'bek ombori', isActive: true } });
  await prisma.warehouse.create({ data: { tenantId: tid, branchId: branches[2].id, name: 'Sergeli ombori', isActive: true } });

  // --- Stock ---
  console.log('  Stock movements...');
  for (const p of prods) {
    await prisma.stockMovement.create({
      data: { tenantId: tid, productId: p.id, warehouseId: wh.id, userId: owner.id, type: 'IN', quantity: 30 + Math.floor(Math.random() * 170), costPrice: p.costPrice, note: 'Boshlang\'ich kirim' },
    });
  }

  // --- Customers ---
  console.log('  Customers...');
  const custsData = [
    { f: 'Aziza', l: 'Aliyeva', p: '+998 90 111 22 33' },
    { f: 'Nodira', l: 'Karimova', p: '+998 91 222 33 44' },
    { f: 'Gulnora', l: 'Toshmatova', p: '+998 93 333 44 55' },
    { f: 'Shahlo', l: 'Yusupova', p: '+998 94 444 55 66' },
    { f: 'Dilfuza', l: 'Xolmatova', p: '+998 90 555 66 77' },
    { f: 'Madina', l: 'Raxmatullayeva', p: '+998 91 666 77 88' },
    { f: 'Kamola', l: 'Ergasheva', p: '+998 93 777 88 99' },
    { f: 'Feruza', l: 'Abdullayeva', p: '+998 94 888 99 00' },
    { f: 'Zilola', l: 'Mirzayeva', p: '+998 90 999 00 11' },
    { f: 'Sarvinoz', l: 'Umarova', p: '+998 91 100 11 22' },
    { f: 'Dildora', l: 'Nazarova', p: '+998 93 200 22 33' },
    { f: 'Mohinur', l: 'Ismoilova', p: '+998 94 300 33 44' },
  ];
  const custs = [];
  for (const c of custsData) {
    custs.push(await prisma.customer.create({
      data: { tenantId: tid, branchId: branches[Math.floor(Math.random() * 3)].id, name: `${c.f} ${c.l}`, phone: c.p },
    }));
  }

  // --- Shifts + Orders ---
  console.log('  Shifts & Orders...');
  const cashiers = users.filter(u => u.role === 'CASHIER');
  const shifts = [];
  for (const c of cashiers) {
    shifts.push(await prisma.shift.create({
      data: { tenantId: tid, userId: c.id, branchId: c.branchId, openedAt: new Date(Date.now() - 8 * 3600000), openingCash: 500000 },
    }));
  }

  let oNum = 1;
  for (let day = 30; day >= 0; day--) {
    const count = 3 + Math.floor(Math.random() * 8);
    for (let j = 0; j < count; j++) {
      const sh = shifts[Math.floor(Math.random() * shifts.length)];
      const ca = cashiers[Math.floor(Math.random() * cashiers.length)];
      const cu = Math.random() > 0.4 ? custs[Math.floor(Math.random() * custs.length)] : null;

      const picks = new Set();
      const itemCount = 1 + Math.floor(Math.random() * 4);
      while (picks.size < itemCount) picks.add(Math.floor(Math.random() * prods.length));

      let total = Number(0);
      const items = [...picks].map(i => {
        const qty = 1 + Math.floor(Math.random() * 3);
        const price = prods[i].sellPrice;
        total += price * Number(qty);
        const tp = price * Number(qty);
        return { productId: prods[i].id, productName: prods[i].name, quantity: qty, unitPrice: price, total: tp };
      });

      const d = new Date();
      d.setDate(d.getDate() - day);
      d.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

      const orderData = {
        tenantId: tid, shiftId: sh.id, userId: ca.id, branchId: ca.branchId,
        orderNumber: oNum++,
        subtotal: total, total: total,
        status: 'COMPLETED', createdAt: d,
        items: { create: items },
      };
      if (cu) orderData.customerId = cu.id;
      await prisma.order.create({ data: orderData });
    }
  }
  console.log(`  ${oNum - 1} orders created`);

  // --- Discounts ---
  console.log('  Discounts...');
  for (let i = 0; i < 10; i++) {
    const isPct = i % 2 === 0;
    await prisma.discount.create({
      data: {
        tenantId: tid, productId: prods[i].id,
        type: isPct ? 'PERCENTAGE' : 'FIXED',
        value: isPct ? Number(5 + Math.floor(Math.random() * 20)) : Number(5000 + Math.floor(Math.random() * 30000)),
        startDate: new Date('2026-05-01'), endDate: new Date('2026-05-31'), isActive: true,
      },
    });
  }

  console.log('\n=== DONE ===');
  console.log(`Tenant: Kosmetika Savdosi`);
  console.log(`Branches: 3 | Users: ${users.length} | Products: ${prods.length}`);
  console.log(`Customers: ${custs.length} | Orders: ${oNum - 1} | Discounts: 10`);
  console.log(`Login: owner@kosmetika.uz / ${DEMO_PASSWORD}`);
}

async function main() {
  // Clean partial data from failed seed, then re-seed
  const tenant = await prisma.tenant.findFirst({ where: { slug: KEEP_SLUG } });
  if (!tenant) throw new Error('Tenant not found!');
  const tid = tenant.id;
  // Clean partial seed data
  const allIds = `'${tid}'`;
  await q(`DELETE FROM discounts WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE tenant_id = ${allIds})`);
  await q(`DELETE FROM orders WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM shifts WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM stock_movements WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM customers WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM warehouses WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM product_barcodes WHERE product_id IN (SELECT id FROM products WHERE tenant_id = ${allIds})`);
  await q(`DELETE FROM products WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM suppliers WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM categories WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM units WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM sessions WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM fcm_tokens WHERE user_id IN (SELECT id FROM users WHERE tenant_id = ${allIds})`);
  await q(`DELETE FROM users WHERE tenant_id = ${allIds}`);
  await q(`DELETE FROM branches WHERE tenant_id = ${allIds}`);
  console.log('Partial data cleaned');
  await seedDemoData(tid);
}

main().catch(console.error).finally(() => prisma.$disconnect());
