import {
  Controller, Get, Post, Patch, Param, Body, Query,
  DefaultValuePipe, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WarehouseInvoiceService } from './warehouse-invoice.service';
import { CreateInvoiceDto } from './dto/warehouse-invoice.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';

@ApiTags('Warehouse')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouse')
export class WarehouseInvoiceController {
  constructor(private readonly svc: WarehouseInvoiceService) {}

  // ─── T-327: POST /warehouse/invoices ─────────────────────────────────────

  @Post('invoices')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'T-327: Nakladnoy yaratish (snapshot + stock movements)' })
  createInvoice(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.svc.createInvoice(tenantId, userId, dto);
  }

  // ─── T-327: GET /warehouse/invoices ──────────────────────────────────────

  @Get('invoices')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER')
  @ApiOperation({ summary: 'T-327: Nakladnoylar royxati' })
  @ApiQuery({ name: 'from', required: false, example: '2026-03-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-03-31' })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listInvoices(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('supplierId') supplierId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.svc.listInvoices(tenantId, { from, to, supplierId, page, limit });
  }

  // ─── T-327: GET /warehouse/invoices/:id ──────────────────────────────────

  @Get('invoices/:id')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER')
  @ApiOperation({ summary: 'T-327: Nakladnoy detali' })
  getInvoice(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') invoiceId: string,
  ) {
    return this.svc.getInvoice(tenantId, invoiceId);
  }

  // ─── APPROVE / REJECT invoice ────────────────────────────────────────────

  @Patch('invoices/:id/approve')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'Nakladnoyni qabul qilish (PENDING → RECEIVED)' })
  approveInvoice(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') invoiceId: string,
  ) {
    return this.svc.approveInvoice(tenantId, userId, invoiceId);
  }

  @Patch('invoices/:id/reject')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'Nakladnoyni rad etish (PENDING → CANCELLED)' })
  rejectInvoice(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') invoiceId: string,
  ) {
    return this.svc.rejectInvoice(tenantId, userId, invoiceId);
  }

  // ─── T-319/T-320: DASHBOARD ───────────────────────────────────────────────

  @Get('dashboard')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'T-319/T-320: Ombor dashboard (stats, low stock, expiry, movements)' })
  getDashboard(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getDashboard(tenantId);
  }

  @Get('movements')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'T-336: Tovar harakatlar tarixi (filters + pagination)' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'type',      required: false, enum: ['IN','OUT','WRITE_OFF','TRANSFER_IN','TRANSFER_OUT','ADJUSTMENT'] })
  @ApiQuery({ name: 'userId',    required: false })
  @ApiQuery({ name: 'from',      required: false, example: '2026-03-01' })
  @ApiQuery({ name: 'to',        required: false, example: '2026-03-31' })
  @ApiQuery({ name: 'page',      required: false })
  @ApiQuery({ name: 'limit',     required: false })
  listMovements(
    @CurrentUser('tenantId') tenantId: string,
    @Query('productId') productId?: string,
    @Query('type')      type?: string,
    @Query('userId')    userId?: string,
    @Query('from')      from?: string,
    @Query('to')        to?: string,
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page  = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
  ) {
    return this.svc.listMovements(tenantId, { productId, type, userId, from, to, page, limit });
  }

  @Get('movements/today')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'T-320: Bugungi harakatlar' })
  getTodayMovements(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getTodayMovements(tenantId);
  }

  @Get('alerts')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'T-320: Kritik ogohlantirishlar (muddati o\'tgan/yaqin)' })
  getAlerts(@CurrentUser('tenantId') tenantId: string) {
    return this.svc.getAlerts(tenantId);
  }
}
