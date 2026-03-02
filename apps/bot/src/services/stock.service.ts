import prisma from '../prisma';

// ─── /stock <barcode> — Mahsulot stock ma'lumoti ──────────────

export interface StockInfo {
  productName: string;
  sku: string | null;
  barcode: string | null;
  sellPrice: number;
  costPrice: number;
  totalStock: number;
  warehouseBreakdown: { warehouseName: string; stock: number }[];
}

export async function getStockByBarcode(barcode: string): Promise<StockInfo | null> {
  // Birinchi oddiy barcode tekshirish
  const product = await prisma.product.findFirst({
    where: { barcode, deletedAt: null },
    select: {
      id: true,
      name: true,
      sku: true,
      barcode: true,
      sellPrice: true,
      costPrice: true,
      tenantId: true,
    },
  }) ?? await prisma.productBarcode.findFirst({
    where: { barcode },
    include: { product: { select: { id: true, name: true, sku: true, barcode: true, sellPrice: true, costPrice: true, tenantId: true } } },
  }).then((r) => r?.product ?? null);

  if (!product) return null;

  const rows = await prisma.$queryRaw<{ warehouseName: string; stock: number }[]>`
    SELECT
      w.name AS "warehouseName",
      COALESCE(SUM(
        CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
          ELSE -sm.quantity
        END
      ), 0)::float AS stock
    FROM stock_movements sm
    JOIN warehouses w ON w.id = sm.warehouse_id
    WHERE sm.product_id = ${product.id}::uuid
      AND sm.tenant_id  = ${product.tenantId}::uuid
    GROUP BY w.id, w.name
    HAVING COALESCE(SUM(
      CASE
        WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
        WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
        ELSE -sm.quantity
      END
    ), 0) > 0
    ORDER BY stock DESC
  `;

  const totalStock = rows.reduce((s, r) => s + r.stock, 0);

  return {
    productName: product.name,
    sku: product.sku,
    barcode: product.barcode,
    sellPrice: Number(product.sellPrice),
    costPrice: Number(product.costPrice),
    totalStock,
    warehouseBreakdown: rows,
  };
}

// ─── /debt <phone> — Mijoz qarzi ma'lumoti ────────────────────

export interface DebtInfo {
  customerName: string;
  phone: string;
  totalDebt: number;
  debtCount: number;
  overdueCount: number;
  debts: { remaining: number; dueDate: Date | null; status: string }[];
}

export async function getDebtByPhone(phone: string): Promise<DebtInfo | null> {
  const customer = await prisma.customer.findFirst({
    where: { phone },
    select: { id: true, name: true, phone: true, tenantId: true },
  });

  if (!customer) return null;

  const debts = await prisma.debtRecord.findMany({
    where: {
      customerId: customer.id,
      status: { in: ['ACTIVE', 'PARTIAL', 'OVERDUE'] },
    },
    select: { remaining: true, dueDate: true, status: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const totalDebt = debts.reduce((s, d) => s + Number(d.remaining), 0);
  const overdueCount = debts.filter((d) => d.status === 'OVERDUE').length;

  return {
    customerName: customer.name,
    phone: customer.phone ?? phone,
    totalDebt,
    debtCount: debts.length,
    overdueCount,
    debts: debts.map((d) => ({
      remaining: Number(d.remaining),
      dueDate: d.dueDate,
      status: d.status,
    })),
  };
}

// ─── /shift — Joriy aktiv smena holati ────────────────────────

export interface ShiftInfo {
  tenantName: string;
  cashierName: string;
  openedAt: Date;
  ordersCount: number;
  revenue: number;
  hoursOpen: number;
}

export async function getActiveShifts(): Promise<ShiftInfo[]> {
  const shifts = await prisma.shift.findMany({
    where: { status: 'OPEN' },
    include: {
      cashier: { select: { firstName: true, lastName: true } },
      tenant:  { select: { name: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { openedAt: 'asc' },
    take: 20,
  });

  return Promise.all(
    shifts.map(async (s) => {
      const revenue = await prisma.order.aggregate({
        where: { shiftId: s.id, status: { not: 'VOIDED' } },
        _sum: { total: true },
      });
      const hoursOpen = Math.round(
        (Date.now() - s.openedAt.getTime()) / 3_600_000,
      );

      return {
        tenantName: s.tenant.name,
        cashierName: `${s.cashier.firstName} ${s.cashier.lastName}`,
        openedAt: s.openedAt,
        ordersCount: s._count.orders,
        revenue: Number(revenue._sum.total ?? 0),
        hoursOpen,
      };
    }),
  );
}
