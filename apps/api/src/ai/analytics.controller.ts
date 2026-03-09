import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

const DEMO_REVENUE = [
  { period: 'daily', amount: 1936000, currency: 'UZS', trend: 12.5, branchId: 'demo-branch-1', branchName: 'Asosiy filial' },
  { period: 'weekly', amount: 12450000, currency: 'UZS', trend: 8.3, branchId: 'demo-branch-1', branchName: 'Asosiy filial' },
  { period: 'monthly', amount: 48750000, currency: 'UZS', trend: -3.1, branchId: 'demo-branch-1', branchName: 'Asosiy filial' },
];

const DEMO_BRANCH_COMPARISON = [
  { branchId: 'demo-branch-1', branchName: 'Asosiy filial', revenue: 48750000, trend: 5.2 },
];

const DEMO_INSIGHTS = [
  {
    id: 'ins-001',
    type: 'TREND',
    title: 'Parfyum sotuvi o\'sdi',
    description: 'O\'tgan hafta parfyum mahsulotlari sotuvi 23% ga oshdi. Zaxirani kengaytirish tavsiya etiladi.',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ins-002',
    type: 'DEADSTOCK',
    title: 'Revlon Blush — sekin sotilmoqda',
    description: '30 kun ichida faqat 2 dona sotildi. Chegirma o\'tkazish yoki qaytarish ko\'rib chiqilsin.',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ins-003',
    type: 'MARGIN',
    title: 'MAC Lipstick margini past',
    description: 'Sotib olish narxi oshgani sababli sof foyda 8% ga tushdi. Narxni yangilash kerak.',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ins-004',
    type: 'FORECAST',
    title: 'Nivea Krem — talabi oshadi',
    description: 'Qish mavsumi boshlanishi bilan Nivea Krem sotuvi 40% oshishi kutilmoqda. Zaxira: 45 dona.',
    priority: 'LOW',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ins-005',
    type: 'TREND',
    title: 'Kechki soatlarda sotuvlar yuqori',
    description: '18:00–20:00 oralig\'ida savdo 35% ko\'p. Smena jadvalini moslashtirish tavsiya etiladi.',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue data' })
  getRevenue(@Query('branchId') branchId?: string) {
    if (branchId) return DEMO_REVENUE.filter((r) => r.branchId === branchId);
    return DEMO_REVENUE;
  }

  @Get('branches/comparison')
  @ApiOperation({ summary: 'Get branch revenue comparison' })
  getBranchComparison() {
    return DEMO_BRANCH_COMPARISON;
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get AI insights' })
  getInsights(@Query('branchId') _branchId?: string) {
    return DEMO_INSIGHTS;
  }
}
