import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { PriceHistoryService } from './price-history.service';
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
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly priceHistoryService: PriceHistoryService,
  ) {}

  // ─── CATEGORIES ───────────────────────────────────────────────

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories (tree)' })
  getCategories(@CurrentUser('tenantId') tenantId: string) {
    return this.catalogService.getCategories(tenantId);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create category' })
  createCategory(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.catalogService.createCategory(tenantId, dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', type: String })
  updateCategory(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.catalogService.updateCategory(tenantId, id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Soft delete category' })
  @ApiParam({ name: 'id', type: String })
  deleteCategory(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.catalogService.deleteCategory(tenantId, id);
  }

  // ─── UNITS ────────────────────────────────────────────────────

  @Get('units')
  @ApiOperation({ summary: 'Get all units' })
  getUnits(@CurrentUser('tenantId') tenantId: string) {
    return this.catalogService.getUnits(tenantId);
  }

  @Post('units')
  @ApiOperation({ summary: 'Create unit' })
  createUnit(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateUnitDto,
  ) {
    return this.catalogService.createUnit(tenantId, dto);
  }

  // ─── PRODUCTS ─────────────────────────────────────────────────

  @Get('products')
  @ApiOperation({ summary: 'List products (paginated, filterable)' })
  getProducts(
    @CurrentUser('tenantId') tenantId: string,
    @Query() filter: ProductFilterDto,
  ) {
    return this.catalogService.getProducts(tenantId, filter);
  }

  @Get('products/barcode/:code')
  @ApiOperation({ summary: 'Find product by barcode (fast scan)' })
  @ApiParam({ name: 'code', type: String })
  getByBarcode(
    @CurrentUser('tenantId') tenantId: string,
    @Param('code') code: string,
  ) {
    return this.catalogService.getProductByBarcode(tenantId, code);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: String })
  getProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.catalogService.getProductById(tenantId, id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product' })
  createProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.catalogService.createProduct(tenantId, dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', type: String })
  updateProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.catalogService.updateProduct(tenantId, id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiParam({ name: 'id', type: String })
  deleteProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.catalogService.deleteProduct(tenantId, id);
  }

  // ─── SUPPLIERS ────────────────────────────────────────────────

  @Get('suppliers')
  @ApiOperation({ summary: 'List all suppliers' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  getSuppliers(
    @CurrentUser('tenantId') tenantId: string,
    @Query('isActive') isActive?: string,
  ) {
    const active =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.catalogService.getSuppliers(tenantId, active);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get supplier by ID (with linked products)' })
  @ApiParam({ name: 'id', type: String })
  getSupplier(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.catalogService.getSupplierById(tenantId, id);
  }

  @Post('suppliers')
  @ApiOperation({ summary: 'Create supplier' })
  createSupplier(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.catalogService.createSupplier(tenantId, dto);
  }

  @Patch('suppliers/:id')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiParam({ name: 'id', type: String })
  updateSupplier(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.catalogService.updateSupplier(tenantId, id, dto);
  }

  @Delete('suppliers/:id')
  @ApiOperation({ summary: 'Deactivate supplier (set isActive=false)' })
  @ApiParam({ name: 'id', type: String })
  deactivateSupplier(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.catalogService.deactivateSupplier(tenantId, id);
  }

  @Post('suppliers/:id/products')
  @ApiOperation({ summary: 'Link product to supplier (upsert with supply price)' })
  @ApiParam({ name: 'id', type: String })
  linkProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) supplierId: string,
    @Body() dto: LinkProductSupplierDto,
  ) {
    return this.catalogService.linkProductToSupplier(tenantId, supplierId, dto);
  }

  @Delete('suppliers/:id/products/:productId')
  @ApiOperation({ summary: 'Unlink product from supplier' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'productId', type: String })
  unlinkProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) supplierId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.catalogService.unlinkProductFromSupplier(
      tenantId,
      supplierId,
      productId,
    );
  }

  // ─── BUNDLES (T-045) ──────────────────────────────────────────

  @Get('products/:id/components')
  @ApiOperation({ summary: 'Bundle mahsulot komponentlarini olish' })
  @ApiParam({ name: 'id', type: String })
  getBundleComponents(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.catalogService.getBundleComponents(tenantId, id);
  }

  @Post('products/:id/components')
  @ApiOperation({ summary: 'Bundle ga komponent qo\'shish / yangilash' })
  @ApiParam({ name: 'id', type: String })
  addBundleComponent(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddBundleComponentDto,
  ) {
    return this.catalogService.addBundleComponent(tenantId, id, dto);
  }

  @Delete('products/:id/components/:componentId')
  @ApiOperation({ summary: 'Bundle dan komponentni olib tashlash' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'componentId', type: String })
  removeBundleComponent(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('componentId', ParseUUIDPipe) componentId: string,
  ) {
    return this.catalogService.removeBundleComponent(tenantId, id, componentId);
  }

  // ─── PRODUCT VARIANTS (T-095) ─────────────────────────────────

  @Get('products/:id/variants')
  @ApiOperation({ summary: 'Mahsulot variantlarini olish (rang/hajm/tur)' })
  @ApiParam({ name: 'id', type: String })
  getVariants(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.catalogService.getVariants(tenantId, id);
  }

  @Post('products/:id/variants')
  @ApiOperation({ summary: 'Mahsulotga variant qo\'shish' })
  @ApiParam({ name: 'id', type: String })
  createVariant(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.catalogService.createVariant(tenantId, id, dto);
  }

  @Patch('products/:id/variants/:variantId')
  @ApiOperation({ summary: 'Variantni yangilash' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'variantId', type: String })
  updateVariant(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.catalogService.updateVariant(tenantId, id, variantId, dto);
  }

  @Delete('products/:id/variants/:variantId')
  @ApiOperation({ summary: 'Variantni o\'chirish' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'variantId', type: String })
  deleteVariant(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ) {
    return this.catalogService.deleteVariant(tenantId, id, variantId);
  }

  // ─── PRICE MANAGEMENT (T-098) ─────────────────────────────────

  @Get('products/:id/prices')
  @ApiOperation({ summary: 'Mahsulot narx turlarini olish (RETAIL/WHOLESALE/VIP, tiered)' })
  @ApiParam({ name: 'id', type: String })
  getProductPrices(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.catalogService.getProductPrices(tenantId, id);
  }

  @Post('products/:id/prices')
  @ApiOperation({ summary: 'Mahsulotga narx qo\'shish (tiered, scheduled narx)' })
  @ApiParam({ name: 'id', type: String })
  createProductPrice(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductPriceDto,
  ) {
    return this.catalogService.createProductPrice(tenantId, id, dto);
  }

  @Patch('products/:id/prices/:priceId')
  @ApiOperation({ summary: 'Narxni yangilash' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'priceId', type: String })
  updateProductPrice(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('priceId', ParseUUIDPipe) priceId: string,
    @Body() dto: UpdateProductPriceDto,
  ) {
    return this.catalogService.updateProductPrice(tenantId, id, priceId, dto);
  }

  @Delete('products/:id/prices/:priceId')
  @ApiOperation({ summary: 'Narxni o\'chirish' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'priceId', type: String })
  deleteProductPrice(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('priceId', ParseUUIDPipe) priceId: string,
  ) {
    return this.catalogService.deleteProductPrice(tenantId, id, priceId);
  }

  @Get('products/:id/prices/resolve')
  @ApiOperation({ summary: 'POS uchun: qty va customer group ga mos narxni topish' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'priceType', enum: ['RETAIL', 'WHOLESALE', 'VIP'], required: false })
  @ApiQuery({ name: 'qty', type: Number, required: false })
  resolvePrice(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('priceType') priceType: string = 'RETAIL',
    @Query('qty') qty?: string,
  ) {
    return this.catalogService.resolvePrice(
      tenantId,
      id,
      priceType,
      qty ? parseInt(qty, 10) : 1,
    );
  }

  // ─── T-097: PRODUCT CERTIFICATES ─────────────────────────────

  @Get('products/:id/certificates')
  @ApiOperation({ summary: 'T-097: Mahsulot sertifikatlari ro\'yxati' })
  @ApiParam({ name: 'id', type: String })
  getCertificates(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.catalogService.getCertificates(tenantId, id);
  }

  @Post('products/:id/certificates')
  @ApiOperation({ summary: 'T-097: Sertifikat qo\'shish' })
  @ApiParam({ name: 'id', type: String })
  createCertificate(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCertificateDto,
  ) {
    return this.catalogService.createCertificate(tenantId, id, dto);
  }

  @Delete('products/:id/certificates/:certId')
  @ApiOperation({ summary: 'T-097: Sertifikat o\'chirish' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'certId', type: String })
  deleteCertificate(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('certId', ParseUUIDPipe) certId: string,
  ) {
    return this.catalogService.deleteCertificate(tenantId, id, certId);
  }

  @Get('certificates/expiring')
  @ApiOperation({ summary: 'T-097: Muddati yaqin sertifikatlar' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getExpiringCertificates(
    @CurrentUser('tenantId') tenantId: string,
    @Query('days') days?: string,
  ) {
    return this.catalogService.getExpiringCertificates(tenantId, days ? parseInt(days, 10) : 30);
  }

  // ─── PRICE HISTORY (T-133) ────────────────────────────────────

  @Get('price-changes')
  @ApiOperation({ summary: 'T-133: Barcha mahsulotlar narx o\'zgarish tarixi' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listPriceChanges(
    @CurrentUser('tenantId') tenantId: string,
    @Query('limit') limit?: string,
  ) {
    return this.priceHistoryService.listRecent(tenantId, limit ? parseInt(limit, 10) : 100);
  }

  @Get('products/:id/price-changes')
  @ApiOperation({ summary: 'T-133: Mahsulot narx o\'zgarish tarixi' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getProductPriceHistory(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: string,
  ) {
    return this.priceHistoryService.getHistory(tenantId, id, limit ? parseInt(limit, 10) : 50);
  }

  // ─── BARCODE GENERATION (T-131) ──────────────────────────────

  @Get('products/:id/barcode')
  @ApiOperation({ summary: 'T-131: EAN-13 barcode PNG for product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'format', required: false, description: 'ean13 | code128 | qrcode', example: 'ean13' })
  async generateBarcode(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('format') format: string = 'ean13',
    @Res() res: Response,
  ) {
    // Lazy import to avoid bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bwipjs = require('bwip-js') as typeof import('bwip-js');

    const product = await this.catalogService.getProductById(tenantId, id);

    const text: string = (product as { barcode?: string }).barcode ?? id.replace(/-/g, '').slice(0, 12);

    const png = await bwipjs.toBuffer({
      bcid: format === 'qrcode' ? 'qrcode' : format === 'code128' ? 'code128' : 'ean13',
      text,
      scale: 3,
      height: 20,
      includetext: true,
      textxalign: 'center',
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="barcode-${id}.png"`);
    res.send(png);
  }
}
