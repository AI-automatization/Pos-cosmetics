// T-430: Expiry Tracking — bot service for /muddat and /muddati_otgan commands

import prisma from '../prisma';

export interface ExpiryItem {
  productName: string;
  batchNumber: string | null;
  warehouseName: string;
  expiryDate: Date;
  daysLeft: number;
  qty: number;
}

/**
 * Muddati yaqin mahsulotlar (tenant izolyatsiya bilan)
 */
export async function getExpiringForBot(
  tenantId: string,
  days = 30,
): Promise<ExpiryItem[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  return prisma.$queryRaw<ExpiryItem[]>`
    SELECT
      p.name              AS "productName",
      sm.batch_number     AS "batchNumber",
      w.name              AS "warehouseName",
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
    JOIN products p  ON p.id  = sm.product_id
    JOIN warehouses w ON w.id = sm.warehouse_id
    WHERE sm.tenant_id = ${tenantId}
      AND sm.expiry_date IS NOT NULL
      AND sm.expiry_date >= NOW()
      AND sm.expiry_date <= ${cutoff}
    GROUP BY p.name, sm.batch_number, w.name, sm.expiry_date
    HAVING SUM(
      CASE
        WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
        WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
        ELSE -sm.quantity
      END
    ) > 0
    ORDER BY sm.expiry_date ASC
    LIMIT 10
  `;
}

/**
 * Muddati o'tgan mahsulotlar (hali omborda bor)
 */
export async function getExpiredForBot(
  tenantId: string,
): Promise<ExpiryItem[]> {
  const now = new Date();

  return prisma.$queryRaw<ExpiryItem[]>`
    SELECT
      p.name              AS "productName",
      sm.batch_number     AS "batchNumber",
      w.name              AS "warehouseName",
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
    JOIN products p  ON p.id  = sm.product_id
    JOIN warehouses w ON w.id = sm.warehouse_id
    WHERE sm.tenant_id = ${tenantId}
      AND sm.expiry_date IS NOT NULL
      AND sm.expiry_date < ${now}
    GROUP BY p.name, sm.batch_number, w.name, sm.expiry_date
    HAVING SUM(
      CASE
        WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
        WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
        ELSE -sm.quantity
      END
    ) > 0
    ORDER BY sm.expiry_date ASC
    LIMIT 10
  `;
}
