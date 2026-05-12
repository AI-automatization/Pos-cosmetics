import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiEnginesHelper } from './ai-engines.helper';
import { AiDashboardHelper } from './ai-dashboard.helper';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engines: AiEnginesHelper,
    private readonly dashboard: AiDashboardHelper,
  ) {}

  // ─── T-089: SALES TREND ───────────────────────────────────────
  getSalesTrend(
    tenantId: string,
    period: 'daily' | 'weekly' | 'monthly',
    from: Date,
    to: Date,
    branchId?: string,
  ) {
    return this.engines.getSalesTrend(tenantId, period, from, to, branchId);
  }

  // ─── T-089: TOP PRODUCTS ──────────────────────────────────────
  getTopProducts(
    tenantId: string,
    from: Date,
    to: Date,
    limit: number,
    sortBy: 'revenue' | 'qty',
    branchId?: string,
  ) {
    return this.engines.getTopProducts(tenantId, from, to, limit, sortBy, branchId);
  }

  // ─── T-089: DEAD STOCK ────────────────────────────────────────
  getDeadStock(tenantId: string, days: number) {
    return this.engines.getDeadStock(tenantId, days);
  }

  // ─── T-089: MARGIN ANALYSIS ───────────────────────────────────
  getMarginAnalysis(
    tenantId: string,
    from: Date,
    to: Date,
    categoryId?: string,
  ) {
    return this.engines.getMarginAnalysis(tenantId, from, to, categoryId);
  }

  // ─── T-089: ABC ANALYSIS ──────────────────────────────────────
  getAbcAnalysis(tenantId: string, from: Date, to: Date) {
    return this.engines.getAbcAnalysis(tenantId, from, to);
  }

  // ─── T-089: CASHIER PERFORMANCE ──────────────────────────────
  getCashierPerformance(tenantId: string, from: Date, to: Date) {
    return this.dashboard.getCashierPerformance(tenantId, from, to);
  }

  // ─── T-089: HOURLY HEATMAP ────────────────────────────────────
  getHourlyHeatmap(tenantId: string, from: Date, to: Date) {
    return this.dashboard.getHourlyHeatmap(tenantId, from, to);
  }

  // ─── T-221: REVENUE SUMMARY ───────────────────────────────────
  getRevenueSummary(tenantId: string, branchId?: string) {
    return this.dashboard.getRevenueSummary(tenantId, branchId);
  }

  // ─── ORDERS SUMMARY ──────────────────────────────────────────
  getOrdersSummary(tenantId: string, branchId?: string) {
    return this.dashboard.getOrdersSummary(tenantId, branchId);
  }

  // ─── BRANCH COMPARISON ───────────────────────────────────────
  getBranchComparison(tenantId: string, period = 'month') {
    return this.dashboard.getBranchComparison(tenantId, period);
  }

  // ─── REVENUE BY BRANCH ───────────────────────────────────────
  getRevenueByBranch(tenantId: string, period = 'month') {
    return this.dashboard.getRevenueByBranch(tenantId, period);
  }
}
