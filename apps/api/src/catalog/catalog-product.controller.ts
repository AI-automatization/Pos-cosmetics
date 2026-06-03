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
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
} from './dto';
import { Roles } from '../common/decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WarehouseReadOnlyGuard } from '../common/guards/warehouse-read-only.guard';

@ApiTags('Catalog')
@ApiBearerAuth()
@UseGuards(WarehouseReadOnlyGuard)
@Controller('catalog')
export class CatalogProductController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly priceHistoryService: PriceHistoryService,
  ) {}

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
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'Create product' })
  createProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.catalogService.createProduct(tenantId, dto);
  }

  @Patch('products/:id')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
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
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiParam({ name: 'id', type: String })
  deleteProduct(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.catalogService.deleteProduct(tenantId, id);
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
}
