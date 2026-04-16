import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService, CACHE_TTL } from '../common/cache/cache.service';
import { StockFilterDto } from './dto/stock-movement.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockLevelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getStockLevels(tenantId: string, opts: { warehouseId?: string; productId?: string; lowStock?: boolean }) {
    const cacheKey = !opts.lowStock
      ? CacheService.key.stockLevels(tenantId, opts.warehouseId)
      : null;

    if (cacheKey) {
      const cached = await this.cache.get<unknown[]>(cacheKey);
      if (cached) return cached;
    }

    const snapshotExists = await this.prisma.stockSnapshot.findFirst({
      where: { tenantId },
      select: { calculatedAt: true },
    });

    let grouped: { productId: string; warehouseId: string; stock: number }[];

    if (snapshotExists) {
      const snapWhere = opts.warehouseId ? Prisma.sql`AND ss.warehouse_id = ${opts.warehouseId}` : Prisma.empty;
      const snapProduct = opts.productId ? Prisma.sql`AND ss.product_id = ${opts.productId}` : Prisma.empty;

      grouped = await this.prisma.$queryRaw<{ productId: string; warehouseId: string; stock: number }[]>`
        SELECT
          ss.product_id    AS "productId",
          ss.warehouse_id  AS "warehouseId",
          (ss.quantity + COALESCE(delta.qty, 0))::float AS stock
        FROM stock_snapshots ss
        LEFT JOIN (
          SELECT sm.product_id, sm.warehouse_id,
            SUM(CASE
              WHEN sm.type IN ('IN', 'RETURN_IN', 'TRANSFER_IN') THEN sm.quantity
              WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
              ELSE -sm.quantity
            END) AS qty
          FROM stock_movements sm
          WHERE sm.tenant_id = ${tenantId}
            AND sm.created_at > ${snapshotExists.calculatedAt}
          GROUP BY sm.product_id, sm.warehouse_id
        ) delta ON delta.product_id = ss.product_id AND delta.warehouse_id = ss.warehouse_id
        WHERE ss.tenant_id = ${tenantId}
        ${snapWhere}
        ${snapProduct}

        UNION ALL

        SELECT
          sm2.product_id   AS "productId",
          sm2.warehouse_id AS "warehouseId",
          SUM(CASE
            WHEN sm2.type IN ('IN', 'RETURN_IN', 'TRANSFER_IN') THEN sm2.quantity
            WHEN sm2.type = 'ADJUSTMENT' THEN sm2.quantity
            ELSE -sm2.quantity
          END)::float AS stock
        FROM stock_movements sm2
        WHERE sm2.tenant_id = ${tenantId}
          AND sm2.created_at > ${snapshotExists.calculatedAt}
          AND NOT EXISTS (
            SELECT 1 FROM stock_snapshots ss2
            WHERE ss2.tenant_id = ${tenantId}
              AND ss2.product_id = sm2.product_id
              AND ss2.warehouse_id = sm2.warehouse_id
          )
        GROUP BY sm2.product_id, sm2.warehouse_id
      `;
    } else {
      const warehousePartFull = opts.warehouseId ? Prisma.sql`AND warehouse_id = ${opts.warehouseId}` : Prisma.empty;
      const productPartFull = opts.productId ? Prisma.sql`AND product_id = ${opts.productId}` : Prisma.empty;

      grouped = await this.prisma.$queryRaw<{ productId: string; warehouseId: string; stock: number }[]>`
        SELECT
          product_id   AS "productId",
          warehouse_id AS "warehouseId",
          SUM(CASE
            WHEN type IN ('IN', 'RETURN_IN', 'TRANSFER_IN') THEN quantity
            WHEN type = 'ADJUSTMENT' THEN quantity
            ELSE -quantity
          END)::float AS stock
        FROM stock_movements
        WHERE tenant_id = ${tenantId}
        ${warehousePartFull}
        ${productPartFull}
        GROUP BY product_id, warehouse_id
      `;
    }

    const productIds = [...new Set(grouped.map((g) => g.productId))];
    const warehouseIds = [...new Set(grouped.map((g) => g.warehouseId))];

    const [enrichProducts, enrichWarehouses] = await Promise.all([
      this.prisma.product.findMany({
        where: { id: { in: productIds }, tenantId },
        select: { id: true, name: true, sku: true, minStockLevel: true },
      }),
      this.prisma.warehouse.findMany({
        where: { id: { in: warehouseIds }, tenantId },
        select: { id: true, name: true },
      }),
    ]);

    const productMap = new Map(enrichProducts.map((p) => [p.id, p]));
    const warehouseMap = new Map(enrichWarehouses.map((w) => [w.id, w]));

    const enriched = grouped.map((g) => {
      const p = productMap.get(g.productId);
      const w = warehouseMap.get(g.warehouseId);
      return {
        productId: g.productId,
        warehouseId: g.warehouseId,
        totalQty: Number(g.stock),
        name: p?.name ?? '',
        sku: p?.sku ?? null,
        minStockLevel: p?.minStockLevel ? Number(p.minStockLevel) : null,
        warehouseName: w?.name ?? '',
      };
    });

    if (cacheKey) {
      await this.cache.set(cacheKey, enriched, CACHE_TTL.STOCK_LEVELS);
    }

    if (!opts.lowStock) return enriched;
    return enriched.filter((item) => item.totalQty <= (item.minStockLevel ?? 5));
  }

  async getOutOfStockItems(tenantId: string, branchId?: string) {
    const branchFilter = branchId ? Prisma.sql`AND w.branch_id = ${branchId}` : Prisma.empty;

    const rows = await this.prisma.$queryRaw<{
      id: string; productName: string; barcode: string | null;
      quantity: number; unit: string | null; branchName: string | null;
      branchId: string | null; costPrice: number; reorderLevel: number;
    }[]>`
      SELECT
        p.id,
        p.name                   AS "productName",
        p.barcode,
        0::float                 AS quantity,
        u.short_name             AS unit,
        b.name                   AS "branchName",
        w.branch_id              AS "branchId",
        p.cost_price::float      AS "costPrice",
        p.min_stock_level::float AS "reorderLevel"
      FROM products p
      LEFT JOIN units u ON u.id = p.unit_id
      LEFT JOIN warehouses w ON w.tenant_id = p.tenant_id
      LEFT JOIN branches b ON b.id = w.branch_id
      WHERE p.tenant_id = ${tenantId}
        AND p.deleted_at IS NULL
        AND p.is_active = true
        ${branchFilter}
        AND NOT EXISTS (
          SELECT 1 FROM stock_movements sm
          WHERE sm.product_id = p.id AND sm.tenant_id = ${tenantId}
        )
      UNION ALL
      SELECT p.id, p.name, p.barcode,
        SUM(CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
          ELSE -sm.quantity
        END)::float,
        u.short_name, b.name, w.branch_id,
        p.cost_price::float, p.min_stock_level::float
      FROM products p
      JOIN stock_movements sm ON sm.product_id = p.id AND sm.tenant_id = p.tenant_id
      LEFT JOIN units u ON u.id = p.unit_id
      LEFT JOIN warehouses w ON w.id = sm.warehouse_id
      LEFT JOIN branches b ON b.id = w.branch_id
      WHERE p.tenant_id = ${tenantId}
        AND p.deleted_at IS NULL
        AND p.is_active = true
        ${branchFilter}
      GROUP BY p.id, p.name, p.barcode, u.short_name, b.name, w.branch_id, p.cost_price, p.min_stock_level
      HAVING SUM(CASE
        WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
        WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
        ELSE -sm.quantity
      END) <= 0
    `;

    return rows.map((r) => ({
      id: r.id, productName: r.productName, barcode: r.barcode, quantity: 0,
      unit: r.unit ?? 'dona', branchName: r.branchName, branchId: r.branchId,
      costPrice: r.costPrice, stockValue: 0, reorderLevel: r.reorderLevel,
      expiryDate: null, status: 'out_of_stock',
    }));
  }

  // ─── T-202: LOW STOCK LIST ───────────────────────────────────
  // GET /inventory/low-stock?branch_id=&limit=20
  async getLowStockList(
    tenantId: string,
    branchId?: string,
    limit = 20,
  ): Promise<{ items: { productId: string; productName: string; quantity: number; unit: string; threshold: number; status: string }[] }> {
    const branchFilter = branchId ? Prisma.sql`AND w.branch_id = ${branchId}` : Prisma.empty;
    const limitVal = Math.min(Math.max(limit, 1), 100);

    const rows = await this.prisma.$queryRaw<{
      productId: string;
      productName: string;
      quantity: number;
      unit: string | null;
      threshold: number;
    }[]>`
      SELECT
        p.id                                  AS "productId",
        p.name                                AS "productName",
        COALESCE(SUM(CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
          ELSE -sm.quantity
        END), 0)::float                       AS quantity,
        u.short_name                          AS unit,
        COALESCE(p.min_stock_level, 5)::float AS threshold
      FROM products p
      LEFT JOIN units u ON u.id = p.unit_id
      LEFT JOIN stock_movements sm
        ON sm.product_id = p.id
        AND sm.tenant_id = p.tenant_id
      LEFT JOIN warehouses w ON w.id = sm.warehouse_id
      WHERE p.tenant_id  = ${tenantId}
        AND p.deleted_at IS NULL
        AND p.is_active  = true
        ${branchFilter}
      GROUP BY p.id, p.name, u.short_name, p.min_stock_level
      HAVING COALESCE(SUM(CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
          ELSE -sm.quantity
        END), 0) <= COALESCE(p.min_stock_level, 5)
      ORDER BY quantity ASC
      LIMIT ${limitVal}
    `;

    const items = rows.map((r) => {
      const qty = Number(r.quantity);
      const status = qty <= 0 ? 'out_of_stock' : 'low';
      return {
        productId: r.productId,
        productName: r.productName,
        quantity: qty,
        unit: r.unit ?? 'dona',
        threshold: Number(r.threshold),
        status,
      };
    });

    return { items };
  }

  // ─── T-202: INVENTORY ITEMS (paginated) ───────────────────────
  // GET /inventory/items?branchId=&status=&search=&page=&limit=
  async getInventoryItems(
    tenantId: string,
    opts: {
      branchId?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = Math.max(opts.page ?? 1, 1);
    const limit = Math.min(opts.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const branchFilter = opts.branchId
      ? Prisma.sql`AND w.branch_id = ${opts.branchId}`
      : Prisma.empty;

    const searchFilter = opts.search
      ? Prisma.sql`AND (p.name ILIKE ${'%' + opts.search + '%'} OR p.barcode ILIKE ${'%' + opts.search + '%'})`
      : Prisma.empty;

    type RawRow = {
      productId: string; productName: string; barcode: string | null;
      branchName: string | null; branchId: string | null;
      quantity: number; unit: string | null;
      costPrice: number; threshold: number;
      expiryDate: Date | null;
    };

    const rows = await this.prisma.$queryRaw<RawRow[]>`
      SELECT
        p.id                                    AS "productId",
        p.name                                  AS "productName",
        p.barcode,
        b.name                                  AS "branchName",
        w.branch_id                             AS "branchId",
        COALESCE(SUM(CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT'           THEN sm.quantity
          ELSE -sm.quantity
        END), 0)::float                         AS quantity,
        u.short_name                            AS unit,
        p.cost_price::float                     AS "costPrice",
        COALESCE(p.min_stock_level, 5)::float   AS threshold,
        MAX(sm.expiry_date)                     AS "expiryDate"
      FROM products p
      LEFT JOIN units u         ON u.id = p.unit_id
      LEFT JOIN stock_movements sm
        ON sm.product_id = p.id AND sm.tenant_id = p.tenant_id
      LEFT JOIN warehouses w    ON w.id = sm.warehouse_id
      LEFT JOIN branches b      ON b.id = w.branch_id
      WHERE p.tenant_id  = ${tenantId}
        AND p.deleted_at IS NULL
        AND p.is_active  = true
        ${branchFilter}
        ${searchFilter}
      GROUP BY p.id, p.name, p.barcode, b.name, w.branch_id, u.short_name, p.cost_price, p.min_stock_level
    `;

    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const withStatus = rows.map((r) => {
      const qty = Number(r.quantity);
      const threshold = Number(r.threshold);
      const expiry = r.expiryDate ? new Date(r.expiryDate) : null;

      let status: string;
      if (expiry && expiry < now) status = 'expired';
      else if (expiry && expiry <= soon) status = 'expiring';
      else if (qty <= 0) status = 'out_of_stock';
      else if (qty <= threshold) status = 'low';
      else status = 'normal';

      return {
        productId: r.productId,
        productName: r.productName,
        barcode: r.barcode ?? null,
        branchName: r.branchName ?? null,
        branchId: r.branchId ?? null,
        quantity: qty,
        unit: r.unit ?? 'dona',
        stockValue: qty * Number(r.costPrice),
        expiryDate: expiry,
        status,
      };
    });

    const filtered = opts.status
      ? withStatus.filter((i) => i.status === opts.status)
      : withStatus;

    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);

    return { items, total, page, limit };
  }

  // Proxy — StockFilterDto uchun
  getStockMovements(tenantId: string, filter: StockFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 50;
    const skip = (page - 1) * limit;
    const where: { tenantId: string; warehouseId?: string; productId?: string } = {
      tenantId,
      ...(filter.warehouseId && { warehouseId: filter.warehouseId }),
      ...(filter.productId && { productId: filter.productId }),
    };
    return this.prisma.$transaction([
      this.prisma.stockMovement.count({ where }),
      this.prisma.stockMovement.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          warehouse: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]).then(([total, items]) => ({ items, total, page, limit }));
  }
}
