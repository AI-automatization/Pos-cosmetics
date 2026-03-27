import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService, CACHE_TTL } from '../common/cache/cache.service';
import {
  CreateStockMovementDto,
  CreateWarehouseDto,
  StockFilterDto,
  BatchStockInDto,
  BatchStockOutDto,
} from './dto/stock-movement.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getWarehouses(tenantId: string) {
    return this.prisma.warehouse.findMany({
      where: { tenantId, isActive: true },
      include: { branch: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createWarehouse(tenantId: string, dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: { tenantId, name: dto.name, branchId: dto.branchId },
    });
  }

  async addStockMovement(tenantId: string, userId: string, dto: CreateStockMovementDto) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, tenantId },
    });
    if (!warehouse) throw new NotFoundException(`Warehouse ${dto.warehouseId} not found`);

    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId, deletedAt: null },
    });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    const movement = await this.prisma.stockMovement.create({
      data: {
        tenantId,
        warehouseId: dto.warehouseId,
        productId: dto.productId,
        userId,
        type: dto.type,
        quantity: dto.quantity,
        costPrice: dto.costPrice,
        note: dto.note,
        batchNumber: dto.batchNumber,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });

    this.logger.log(`StockMovement: ${dto.type} ${dto.quantity} of ${dto.productId}`, {
      tenantId,
      movementId: movement.id,
    });
    // Stock cache invalidate — harakat bo'lganda 1 daqiqalik cache tozalanadi
    await this.cache.invalidatePattern(CacheService.key.stockLevels(tenantId, '*'));
    return movement;
  }

  // ─── Batch Stock-In (Process 5 — Goods Receipt) ───────────────────────────
  async batchStockIn(tenantId: string, userId: string, dto: BatchStockInDto) {
    const warehouseId = await this.resolveWarehouseId(tenantId, dto.warehouseId);
    const movements = await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.stockMovement.create({
          data: {
            tenantId,
            warehouseId,
            productId: item.productId,
            userId,
            type: 'IN',
            quantity: item.quantity,
            costPrice: item.costPrice,
            note: dto.notes ?? (dto.supplier ? `Supplier: ${dto.supplier}` : undefined),
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
          },
        }),
      ),
    );
    await this.cache.invalidatePattern(CacheService.key.stockLevels(tenantId, '*'));
    this.logger.log(`BatchStockIn: ${movements.length} movements`, { tenantId });
    return { created: movements.length, movements };
  }

  // ─── Batch Stock-Out / Write-Off (Process 11 — Write-Off) ─────────────────
  async batchStockOut(tenantId: string, userId: string, dto: BatchStockOutDto) {
    const warehouseId = await this.resolveWarehouseId(tenantId, dto.warehouseId);
    const movements = await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.stockMovement.create({
          data: {
            tenantId,
            warehouseId,
            productId: item.productId,
            userId,
            type: 'ADJUSTMENT',
            quantity: -Math.abs(item.quantity),
            note: dto.notes ?? dto.reason,
          },
        }),
      ),
    );
    await this.cache.invalidatePattern(CacheService.key.stockLevels(tenantId, '*'));
    this.logger.log(`BatchStockOut: ${movements.length} movements`, { tenantId });
    return { created: movements.length, movements };
  }

  private async resolveWarehouseId(tenantId: string, warehouseId?: string): Promise<string> {
    if (warehouseId) {
      const exists = await this.prisma.warehouse.findFirst({ where: { id: warehouseId, tenantId } });
      if (!exists) throw new NotFoundException(`Warehouse ${warehouseId} not found`);
      return warehouseId;
    }
    const first = await this.prisma.warehouse.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!first) {
      // Auto-create default warehouse for tenant
      const created = await this.prisma.warehouse.create({
        data: { tenantId, name: 'Asosiy Ombor' },
      });
      return created.id;
    }
    return first.id;
  }

  async getStockMovements(tenantId: string, filter: StockFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {
      tenantId,
      ...(filter.warehouseId && { warehouseId: filter.warehouseId }),
      ...(filter.productId && { productId: filter.productId }),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.stockMovement.count({ where }),
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          warehouse: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    return { items, total, page, limit };
  }

  async getStockLevels(tenantId: string, opts: { warehouseId?: string; productId?: string; lowStock?: boolean }) {
    // T-075: Stock levels — snapshot + recent movements (10x tezroq katta inventar uchun)
    // lowStock=true bo'lsa cache ishlatmaymiz (dinamik)
    const cacheKey = !opts.lowStock
      ? CacheService.key.stockLevels(tenantId, opts.warehouseId)
      : null;

    if (cacheKey) {
      const cached = await this.cache.get<unknown[]>(cacheKey);
      if (cached) return cached;
    }

    const _warehousePart = opts.warehouseId ? Prisma.sql`AND sm_filter.warehouse_id = ${opts.warehouseId}` : Prisma.empty;
    const _productPart = opts.productId ? Prisma.sql`AND sm_filter.product_id = ${opts.productId}` : Prisma.empty;

    // Check if snapshot exists for this tenant
    const snapshotExists = await this.prisma.stockSnapshot.findFirst({
      where: { tenantId },
      select: { calculatedAt: true },
    });

    let grouped: { productId: string; warehouseId: string; stock: number }[];

    if (snapshotExists) {
      // T-075: Snapshot + recent movements (since last snapshot)
      const snapWhere = opts.warehouseId
        ? Prisma.sql`AND ss.warehouse_id = ${opts.warehouseId}`
        : Prisma.empty;
      const snapProduct = opts.productId
        ? Prisma.sql`AND ss.product_id = ${opts.productId}`
        : Prisma.empty;

      // T-138 FIX: UNION ALL — snapshot'da bo'lmagan yangi mahsulotlarni ham qo'shish
      grouped = await this.prisma.$queryRaw<{ productId: string; warehouseId: string; stock: number }[]>`
        -- Part 1: snapshot'dagi mahsulotlar + keyingi delta
        SELECT
          ss.product_id    AS "productId",
          ss.warehouse_id  AS "warehouseId",
          (ss.quantity + COALESCE(delta.qty, 0))::float AS stock
        FROM stock_snapshots ss
        LEFT JOIN (
          SELECT
            sm.product_id,
            sm.warehouse_id,
            SUM(
              CASE
                WHEN sm.type IN ('IN', 'RETURN_IN', 'TRANSFER_IN') THEN sm.quantity
                WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
                ELSE -sm.quantity
              END
            ) AS qty
          FROM stock_movements sm
          WHERE sm.tenant_id = ${tenantId}
            AND sm.created_at > ${snapshotExists.calculatedAt}
          GROUP BY sm.product_id, sm.warehouse_id
        ) delta ON delta.product_id = ss.product_id AND delta.warehouse_id = ss.warehouse_id
        WHERE ss.tenant_id = ${tenantId}
        ${snapWhere}
        ${snapProduct}

        UNION ALL

        -- Part 2 (T-138): snapshot'dan KEYIN qo'shilgan yangi mahsulotlar
        SELECT
          sm2.product_id   AS "productId",
          sm2.warehouse_id AS "warehouseId",
          SUM(
            CASE
              WHEN sm2.type IN ('IN', 'RETURN_IN', 'TRANSFER_IN') THEN sm2.quantity
              WHEN sm2.type = 'ADJUSTMENT' THEN sm2.quantity
              ELSE -sm2.quantity
            END
          )::float AS stock
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
      // Fallback: full history aggregate (snapshot hali yo'q)
      const warehousePartFull = opts.warehouseId ? Prisma.sql`AND warehouse_id = ${opts.warehouseId}` : Prisma.empty;
      const productPartFull = opts.productId ? Prisma.sql`AND product_id = ${opts.productId}` : Prisma.empty;

      grouped = await this.prisma.$queryRaw<{ productId: string; warehouseId: string; stock: number }[]>`
        SELECT
          product_id   AS "productId",
          warehouse_id AS "warehouseId",
          SUM(
            CASE
              WHEN type IN ('IN', 'RETURN_IN', 'TRANSFER_IN') THEN quantity
              WHEN type = 'ADJUSTMENT' THEN quantity
              ELSE -quantity
            END
          )::float AS stock
        FROM stock_movements
        WHERE tenant_id = ${tenantId}
        ${warehousePartFull}
        ${productPartFull}
        GROUP BY product_id, warehouse_id
      `;
    }

    // Enrich with product and warehouse names
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

  // ─── EXPIRY TRACKING (T-031) ─────────────────────────────────

  async getExpiringProducts(tenantId: string, days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    const rows = await this.prisma.$queryRaw<
      {
        productId: string;
        productName: string;
        warehouseId: string;
        warehouseName: string;
        batchNumber: string | null;
        expiryDate: Date;
        qty: number;
        daysLeft: number;
      }[]
    >`
      SELECT
        sm.product_id       AS "productId",
        p.name              AS "productName",
        sm.warehouse_id     AS "warehouseId",
        w.name              AS "warehouseName",
        sm.batch_number     AS "batchNumber",
        sm.expiry_date      AS "expiryDate",
        SUM(
          CASE
            WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
            WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
            ELSE -sm.quantity
          END
        )::float            AS qty,
        EXTRACT(DAY FROM sm.expiry_date - NOW())::int AS "daysLeft"
      FROM stock_movements sm
      JOIN products p  ON p.id  = sm.product_id
      JOIN warehouses w ON w.id = sm.warehouse_id
      WHERE sm.tenant_id   = ${tenantId}
        AND sm.expiry_date IS NOT NULL
        AND sm.expiry_date >= NOW()
        AND sm.expiry_date <= ${cutoff}
      GROUP BY sm.product_id, p.name, sm.warehouse_id, w.name, sm.batch_number, sm.expiry_date
      HAVING SUM(
        CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
          ELSE -sm.quantity
        END
      ) > 0
      ORDER BY sm.expiry_date ASC
    `;

    return rows;
  }

  async getExpiredProducts(tenantId: string) {
    const now = new Date();

    const rows = await this.prisma.$queryRaw<
      {
        productId: string;
        productName: string;
        batchNumber: string | null;
        expiryDate: Date;
        qty: number;
      }[]
    >`
      SELECT
        sm.product_id   AS "productId",
        p.name          AS "productName",
        sm.batch_number AS "batchNumber",
        sm.expiry_date  AS "expiryDate",
        SUM(
          CASE
            WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
            WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
            ELSE -sm.quantity
          END
        )::float AS qty
      FROM stock_movements sm
      JOIN products p ON p.id = sm.product_id
      WHERE sm.tenant_id   = ${tenantId}
        AND sm.expiry_date IS NOT NULL
        AND sm.expiry_date < ${now}
      GROUP BY sm.product_id, p.name, sm.batch_number, sm.expiry_date
      HAVING SUM(
        CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
          ELSE -sm.quantity
        END
      ) > 0
      ORDER BY sm.expiry_date ASC
    `;

    return rows;
  }

  // T-096: Tester/namuna harakatlari
  async getTesterMovements(tenantId: string, from?: string, to?: string) {
    const where: Record<string, unknown> = {
      tenantId,
      type: 'TESTER',
    };
    if (from || to) {
      where['createdAt'] = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        warehouse: { select: { id: true, name: true } },
      },
    });

    const totalCost = movements.reduce((sum, m) => {
      const cost = m.costPrice ? Number(m.costPrice) * Number(m.quantity) : 0;
      return sum + cost;
    }, 0);

    return {
      items: movements,
      totalCost,
      count: movements.length,
    };
  }

  async deductStock(tenantId: string, warehouseId: string, items: Array<{ productId: string; quantity: number }>, refId: string) {
    const movements = items.map((item) => ({
      tenantId,
      warehouseId,
      productId: item.productId,
      type: 'OUT' as const,
      quantity: item.quantity,
      refId,
      refType: 'ORDER',
    }));

    await this.prisma.stockMovement.createMany({ data: movements });

    this.logger.log(`Stock deducted for order ${refId}`, {
      tenantId,
      itemCount: items.length,
    });
  }

  // ─── T-222: OUT OF STOCK ──────────────────────────────────────
  async getOutOfStockItems(tenantId: string, branchId?: string) {
    const branchFilter = branchId
      ? Prisma.sql`AND w.branch_id = ${branchId}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<{
      id: string;
      productName: string;
      barcode: string | null;
      quantity: number;
      unit: string | null;
      branchName: string | null;
      branchId: string | null;
      costPrice: number;
      reorderLevel: number;
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
      SELECT
        p.id,
        p.name,
        p.barcode,
        SUM(CASE
          WHEN sm.type IN ('IN','RETURN_IN','TRANSFER_IN') THEN sm.quantity
          WHEN sm.type = 'ADJUSTMENT'                      THEN sm.quantity
          ELSE -sm.quantity
        END)::float,
        u.short_name,
        b.name,
        w.branch_id,
        p.cost_price::float,
        p.min_stock_level::float
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
        WHEN sm.type = 'ADJUSTMENT'                      THEN sm.quantity
        ELSE -sm.quantity
      END) <= 0
    `;

    return rows.map((r) => ({
      id: r.id,
      productName: r.productName,
      barcode: r.barcode,
      quantity: 0,
      unit: r.unit ?? 'dona',
      branchName: r.branchName,
      branchId: r.branchId,
      costPrice: r.costPrice,
      stockValue: 0,
      reorderLevel: r.reorderLevel,
      expiryDate: null,
      status: 'out_of_stock',
    }));
  }

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
