import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── T-089: SALES TREND ───────────────────────────────────────
  // GET /analytics/sales-trend?period=daily|weekly|monthly&from=&to=&branch_id=
  async getSalesTrend(
    tenantId: string,
    period: 'daily' | 'weekly' | 'monthly',
    from: Date,
    to: Date,
    branchId?: string,
  ) {
    const trunc =
      period === 'daily'
        ? 'day'
        : period === 'weekly'
          ? 'week'
          : 'month';
    const truncRaw = Prisma.raw(`'${trunc}'`);
    const branchFilter = branchId ? Prisma.sql`AND o.branch_id = ${branchId}` : Prisma.empty;

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
      date: r.period,      // mobile expects "date" field
      period: r.period,    // keep for backwards compat
      revenue: Number(r.revenue),
      orders: r.orders,
      avgBasket: Number(r.avgBasket),
    }));
  }

  // ─── T-089: TOP PRODUCTS ──────────────────────────────────────
  // GET /analytics/top-products?from=&to=&limit=10&sortBy=revenue|qty&branch_id=
  async getTopProducts(
    tenantId: string,
    from: Date,
    to: Date,
    limit: number,
    sortBy: 'revenue' | 'qty',
    branchId?: string,
  ) {
    const orderCol = sortBy === 'revenue' ? 'revenue' : '"qtySold"';
    const branchFilter = branchId ? Prisma.sql`AND o.branch_id = ${branchId}` : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      {
        productId: string;
        productName: string;
        qtySold: number;
        revenue: number;
        costTotal: number;
        margin: number;
      }[]
    >`
      SELECT
        oi.product_id                           AS "productId",
        p.name                                  AS "productName",
        SUM(oi.quantity)::float                 AS "qtySold",
        SUM(oi.total)::float              AS revenue,
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
      name: r.productName,        // mobile expects "name"
      qtySold: Number(r.qtySold),
      quantity: Number(r.qtySold), // mobile expects "quantity"
      revenue: Number(r.revenue),
      costTotal: Number(r.costTotal),
      margin: Number(r.margin),
    }));
  }

  // ─── T-089: DEAD STOCK ────────────────────────────────────────
  // GET /analytics/dead-stock?days=90
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

  // ─── T-089: MARGIN ANALYSIS ───────────────────────────────────
  // GET /analytics/margin?from=&to=&categoryId=
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

  // ─── T-089: ABC ANALYSIS ──────────────────────────────────────
  // GET /analytics/abc?from=&to=
  // A: top 80% revenue, B: next 15%, C: remaining 5%
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

  // ─── T-089: CASHIER PERFORMANCE ──────────────────────────────
  // GET /analytics/cashier-performance?from=&to=
  async getCashierPerformance(tenantId: string, from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<
      {
        userId: string;
        firstName: string;
        lastName: string;
        ordersCount: number;
        revenue: number;
        avgBasket: number;
        returnsCount: number;
        shiftsCount: number;
      }[]
    >`
      SELECT
        u.id                          AS "userId",
        u.first_name                  AS "firstName",
        u.last_name                   AS "lastName",
        COUNT(DISTINCT o.id)::int     AS "ordersCount",
        COALESCE(SUM(o.total), 0)::float AS revenue,
        COALESCE(AVG(o.total), 0)::float AS "avgBasket",
        COUNT(DISTINCT r.id)::int     AS "returnsCount",
        COUNT(DISTINCT s.id)::int     AS "shiftsCount"
      FROM users u
      LEFT JOIN orders o
        ON o.user_id     = u.id
        AND o.status::text = 'COMPLETED'
        AND o.created_at >= ${from}
        AND o.created_at <= ${to}
      LEFT JOIN returns r
        ON r.user_id     = u.id
        AND r.created_at >= ${from}
        AND r.created_at <= ${to}
      LEFT JOIN shifts s
        ON s.user_id     = u.id
        AND s.opened_at >= ${from}
        AND s.opened_at <= ${to}
      WHERE u.tenant_id  = ${tenantId}
        AND u."isActive" = true
        AND u.role::text IN ('CASHIER', 'MANAGER', 'ADMIN', 'OWNER')
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY revenue DESC
    `;

    return rows.map((r) => ({
      userId: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      ordersCount: r.ordersCount,
      revenue: Number(r.revenue),
      avgBasket: Number(r.avgBasket),
      returnsCount: r.returnsCount,
      shiftsCount: r.shiftsCount,
    }));
  }

  // ─── T-089: HOURLY HEATMAP ────────────────────────────────────
  // GET /analytics/hourly-heatmap?from=&to=
  // Returns: per weekday + hour, avg orders and revenue
  async getHourlyHeatmap(tenantId: string, from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<
      { dow: number; hour: number; orders: number; revenue: number }[]
    >`
      SELECT
        EXTRACT(DOW  FROM o.created_at)::int AS dow,
        EXTRACT(HOUR FROM o.created_at)::int AS hour,
        COUNT(*)::int                         AS orders,
        SUM(o.total)::float            AS revenue
      FROM orders o
      WHERE o.tenant_id   = ${tenantId}
        AND o.status::text = 'COMPLETED'
        AND o.created_at >= ${from}
        AND o.created_at <= ${to}
      GROUP BY
        EXTRACT(DOW  FROM o.created_at),
        EXTRACT(HOUR FROM o.created_at)
      ORDER BY dow ASC, hour ASC
    `;

    return rows.map((r) => ({
      dow: r.dow,      // 0=Sunday .. 6=Saturday
      hour: r.hour,    // 0..23
      orders: r.orders,
      revenue: Number(r.revenue),
    }));
  }

  // ─── T-221: REVENUE SUMMARY ───────────────────────────────────
  async getRevenueSummary(tenantId: string, branchId?: string) {
    const now = new Date();

    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const prevTodayStart = new Date(todayStart); prevTodayStart.setDate(prevTodayStart.getDate() - 1);
    const prevTodayEnd = new Date(todayStart); prevTodayEnd.setMilliseconds(-1);
    const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart); prevWeekEnd.setMilliseconds(-1);
    const prevMonthStart = new Date(monthStart); prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart); prevMonthEnd.setMilliseconds(-1);
    const prevYearStart = new Date(yearStart); prevYearStart.setFullYear(prevYearStart.getFullYear() - 1);
    const prevYearEnd = new Date(yearStart); prevYearEnd.setMilliseconds(-1);

    const branchFilter = branchId ? Prisma.sql`AND o.branch_id = ${branchId}` : Prisma.empty;

    const sumQuery = async (from: Date, to: Date): Promise<number> => {
      const rows = await this.prisma.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(o.total), 0)::float AS total
        FROM orders o
        WHERE o.tenant_id = ${tenantId}
          AND o.status::text = 'COMPLETED'
          AND o.created_at >= ${from}
          AND o.created_at <= ${to}
          ${branchFilter}
      `;
      return Number(rows[0]?.total ?? 0);
    };

    const calcTrend = (curr: number, prev: number): number => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return parseFloat(((curr - prev) / prev * 100).toFixed(1));
    };

    const [today, prevToday, week, prevWeek, month, prevMonth, year, prevYear] =
      await Promise.all([
        sumQuery(todayStart, now),
        sumQuery(prevTodayStart, prevTodayEnd),
        sumQuery(weekStart, now),
        sumQuery(prevWeekStart, prevWeekEnd),
        sumQuery(monthStart, now),
        sumQuery(prevMonthStart, prevMonthEnd),
        sumQuery(yearStart, now),
        sumQuery(prevYearStart, prevYearEnd),
      ]);

    return {
      today,
      week,
      month,
      year,
      todayTrend: calcTrend(today, prevToday),
      weekTrend: calcTrend(week, prevWeek),
      monthTrend: calcTrend(month, prevMonth),
      yearTrend: calcTrend(year, prevYear),
    };
  }

  // ─── ORDERS SUMMARY ──────────────────────────────────────────
  async getOrdersSummary(tenantId: string, branchId?: string) {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const prevStart = new Date(todayStart); prevStart.setDate(prevStart.getDate() - 1);
    const prevEnd = new Date(todayStart); prevEnd.setMilliseconds(-1);

    const branchFilter = branchId ? Prisma.sql`AND o.branch_id = ${branchId}` : Prisma.empty;

    const statsQuery = async (from: Date, to: Date) => {
      const rows = await this.prisma.$queryRaw<{ total: number; avg: number }[]>`
        SELECT COUNT(*)::int AS total, COALESCE(AVG(o.total), 0)::float AS avg
        FROM orders o
        WHERE o.tenant_id = ${tenantId}
          AND o.status::text = 'COMPLETED'
          AND o.created_at >= ${from}
          AND o.created_at <= ${to}
          ${branchFilter}
      `;
      return { total: Number(rows[0]?.total ?? 0), avg: Number(rows[0]?.avg ?? 0) };
    };

    const [curr, prev] = await Promise.all([
      statsQuery(todayStart, now),
      statsQuery(prevStart, prevEnd),
    ]);

    const trend = prev.total === 0
      ? (curr.total > 0 ? 100 : 0)
      : parseFloat(((curr.total - prev.total) / prev.total * 100).toFixed(1));

    return {
      total: curr.total,
      avgOrderValue: Math.round(curr.avg),
      trend,
    };
  }

  // ─── BRANCH COMPARISON ───────────────────────────────────────
  async getBranchComparison(tenantId: string, period = 'month') {
    const { from, prevFrom, prevTo } = this.periodBounds(period);
    const now = new Date();

    const rows = await this.prisma.$queryRaw<{
      branchId: string;
      branchName: string;
      revenue: number;
      orders: number;
      avgOrderValue: number;
    }[]>`
      SELECT
        b.id                                      AS "branchId",
        b.name                                    AS "branchName",
        COALESCE(SUM(o.total), 0)::float          AS revenue,
        COUNT(o.id)::int                          AS orders,
        COALESCE(AVG(o.total), 0)::float          AS "avgOrderValue"
      FROM branches b
      LEFT JOIN orders o
        ON o.branch_id = b.id
        AND o.status::text = 'COMPLETED'
        AND o.created_at >= ${from}
        AND o.created_at <= ${now}
      WHERE b.tenant_id = ${tenantId}
        AND b."isActive" = true
      GROUP BY b.id, b.name
      ORDER BY revenue DESC
    `;

    const prevRows = await this.prisma.$queryRaw<{
      branchId: string;
      revenue: number;
    }[]>`
      SELECT b.id AS "branchId", COALESCE(SUM(o.total), 0)::float AS revenue
      FROM branches b
      LEFT JOIN orders o
        ON o.branch_id = b.id
        AND o.status::text = 'COMPLETED'
        AND o.created_at >= ${prevFrom}
        AND o.created_at <= ${prevTo}
      WHERE b.tenant_id = ${tenantId}
        AND b."isActive" = true
      GROUP BY b.id
    `;

    const prevMap = new Map(prevRows.map((r) => [r.branchId, Number(r.revenue)]));

    return rows.map((r) => {
      const prev = prevMap.get(r.branchId) ?? 0;
      const curr = Number(r.revenue);
      const growth = prev === 0 ? (curr > 0 ? 100 : 0) : parseFloat(((curr - prev) / prev * 100).toFixed(1));
      return {
        branchId: r.branchId,
        branchName: r.branchName,
        revenue: curr,
        orders: r.orders,
        avgOrderValue: Math.round(Number(r.avgOrderValue)),
        growth,
      };
    });
  }

  // ─── REVENUE BY BRANCH ───────────────────────────────────────
  async getRevenueByBranch(tenantId: string, period = 'month') {
    const { from } = this.periodBounds(period);
    const now = new Date();

    const rows = await this.prisma.$queryRaw<{
      branchId: string;
      branchName: string;
      revenue: number;
      orders: number;
      avgOrderValue: number;
    }[]>`
      SELECT
        b.id                                      AS "branchId",
        b.name                                    AS "branchName",
        COALESCE(SUM(o.total), 0)::float          AS revenue,
        COUNT(o.id)::int                          AS orders,
        COALESCE(AVG(o.total), 0)::float          AS "avgOrderValue"
      FROM branches b
      LEFT JOIN orders o
        ON o.branch_id = b.id
        AND o.status::text = 'COMPLETED'
        AND o.created_at >= ${from}
        AND o.created_at <= ${now}
      WHERE b.tenant_id = ${tenantId}
        AND b."isActive" = true
      GROUP BY b.id, b.name
      ORDER BY revenue DESC
    `;

    return rows.map((r) => ({
      branchId: r.branchId,
      branchName: r.branchName,
      name: r.branchName,         // mobile expects "name"
      revenue: Number(r.revenue),
      orders: r.orders,
      avgOrderValue: Math.round(Number(r.avgOrderValue)),
      stockValue: 0,              // mobile expects "stockValue" (not available without heavy join)
    }));
  }

  // ─── PERIOD BOUNDS HELPER ────────────────────────────────────
  private periodBounds(period: string): { from: Date; prevFrom: Date; prevTo: Date } {
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
}
