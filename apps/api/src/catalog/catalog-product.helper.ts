import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService, CACHE_TTL } from '../common/cache/cache.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  AddBundleComponentDto,
} from './dto';
import { Prisma } from '@prisma/client';
import { PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED } from '../events/domain-events';

@Injectable()
export class CatalogProductHelper {
  private readonly logger = new Logger(CatalogProductHelper.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── PRODUCTS ─────────────────────────────────────────────────

  async getProducts(tenantId: string, filter: ProductFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;
    const sort = filter.sort ?? 'createdAt';
    const order = filter.order ?? 'desc';

    const where: Prisma.ProductWhereInput = {
      tenantId,
      deletedAt: null,
      ...(filter.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter.categoryId && { categoryId: filter.categoryId }),
      ...(filter.minPrice !== undefined && {
        sellPrice: { gte: filter.minPrice },
      }),
      ...(filter.maxPrice !== undefined && {
        sellPrice: { lte: filter.maxPrice },
      }),
      ...(filter.search && {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { sku: { contains: filter.search, mode: 'insensitive' } },
          { barcode: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          category: { select: { id: true, name: true } },
          unit: { select: { id: true, name: true, shortName: true } },
          barcodes: true,
          _count: { select: { variants: true } },
        },
      }),
    ]);

    let stockMap = new Map<string, number>();
    if (items.length > 0) {
      const productIds = items.map((i) => i.id);
      const stockRaw = await this.prisma.$queryRaw<
        { productId: string; stock: string }[]
      >(
        Prisma.sql`
          SELECT product_id AS "productId",
            COALESCE(SUM(
              CASE
                WHEN type IN ('IN','RETURN_IN','TRANSFER_IN') THEN quantity
                WHEN type = 'ADJUSTMENT' THEN quantity
                ELSE -quantity
              END
            ), 0) AS stock
          FROM stock_movements
          WHERE tenant_id = ${tenantId}
            AND product_id IN (${Prisma.join(productIds)})
          GROUP BY product_id
        `,
      );
      stockMap = new Map(
        stockRaw.map((s) => [s.productId, Number(s.stock)]),
      );
    }

    const itemsWithStock = items.map((item) => ({
      ...item,
      currentStock: stockMap.get(item.id) ?? 0,
    }));

    return {
      items: itemsWithStock,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, shortName: true } },
        barcodes: true,
        productSuppliers: { where: { isDefault: true }, select: { supplierId: true }, take: 1 },
        _count: { select: { variants: true } },
      },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async getProductByBarcode(tenantId: string, barcode: string) {
    const cacheKey = CacheService.key.products(tenantId, `barcode:${barcode}`);
    const cached = await this.cache.get<unknown>(cacheKey);
    if (cached) return cached;

    const productInclude = {
      category: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true, shortName: true } },
      barcodes: true,
      _count: { select: { variants: true } },
    } as const;

    let product = await this.prisma.product.findFirst({
      where: { tenantId, barcode, deletedAt: null },
      include: productInclude,
    });

    if (!product) {
      const barEntry = await this.prisma.productBarcode.findFirst({
        where: { barcode, product: { tenantId, deletedAt: null } },
        include: { product: { include: productInclude } },
      });
      if (!barEntry) {
        throw new NotFoundException(`Product with barcode ${barcode} not found`);
      }
      product = barEntry.product;
    }

    const stockRaw = await this.prisma.$queryRaw<{ stock: string }[]>(
      Prisma.sql`
        SELECT COALESCE(SUM(
          CASE
            WHEN type IN ('IN','RETURN_IN','TRANSFER_IN') THEN quantity
            WHEN type = 'ADJUSTMENT' THEN quantity
            ELSE -quantity
          END
        ), 0) AS stock
        FROM stock_movements
        WHERE tenant_id = ${tenantId}
          AND product_id = ${product.id}
      `,
    );
    const currentStock = Number(stockRaw[0]?.stock ?? 0);

    const result = { ...product, currentStock };
    await this.cache.set(cacheKey, result, CACHE_TTL.PRODUCT_CATALOG);
    return result;
  }

  async createProduct(tenantId: string, dto: CreateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          tenantId,
          name: dto.name,
          sku: dto.sku || `PRD-${Date.now().toString(36).toUpperCase()}`,
          barcode: dto.barcode,
          categoryId: dto.categoryId,
          unitId: dto.unitId,
          costPrice: dto.costPrice,
          sellPrice: dto.sellPrice,
          minStockLevel: dto.minStockLevel ?? 0,
          isActive: dto.isActive ?? true,
          imageUrl: dto.imageUrl,
          description: dto.description,
          expiryTracking: dto.expiryTracking ?? false,
        },
      });

      if (dto.extraBarcodes?.length) {
        await tx.productBarcode.createMany({
          data: dto.extraBarcodes.map((b, i) => ({
            productId: product.id,
            barcode: b,
            isPrimary: i === 0 && !dto.barcode,
          })),
        });
      }

      if (dto.supplierId) {
        await tx.productSupplier.create({
          data: {
            productId: product.id,
            supplierId: dto.supplierId,
            supplyPrice: dto.costPrice ?? 0,
            isDefault: true,
          },
        });
      }

      if (dto.initialStock && dto.initialStock > 0) {
        let warehouse = await tx.warehouse.findFirst({
          where: { tenantId, isActive: true },
          orderBy: { createdAt: 'asc' },
        });
        if (!warehouse) {
          warehouse = await tx.warehouse.create({
            data: { tenantId, name: 'Asosiy ombor', isActive: true },
          });
          this.logger.log(`Default warehouse created for tenant ${tenantId}`);
        }
        await tx.stockMovement.create({
          data: {
            tenantId,
            warehouseId: warehouse.id,
            productId: product.id,
            type: 'IN',
            quantity: dto.initialStock,
            costPrice: dto.costPrice ?? 0,
            note: 'Initial stock on product creation',
          },
        });
        this.logger.log(
          `Initial stock ${dto.initialStock} created for product ${product.id}`,
          { tenantId },
        );
      }

      this.logger.log(`Product created: ${product.id}`, {
        tenantId,
        productId: product.id,
      });
      await this.cache.invalidatePattern(CacheService.key.products(tenantId, '*'));
      await this.cache.invalidatePattern(CacheService.key.stockLevels(tenantId, '*'));

      this.eventEmitter.emit(PRODUCT_CREATED, {
        tenantId,
        productId: product.id,
        product: {
          name: product.name,
          sku: product.sku,
          sellPrice: Number(product.sellPrice),
          description: product.description,
          imageUrl: product.imageUrl,
        },
      });

      return product;
    });
  }

  async updateProduct(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.getProductById(tenantId, id);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.sku !== undefined && { sku: dto.sku }),
          ...(dto.barcode !== undefined && { barcode: dto.barcode }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.unitId !== undefined && { unitId: dto.unitId }),
          ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
          ...(dto.sellPrice !== undefined && { sellPrice: dto.sellPrice }),
          ...(dto.minStockLevel !== undefined && { minStockLevel: dto.minStockLevel }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.expiryTracking !== undefined && { expiryTracking: dto.expiryTracking }),
        },
        include: {
          category: { select: { id: true, name: true } },
          unit: { select: { id: true, name: true, shortName: true } },
          barcodes: true,
          productSuppliers: { where: { isDefault: true }, select: { supplierId: true }, take: 1 },
        },
      });

      if (dto.supplierId !== undefined) {
        await tx.productSupplier.updateMany({
          where: { productId: id, isDefault: true },
          data: { isDefault: false },
        });
        if (dto.supplierId) {
          await tx.productSupplier.upsert({
            where: { productId_supplierId: { productId: id, supplierId: dto.supplierId } },
            create: {
              productId: id,
              supplierId: dto.supplierId,
              supplyPrice: dto.costPrice ?? updated.costPrice ?? 0,
              isDefault: true,
            },
            update: {
              isDefault: true,
              supplyPrice: dto.costPrice ?? updated.costPrice ?? 0,
            },
          });
        }
      }

      this.logger.log(`Product updated: ${id}`, { tenantId, productId: id });
      await this.cache.invalidatePattern(CacheService.key.products(tenantId, '*'));

      this.eventEmitter.emit(PRODUCT_UPDATED, {
        tenantId,
        productId: id,
        changes: dto,
      });

      return updated;
    });
  }

  async deleteProduct(tenantId: string, id: string) {
    await this.getProductById(tenantId, id);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    this.logger.log(`Product soft-deleted: ${id}`, { tenantId });
    await this.cache.invalidatePattern(CacheService.key.products(tenantId, '*'));

    this.eventEmitter.emit(PRODUCT_DELETED, {
      tenantId,
      productId: id,
    });

    return { success: true };
  }

  // ─── BUNDLES ──────────────────────────────────────────────────

  async getBundleComponents(tenantId: string, bundleId: string) {
    await this.getProductById(tenantId, bundleId);
    return this.prisma.bundleItem.findMany({
      where: { bundleId },
      include: {
        component: {
          select: {
            id: true,
            name: true,
            sku: true,
            barcode: true,
            sellPrice: true,
            costPrice: true,
            isActive: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async addBundleComponent(
    tenantId: string,
    bundleId: string,
    dto: AddBundleComponentDto,
  ) {
    const bundle = await this.getProductById(tenantId, bundleId);
    if (!bundle.isBundle) {
      await this.prisma.product.update({
        where: { id: bundleId },
        data: { isBundle: true },
      });
    }

    if (dto.componentId === bundleId) {
      throw new ConflictException("Mahsulot o'ziga komponent bo'la olmaydi");
    }

    await this.getProductById(tenantId, dto.componentId);

    return this.prisma.bundleItem.upsert({
      where: { bundleId_componentId: { bundleId, componentId: dto.componentId } },
      create: { bundleId, componentId: dto.componentId, quantity: dto.quantity },
      update: { quantity: dto.quantity },
    });
  }

  async removeBundleComponent(
    tenantId: string,
    bundleId: string,
    componentId: string,
  ) {
    await this.getProductById(tenantId, bundleId);
    const item = await this.prisma.bundleItem.findUnique({
      where: { bundleId_componentId: { bundleId, componentId } },
    });
    if (!item) {
      throw new NotFoundException(
        `Component ${componentId} not in bundle ${bundleId}`,
      );
    }

    await this.prisma.bundleItem.delete({
      where: { bundleId_componentId: { bundleId, componentId } },
    });

    const remaining = await this.prisma.bundleItem.count({ where: { bundleId } });
    if (remaining === 0) {
      await this.prisma.product.update({
        where: { id: bundleId },
        data: { isBundle: false },
      });
    }

    return { success: true };
  }

}
