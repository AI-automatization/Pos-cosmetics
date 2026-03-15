import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ExportService, ExportFormat } from './export.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

function parseExportFormat(raw?: string): ExportFormat {
  return raw === 'xlsx' ? 'xlsx' : 'csv';
}

// T-077: Report generation is resource-intensive — 20 req/min per tenant
@Throttle({ default: { limit: 20, ttl: 60000 } })
@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService,
  ) {}

  // ─── DAILY REPORT (T-226 alias) ───────────────────────────────

  @Get('daily')
  @ApiOperation({ summary: 'Bugungi kunlik hisobot (T-226 mobile alias)' })
  async getDailyReport(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getDailyReport(tenantId);
  }

  // ─── DAILY REVENUE ────────────────────────────────────────────

  @Get('daily-revenue')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Kunlik daromad (kuni boyicha)' })
  @ApiQuery({ name: 'from', example: '2026-02-01' })
  @ApiQuery({ name: 'to', example: '2026-02-28' })
  async getDailyRevenue(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    return this.reportsService.getDailyRevenue(tenantId, fromDate, toDate);
  }

  // ─── TOP PRODUCTS ─────────────────────────────────────────────

  @Get('top-products')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Eng kop sotilgan mahsulotlar' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getTopProducts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    return this.reportsService.getTopProducts(tenantId, fromDate, toDate, limit);
  }

  // ─── SALES SUMMARY ────────────────────────────────────────────

  @Get('sales-summary')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Savdo xulosasi (jami, qaytarishlar, tolov turlari)' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getSalesSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    return this.reportsService.getSalesSummary(tenantId, fromDate, toDate);
  }

  // ─── PROFIT ESTIMATE ─────────────────────────────────────────

  @Get('profit')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Foyda hisoboti (Revenue - COGS - Returns)' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getProfit(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    return this.reportsService.getProfitEstimate(tenantId, fromDate, toDate);
  }

  // ─── SHIFT REPORT ─────────────────────────────────────────────

  @Get('shift/:shiftId')
  @Roles('OWNER', 'ADMIN', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Smena hisoboti' })
  async getShiftReport(
    @CurrentUser('tenantId') tenantId: string,
    @Param('shiftId') shiftId: string,
  ) {
    const report = await this.reportsService.getShiftReport(tenantId, shiftId);
    if (!report) throw new NotFoundException(`Shift ${shiftId} not found`);
    return report;
  }

  // ─── Z-REPORT (T-083) ─────────────────────────────────────────

  @Post('z-report')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Z-report yaratish — kunlik fiskal yakuniy hisobot (IMMUTABLE)',
  })
  @ApiQuery({ name: 'date', required: false, example: '2026-03-01', description: 'Sana (bo\'lmasa bugun)' })
  async createZReport(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Query('date') date?: string,
  ) {
    return this.reportsService.createZReport(tenantId, userId, date);
  }

  @Get('z-reports')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Z-report tarixi' })
  @ApiQuery({ name: 'limit', required: false, example: 30 })
  async getZReports(
    @CurrentUser('tenantId') tenantId: string,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.reportsService.getZReports(tenantId, limit);
  }

  // ─── EXPORT ENDPOINTS (T-087) ──────────────────────────────────────────────

  private sendFile(
    res: Response,
    result: { buffer: Buffer; contentType: string; extension: string },
    filename: string,
  ) {
    res.setHeader('Content-Type', result.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}.${result.extension}"`,
    );
    res.setHeader('Content-Length', result.buffer.length);
    res.end(result.buffer);
  }

  @Get('export/sales')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Savdolarni CSV/Excel ga eksport' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
  async exportSales(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const result = await this.exportService.exportSales(
      tenantId, fromDate, toDate, parseExportFormat(format),
    );
    const dateStr = new Date().toISOString().slice(0, 10);
    this.sendFile(res, result, `savdolar-${dateStr}`);
  }

  @Get('export/order-items')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Buyurtma tarkibini CSV/Excel ga eksport' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
  async exportOrderItems(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const result = await this.exportService.exportOrderItems(
      tenantId, fromDate, toDate, parseExportFormat(format),
    );
    const dateStr = new Date().toISOString().slice(0, 10);
    this.sendFile(res, result, `buyurtma-tarkibi-${dateStr}`);
  }

  @Get('export/products')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Mahsulotlar ro\'yxatini CSV/Excel ga eksport' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
  async exportProducts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const result = await this.exportService.exportProducts(tenantId, parseExportFormat(format));
    const dateStr = new Date().toISOString().slice(0, 10);
    this.sendFile(res, result, `mahsulotlar-${dateStr}`);
  }

  @Get('export/inventory')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Inventar qoldiqlarini CSV/Excel ga eksport' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
  async exportInventory(
    @CurrentUser('tenantId') tenantId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const result = await this.exportService.exportInventory(tenantId, parseExportFormat(format));
    const dateStr = new Date().toISOString().slice(0, 10);
    this.sendFile(res, result, `inventar-${dateStr}`);
  }

  @Get('export/customers')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Xaridorlar ro\'yxatini CSV/Excel ga eksport' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
  async exportCustomers(
    @CurrentUser('tenantId') tenantId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const result = await this.exportService.exportCustomers(tenantId, parseExportFormat(format));
    const dateStr = new Date().toISOString().slice(0, 10);
    this.sendFile(res, result, `xaridorlar-${dateStr}`);
  }

  // ─── T-070: EMPLOYEE ACTIVITY ──────────────────────────────────

  @Get('employee-activity')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'T-070: Xodim faoliyati — fraud detection',
    description:
      'Kassir kesimida: void soni, qaytarishlar, chegirmalar, shubhali faoliyat bayroqchasi.',
  })
  @ApiQuery({ name: 'from', required: false, example: '2026-03-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-03-31' })
  @ApiQuery({ name: 'userId', required: false, description: 'Faqat bitta xodim uchun filter' })
  async getEmployeeActivity(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('userId') userId?: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);
    return this.reportsService.getEmployeeActivity(tenantId, fromDate, toDate, userId);
  }

  @Get('export/debts')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Nasiya/qarzlar ro\'yxatini CSV/Excel ga eksport' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false })
  async exportDebts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const result = await this.exportService.exportDebts(tenantId, parseExportFormat(format));
    const dateStr = new Date().toISOString().slice(0, 10);
    this.sendFile(res, result, `nasiyalar-${dateStr}`);
  }
}
