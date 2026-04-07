import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService, CACHE_TTL } from '../common/cache/cache.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateUnitDto,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  CreateSupplierDto,
  UpdateSupplierDto,
  LinkProductSupplierDto,
  AddBundleComponentDto,
  CreateVariantDto,
  UpdateVariantDto,
  CreateProductPriceDto,
  UpdateProductPriceDto,
  CreateCertificateDto,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  // ─── CATEGORIES ───────────────────────────────────────────────

  async getCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        children: {
          where: { deletedAt: null },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }

  async createCategory(tenantId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        tenantId,
        name: dto.name,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateCategory(
    tenantId: string,
    id: string,
    dto: UpdateCategoryDto,
  ) {
    await this.findCategoryOrFail(tenantId, id);
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deleteCategory(tenantId: string, id: string) {
    await this.findCategoryOrFail(tenantId, id);
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  private async findCategoryOrFail(tenantId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return cat;
  }

  // ─── UNITS ────────────────────────────────────────────────────

  async getUnits(tenantId: string) {
    return this.prisma.unit.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async createUnit(tenantId: string, dto: CreateUnitDto) {
    return this.prisma.unit.create({
      data: { tenantId, name: dto.name, shortName: dto.shortName },
    });
  }

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
        },
      }),
    ]);

    // Add currentStock by aggregating StockMovements for returned products
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
      },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async getProductByBarcode(tenantId: string, barcode: string) {
    // Cache lookup (barcode scan — tez bo'lishi kerak)
    const cacheKey = CacheService.key.products(tenantId, `barcode:${barcode}`);
    const cached = await this.cache.get<unknown>(cacheKey);
    if (cached) return cached;

    // Check primary barcode first
    const byMain = await this.prisma.product.findFirst({
      where: { tenantId, barcode, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, shortName: true } },
        barcodes: true,
      },
    });
    if (byMain) {
      await this.cache.set(cacheKey, byMain, CACHE_TTL.PRODUCT_CATALOG);
      return byMain;
    }

    // Then check product_barcodes table
    const barEntry = await this.prisma.productBarcode.findFirst({
      where: { barcode, product: { tenantId, deletedAt: null } },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true } },
            unit: { select: { id: true, name: true, shortName: true } },
            barcodes: true,
          },
        },
      },
    });
    if (!barEntry)
      throw new NotFoundException(`Product with barcode ${barcode} not found`);

    await this.cache.set(cacheKey, barEntry.product, CACHE_TTL.PRODUCT_CATALOG);
    return barEntry.product;
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

      this.logger.log(`Product created: ${product.id}`, {
        tenantId,
        productId: product.id,
      });
      // Cache invalidate — yangi mahsulot qo'shilganda
      await this.cache.invalidatePattern(CacheService.key.products(tenantId, '*'));
      return product;
    });
  }

  async updateProduct(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.getProductById(tenantId, id);
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.barcode !== undefined && { barcode: dto.barcode }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.unitId !== undefined && { unitId: dto.unitId }),
        ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
        ...(dto.sellPrice !== undefined && { sellPrice: dto.sellPrice }),
        ...(dto.minStockLevel !== undefined && {
          minStockLevel: dto.minStockLevel,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.expiryTracking !== undefined && {
          expiryTracking: dto.expiryTracking,
        }),
      },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, shortName: true } },
        barcodes: true,
      },
    });
    this.logger.log(`Product updated: ${id}`, { tenantId, productId: id });
    // Cache invalidate — barcode va list cachelarni tozalash
    await this.cache.invalidatePattern(CacheService.key.products(tenantId, '*'));
    return updated;
  }

  async deleteProduct(tenantId: string, id: string) {
    await this.getProductById(tenantId, id);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    this.logger.log(`Product soft-deleted: ${id}`, { tenantId });
    await this.cache.invalidatePattern(CacheService.key.products(tenantId, '*'));
    return { success: true };
  }

  // ─── SUPPLIERS ────────────────────────────────────────────────

  async getSuppliers(tenantId: string, isActive: boolean = true) {
    return this.prisma.supplier.findMany({
      where: {
        tenantId,
        isActive,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getSupplierById(tenantId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
      include: {
        productSuppliers: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                barcode: true,
                sellPrice: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }

  async createSupplier(tenantId: string, dto: CreateSupplierDto) {
    const supplier = await this.prisma.supplier.create({
      data: {
        tenantId,
        name: dto.name,
        phone: dto.phone,
        company: dto.company,
        address: dto.address,
      },
    });
    this.logger.log(`Supplier created: ${supplier.id}`, { tenantId });
    return supplier;
  }

  async updateSupplier(tenantId: string, id: string, dto: UpdateSupplierDto) {
    await this.findSupplierOrFail(tenantId, id);
    const updated = await this.prisma.supplier.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.company !== undefined && { company: dto.company }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    this.logger.log(`Supplier updated: ${id}`, { tenantId });
    return updated;
  }

  async deactivateSupplier(tenantId: string, id: string) {
    await this.findSupplierOrFail(tenantId, id);
    await this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
    this.logger.log(`Supplier deactivated: ${id}`, { tenantId });
    return { success: true };
  }

  async linkProductToSupplier(
    tenantId: string,
    supplierId: string,
    dto: LinkProductSupplierDto,
  ) {
    await this.findSupplierOrFail(tenantId, supplierId);
    await this.getProductById(tenantId, dto.productId);

    if (dto.isDefault) {
      // Boshqa default ni tozalash
      await this.prisma.productSupplier.updateMany({
        where: { productId: dto.productId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const link = await this.prisma.productSupplier.upsert({
      where: {
        productId_supplierId: {
          productId: dto.productId,
          supplierId,
        },
      },
      create: {
        productId: dto.productId,
        supplierId,
        supplyPrice: dto.supplyPrice,
        isDefault: dto.isDefault ?? false,
      },
      update: {
        supplyPrice: dto.supplyPrice,
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
    this.logger.log(
      `Product ${dto.productId} linked to supplier ${supplierId}`,
      { tenantId },
    );
    return link;
  }

  async unlinkProductFromSupplier(
    tenantId: string,
    supplierId: string,
    productId: string,
  ) {
    await this.findSupplierOrFail(tenantId, supplierId);
    const link = await this.prisma.productSupplier.findUnique({
      where: { productId_supplierId: { productId, supplierId } },
    });
    if (!link)
      throw new NotFoundException(
        `Product ${productId} is not linked to supplier ${supplierId}`,
      );
    await this.prisma.productSupplier.delete({
      where: { productId_supplierId: { productId, supplierId } },
    });
    return { success: true };
  }

  private async findSupplierOrFail(tenantId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
    });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }

  // ─── BUNDLES (T-045) ──────────────────────────────────────────

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
      // Auto-mark as bundle on first component add
      await this.prisma.product.update({
        where: { id: bundleId },
        data: { isBundle: true },
      });
    }

    if (dto.componentId === bundleId) {
      throw new ConflictException('Mahsulot o\'ziga komponent bo\'la olmaydi');
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
    if (!item)
      throw new NotFoundException(
        `Component ${componentId} not in bundle ${bundleId}`,
      );

    await this.prisma.bundleItem.delete({
      where: { bundleId_componentId: { bundleId, componentId } },
    });

    // Agar komponentlar qolmasa — isBundle=false
    const remaining = await this.prisma.bundleItem.count({ where: { bundleId } });
    if (remaining === 0) {
      await this.prisma.product.update({
        where: { id: bundleId },
        data: { isBundle: false },
      });
    }

    return { success: true };
  }

  // ─── PRODUCT VARIANTS (T-095) ─────────────────────────────────

  async getVariants(tenantId: string, productId: string) {
    await this.getProductById(tenantId, productId);
    return this.prisma.productVariant.findMany({
      where: { productId, tenantId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createVariant(tenantId: string, productId: string, dto: CreateVariantDto) {
    await this.getProductById(tenantId, productId);
    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        tenantId,
        name: dto.name,
        sku: dto.sku,
        barcode: dto.barcode,
        costPrice: dto.costPrice ?? 0,
        costCurrency: dto.costCurrency ?? 'UZS',
        sellPrice: dto.sellPrice ?? 0,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    this.logger.log(`Variant created: ${variant.id}`, { tenantId, productId });
    return variant;
  }

  async updateVariant(tenantId: string, productId: string, variantId: string, dto: UpdateVariantDto) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId, tenantId },
    });
    if (!variant) throw new NotFoundException(`Variant ${variantId} not found`);

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.barcode !== undefined && { barcode: dto.barcode }),
        ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
        ...(dto.costCurrency !== undefined && { costCurrency: dto.costCurrency }),
        ...(dto.sellPrice !== undefined && { sellPrice: dto.sellPrice }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
    this.logger.log(`Variant updated: ${variantId}`, { tenantId, productId });
    return updated;
  }

  async deleteVariant(tenantId: string, productId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId, tenantId },
    });
    if (!variant) throw new NotFoundException(`Variant ${variantId} not found`);

    await this.prisma.productVariant.delete({ where: { id: variantId } });
    this.logger.log(`Variant deleted: ${variantId}`, { tenantId, productId });
    return { success: true };
  }

  // ─── PRICE MANAGEMENT (T-098) ────────────────────────────────

  async getProductPrices(tenantId: string, productId: string) {
    await this.getProductById(tenantId, productId);
    return this.prisma.productPrice.findMany({
      where: { productId, tenantId },
      orderBy: [{ priceType: 'asc' }, { minQty: 'asc' }],
    });
  }

  async createProductPrice(tenantId: string, productId: string, dto: CreateProductPriceDto) {
    await this.getProductById(tenantId, productId);
    const price = await this.prisma.productPrice.create({
      data: {
        tenantId,
        productId,
        priceType: dto.priceType,
        minQty: dto.minQty ?? 1,
        price: dto.price,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
        isActive: dto.isActive ?? true,
        note: dto.note,
      },
    });
    this.logger.log(`Price created: ${price.id} for product ${productId}`, { tenantId });
    return price;
  }

  async updateProductPrice(tenantId: string, productId: string, priceId: string, dto: UpdateProductPriceDto) {
    const price = await this.prisma.productPrice.findFirst({
      where: { id: priceId, productId, tenantId },
    });
    if (!price) throw new NotFoundException(`Price ${priceId} not found`);

    const updated = await this.prisma.productPrice.update({
      where: { id: priceId },
      data: {
        ...(dto.priceType !== undefined && { priceType: dto.priceType }),
        ...(dto.minQty !== undefined && { minQty: dto.minQty }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.validFrom !== undefined && { validFrom: dto.validFrom ? new Date(dto.validFrom) : null }),
        ...(dto.validTo !== undefined && { validTo: dto.validTo ? new Date(dto.validTo) : null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.note !== undefined && { note: dto.note }),
      },
    });
    this.logger.log(`Price updated: ${priceId}`, { tenantId, productId });
    return updated;
  }

  async deleteProductPrice(tenantId: string, productId: string, priceId: string) {
    const price = await this.prisma.productPrice.findFirst({
      where: { id: priceId, productId, tenantId },
    });
    if (!price) throw new NotFoundException(`Price ${priceId} not found`);
    await this.prisma.productPrice.delete({ where: { id: priceId } });
    return { success: true };
  }

  // T-098: Berilgan qty va priceType ga mos narxni topish
  // POS da: customer.priceType + cart item qty → resolved price
  async resolvePrice(
    tenantId: string,
    productId: string,
    priceType: string,
    qty: number,
  ): Promise<{ price: number; priceType: string; minQty: number } | null> {
    const now = new Date();
    const prices = await this.prisma.productPrice.findMany({
      where: {
        tenantId,
        productId,
        priceType: priceType as 'RETAIL' | 'WHOLESALE' | 'VIP',
        isActive: true,
        minQty: { lte: qty },
        OR: [{ validFrom: null }, { validFrom: { lte: now } }],
        AND: [{ OR: [{ validTo: null }, { validTo: { gte: now } }] }],
      },
      orderBy: { minQty: 'desc' },
      take: 1,
    });

    if (!prices.length) return null;
    const p = prices[0];
    return { price: Number(p.price), priceType: p.priceType, minQty: p.minQty };
  }

  // ─── T-097: Product Certificates ──────────────────────────────

  async getCertificates(tenantId: string, productId: string) {
    await this.findProductOrThrow(tenantId, productId);
    return this.prisma.productCertificate.findMany({
      where: { tenantId, productId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async createCertificate(tenantId: string, productId: string, dto: CreateCertificateDto) {
    await this.findProductOrThrow(tenantId, productId);
    return this.prisma.productCertificate.create({
      data: {
        tenantId,
        productId,
        certNumber: dto.certNumber,
        issuingAuthority: dto.issuingAuthority,
        issuedAt: new Date(dto.issuedAt),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        fileUrl: dto.fileUrl,
      },
    });
  }

  async deleteCertificate(tenantId: string, productId: string, certId: string) {
    const cert = await this.prisma.productCertificate.findFirst({
      where: { id: certId, tenantId, productId },
    });
    if (!cert) throw new NotFoundException('Sertifikat topilmadi');
    await this.prisma.productCertificate.delete({ where: { id: certId } });
    return { success: true };
  }

  async getExpiringCertificates(tenantId: string, days = 30) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);
    return this.prisma.productCertificate.findMany({
      where: {
        tenantId,
        expiresAt: { not: null, lte: threshold },
      },
      include: { product: { select: { id: true, name: true, sku: true } } },
      orderBy: { expiresAt: 'asc' },
    });
  }

  private async findProductOrThrow(tenantId: string, productId: string) {
    const p = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!p) throw new NotFoundException('Mahsulot topilmadi');
    return p;
  }
}
