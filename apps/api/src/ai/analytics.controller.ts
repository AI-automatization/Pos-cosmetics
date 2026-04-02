import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Supplemental analytics endpoints (unique to this controller).
 * Duplicate endpoints (revenue, orders, sales-trend, branch-comparison,
 * top-products, revenue-by-branch) live in AiController — see ai.controller.ts.
 *
 * T-326: path conflict resolution — duplicates removed, only unique endpoints kept.
 */
@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /analytics/stock-value
   * T-215: { total, byBranch: [{ branchId, branchName, value }] }
   */
  @Get('stock-value')
  @ApiOperation({ summary: 'T-215: Stock value total + by branch' })
  async getStockValue(@CurrentUser('tenantId') tenantId: string) {
    const branches = await this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });

    const byBranch = await Promise.all(
      branches.map(async (b) => {
        const movements = await this.prisma.stockMovement.findMany({
          where: { tenantId, warehouseId: b.id },
          select: { type: true, quantity: true, product: { select: { costPrice: true } } },
        });
        const value = movements.reduce((s, m) => {
          const cost = Number(m.product?.costPrice ?? 0);
          const qty = Number(m.quantity);
          const sign = ['IN', 'TRANSFER_IN', 'RETURN_IN'].includes(m.type) ? 1 : -1;
          return s + cost * qty * sign;
        }, 0);
        return { branchId: b.id, branchName: b.name, value: Math.max(0, value) };
      }),
    );

    const total = byBranch.reduce((s, b) => s + b.value, 0);
    return { total, byBranch };
  }

  /**
   * GET /analytics/insights — AI insights (mock data until Phase 3)
   */
  @Get('insights')
  @ApiOperation({ summary: 'AI insights (mock data until Phase 3)' })
  getInsights() {
    return [
      { id: 'ins-001', type: 'TREND',     title: "Parfyum sotuvi o'sdi",           description: "O'tgan hafta parfyum sotuvi 23% oshdi.", priority: 'HIGH',   createdAt: new Date(Date.now() - 2 * 3600000) },
      { id: 'ins-002', type: 'DEADSTOCK', title: "Revlon Blush — sekin sotilmoqda", description: "30 kun ichida 2 dona sotildi.",           priority: 'MEDIUM', createdAt: new Date(Date.now() - 6 * 3600000) },
      { id: 'ins-003', type: 'MARGIN',    title: "MAC Lipstick margini past",        description: "Sof foyda 8% ga tushdi.",                priority: 'HIGH',   createdAt: new Date(Date.now() - 12 * 3600000) },
    ];
  }
}
