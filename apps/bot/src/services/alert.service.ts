import prisma from '../prisma';
import { config } from '../config';

// ─── Low Stock ─────────────────────────────────────────────────

export interface LowStockItem {
  tenantName: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  minLevel: number;
}

export async function getLowStockItems(): Promise<LowStockItem[]> {
  // Raw SQL: stock levels per product per tenant
  const rows = await prisma.$queryRaw<{
    tenantId: string;
    tenantName: string;
    productId: string;
    productName: string;
    sku: string | null;
    minStockLevel: number;
    stock: number;
  }[]>`
    SELECT
      t.id           AS "tenantId",
      t.name         AS "tenantName",
      p.id           AS "productId",
      p.name         AS "productName",
      p.sku          AS sku,
      p.min_stock_level::float AS "minStockLevel",
      COALESCE(SUM(
        CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
          ELSE -sm.quantity
        END
      ), 0)::float AS stock
    FROM products p
    JOIN tenants t ON t.id = p.tenant_id
    LEFT JOIN stock_movements sm ON sm.product_id = p.id AND sm.tenant_id = p.tenant_id
    WHERE p.deleted_at IS NULL
      AND p.is_active = true
      AND p.min_stock_level > 0
    GROUP BY t.id, t.name, p.id, p.name, p.sku, p.min_stock_level
    HAVING COALESCE(SUM(
      CASE
        WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
        WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
        ELSE -sm.quantity
      END
    ), 0) <= p.min_stock_level
    ORDER BY t.name, stock ASC
    LIMIT 50
  `;

  return rows.map((r) => ({
    tenantName: r.tenantName,
    productName: r.productName,
    sku: r.sku,
    currentStock: r.stock,
    minLevel: r.minStockLevel,
  }));
}

// ─── Expiring Products ─────────────────────────────────────────

export interface ExpiringItem {
  tenantName: string;
  productName: string;
  batchNumber: string | null;
  expiryDate: Date;
  daysLeft: number;
  qty: number;
}

export async function getExpiringItems(days = config.expiryDaysWarning): Promise<ExpiringItem[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  const rows = await prisma.$queryRaw<{
    tenantName: string;
    productName: string;
    batchNumber: string | null;
    expiryDate: Date;
    daysLeft: number;
    qty: number;
  }[]>`
    SELECT
      t.name              AS "tenantName",
      p.name              AS "productName",
      sm.batch_number     AS "batchNumber",
      sm.expiry_date      AS "expiryDate",
      EXTRACT(DAY FROM sm.expiry_date - NOW())::int AS "daysLeft",
      SUM(
        CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
          ELSE -sm.quantity
        END
      )::float AS qty
    FROM stock_movements sm
    JOIN products p ON p.id = sm.product_id
    JOIN tenants  t ON t.id = sm.tenant_id
    WHERE sm.expiry_date IS NOT NULL
      AND sm.expiry_date >= NOW()
      AND sm.expiry_date <= ${cutoff}
    GROUP BY t.name, p.name, sm.batch_number, sm.expiry_date
    HAVING SUM(
      CASE
        WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
        WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
        ELSE -sm.quantity
      END
    ) > 0
    ORDER BY sm.expiry_date ASC
    LIMIT 30
  `;

  return rows;
}

// ─── Suspicious Refunds ────────────────────────────────────────

export interface SuspiciousRefund {
  tenantName: string;
  returnId: string;
  amount: number;
  cashier: string;
  createdAt: Date;
}

export async function getRecentSuspiciousRefunds(): Promise<SuspiciousRefund[]> {
  const since = new Date(Date.now() - 60 * 60 * 1000); // so'nggi 1 soat

  const rows = await prisma.return.findMany({
    where: {
      total: { gte: config.refundAlertThreshold },
      status: 'APPROVED',
      createdAt: { gte: since },
    },
    include: {
      user: { select: { firstName: true, lastName: true } },
      tenant: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return rows.map((r) => ({
    tenantName: r.tenant.name,
    returnId: r.id.slice(0, 8),
    amount: Number(r.total),
    cashier: `${r.user.firstName} ${r.user.lastName}`,
    createdAt: r.createdAt,
  }));
}
