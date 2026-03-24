import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

// ─── Helpers ────────────────────────────────────────────────────────────────

function startOf(period: 'today' | 'week' | 'month' | 'year', now = new Date()): Date {
  const d = new Date(now);
  if (period === 'today') { d.setHours(0, 0, 0, 0); return d; }
  if (period === 'week')  { d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d; }
  if (period === 'month') { d.setDate(d.getDate() - 29); d.setHours(0, 0, 0, 0); return d; }
  // year
  d.setDate(d.getDate() - 364); d.setHours(0, 0, 0, 0); return d;
}

function prevStart(period: 'today' | 'week' | 'month' | 'year', now = new Date()): Date {
  const d = new Date(now);
  if (period === 'today') { d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0); return d; }
  if (period === 'week')  { d.setDate(d.getDate() - 13); d.setHours(0, 0, 0, 0); return d; }
  if (period === 'month') { d.setDate(d.getDate() - 59); d.setHours(0, 0, 0, 0); return d; }
  d.setDate(d.getDate() - 729); d.setHours(0, 0, 0, 0); return d;
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// ─── Controller ─────────────────────────────────────────────────────────────

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /analytics/revenue
   * T-221: { today, week, month, year, todayTrend, weekTrend, monthTrend, yearTrend }
   */
  @Get('revenue')
  @ApiOperation({ summary: 'T-221: Revenue summary — today/week/month/year + trends' })
  @ApiQuery({ name: 'branch_id', required: false })
  async getRevenue(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    const now = new Date();
    const where = (from: Date, to?: Date) => ({
      tenantId,
      status: OrderStatus.COMPLETED,
      ...(branchId ? { branchId } : {}),
      createdAt: { gte: from, ...(to ? { lt: to } : {}) },
    });

    const sum = (orders: { total: number | { toNumber(): number } }[]) =>
      orders.reduce((s, o) => s + (typeof o.total === 'number' ? o.total : o.total.toNumber()), 0);

    const [todayOrders, prevTodayOrders, weekOrders, prevWeekOrders, monthOrders, prevMonthOrders, yearOrders, prevYearOrders] =
      await Promise.all([
        this.prisma.order.findMany({ where: where(startOf('today', now)),       select: { total: true } }),
        this.prisma.order.findMany({ where: where(prevStart('today', now), startOf('today', now)), select: { total: true } }),
        this.prisma.order.findMany({ where: where(startOf('week', now)),         select: { total: true } }),
        this.prisma.order.findMany({ where: where(prevStart('week', now), startOf('week', now)),   select: { total: true } }),
        this.prisma.order.findMany({ where: where(startOf('month', now)),        select: { total: true } }),
        this.prisma.order.findMany({ where: where(prevStart('month', now), startOf('month', now)), select: { total: true } }),
        this.prisma.order.findMany({ where: where(startOf('year', now)),         select: { total: true } }),
        this.prisma.order.findMany({ where: where(prevStart('year', now), startOf('year', now)),   select: { total: true } }),
      ]);

    const today  = sum(todayOrders);
    const week   = sum(weekOrders);
    const month  = sum(monthOrders);
    const year   = sum(yearOrders);

    return {
      today,
      week,
      month,
      year,
      todayTrend:  calcTrend(today,  sum(prevTodayOrders)),
      weekTrend:   calcTrend(week,   sum(prevWeekOrders)),
      monthTrend:  calcTrend(month,  sum(prevMonthOrders)),
      yearTrend:   calcTrend(year,   sum(prevYearOrders)),
    };
  }

  /**
   * GET /analytics/orders
   * T-210: { total, avgOrderValue, trend }
   */
  @Get('orders')
  @ApiOperation({ summary: 'T-210: Orders count + avg value + trend' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  async getOrders(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
    @Query('period') period: 'today' | 'week' | 'month' | 'year' = 'month',
  ) {
    const now = new Date();
    const from = startOf(period, now);
    const prevFrom = prevStart(period, now);

    const baseWhere = {
      tenantId,
      status: OrderStatus.COMPLETED,
      ...(branchId ? { branchId } : {}),
    };

    const [orders, prevOrders] = await Promise.all([
      this.prisma.order.findMany({ where: { ...baseWhere, createdAt: { gte: from } }, select: { total: true } }),
      this.prisma.order.findMany({ where: { ...baseWhere, createdAt: { gte: prevFrom, lt: from } }, select: { total: true } }),
    ]);

    const total = orders.length;
    const prevTotal = prevOrders.length;
    const sumTotal = orders.reduce((s, o) => s + Number(o.total), 0);
    const avgOrderValue = total > 0 ? Math.round(sumTotal / total) : 0;

    return {
      total,
      avgOrderValue,
      trend: calcTrend(total, prevTotal),
    };
  }

  /**
   * GET /analytics/sales-trend
   * T-201: { labels: string[], values: number[] }
   */
  @Get('sales-trend')
  @ApiOperation({ summary: 'T-201: Sales trend for chart (daily points)' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d'] })
  async getSalesTrend(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
    @Query('period') period: '7d' | '30d' = '30d',
  ) {
    const days = period === '7d' ? 7 : 30;
    const labels: string[] = [];
    const values: number[] = [];
    const now = new Date();

    // Build date buckets
    const buckets = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const label = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      labels.push(label);
      buckets.set(key, 0);
    }

    const from = new Date(now);
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: OrderStatus.COMPLETED,
        ...(branchId ? { branchId } : {}),
        createdAt: { gte: from },
      },
      select: { total: true, createdAt: true },
    });

    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + Number(o.total));
    }

    for (const val of buckets.values()) {
      values.push(val);
    }

    return { labels, values };
  }

  /**
   * GET /analytics/branch-comparison
   * T-201: { branches: [{ branchId, branchName, value }] }
   */
  @Get('branch-comparison')
  @ApiOperation({ summary: 'T-201: Revenue comparison across branches' })
  @ApiQuery({ name: 'metric', required: false, enum: ['revenue', 'orders'] })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  async getBranchComparison(
    @CurrentUser('tenantId') tenantId: string,
    @Query('metric') metric: 'revenue' | 'orders' = 'revenue',
    @Query('period') period: 'today' | 'week' | 'month' | 'year' = 'month',
  ) {
    const from = startOf(period);

    const branches = await this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });

    const results = await Promise.all(
      branches.map(async (b) => {
        const orders = await this.prisma.order.findMany({
          where: { tenantId, branchId: b.id, status: OrderStatus.COMPLETED, createdAt: { gte: from } },
          select: { total: true },
        });
        const value = metric === 'revenue'
          ? orders.reduce((s, o) => s + Number(o.total), 0)
          : orders.length;
        return { branchId: b.id, branchName: b.name, value };
      }),
    );

    return { branches: results.sort((a, b) => b.value - a.value) };
  }

  /**
   * GET /analytics/top-products
   * T-201: { products: [{ productId, name, quantity, revenue }] }
   */
  @Get('top-products')
  @ApiOperation({ summary: 'T-201: Top selling products' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  async getTopProducts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
    @Query('limit') limit = 10,
    @Query('period') period: 'today' | 'week' | 'month' | 'year' = 'month',
  ) {
    const from = startOf(period);
    const take = Number(limit) || 10;

    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          tenantId,
          status: OrderStatus.COMPLETED,
          createdAt: { gte: from },
          ...(branchId ? { branchId } : {}),
        },
      },
      select: { productId: true, productName: true, quantity: true, total: true },
    });

    // Aggregate by product
    const map = new Map<string, { productId: string; name: string; quantity: number; revenue: number }>();
    for (const item of items) {
      const existing = map.get(item.productId);
      if (existing) {
        existing.quantity += Number(item.quantity);
        existing.revenue  += Number(item.total);
      } else {
        map.set(item.productId, {
          productId: item.productId,
          name: item.productName,
          quantity: Number(item.quantity),
          revenue: Number(item.total),
        });
      }
    }

    const products = Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, take);

    return { products };
  }

  /**
   * GET /analytics/revenue-by-branch
   * T-201: alias for branch-comparison with metric=revenue
   */
  @Get('revenue-by-branch')
  @ApiOperation({ summary: 'T-201: Revenue by branch (alias for branch-comparison)' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  async getRevenueByBranch(
    @CurrentUser('tenantId') tenantId: string,
    @Query('period') period: 'today' | 'week' | 'month' | 'year' = 'month',
  ) {
    return this.getBranchComparison(tenantId, 'revenue', period);
  }

  /**
   * GET /analytics/stock-value
   * T-215: { total, byBranch: [{ branchId, branchName, value }] }
   */
  @Get('stock-value')
  @ApiOperation({ summary: 'T-215: Stock value total + by branch' })
  async getStockValue(@CurrentUser('tenantId') tenantId: string) {
    const branches = await this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });

    const byBranch = await Promise.all(
      branches.map(async (b) => {
        const movements = await this.prisma.stockMovement.findMany({
          where: { tenantId, warehouseId: b.id },
          select: { type: true, quantity: true, product: { select: { costPrice: true } } },
        });
        // cost * quantity (Decimal -> Number conversion)
        const value = movements.length > 0
          ? movements.reduce((s, m) => {
              const cost = Number(m.product?.costPrice ?? 0);
              const qty = Number(m.quantity);
              const sign = ['IN', 'TRANSFER_IN', 'RETURN_IN'].includes(m.type) ? 1 : -1;
              return s + cost * qty * sign;
            }, 0)
          : 0;
        return { branchId: b.id, branchName: b.name, value: Math.max(0, value) };
      }),
    );

    const total = byBranch.reduce((s, b) => s + b.value, 0);
    return { total, byBranch };
  }

  /**
   * GET /analytics/insights — AI insights (kept as mock, real AI in Phase 3)
   */
  @Get('insights')
  @ApiOperation({ summary: 'AI insights (mock data until Phase 3)' })
  getInsights() {
    return [
      { id: 'ins-001', type: 'TREND',     title: "Parfyum sotuvi o'sdi",        description: "O'tgan hafta parfyum sotuvi 23% oshdi.", priority: 'HIGH',   createdAt: new Date(Date.now() - 2 * 3600000) },
      { id: 'ins-002', type: 'DEADSTOCK', title: "Revlon Blush — sekin sotilmoqda", description: "30 kun ichida 2 dona sotildi.",       priority: 'MEDIUM', createdAt: new Date(Date.now() - 6 * 3600000) },
      { id: 'ins-003', type: 'MARGIN',    title: "MAC Lipstick margini past",    description: "Sof foyda 8% ga tushdi.",              priority: 'HIGH',   createdAt: new Date(Date.now() - 12 * 3600000) },
    ];
  }
}
