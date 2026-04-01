import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';
import {
  CreateStockMovementDto,
  CreateWarehouseDto,
  StockFilterDto,
  BatchStockInDto,
  BatchStockOutDto,
} from './dto/stock-movement.dto';
import { StockLevelService } from './stock-level.service';
import { ExpiryTrackingService } from './expiry-tracking.service';
import { StockValueService } from './stock-value.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly stockLevel: StockLevelService,
    private readonly expiryTracking: ExpiryTrackingService,
    private readonly stockValue: StockValueService,
  ) {}

  // ─── Warehouses ──────────────────────────────────────────────────────────────

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

  // ─── Stock Movements ─────────────────────────────────────────────────────────

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
    await this.cache.invalidatePattern(CacheService.key.stockLevels(tenantId, '*'));
    return movement;
  }

  // ─── Batch Stock-In (Process 5 — Goods Receipt) ──────────────────────────────

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

  // ─── Batch Stock-Out / Write-Off (Process 11) ────────────────────────────────

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

  async deductStock(
    tenantId: string,
    warehouseId: string,
    items: Array<{ productId: string; quantity: number }>,
    refId: string,
  ) {
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

  // ─── Facade delegates ────────────────────────────────────────────────────────

  getStockMovements(tenantId: string, filter: StockFilterDto) {
    return this.stockLevel.getStockMovements(tenantId, filter);
  }

  getStockLevels(tenantId: string, opts: { warehouseId?: string; productId?: string; lowStock?: boolean }) {
    return this.stockLevel.getStockLevels(tenantId, opts);
  }

  getOutOfStockItems(tenantId: string, branchId?: string) {
    return this.stockLevel.getOutOfStockItems(tenantId, branchId);
  }

  getExpiringProducts(tenantId: string, days: number) {
    return this.expiryTracking.getExpiringProducts(tenantId, days);
  }

  getExpiredProducts(tenantId: string) {
    return this.expiryTracking.getExpiredProducts(tenantId);
  }

  getTesterMovements(tenantId: string, from?: string, to?: string) {
    return this.expiryTracking.getTesterMovements(tenantId, from, to);
  }

  getStockValue(tenantId: string, branchId?: string) {
    return this.stockValue.getStockValue(tenantId, branchId);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

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
