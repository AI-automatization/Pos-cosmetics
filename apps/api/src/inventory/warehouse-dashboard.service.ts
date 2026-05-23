import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class WarehouseDashboardService {
  private readonly logger = new Logger(WarehouseDashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  // ─── T-319/T-320: WAREHOUSE DASHBOARD ────────────────────────────────────

  async getDashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);

    const [
      totalProducts,
      todayMovementsIn,
      todayMovementsOut,
      lowStockItems,
      expiryItems,
      recentMovements,
    ] = await Promise.all([
      this.prisma.product.count({ where: { tenantId, deletedAt: null } }),

      this.prisma.stockMovement.count({
        where: { tenantId, type: 'IN', createdAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.stockMovement.count({
        where: { tenantId, type: { in: ['OUT', 'WRITE_OFF'] }, createdAt: { gte: today, lt: tomorrow } },
      }),

      // Low stock: products with total quantity < 5
      this.prisma.$queryRaw<{ productId: string; name: string; totalQty: number }[]>`
        SELECT p.id AS "productId", p.name, COALESCE(SUM(sm.quantity), 0)::float AS "totalQty"
        FROM products p
        LEFT JOIN stock_movements sm ON sm.product_id = p.id AND sm.tenant_id = ${tenantId}
        WHERE p.tenant_id = ${tenantId} AND p.deleted_at IS NULL
        GROUP BY p.id, p.name
        HAVING COALESCE(SUM(CASE WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity ELSE 0 END), 0)
             - COALESCE(SUM(CASE WHEN sm.type IN ('OUT','WRITE_OFF','TRANSFER_OUT') THEN sm.quantity ELSE 0 END), 0) < 5
        ORDER BY "totalQty" ASC
        LIMIT 10
      `,

      // Expiring products (batch expiry within 30 days)
      this.prisma.stockMovement.findMany({
        where: {
          tenantId,
          expiryDate: { gte: today, lte: in30Days },
        },
        select: {
          productId: true,
          expiryDate: true,
          batchNumber: true,
          quantity: true,
          product: { select: { name: true } },
        },
        orderBy: { expiryDate: 'asc' },
        take: 10,
        distinct: ['productId'],
      }),

      // Recent movements (today)
      this.prisma.stockMovement.findMany({
        where: { tenantId, createdAt: { gte: today } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { product: { select: { name: true } } },
      }),
    ]);

    return {
      stats: {
        totalProducts,
        todayMovementsIn,
        todayMovementsOut,
        lowStockCount: lowStockItems.length,
        expiryCount: expiryItems.length,
      },
      lowStockItems,
      expiryItems,
      recentMovements,
    };
  }

  async getTodayMovements(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.stockMovement.findMany({
      where: { tenantId, createdAt: { gte: today } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { product: { select: { name: true } } },
    });
  }

  async getAlerts(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    const expiredItems = await this.prisma.stockMovement.findMany({
      where: { tenantId, expiryDate: { lt: today } },
      select: { productId: true, expiryDate: true, batchNumber: true, product: { select: { name: true } } },
      distinct: ['productId'],
      take: 20,
    });

    const soonExpiring = await this.prisma.stockMovement.findMany({
      where: { tenantId, expiryDate: { gte: today, lte: in7Days } },
      select: { productId: true, expiryDate: true, batchNumber: true, product: { select: { name: true } } },
      distinct: ['productId'],
      take: 20,
    });

    return {
      expired: expiredItems.length,
      soonExpiring: soonExpiring.length,
      alerts: [
        ...expiredItems.map((i) => ({ type: 'EXPIRED' as const, ...i })),
        ...soonExpiring.map((i) => ({ type: 'EXPIRING_SOON' as const, ...i })),
      ],
    };
  }

  // ─── T-336: Movement history with filters ────────────────────────────────

  async listMovements(
    tenantId: string,
    params: {
      productId?: string;
      type?: string;
      userId?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page  = params.page  ?? 1;
    const limit = params.limit ?? 50;
    const skip  = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (params.productId) where['productId'] = params.productId;
    if (params.type)      where['type']      = params.type;
    if (params.userId)    where['userId']    = params.userId;
    if (params.from || params.to) {
      where['createdAt'] = {
        ...(params.from ? { gte: new Date(params.from) } : {}),
        ...(params.to   ? { lte: new Date(params.to)   } : {}),
      };
    }

    const [movements, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          product:   { select: { name: true, sku: true } },
          user:      { select: { firstName: true, lastName: true } },
          warehouse: { select: { name: true } },
        },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return { movements, total, page, limit };
  }
}
