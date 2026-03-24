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
