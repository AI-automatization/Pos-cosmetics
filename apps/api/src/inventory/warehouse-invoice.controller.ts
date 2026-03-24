import {
  Controller, Get, Post, Param, Body, Query,
  DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  WarehouseInvoiceService,
  CreateInvoiceDto,
  WriteOffDto,
} from './warehouse-invoice.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Warehouse')
@ApiBearerAuth()
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
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
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
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'T-327: Nakladnoy detali' })
  getInvoice(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') invoiceId: string,
  ) {
    return this.svc.getInvoice(tenantId, invoiceId);
  }
}

// ─── T-328: Write-off ────────────────────────────────────────────────────────

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class WriteOffController {
  constructor(private readonly svc: WarehouseInvoiceService) {}

  @Post('write-off')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE')
  @ApiOperation({ summary: 'T-328: Tovar spisanie (DAMAGED/EXPIRED/LOST/OTHER)' })
  writeOff(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: WriteOffDto,
  ) {
    return this.svc.writeOff(tenantId, userId, dto);
  }
}
