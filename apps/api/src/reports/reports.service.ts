import { Injectable } from '@nestjs/common';
import { RevenueReportsService } from './revenue-reports.service';
import { ZReportService } from './z-report.service';
import { EmployeeActivityService } from './employee-activity.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly revenue: RevenueReportsService,
    private readonly zReport: ZReportService,
    private readonly employeeActivity: EmployeeActivityService,
  ) {}

  // ─── Revenue reports ──────────────────────────────────────────────────────────

  getDailyReport(tenantId: string) {
    return this.revenue.getDailyReport(tenantId);
  }

  getDailyRevenue(tenantId: string, from: Date, to: Date) {
    return this.revenue.getDailyRevenue(tenantId, from, to);
  }

  getTopProducts(tenantId: string, from: Date, to: Date, limit?: number) {
    return this.revenue.getTopProducts(tenantId, from, to, limit);
  }

  getSalesSummary(tenantId: string, from: Date, to: Date) {
    return this.revenue.getSalesSummary(tenantId, from, to);
  }

  getProfitEstimate(tenantId: string, from: Date, to: Date) {
    return this.revenue.getProfitEstimate(tenantId, from, to);
  }

  // ─── Z-Report ─────────────────────────────────────────────────────────────────

  createZReport(tenantId: string, userId: string, date?: string) {
    return this.zReport.createZReport(tenantId, userId, date);
  }

  getZReports(tenantId: string, limit?: number) {
    return this.zReport.getZReports(tenantId, limit);
  }

  getShiftReport(tenantId: string, shiftId: string) {
    return this.zReport.getShiftReport(tenantId, shiftId);
  }

  // ─── Employee activity ────────────────────────────────────────────────────────

  getEmployeeActivity(tenantId: string, from: Date, to: Date, userId?: string) {
    return this.employeeActivity.getEmployeeActivity(tenantId, from, to, userId);
  }

  checkHourlyVoids(tenantId: string) {
    return this.employeeActivity.checkHourlyVoids(tenantId);
  }
}
