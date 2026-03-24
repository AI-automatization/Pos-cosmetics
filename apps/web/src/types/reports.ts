// Reports domain types
// TODO: Move to packages/types/ after backend implements T-024

export interface DailyRevenue {
  date: string; // YYYY-MM-DD
  revenue: number;
  ordersCount: number;
  discountAmount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  ordersCount: number;
}

export interface SalesSummary {
  totalRevenue: number;
  ordersCount: number;
  averageOrderValue: number;
  discountAmount: number;
  returnsAmount: number;
  netRevenue: number;
}

export interface ShiftReport {
  shiftId: string;
  openedAt: string;
  closedAt: string | null;
  cashierName: string;
  ordersCount: number;
  cashRevenue: number;
  cardRevenue: number;
  totalRevenue: number;
  openingCash: number;
  closingCash: number | null;
  expectedCash: number;
  discrepancy: number | null;
}

export interface ProfitSummary {
  revenue: number;
  cogs: number;
  returns: number;
  grossProfit: number;
  grossMarginPct: string; // e.g. "18.50"
}

export interface DashboardData {
  today: SalesSummary;
  profit: ProfitSummary | null;
  profitYesterday: ProfitSummary | null;
  weeklyRevenue: DailyRevenue[];
  topProducts: TopProduct[];
  lowStockCount: number;
}

export interface DateRangeQuery {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}
