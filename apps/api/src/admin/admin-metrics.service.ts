import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type RevenueSeries = { date: string; revenue: number; orders: number };
type TopTenant = { name: string; revenue: number };
type FounderError = {
  id: string;
  tenantId: string;
  tenantName: string;
  type: string;
  severity: string;
  message: string;
  stack?: string;
  url?: string;
  userId?: string;
  occurredAt: string;
};

@Injectable()
export class AdminMetricsService {
  private readonly logger = new Logger(AdminMetricsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Barcha tenantlar bo'yicha agregat metrikalar.
   * Bugun, shu hafta, shu oy savdo jami.
   */
  async getGlobalMetrics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalTenants,
      activeTenants,
      todayOrders,
      weekOrders,
      monthOrders,
      totalUsers,
    ] = await this.prisma.$transaction([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.order.aggregate({
        _count: true,
        _sum: { total: true },
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.order.aggregate({
        _count: true,
        _sum: { total: true },
        where: { createdAt: { gte: weekStart } },
      }),
      this.prisma.order.aggregate({
        _count: true,
        _sum: { total: true },
        where: { createdAt: { gte: monthStart } },
      }),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    return {
      tenants: { total: totalTenants, active: activeTenants },
      users: { totalActive: totalUsers },
      sales: {
        today: {
          orders: todayOrders._count,
          revenue: Number(todayOrders._sum.total ?? 0),
        },
        week: {
          orders: weekOrders._count,
          revenue: Number(weekOrders._sum.total ?? 0),
        },
        month: {
          orders: monthOrders._count,
          revenue: Number(monthOrders._sum.total ?? 0),
        },
      },
      generatedAt: now.toISOString(),
    };
  }

  /**
   * Tenant ning savdo tarixi (so'nggi 30 kun).
   */
  async getTenantSales(
    tenantId: string,
    opts: { from?: string; to?: string; page?: number; limit?: number },
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      tenantId,
      ...(opts.from || opts.to
        ? {
            createdAt: {
              ...(opts.from && { gte: new Date(opts.from) }),
              ...(opts.to && { lte: new Date(opts.to) }),
            },
          }
        : {}),
    };

    const [total, items, aggregate] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.order.aggregate({
        where,
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      summary: {
        totalOrders: aggregate._count,
        totalRevenue: Number(aggregate._sum.total ?? 0),
      },
    };
  }

  /**
   * T-056: Barcha tenantlar bo'yicha kunlik daromad grafigi.
   * PostgreSQL DATE(created_at) bilan GROUP BY.
   */
  async getRevenueSeries(days: number): Promise<RevenueSeries[]> {
    const rows = await this.prisma.$queryRaw<
      { date: Date; revenue: bigint | number; orders: bigint | number }[]
    >(
      Prisma.sql`
        SELECT
          DATE(created_at) AS date,
          COALESCE(SUM(total), 0)  AS revenue,
          COUNT(*)                 AS orders
        FROM orders
        WHERE created_at >= NOW() - (${days} || ' days')::INTERVAL
          AND status = 'COMPLETED'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    );

    return rows.map((r) => ({
      date: r.date instanceof Date
        ? r.date.toISOString().slice(0, 10)
        : String(r.date).slice(0, 10),
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    }));
  }

  /**
   * T-056: Bugungi top 5 tenant — daromad bo'yicha.
   */
  async getTopTenants(): Promise<TopTenant[]> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const groups = await this.prisma.order.groupBy({
      by: ['tenantId'],
      where: {
        createdAt: { gte: todayStart },
        status: 'COMPLETED',
      },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    });

    if (groups.length === 0) return [];

    const tenantIds = groups.map((g) => g.tenantId);
    const tenants = await this.prisma.tenant.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(tenants.map((t) => [t.id, t.name]));

    return groups.map((g) => ({
      name: nameMap.get(g.tenantId) ?? g.tenantId,
      revenue: Number(g._sum.total ?? 0),
    }));
  }

  /**
   * T-056: Klient xatolari ro'yxati — client_error_logs jadvalidan.
   */
  async getErrors(params: {
    tenantId?: string;
    type?: string;
    severity?: string;
    limit?: number;
  }): Promise<FounderError[]> {
    const logs = await this.prisma.clientErrorLog.findMany({
      where: {
        ...(params.tenantId ? { tenantId: params.tenantId } : {}),
        ...(params.type ? { type: params.type } : {}),
        ...(params.severity ? { severity: params.severity } : {}),
      },
      orderBy: { occurredAt: 'desc' },
      take: params.limit ?? 50,
    });

    if (logs.length === 0) return [];

    // Resolve tenant names for logs that have tenantId
    const tenantIds = [...new Set(logs.map((l) => l.tenantId).filter(Boolean) as string[])];
    const tenants = tenantIds.length > 0
      ? await this.prisma.tenant.findMany({
          where: { id: { in: tenantIds } },
          select: { id: true, name: true },
        })
      : [];
    const nameMap = new Map(tenants.map((t) => [t.id, t.name]));

    return logs.map((l) => ({
      id: l.id,
      tenantId: l.tenantId ?? 'unknown',
      tenantName: l.tenantId ? (nameMap.get(l.tenantId) ?? l.tenantId) : 'Unknown',
      type: l.type,
      severity: l.severity,
      message: l.message,
      ...(l.stack ? { stack: l.stack } : {}),
      ...(l.url ? { url: l.url } : {}),
      ...(l.userId ? { userId: l.userId } : {}),
      occurredAt: l.occurredAt.toISOString(),
    }));
  }

  /**
   * Tenant sog'liq holati.
   */
  async getTenantHealth(tenantId: string) {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [lastOrder, activeShift, userCount, orderCount24h] = await this.prisma.$transaction([
      this.prisma.order.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, total: true },
      }),
      this.prisma.shift.findFirst({
        where: { tenantId, status: 'OPEN' },
        select: { id: true, openedAt: true, userId: true },
      }),
      this.prisma.user.count({ where: { tenantId, isActive: true } }),
      this.prisma.order.count({ where: { tenantId, createdAt: { gte: since24h } } }),
    ]);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, isActive: true, createdAt: true },
    });

    return {
      tenant,
      health: {
        isActive: tenant?.isActive ?? false,
        lastSaleAt: lastOrder?.createdAt ?? null,
        lastSaleAmount: lastOrder ? Number(lastOrder.total) : null,
        hasOpenShift: !!activeShift,
        openShiftSince: activeShift?.openedAt ?? null,
        activeUsers: userCount,
        orders24h: orderCount24h,
      },
    };
  }
}
