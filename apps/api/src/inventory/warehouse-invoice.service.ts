import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';
import { WriteOffReason } from '@prisma/client';
import {
  IsString, IsOptional, IsArray, IsNumber, Min, IsInt, IsPositive,
  ValidateNested, IsDateString, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export class InvoiceItemDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  quantity!: number;

  @ApiProperty({ example: 25000, description: 'Sotib olish narxi (UZS)' })
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ example: 'BATCH-001' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ example: '2027-01-01' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class CreateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'INV-2026-001' })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];
}

export class WriteOffItemDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  qty!: number;
}

export class WriteOffDto {
  @ApiProperty({ enum: WriteOffReason })
  @IsEnum(WriteOffReason)
  reason!: WriteOffReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiProperty({ type: [WriteOffItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WriteOffItemDto)
  items!: WriteOffItemDto[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class WarehouseInvoiceService {
  private readonly logger = new Logger(WarehouseInvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  // ─── POST /warehouse/invoices ─────────────────────────────────────────────

  async createInvoice(tenantId: string, userId: string, dto: CreateInvoiceDto) {
    if (dto.items.length === 0) throw new BadRequestException('items bo\'sh bo\'lishi mumkin emas');

    const warehouseId = await this.resolveWarehouseId(tenantId, dto.items[0]?.warehouseId);

    const totalCost = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.purchasePrice,
      0,
    );

    // Snapshot: invoice + items + stock movements — all in one transaction
    const invoice = await this.prisma.$transaction(async (tx) => {
      const inv = await tx.warehouseInvoice.create({
        data: {
          tenantId,
          branchId: dto.branchId ?? null,
          supplierId: dto.supplierId ?? null,
          invoiceNumber: dto.invoiceNumber ?? null,
          note: dto.note ?? null,
          totalCost,
          createdBy: userId,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              purchasePrice: item.purchasePrice,
              totalCost: item.quantity * item.purchasePrice,
              warehouseId: item.warehouseId ?? warehouseId,
              batchNumber: item.batchNumber ?? null,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
            })),
          },
        },
        include: { items: true },
      });

      // Create stock movements for each item
      await Promise.all(
        dto.items.map((item) =>
          tx.stockMovement.create({
            data: {
              tenantId,
              warehouseId: item.warehouseId ?? warehouseId,
              productId: item.productId,
              userId,
              type: 'IN',
              quantity: item.quantity,
              costPrice: item.purchasePrice,
              refType: 'INVOICE',
              refId: inv.id,
              note: dto.invoiceNumber ? `Nakladnoy: ${dto.invoiceNumber}` : 'Warehouse invoice',
              batchNumber: item.batchNumber ?? null,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
            },
          }),
        ),
      );

      return inv;
    });

    await this.cache.invalidatePattern(CacheService.key.stockLevels(tenantId, '*'));
    this.logger.log(`[Invoice] Created ${invoice.id}, ${dto.items.length} items, totalCost=${totalCost}`, { tenantId });

    return invoice;
  }

  // ─── GET /warehouse/invoices ──────────────────────────────────────────────

  async listInvoices(
    tenantId: string,
    opts: { from?: string; to?: string; supplierId?: string; page?: number; limit?: number },
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(opts.supplierId && { supplierId: opts.supplierId }),
      ...((opts.from || opts.to) && {
        createdAt: {
          ...(opts.from && { gte: new Date(opts.from) }),
          ...(opts.to && { lte: new Date(opts.to) }),
        },
      }),
    };

    const [total, invoices] = await Promise.all([
      this.prisma.warehouseInvoice.count({ where }),
      this.prisma.warehouseInvoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { items: { select: { productId: true, quantity: true, totalCost: true } } },
      }),
    ]);

    return { invoices, total, page, limit };
  }

  // ─── GET /warehouse/invoices/:id ──────────────────────────────────────────

  async getInvoice(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.warehouseInvoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        items: {
          include: {
            invoice: false,
          },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Nakladnoy topilmadi');
    return invoice;
  }

  // ─── POST /inventory/write-off ────────────────────────────────────────────

  async writeOff(tenantId: string, userId: string, dto: WriteOffDto) {
    if (dto.items.length === 0) throw new BadRequestException('items bo\'sh bo\'lishi mumkin emas');

    const warehouseId = await this.resolveWarehouseId(tenantId, dto.warehouseId);

    const movements = await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.stockMovement.create({
          data: {
            tenantId,
            warehouseId,
            productId: item.productId,
            userId,
            type: 'WRITE_OFF',
            quantity: item.qty,
            refType: 'WRITE_OFF',
            note: `${dto.reason}${dto.note ? ': ' + dto.note : ''}`,
          },
        }),
      ),
    );

    await this.cache.invalidatePattern(CacheService.key.stockLevels(tenantId, '*'));
    this.logger.log(`[WriteOff] ${movements.length} items, reason=${dto.reason}`, { tenantId });

    return { created: movements.length, reason: dto.reason, movements };
  }

  // ─── T-319/T-320: WAREHOUSE DASHBOARD ───────────────────────────────────────

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
        select: { productId: true, expiryDate: true, batchNumber: true, quantity: true },
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
      select: { productId: true, expiryDate: true, batchNumber: true },
      distinct: ['productId'],
      take: 20,
    });

    const soonExpiring = await this.prisma.stockMovement.findMany({
      where: { tenantId, expiryDate: { gte: today, lte: in7Days } },
      select: { productId: true, expiryDate: true, batchNumber: true },
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
      const created = await this.prisma.warehouse.create({
        data: { tenantId, name: 'Asosiy Ombor' },
      });
      return created.id;
    }
    return first.id;
  }
}
