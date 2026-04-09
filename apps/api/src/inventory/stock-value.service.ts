import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockValueService {
  constructor(private readonly prisma: PrismaService) {}

  // mobile-owner: GET /inventory/stock-value
  async getStockValue(tenantId: string, branchId?: string) {
    const branchFilter = branchId ? Prisma.sql`AND w.branch_id = ${branchId}` : Prisma.empty;

    const rows = await this.prisma.$queryRaw<{
      branchId: string | null;
      branchName: string | null;
      value: number;
    }[]>`
      SELECT
        w.branch_id                                   AS "branchId",
        b.name                                        AS "branchName",
        COALESCE(SUM(
          CASE
            WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity * p.cost_price
            WHEN sm.type = 'ADJUSTMENT'                      THEN sm.quantity * p.cost_price
            ELSE -(sm.quantity * p.cost_price)
          END
        ), 0)::float                                  AS value
      FROM stock_movements sm
      JOIN products p   ON p.id = sm.product_id
      JOIN warehouses w ON w.id = sm.warehouse_id
      LEFT JOIN branches b ON b.id = w.branch_id
      WHERE sm.tenant_id = ${tenantId}
        ${branchFilter}
      GROUP BY w.branch_id, b.name
    `;

    const byBranch = rows.map((r) => ({
      branchId: r.branchId ?? 'unknown',
      branchName: r.branchName ?? 'Asosiy ombor',
      value: Math.max(0, Number(r.value)),
    }));

    const totalValue = byBranch.reduce((s, b) => s + b.value, 0);

    return { totalValue, byBranch };
  }
}
