import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Throttle({ default: { limit: 20, ttl: 60000 } })
@Controller('analytics')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ─── helpers ─────────────────────────────────────────────────
  private parseDate(raw: string | undefined, fallback: Date): Date {
    if (!raw) return fallback;
    const d = new Date(raw);
    if (isNaN(d.getTime())) throw new BadRequestException(`Invalid date: ${raw}`);
    return d;
  }

  private defaultFrom(days = 30): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private defaultTo(): Date {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }

  // ─── SALES TREND ──────────────────────────────────────────────
  @Get('sales-trend')
  @ApiOperation({ summary: 'Sales trend: kunlik/haftalik/oylik daromad grafigi' })
  @ApiQuery({ name: 'period', enum: ['daily', 'weekly', 'monthly'], required: false })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date (default: 30 kun oldin)' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date (default: bugun)' })
  getSalesTrend(
    @CurrentUser('tenantId') tenantId: string,
    @Query('period') period: string = 'daily',
    @Query('granularity') granularity?: string, // mobile sends "granularity" instead of "period"
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
  ) {
    // mobile sends granularity=day|week|month, map to daily|weekly|monthly
    const granMap: Record<string, string> = { day: 'daily', week: 'weekly', month: 'monthly' };
    const raw = granularity ? (granMap[granularity] ?? granularity) : period;
    const validPeriods = ['daily', 'weekly', 'monthly'];
    const resolved = validPeriods.includes(raw) ? raw : 'daily';
    return this.aiService.getSalesTrend(
      tenantId,
      resolved as 'daily' | 'weekly' | 'monthly',
      this.parseDate(from ?? fromDate, this.defaultFrom(30)),
      this.parseDate(to ?? toDate, this.defaultTo()),
    );
  }

  // ─── TOP PRODUCTS ─────────────────────────────────────────────
  @Get('top-products')
  @ApiOperation({ summary: 'Top mahsulotlar — revenue yoki qty bo\'yicha' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Default: 10' })
  @ApiQuery({ name: 'sortBy', enum: ['revenue', 'qty'], required: false })
  getTopProducts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy: string = 'revenue',
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('limit must be 1–100');
    }
    if (!['revenue', 'qty'].includes(sortBy)) {
      throw new BadRequestException('sortBy must be revenue or qty');
    }
    return this.aiService.getTopProducts(
      tenantId,
      this.parseDate(from, this.defaultFrom(30)),
      this.parseDate(to, this.defaultTo()),
      limitNum,
      sortBy as 'revenue' | 'qty',
    );
  }

  // ─── DEAD STOCK ───────────────────────────────────────────────
  @Get('dead-stock')
  @ApiOperation({ summary: 'Harakatsiz tovarlar — N kun sotilmagan, omborda qolgan' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Default: 90' })
  getDeadStock(
    @CurrentUser('tenantId') tenantId: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 90;
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      throw new BadRequestException('days must be 1–365');
    }
    return this.aiService.getDeadStock(tenantId, daysNum);
  }

  // ─── MARGIN ANALYSIS ──────────────────────────────────────────
  @Get('margin')
  @ApiOperation({ summary: 'Mahsulot/kategoriya marja tahlili' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  getMargin(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.aiService.getMarginAnalysis(
      tenantId,
      this.parseDate(from, this.defaultFrom(30)),
      this.parseDate(to, this.defaultTo()),
      categoryId,
    );
  }

  // ─── ABC ANALYSIS ─────────────────────────────────────────────
  @Get('abc')
  @ApiOperation({ summary: 'ABC tahlil — revenue bo\'yicha A/B/C guruhlar (80/15/5%)' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getAbc(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.aiService.getAbcAnalysis(
      tenantId,
      this.parseDate(from, this.defaultFrom(30)),
      this.parseDate(to, this.defaultTo()),
    );
  }

  // ─── CASHIER PERFORMANCE ──────────────────────────────────────
  @Get('cashier-performance')
  @ApiOperation({ summary: 'Kassirlar samaradorligi — orders, revenue, returns' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getCashierPerformance(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.aiService.getCashierPerformance(
      tenantId,
      this.parseDate(from, this.defaultFrom(30)),
      this.parseDate(to, this.defaultTo()),
    );
  }

  // ─── T-221: REVENUE SUMMARY (mobile-owner format) ────────────
  @Get('revenue')
  @ApiOperation({ summary: 'T-221: Revenue summary — today/week/month/year with trends' })
  @ApiQuery({ name: 'branch_id', required: false })
  getRevenue(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    return this.aiService.getRevenueSummary(tenantId, branchId);
  }

  // ─── HOURLY HEATMAP ───────────────────────────────────────────
  @Get('hourly-heatmap')
  @ApiOperation({ summary: 'Soatlik issiqlik xaritasi — qaysi kun/soat eng band' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getHourlyHeatmap(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.aiService.getHourlyHeatmap(
      tenantId,
      this.parseDate(from, this.defaultFrom(30)),
      this.parseDate(to, this.defaultTo()),
    );
  }

  // ─── ORDERS SUMMARY ───────────────────────────────────────────
  @Get('orders')
  @ApiOperation({ summary: 'Orders summary — total, avgOrderValue, trend' })
  @ApiQuery({ name: 'branch_id', required: false })
  getOrdersSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('branch_id') branchId?: string,
  ) {
    return this.aiService.getOrdersSummary(tenantId, branchId);
  }

  // ─── BRANCH COMPARISON ────────────────────────────────────────
  @Get('branch-comparison')
  @ApiOperation({ summary: 'Filiallar solishtirmasi — revenue, orders, growth' })
  @ApiQuery({ name: 'period', enum: ['today', 'week', 'month', 'year'], required: false })
  getBranchComparison(
    @CurrentUser('tenantId') tenantId: string,
    @Query('period') period: string = 'month',
  ) {
    return this.aiService.getBranchComparison(tenantId, period);
  }

  // ─── REVENUE BY BRANCH ────────────────────────────────────────
  @Get('revenue-by-branch')
  @ApiOperation({ summary: 'Filial bo\'yicha daromad — branchId, revenue, orders, avgOrderValue' })
  @ApiQuery({ name: 'period', enum: ['today', 'week', 'month', 'year'], required: false })
  getRevenueByBranch(
    @CurrentUser('tenantId') tenantId: string,
    @Query('period') period: string = 'month',
  ) {
    return this.aiService.getRevenueByBranch(tenantId, period);
  }

  // ─── EMPLOYEE PERFORMANCE (alias for cashier-performance) ────
  @Get('employee-performance')
  @ApiOperation({ summary: 'Mobile alias: same as /analytics/cashier-performance' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'from_date', required: false })
  @ApiQuery({ name: 'to_date', required: false })
  getEmployeePerformance(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
  ) {
    return this.aiService.getCashierPerformance(
      tenantId,
      this.parseDate(from ?? fromDate, this.defaultFrom(30)),
      this.parseDate(to ?? toDate, this.defaultTo()),
    );
  }
}
