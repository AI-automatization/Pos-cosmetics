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
  CreateSupplierDto,
  UpdateSupplierDto,
  LinkProductSupplierDto,
} from './dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../common/decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WarehouseReadOnlyGuard } from '../common/guards/warehouse-read-only.guard';

@ApiTags('Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, WarehouseReadOnlyGuard)
@Controller('catalog')
export class CatalogSupplierController {
  constructor(private readonly catalogService: CatalogService) {}

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
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'Create supplier' })
  createSupplier(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.catalogService.createSupplier(tenantId, dto);
  }

  @Patch('suppliers/:id')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
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
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
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
}
