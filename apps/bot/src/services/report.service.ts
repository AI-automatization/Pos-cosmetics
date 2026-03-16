import prisma from '../prisma';

// ─── Bugungi savdo xulosasi ────────────────────────────────────

export async function getTodaySummary(tenantId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [orderAgg, returnAgg, paymentRows, topProducts] = await Promise.all([
    // Jami buyurtmalar
    prisma.order.aggregate({
      where: {
        tenantId,
        createdAt: { gte: todayStart, lte: todayEnd },
        status: { not: 'VOIDED' },
      },
      _sum: { total: true, discountAmount: true },
      _count: { id: true },
    }),

    // Qaytarishlar
    prisma.return.aggregate({
      where: {
        tenantId,
        createdAt: { gte: todayStart, lte: todayEnd },
        status: 'APPROVED',
      },
      _sum: { total: true },
      _count: { id: true },
    }),

    // To'lov usullari
    prisma.$queryRaw<{ method: string; amount: number }[]>`
      SELECT pi.method, SUM(pi.amount)::float AS amount
      FROM payment_intents pi
      JOIN orders o ON o.id = pi.order_id
      WHERE pi.tenant_id = ${tenantId}
        AND o.created_at >= ${todayStart}
        AND o.created_at <= ${todayEnd}
        AND pi.status = 'SETTLED'
      GROUP BY pi.method
      ORDER BY amount DESC
    `,

    // Top 5 mahsulot
    prisma.$queryRaw<{ name: string; qty: number; revenue: number }[]>`
      SELECT oi.product_name AS name,
             SUM(oi.quantity)::float AS qty,
             SUM(oi.total)::float AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.tenant_id = ${tenantId}
        AND o.created_at >= ${todayStart}
        AND o.created_at <= ${todayEnd}
        AND o.status != 'VOIDED'
      GROUP BY oi.product_name
      ORDER BY revenue DESC
      LIMIT 5
    `,
  ]);

  return {
    date: todayStart.toLocaleDateString('uz-UZ'),
    orders: {
      count: orderAgg._count.id,
      revenue: Number(orderAgg._sum.total ?? 0),
      totalDiscount: Number(orderAgg._sum.discountAmount ?? 0),
    },
    returns: {
      count: returnAgg._count.id,
      total: Number(returnAgg._sum.total ?? 0),
    },
    netRevenue:
      Number(orderAgg._sum.total ?? 0) - Number(returnAgg._sum.total ?? 0),
    payments: paymentRows,
    topProducts,
  };
}

// ─── Barcha tenantlar uchun summary (admin uchun) ──────────────

export async function getAllTenantsSummary() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
  });

  const results = await Promise.all(
    tenants.map(async (t) => {
      const agg = await prisma.order.aggregate({
        where: {
          tenantId: t.id,
          createdAt: { gte: todayStart },
          status: { not: 'VOIDED' },
        },
        _sum: { total: true },
        _count: { id: true },
      });
      return {
        tenant: t.name,
        orders: agg._count.id,
        revenue: Number(agg._sum.total ?? 0),
      };
    }),
  );

  return results;
}
