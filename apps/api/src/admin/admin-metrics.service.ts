import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
