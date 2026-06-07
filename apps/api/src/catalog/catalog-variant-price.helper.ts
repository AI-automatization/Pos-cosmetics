import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateVariantDto,
  UpdateVariantDto,
  BulkCreateVariantsDto,
  GenerateVariantMatrixDto,
  CreateProductPriceDto,
  UpdateProductPriceDto,
  CreateCertificateDto,
} from './dto';

@Injectable()
export class CatalogVariantPriceHelper {
  private readonly logger = new Logger(CatalogVariantPriceHelper.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── VARIANTS ─────────────────────────────────────────────────

  async getVariants(tenantId: string, productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId, tenantId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createVariant(
    tenantId: string,
    productId: string,
    dto: CreateVariantDto,
  ) {
    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        tenantId,
        name: dto.name,
        sku: dto.sku,
        barcode: dto.barcode,
        attributes: dto.attributes ?? {},
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

  async updateVariant(
    tenantId: string,
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ) {
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
        ...(dto.attributes !== undefined && { attributes: dto.attributes }),
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

  async bulkCreateVariants(
    tenantId: string,
    productId: string,
    dto: BulkCreateVariantsDto,
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    const variants = await this.prisma.$transaction(
      dto.variants.map((v, i) =>
        this.prisma.productVariant.create({
          data: {
            productId,
            tenantId,
            name: v.name,
            sku: v.sku,
            barcode: v.barcode,
            attributes: v.attributes ?? {},
            costPrice: v.costPrice ?? 0,
            costCurrency: v.costCurrency ?? 'UZS',
            sellPrice: v.sellPrice ?? 0,
            isActive: v.isActive ?? true,
            sortOrder: v.sortOrder ?? i,
          },
        }),
      ),
    );
    this.logger.log(`Bulk created ${variants.length} variants`, { tenantId, productId });
    return variants;
  }

  async generateMatrix(
    tenantId: string,
    productId: string,
    dto: GenerateVariantMatrixDto,
  ) {
    const attrKeys = Object.keys(dto.attributes);
    if (attrKeys.length === 0) {
      throw new BadRequestException('At least one attribute is required');
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { sku: true, costPrice: true, sellPrice: true },
    });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    const combinations = this.cartesianProduct(
      attrKeys.map((k) => dto.attributes[k].map((v) => ({ key: k, value: v }))),
    );

    const MAX_COMBINATIONS = 100;
    if (combinations.length > MAX_COMBINATIONS) {
      throw new BadRequestException(
        `Too many combinations: ${combinations.length}. Maximum ${MAX_COMBINATIONS}`,
      );
    }

    const costPrice = dto.costPrice ?? Number(product.costPrice);
    const sellPrice = dto.sellPrice ?? Number(product.sellPrice);
    const baseSku = product.sku ?? 'VAR';

    const variants = await this.prisma.$transaction(
      combinations.map((combo, i) => {
        const attrs: Record<string, string> = {};
        const nameParts: string[] = [];
        const skuParts: string[] = [baseSku];

        for (const { key, value } of combo) {
          attrs[key] = value;
          nameParts.push(value);
          skuParts.push(value.toUpperCase().replace(/\s+/g, ''));
        }

        return this.prisma.productVariant.create({
          data: {
            productId,
            tenantId,
            name: nameParts.join(' / '),
            sku: skuParts.join('-'),
            attributes: attrs,
            costPrice,
            sellPrice,
            sortOrder: i,
          },
        });
      }),
    );

    this.logger.log(
      `Generated ${variants.length} variant combinations`,
      { tenantId, productId, attributes: attrKeys },
    );
    return variants;
  }

  private cartesianProduct<T>(arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>(
      (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
      [[]],
    );
  }

  // ─── PRICE MANAGEMENT ─────────────────────────────────────────

  async getProductPrices(tenantId: string, productId: string) {
    return this.prisma.productPrice.findMany({
      where: { productId, tenantId },
      orderBy: [{ priceType: 'asc' }, { minQty: 'asc' }],
    });
  }

  async createProductPrice(
    tenantId: string,
    productId: string,
    dto: CreateProductPriceDto,
  ) {
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
    this.logger.log(
      `Price created: ${price.id} for product ${productId}`,
      { tenantId },
    );
    return price;
  }

  async updateProductPrice(
    tenantId: string,
    productId: string,
    priceId: string,
    dto: UpdateProductPriceDto,
  ) {
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
        ...(dto.validFrom !== undefined && {
          validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        }),
        ...(dto.validTo !== undefined && {
          validTo: dto.validTo ? new Date(dto.validTo) : null,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.note !== undefined && { note: dto.note }),
      },
    });
    this.logger.log(`Price updated: ${priceId}`, { tenantId, productId });
    return updated;
  }

  async deleteProductPrice(
    tenantId: string,
    productId: string,
    priceId: string,
  ) {
    const price = await this.prisma.productPrice.findFirst({
      where: { id: priceId, productId, tenantId },
    });
    if (!price) throw new NotFoundException(`Price ${priceId} not found`);
    await this.prisma.productPrice.delete({ where: { id: priceId } });
    return { success: true };
  }

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

  // ─── CERTIFICATES ─────────────────────────────────────────────

  async getCertificates(tenantId: string, productId: string) {
    return this.prisma.productCertificate.findMany({
      where: { tenantId, productId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async createCertificate(
    tenantId: string,
    productId: string,
    dto: CreateCertificateDto,
  ) {
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

  async deleteCertificate(
    tenantId: string,
    productId: string,
    certId: string,
  ) {
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
}
