import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AiEnginesHelper {
  constructor(private readonly prisma: PrismaService) {}

  // ─── PERIOD BOUNDS HELPER ────────────────────────────────────
  periodBounds(period: string): { from: Date; prevFrom: Date; prevTo: Date } {
    const now = new Date();
    let from: Date;
    let prevFrom: Date;
    let prevTo: Date;

    switch (period) {
      case 'today':
        from = new Date(now); from.setHours(0, 0, 0, 0);
        prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 1);
        prevTo = new Date(from); prevTo.setMilliseconds(-1);
        break;
      case 'week':
        from = new Date(now); from.setDate(now.getDate() - 6); from.setHours(0, 0, 0, 0);
        prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 7);
        prevTo = new Date(from); prevTo.setMilliseconds(-1);
        break;
      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        prevFrom = new Date(now.getFullYear() - 1, 0, 1);
        prevTo = new Date(now.getFullYear(), 0, 1); prevTo.setMilliseconds(-1);
        break;
      default: // month
        from = new Date(now); from.setDate(1); from.setHours(0, 0, 0, 0);
        prevFrom = new Date(from); prevFrom.setMonth(prevFrom.getMonth() - 1);
        prevTo = new Date(from); prevTo.setMilliseconds(-1);
    }
    return { from, prevFrom, prevTo };
  }

  // ─── SALES TREND ─────────────────────────────────────────────
  async getSalesTrend(
    tenantId: string,
    period: 'daily' | 'weekly' | 'monthly',
    from: Date,
    to: Date,
    branchId?: string,
  ) {
    const trunc = period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month';
    const truncRaw = Prisma.raw(`'${trunc}'`);
    const branchFilter = branchId
      ? Prisma.sql`AND o.branch_id = ${branchId}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      { period: Date; revenue: number; orders: number; avgBasket: number }[]
    >`
      SELECT
        DATE_TRUNC(${truncRaw}, o.created_at) AS period,
        SUM(o.total)::float          AS revenue,
        COUNT(*)::int                       AS orders,
        AVG(o.total)::float          AS "avgBasket"
      FROM orders o
      WHERE o.tenant_id    = ${tenantId}
        AND o.status::text = 'COMPLETED'
        AND o.created_at  >= ${from}
        AND o.created_at  <= ${to}
        ${branchFilter}
      GROUP BY DATE_TRUNC(${truncRaw}, o.created_at)
      ORDER BY period ASC
    `;

    return rows.map((r) => ({
      date: r.period,
      period: r.period,
      revenue: Number(r.revenue),
      orders: r.orders,
      avgBasket: Number(r.avgBasket),
    }));
  }

  // ─── TOP PRODUCTS ─────────────────────────────────────────────
  async getTopProducts(
    tenantId: string,
    from: Date,
    to: Date,
    limit: number,
    sortBy: 'revenue' | 'qty',
    branchId?: string,
  ) {
    const orderCol = sortBy === 'revenue' ? 'revenue' : '"qtySold"';
    const branchFilter = branchId
      ? Prisma.sql`AND o.branch_id = ${branchId}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      {
        productId: string;
        productName: string;
        qtySold: number;
        ordersCount: number;
        revenue: number;
        costTotal: number;
        margin: number;
      }[]
    >`
      SELECT
        oi.product_id                           AS "productId",
        p.name                                  AS "productName",
        SUM(oi.quantity)::float                 AS "qtySold",
        COUNT(DISTINCT o.id)::int               AS "ordersCount",
        SUM(oi.total)::float                    AS revenue,
        SUM(oi.quantity * p.cost_price)::float  AS "costTotal",
        (SUM(oi.total) - SUM(oi.quantity * p.cost_price))::float AS margin
      FROM order_items oi
      JOIN orders o     ON o.id = oi.order_id
      JOIN products p   ON p.id = oi.product_id
      WHERE o.tenant_id  = ${tenantId}
        AND o.status::text = 'COMPLETED'
        AND o.created_at >= ${from}
        AND o.created_at <= ${to}
        ${branchFilter}
      GROUP BY oi.product_id, p.name
      ORDER BY ${Prisma.raw(orderCol)} DESC
      LIMIT ${limit}
    `;

    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      name: r.productName,
      qtySold: Number(r.qtySold),
      quantity: Number(r.qtySold),
      ordersCount: Number(r.ordersCount),
      revenue: Number(r.revenue),
      costTotal: Number(r.costTotal),
      margin: Number(r.margin),
    }));
  }

  // ─── DEAD STOCK ───────────────────────────────────────────────
  async getDeadStock(tenantId: string, days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const rows = await this.prisma.$queryRaw<
      {
        productId: string;
        productName: string;
        sku: string | null;
        totalStock: number;
        lastSoldAt: Date | null;
        carryingCost: number;
        daysIdle: number;
      }[]
    >`
      SELECT
        p.id                AS "productId",
        p.name              AS "productName",
        p.sku               AS sku,
        COALESCE(snap.stock, 0)::float AS "totalStock",
        MAX(o.created_at)   AS "lastSoldAt",
        (COALESCE(snap.stock, 0) * p.cost_price)::float AS "carryingCost",
        COALESCE(
          EXTRACT(DAY FROM NOW() - MAX(o.created_at))::int,
          ${days}
        )                   AS "daysIdle"
      FROM products p
      LEFT JOIN (
        SELECT
          product_id,
          SUM(
            CASE
              WHEN type IN ('IN','RETURN_IN','TRANSFER_IN') THEN quantity
              WHEN type = 'ADJUSTMENT' THEN quantity
              ELSE -quantity
            END
          ) AS stock
        FROM stock_movements
        WHERE tenant_id = ${tenantId}
        GROUP BY product_id
      ) snap ON snap.product_id = p.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o
        ON o.id = oi.order_id
        AND o.status::text = 'COMPLETED'
        AND o.created_at >= ${cutoff}
      WHERE p.tenant_id  = ${tenantId}
        AND p.deleted_at IS NULL
        AND p.is_active  = true
      GROUP BY p.id, p.name, p.sku, p.cost_price, snap.stock
      HAVING
        COALESCE(snap.stock, 0) > 0
        AND MAX(o.created_at) IS NULL
      ORDER BY "carryingCost" DESC
      LIMIT 200
    `;

    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      sku: r.sku,
      totalStock: Number(r.totalStock),
      lastSoldAt: r.lastSoldAt,
      carryingCost: Number(r.carryingCost),
      daysIdle: Number(r.daysIdle),
    }));
  }

  // ─── MARGIN ANALYSIS ─────────────────────────────────────────
  async getMarginAnalysis(
    tenantId: string,
    from: Date,
    to: Date,
    categoryId?: string,
  ) {
    const catFilter = categoryId
      ? Prisma.sql`AND p.category_id = ${categoryId}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      {
        productId: string;
        productName: string;
        categoryName: string | null;
        revenue: number;
        costTotal: number;
        grossProfit: number;
        marginPct: number;
        qtySold: number;
      }[]
    >`
      SELECT
        p.id                                            AS "productId",
        p.name                                          AS "productName",
        c.name                                          AS "categoryName",
        SUM(oi.total)::float                      AS revenue,
        SUM(oi.quantity * p.cost_price)::float          AS "costTotal",
        (SUM(oi.total) - SUM(oi.quantity * p.cost_price))::float AS "grossProfit",
        CASE
          WHEN SUM(oi.total) = 0 THEN 0
          ELSE ROUND(
            ((SUM(oi.total) - SUM(oi.quantity * p.cost_price))
              / SUM(oi.total) * 100)::numeric, 2
          )::float
        END AS "marginPct",
        SUM(oi.quantity)::float AS "qtySold"
      FROM order_items oi
      JOIN orders o    ON o.id = oi.order_id
      JOIN products p  ON p.id = oi.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE o.tenant_id   = ${tenantId}
        AND o.status::text = 'COMPLETED'
        AND o.created_at >= ${from}
        AND o.created_at <= ${to}
        ${catFilter}
      GROUP BY p.id, p.name, c.name
      ORDER BY "grossProfit" DESC
      LIMIT 500
    `;

    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      categoryName: r.categoryName,
      revenue: Number(r.revenue),
      costTotal: Number(r.costTotal),
      grossProfit: Number(r.grossProfit),
      marginPct: Number(r.marginPct),
      qtySold: Number(r.qtySold),
    }));
  }

  // ─── ABC ANALYSIS ─────────────────────────────────────────────
  async getAbcAnalysis(tenantId: string, from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<
      {
        productId: string;
        productName: string;
        revenue: number;
        revenuePct: number;
        cumulativePct: number;
        category: 'A' | 'B' | 'C';
      }[]
    >`
      WITH product_revenue AS (
        SELECT
          p.id   AS product_id,
          p.name AS product_name,
          SUM(oi.total)::float AS revenue
        FROM order_items oi
        JOIN orders o   ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE o.tenant_id   = ${tenantId}
          AND o.status::text = 'COMPLETED'
          AND o.created_at >= ${from}
          AND o.created_at <= ${to}
        GROUP BY p.id, p.name
      ),
      totals AS (
        SELECT SUM(revenue) AS total_revenue FROM product_revenue
      ),
      ranked AS (
        SELECT
          pr.*,
          (pr.revenue / t.total_revenue * 100) AS revenue_pct,
          SUM(pr.revenue / t.total_revenue * 100)
            OVER (ORDER BY pr.revenue DESC) AS cumulative_pct
        FROM product_revenue pr, totals t
      )
      SELECT
        product_id   AS "productId",
        product_name AS "productName",
        revenue,
        ROUND(revenue_pct::numeric, 2)   AS "revenuePct",
        ROUND(cumulative_pct::numeric, 2) AS "cumulativePct",
        CASE
          WHEN cumulative_pct <= 80 THEN 'A'
          WHEN cumulative_pct <= 95 THEN 'B'
          ELSE 'C'
        END AS category
      FROM ranked
      ORDER BY revenue DESC
    `;

    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      revenue: Number(r.revenue),
      revenuePct: Number(r.revenuePct),
      cumulativePct: Number(r.cumulativePct),
      category: r.category,
    }));
  }

}
