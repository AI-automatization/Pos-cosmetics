const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres:IexyvkdDvSVlXcVFCzlsuuQReOpKFrEM@interchange.proxy.rlwy.net:29292/railway"
});

async function main() {
  // 1. Tenants
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true, slug: true, createdAt: true, _count: { select: { users: true, branches: true, products: true, categories: true, orders: true, customers: true } } }
  });
  console.log('=== TENANTS ===');
  tenants.forEach(t => console.log(`  ${t.name} (${t.slug}) — users:${t._count.users} branches:${t._count.branches} products:${t._count.products} categories:${t._count.categories} orders:${t._count.orders} customers:${t._count.customers}`));

  // 2. Users
  const users = await prisma.user.findMany({
    select: { email: true, firstName: true, lastName: true, role: true, tenant: { select: { slug: true } } }
  });
  console.log('\n=== USERS ===');
  users.forEach(u => console.log(`  ${u.email} — ${u.firstName} ${u.lastName} (${u.role}) [${u.tenant.slug}]`));

  // 3. Branches
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true, address: true, tenant: { select: { slug: true } } }
  });
  console.log('\n=== BRANCHES ===');
  branches.forEach(b => console.log(`  ${b.name} — ${b.address || 'no address'} [${b.tenant.slug}]`));

  // 4. Products count per tenant
  console.log('\n=== PRODUCTS (count per tenant) ===');
  for (const t of tenants) {
    const prods = await prisma.product.findMany({
      where: { tenantId: t.id },
      select: { name: true, sku: true, price: true },
      take: 5,
    });
    console.log(`  ${t.slug}: ${t._count.products} products`);
    prods.forEach(p => console.log(`    - ${p.name} (${p.sku}) — ${p.price}`));
  }

  // 5. Categories
  const cats = await prisma.category.findMany({
    select: { name: true, tenant: { select: { slug: true } } }
  });
  console.log('\n=== CATEGORIES ===');
  cats.forEach(c => console.log(`  ${c.name} [${c.tenant.slug}]`));

  // 6. Orders count
  const orderCount = await prisma.order.count();
  console.log(`\n=== ORDERS: ${orderCount} total ===`);
  if (orderCount > 0) {
    const orders = await prisma.order.findMany({
      select: { orderNumber: true, totalAmount: true, status: true, tenant: { select: { slug: true } } },
      take: 10,
    });
    orders.forEach(o => console.log(`  #${o.orderNumber} — ${o.totalAmount} (${o.status}) [${o.tenant.slug}]`));
  }

  // 7. Customers
  const custCount = await prisma.customer.count();
  console.log(`\n=== CUSTOMERS: ${custCount} total ===`);
  if (custCount > 0) {
    const custs = await prisma.customer.findMany({
      select: { firstName: true, lastName: true, phone: true, tenant: { select: { slug: true } } },
      take: 10,
    });
    custs.forEach(c => console.log(`  ${c.firstName} ${c.lastName} — ${c.phone} [${c.tenant.slug}]`));
  }

  // 8. Suppliers
  const supCount = await prisma.supplier.count();
  console.log(`\n=== SUPPLIERS: ${supCount} total ===`);

  // 9. StockMovements
  const smCount = await prisma.stockMovement.count();
  console.log(`=== STOCK MOVEMENTS: ${smCount} total ===`);

  // 10. Discounts
  const discCount = await prisma.discount.count();
  console.log(`=== DISCOUNTS: ${discCount} total ===`);

  // 11. Promotions
  try {
    const promoCount = await prisma.promotion.count();
    console.log(`=== PROMOTIONS: ${promoCount} total ===`);
  } catch { console.log('=== PROMOTIONS: table not found ==='); }

  // 12. Shifts
  const shiftCount = await prisma.shift.count();
  console.log(`=== SHIFTS: ${shiftCount} total ===`);

  // 13. Properties (real estate)
  try {
    const propCount = await prisma.property.count();
    console.log(`=== PROPERTIES: ${propCount} total ===`);
  } catch { console.log('=== PROPERTIES: table not found ==='); }

  // 14. Notifications
  const notifCount = await prisma.notification.count();
  console.log(`=== NOTIFICATIONS: ${notifCount} total ===`);

  // 15. Tasks
  try {
    const taskCount = await prisma.task.count();
    console.log(`=== TASKS: ${taskCount} total ===`);
  } catch { console.log('=== TASKS: table not found ==='); }

  // 16. Nasiya (debts)
  try {
    const nasiyaCount = await prisma.nasiya.count();
    console.log(`=== NASIYA: ${nasiyaCount} total ===`);
  } catch { console.log('=== NASIYA: table not found ==='); }
}

main().catch(console.error).finally(() => prisma.$disconnect());
