import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateStockMovementDto,
  CreateWarehouseDto,
  StockFilterDto,
  BatchStockInDto,
  BatchStockOutDto,
} from './dto/stock-movement.dto';
import { RestockRequestDto } from './dto/restock-request.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TransferService, CreateTransferDto } from './transfer.service';
import { TransferStatus } from '@prisma/client';
import { Roles } from '../common/decorators';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly transferService: TransferService,
  ) {}

  // ─── WAREHOUSES ───────────────────────────────────────────────

  @Get('warehouses')
  @ApiOperation({ summary: 'List warehouses' })
  getWarehouses(@CurrentUser('tenantId') tenantId: string) {
    return this.inventoryService.getWarehouses(tenantId);
  }

  @Post('warehouses')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create warehouse' })
  createWarehouse(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.inventoryService.createWarehouse(tenantId, dto);
  }

  // ─── STOCK MOVEMENTS ──────────────────────────────────────────

  @Post('movements')
  @ApiOperation({ summary: 'Add stock movement (IN/OUT/ADJUSTMENT)' })
  addMovement(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateStockMovementDto,
  ) {
    return this.inventoryService.addStockMovement(tenantId, userId, dto);
  }

  @Post('stock-in')
  @ApiOperation({ summary: 'Batch goods receipt — Process 5 (Nakladnoy)' })
  batchStockIn(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: BatchStockInDto,
  ) {
    return this.inventoryService.batchStockIn(tenantId, userId, dto);
  }

  @Post('stock-out')
  @ApiOperation({ summary: 'Batch stock-out / write-off — Process 11' })
  batchStockOut(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: BatchStockOutDto,
  ) {
    return this.inventoryService.batchStockOut(tenantId, userId, dto);
  }

  @Get('movements')
  @ApiOperation({ summary: 'List stock movements (paginated)' })
  getMovements(
    @CurrentUser('tenantId') tenantId: string,
    @Query() filter: StockFilterDto,
  ) {
    return this.inventoryService.getStockMovements(tenantId, filter);
  }

  // ─── STOCK LEVELS ─────────────────────────────────────────────

  @Get('levels')
  @ApiOperation({ summary: 'Get current stock levels' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'lowStock', required: false })
  getStockLevels(
    @CurrentUser('tenantId') tenantId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.inventoryService.getStockLevels(tenantId, {
      warehouseId,
      productId,
      lowStock: lowStock === 'true',
    });
  }


  // ─── Mobile aliases (read-only) ───────────────────────────────

  @Get('stock')
  @ApiOperation({ summary: 'Mobile alias: GET /inventory/levels' })
  @ApiQuery({ name: 'branchId', required: false })
  getMobileStock(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') _branchId?: string,
  ) {
    return this.inventoryService.getStockLevels(tenantId, {});
  }

  @Get('stock/low')
  @ApiOperation({ summary: 'Mobile alias: GET /inventory/levels?lowStock=true' })
  @ApiQuery({ name: 'branchId', required: false })
  getMobileLowStock(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') _branchId?: string,
  ) {
    return this.inventoryService.getStockLevels(tenantId, { lowStock: true });
  }

  // ─── T-202: LOW STOCK (mobile-owner format) ─────────────────
  // GET /inventory/low-stock?branch_id=&limit=20
  @Get('low-stock')
  @ApiOperation({ summary: 'T-202: Low stock items — { items: [{ productId, productName, quantity, unit, threshold, status }] }' })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Default: 20, max: 100' })
  getLowStock(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.inventoryService.getLowStockList(tenantId, branchId, isNaN(limitNum) ? 20 : limitNum);
  }

  // ─── T-202: INVENTORY ITEMS (paginated) ──────────────────────
  // GET /inventory/items?branchId=&status=&search=&page=&limit=
  @Get('items')
  @ApiOperation({ summary: 'T-202: Paginated inventory list for Inventory screen' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['normal', 'low', 'out_of_stock', 'expiring', 'expired'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getInventoryItems(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('branch_id') branchIdAlt?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.inventoryService.getInventoryItems(tenantId, {
      branchId: branchId ?? branchIdAlt,
      status,
      search,
      page,
      limit,
    });
  }

  // mobile-owner: GET /inventory/stock-value
  @Get('stock-value')
  @ApiOperation({ summary: 'Mobile-owner: total stock value + by branch' })
  @ApiQuery({ name: 'branch_id', required: false })
  getStockValue(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    return this.inventoryService.getStockValue(tenantId, branchId);
  }

  // ─── T-222: OUT OF STOCK ─────────────────────────────────────

  @Post('restock-request')
  @Roles('CASHIER', 'MANAGER', 'ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Kassirdan omborchiga zapros yuborish' })
  sendRestockRequest(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: RestockRequestDto,
  ) {
    return this.inventoryService.sendRestockRequest(tenantId, userId, dto);
  }

  @Get('out-of-stock')
  @ApiOperation({ summary: 'T-222: Omborda yo\'q tovarlar (quantity = 0)' })
  @ApiQuery({ name: 'branch_id', required: false })
  getOutOfStock(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    return this.inventoryService.getOutOfStockItems(tenantId, branchId);

  }

  // ─── EXPIRY (T-031) ───────────────────────────────────────────

  @Get('expiring')
  @ApiOperation({ summary: 'Muddati yaqin mahsulotlar (kosmetika uchun)' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getExpiring(
    @CurrentUser('tenantId') tenantId: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.inventoryService.getExpiringProducts(tenantId, days);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Muddati otgan mahsulotlar' })
  getExpired(@CurrentUser('tenantId') tenantId: string) {
    return this.inventoryService.getExpiredProducts(tenantId);
  }

  // ─── T-096: TESTER TRACKING ────────────────────────────────────────────────

  @Get('testers')
  @ApiOperation({ summary: 'T-096: Tester/namuna harakatlari ro\'yxati' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  listTesters(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.inventoryService.getTesterMovements(tenantId, from, to);
  }

  // ─── T-114: INTER-BRANCH STOCK TRANSFERS ──────────────────────────────────

  @Post('transfers')
  @ApiOperation({ summary: 'Filiallar orasida tovar ko\'chirish uchun so\'rov' })
  requestTransfer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTransferDto,
  ) {
    return this.transferService.requestTransfer(tenantId, userId, dto);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Transfer ro\'yxati' })
  @ApiQuery({ name: 'status', required: false, enum: TransferStatus })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listTransfers(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: TransferStatus,
    @Query('branchId') branchId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.transferService.listTransfers(tenantId, status, branchId, page, limit);
  }

  @Patch('transfers/:id/approve')
  @ApiOperation({ summary: 'Transferni tasdiqlash (ADMIN/OWNER)' })
  approveTransfer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') transferId: string,
  ) {
    return this.transferService.approveTransfer(tenantId, transferId, userId);
  }

  @Patch('transfers/:id/ship')
  @ApiOperation({ summary: 'Transferni jo\'natish (tovar chiqdi)' })
  shipTransfer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') transferId: string,
  ) {
    return this.transferService.shipTransfer(tenantId, transferId, userId);
  }

  @Patch('transfers/:id/receive')
  @ApiOperation({ summary: 'Transferni qabul qilish (tovar keldi)' })
  receiveTransfer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') transferId: string,
  ) {
    return this.transferService.receiveTransfer(tenantId, transferId, userId);
  }

  @Patch('transfers/:id/cancel')
  @ApiOperation({ summary: 'Transferni bekor qilish' })
  cancelTransfer(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') transferId: string,
  ) {
    return this.transferService.cancelTransfer(tenantId, transferId);
  }
}
