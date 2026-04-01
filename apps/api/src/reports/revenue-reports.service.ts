import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RevenueReportsService {
  private readonly logger = new Logger(RevenueReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDailyReport(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [orderAgg, returnAgg] = await Promise.all([
      this.prisma.order.aggregate({
        where: { tenantId, createdAt: { gte: today, lt: tomorrow }, status: { not: 'VOIDED' as const } },
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.return.aggregate({
        where: { tenantId, createdAt: { gte: today, lt: tomorrow }, status: 'APPROVED' },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    const revenue = Number(orderAgg._sum.total ?? 0);
    const returnTotal = Number(returnAgg._sum.total ?? 0);
    return {
      date: today.toISOString().slice(0, 10),
      orders: orderAgg._count.id,
      revenue,
      returns: returnAgg._count.id,
      returnTotal,
      netRevenue: revenue - returnTotal,
    };
  }

  async getDailyRevenue(tenantId: string, from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<
      { date: string; revenue: number; orderCount: number }[]
    >`
      SELECT
        DATE(created_at) AS date,
        SUM(total)::float        AS revenue,
        COUNT(*)::int            AS "orderCount"
      FROM orders
      WHERE tenant_id = ${tenantId}
        AND created_at >= ${from}
        AND created_at <  ${to}
        AND status::text != 'VOIDED'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    this.logger.log(`DailyRevenue query: ${from.toISOString()} → ${to.toISOString()}`, { tenantId });
    return rows;
  }

  async getTopProducts(tenantId: string, from: Date, to: Date, limit = 10) {
    return this.prisma.$queryRaw<
      { productId: string; productName: string; totalQty: number; totalRevenue: number }[]
    >`
      SELECT
        oi.product_id          AS "productId",
        oi.product_name        AS "productName",
        SUM(oi.quantity)::float       AS "totalQty",
        SUM(oi.total)::float          AS "totalRevenue"
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.tenant_id = ${tenantId}
        AND o.created_at >= ${from}
        AND o.created_at <  ${to}
        AND o.status::text != 'VOIDED'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY "totalRevenue" DESC
      LIMIT ${limit}
    `;
  }

  async getSalesSummary(tenantId: string, from: Date, to: Date) {
    const [orderAgg, returnAgg, paymentAgg] = await Promise.all([
      this.prisma.order.aggregate({
        where: { tenantId, createdAt: { gte: from, lt: to }, status: { not: 'VOIDED' } },
        _sum: { total: true, subtotal: true, discountAmount: true, taxAmount: true },
        _count: { id: true },
      }),
      this.prisma.return.aggregate({
        where: { tenantId, createdAt: { gte: from, lt: to }, status: 'APPROVED' },
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.$queryRaw<{ method: string; amount: number }[]>`
        SELECT
          pi.method,
          SUM(pi.amount)::float AS amount
        FROM payment_intents pi
        JOIN orders o ON o.id = pi.order_id
        WHERE pi.tenant_id = ${tenantId}
          AND o.created_at >= ${from}
          AND o.created_at <  ${to}
          AND pi.status::text = 'SETTLED'
        GROUP BY pi.method
      `,
    ]);

    const grossRevenue = Number(orderAgg._sum.total ?? 0);
    const returnTotal = Number(returnAgg._sum.total ?? 0);

    return {
      period: { from, to },
      orders: {
        count: orderAgg._count.id,
        grossRevenue,
        subtotal: Number(orderAgg._sum.subtotal ?? 0),
        totalDiscount: Number(orderAgg._sum.discountAmount ?? 0),
        totalTax: Number(orderAgg._sum.taxAmount ?? 0),
      },
      returns: { count: returnAgg._count.id, total: returnTotal },
      netRevenue: grossRevenue - returnTotal,
      paymentBreakdown: paymentAgg,
    };
  }

  async getProfitEstimate(tenantId: string, from: Date, to: Date) {
    const [revenueAgg, cogsRows, returnAgg] = await Promise.all([
      this.prisma.order.aggregate({
        where: { tenantId, createdAt: { gte: from, lt: to }, status: { not: 'VOIDED' } },
        _sum: { total: true },
      }),
      this.prisma.$queryRaw<{ cogs: number }[]>`
        SELECT SUM(oi.quantity * oi.cost_price)::float AS cogs
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.tenant_id = ${tenantId}
          AND o.created_at >= ${from}
          AND o.created_at <  ${to}
          AND o.status::text != 'VOIDED'
      `,
      this.prisma.return.aggregate({
        where: { tenantId, createdAt: { gte: from, lt: to }, status: 'APPROVED' },
        _sum: { total: true },
      }),
    ]);

    const revenue = Number(revenueAgg._sum.total ?? 0);
    const cogs = Number(cogsRows[0]?.cogs ?? 0);
    const returns = Number(returnAgg._sum.total ?? 0);
    const grossProfit = revenue - cogs - returns;

    return {
      period: { from, to },
      revenue,
      cogs,
      returns,
      grossProfit,
      grossMarginPct: revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(2) : '0.00',
    };
  }
}
