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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import {
  AddBundleComponentDto,
  CreateVariantDto,
  UpdateVariantDto,
  CreateProductPriceDto,
  UpdateProductPriceDto,
  CreateCertificateDto,
} from './dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WarehouseReadOnlyGuard } from '../common/guards/warehouse-read-only.guard';

@ApiTags('Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, WarehouseReadOnlyGuard)
@Controller('catalog')
export class CatalogExtrasController {
  constructor(private readonly catalogService: CatalogService) {}

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
}
