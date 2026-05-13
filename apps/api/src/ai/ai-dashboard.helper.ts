import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AiEnginesHelper } from './ai-engines.helper';

@Injectable()
export class AiDashboardHelper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engines: AiEnginesHelper,
  ) {}

  // ─── CASHIER PERFORMANCE ─────────────────────────────────────
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
        AND u.role::text = 'CASHIER'
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

  // ─── HOURLY HEATMAP ───────────────────────────────────────────
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
      dow: r.dow,
      hour: r.hour,
      orders: r.orders,
      revenue: Number(r.revenue),
    }));
  }

  // ─── REVENUE SUMMARY ──────────────────────────────────────────
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

  // ─── ORDERS SUMMARY ───────────────────────────────────────────
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

    const trend =
      prev.total === 0
        ? curr.total > 0 ? 100 : 0
        : parseFloat(((curr.total - prev.total) / prev.total * 100).toFixed(1));

    return {
      total: curr.total,
      avgOrderValue: Math.round(curr.avg),
      trend,
    };
  }

  // ─── BRANCH COMPARISON ────────────────────────────────────────
  async getBranchComparison(tenantId: string, period = 'month') {
    const { from, prevFrom, prevTo } = this.engines.periodBounds(period);
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
        AND o.status::text IN ('COMPLETED', 'RETURNED')
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
        AND o.status::text IN ('COMPLETED', 'RETURNED')
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
      const growth =
        prev === 0
          ? curr > 0 ? 100 : 0
          : parseFloat(((curr - prev) / prev * 100).toFixed(1));
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

  // ─── REVENUE BY BRANCH ────────────────────────────────────────
  async getRevenueByBranch(tenantId: string, period = 'month') {
    const { from } = this.engines.periodBounds(period);
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
        AND o.status::text IN ('COMPLETED', 'RETURNED')
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
      name: r.branchName,
      revenue: Number(r.revenue),
      orders: r.orders,
      avgOrderValue: Math.round(Number(r.avgOrderValue)),
      stockValue: 0,
    }));
  }
}
