import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateUnitDto,
} from './dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WarehouseReadOnlyGuard } from '../common/guards/warehouse-read-only.guard';

@ApiTags('Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, WarehouseReadOnlyGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

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
}
