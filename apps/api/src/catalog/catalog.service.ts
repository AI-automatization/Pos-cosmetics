import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';
import { AuditService } from '../audit/audit.service';
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
import { CatalogCategoryHelper } from './catalog-category.helper';
import { CatalogProductHelper } from './catalog-product.helper';
import { CatalogSupplierHelper } from './catalog-supplier.helper';
import { CatalogVariantPriceHelper } from './catalog-variant-price.helper';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly auditService: AuditService,
    private readonly categoryHelper: CatalogCategoryHelper,
    private readonly productHelper: CatalogProductHelper,
    private readonly supplierHelper: CatalogSupplierHelper,
    private readonly variantPriceHelper: CatalogVariantPriceHelper,
  ) {}

  // ─── CATEGORIES ───────────────────────────────────────────────

  getCategories(tenantId: string) {
    return this.categoryHelper.getCategories(tenantId);
  }

  createCategory(tenantId: string, dto: CreateCategoryDto) {
    return this.categoryHelper.createCategory(tenantId, dto);
  }

  updateCategory(tenantId: string, id: string, dto: UpdateCategoryDto) {
    return this.categoryHelper.updateCategory(tenantId, id, dto);
  }

  deleteCategory(tenantId: string, id: string) {
    return this.categoryHelper.deleteCategory(tenantId, id);
  }

  // ─── UNITS ────────────────────────────────────────────────────

  getUnits(tenantId: string) {
    return this.categoryHelper.getUnits(tenantId);
  }

  createUnit(tenantId: string, dto: CreateUnitDto) {
    return this.categoryHelper.createUnit(tenantId, dto);
  }

  // ─── PRODUCTS ─────────────────────────────────────────────────

  getProducts(tenantId: string, filter: ProductFilterDto) {
    return this.productHelper.getProducts(tenantId, filter);
  }

  getProductById(tenantId: string, id: string) {
    return this.productHelper.getProductById(tenantId, id);
  }

  getProductByBarcode(tenantId: string, barcode: string) {
    return this.productHelper.getProductByBarcode(tenantId, barcode);
  }

  async createProduct(tenantId: string, dto: CreateProductDto) {
    const product = await this.productHelper.createProduct(tenantId, dto);
    void this.auditService.log({
      tenantId,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product.id,
      newData: { name: dto.name, sku: dto.sku },
    });
    return product;
  }

  async updateProduct(tenantId: string, id: string, dto: UpdateProductDto) {
    const product = await this.productHelper.updateProduct(tenantId, id, dto);
    void this.auditService.log({
      tenantId,
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: id,
      newData: dto as Record<string, unknown>,
    });
    return product;
  }

  async deleteProduct(tenantId: string, id: string) {
    const result = await this.productHelper.deleteProduct(tenantId, id);
    void this.auditService.log({
      tenantId,
      action: 'PRODUCT_DELETED',
      entityType: 'Product',
      entityId: id,
    });
    return result;
  }

  // ─── SUPPLIERS ────────────────────────────────────────────────

  getSuppliers(tenantId: string, isActive?: boolean) {
    return this.supplierHelper.getSuppliers(tenantId, isActive);
  }

  getSupplierById(tenantId: string, id: string) {
    return this.supplierHelper.getSupplierById(tenantId, id);
  }

  createSupplier(tenantId: string, dto: CreateSupplierDto) {
    return this.supplierHelper.createSupplier(tenantId, dto);
  }

  updateSupplier(tenantId: string, id: string, dto: UpdateSupplierDto) {
    return this.supplierHelper.updateSupplier(tenantId, id, dto);
  }

  deactivateSupplier(tenantId: string, id: string) {
    return this.supplierHelper.deactivateSupplier(tenantId, id);
  }

  linkProductToSupplier(
    tenantId: string,
    supplierId: string,
    dto: LinkProductSupplierDto,
  ) {
    return this.supplierHelper.linkProductToSupplier(
      tenantId,
      supplierId,
      dto,
      (tid, id) => this.productHelper.getProductById(tid, id),
    );
  }

  unlinkProductFromSupplier(
    tenantId: string,
    supplierId: string,
    productId: string,
  ) {
    return this.supplierHelper.unlinkProductFromSupplier(
      tenantId,
      supplierId,
      productId,
    );
  }

  // ─── BUNDLES ──────────────────────────────────────────────────

  getBundleComponents(tenantId: string, bundleId: string) {
    return this.productHelper.getBundleComponents(tenantId, bundleId);
  }

  addBundleComponent(
    tenantId: string,
    bundleId: string,
    dto: AddBundleComponentDto,
  ) {
    return this.productHelper.addBundleComponent(tenantId, bundleId, dto);
  }

  removeBundleComponent(
    tenantId: string,
    bundleId: string,
    componentId: string,
  ) {
    return this.productHelper.removeBundleComponent(
      tenantId,
      bundleId,
      componentId,
    );
  }

  // ─── VARIANTS ─────────────────────────────────────────────────

  async getVariants(tenantId: string, productId: string) {
    await this.productHelper.getProductById(tenantId, productId);
    return this.variantPriceHelper.getVariants(tenantId, productId);
  }

  async createVariant(
    tenantId: string,
    productId: string,
    dto: CreateVariantDto,
  ) {
    await this.productHelper.getProductById(tenantId, productId);
    return this.variantPriceHelper.createVariant(tenantId, productId, dto);
  }

  updateVariant(
    tenantId: string,
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ) {
    return this.variantPriceHelper.updateVariant(
      tenantId,
      productId,
      variantId,
      dto,
    );
  }

  deleteVariant(tenantId: string, productId: string, variantId: string) {
    return this.variantPriceHelper.deleteVariant(tenantId, productId, variantId);
  }

  // ─── PRICE MANAGEMENT ─────────────────────────────────────────

  async getProductPrices(tenantId: string, productId: string) {
    await this.productHelper.getProductById(tenantId, productId);
    return this.variantPriceHelper.getProductPrices(tenantId, productId);
  }

  async createProductPrice(
    tenantId: string,
    productId: string,
    dto: CreateProductPriceDto,
  ) {
    await this.productHelper.getProductById(tenantId, productId);
    return this.variantPriceHelper.createProductPrice(tenantId, productId, dto);
  }

  updateProductPrice(
    tenantId: string,
    productId: string,
    priceId: string,
    dto: UpdateProductPriceDto,
  ) {
    return this.variantPriceHelper.updateProductPrice(
      tenantId,
      productId,
      priceId,
      dto,
    );
  }

  deleteProductPrice(tenantId: string, productId: string, priceId: string) {
    return this.variantPriceHelper.deleteProductPrice(
      tenantId,
      productId,
      priceId,
    );
  }

  resolvePrice(
    tenantId: string,
    productId: string,
    priceType: string,
    qty: number,
  ) {
    return this.variantPriceHelper.resolvePrice(
      tenantId,
      productId,
      priceType,
      qty,
    );
  }

  // ─── CERTIFICATES ─────────────────────────────────────────────

  async getCertificates(tenantId: string, productId: string) {
    await this.productHelper.getProductById(tenantId, productId);
    return this.variantPriceHelper.getCertificates(tenantId, productId);
  }

  async createCertificate(
    tenantId: string,
    productId: string,
    dto: CreateCertificateDto,
  ) {
    await this.productHelper.getProductById(tenantId, productId);
    return this.variantPriceHelper.createCertificate(tenantId, productId, dto);
  }

  deleteCertificate(tenantId: string, productId: string, certId: string) {
    return this.variantPriceHelper.deleteCertificate(
      tenantId,
      productId,
      certId,
    );
  }

  getExpiringCertificates(tenantId: string, days = 30) {
    return this.variantPriceHelper.getExpiringCertificates(tenantId, days);
  }
}
