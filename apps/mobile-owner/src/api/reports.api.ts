import { apiClient } from './client';

export interface ExpenseBreakdownItem {
  category: string;
  amount: number;
  pct: number;
}

export interface ProfitReport {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  totalExpenses: number;
  netProfit: number;
  expenseBreakdown: ExpenseBreakdownItem[];
}

export interface DailyRevenuePoint {
  date: string;
  revenue: number;
  orders: number;
  discounts: number;
}

export const reportsApi = {
  async getProfitReport(from?: string, to?: string): Promise<ProfitReport> {
    const { data } = await apiClient.get('/reports/profit', {
      params: { from, to },
    });
    const d = data ?? {};
    const revenue = d.revenue ?? 0;
    const cogs = d.cogs ?? 0;
    const grossProfit = d.grossProfit ?? revenue - cogs;
    const totalExpenses = d.totalExpenses ?? 0;
    const netProfit = d.netProfit ?? grossProfit - totalExpenses;
    const grossMarginPct =
      d.grossMarginPct ?? (revenue > 0 ? (grossProfit / revenue) * 100 : 0);

    const rawExpenses: Array<{ category: string; total?: number; amount?: number; count?: number }> =
      Array.isArray(d.expensesByCategory)
        ? d.expensesByCategory
        : Array.isArray(d.expenseBreakdown)
          ? d.expenseBreakdown
          : [];

    const expenseBreakdown: ExpenseBreakdownItem[] = rawExpenses.map((e) => {
      const amount = e.amount ?? e.total ?? 0;
      return {
        category: e.category,
        amount,
        pct: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      };
    });

    return {
      revenue,
      cogs,
      grossProfit,
      grossMarginPct,
      totalExpenses,
      netProfit,
      expenseBreakdown,
    };
  },

  async getDailyRevenue(from?: string, to?: string): Promise<DailyRevenuePoint[]> {
    const { data } = await apiClient.get('/reports/daily-revenue', {
      params: { from, to },
    });
    if (!Array.isArray(data)) return [];
    return data.map((d: Record<string, unknown>) => ({
      date: String(d.date ?? ''),
      revenue: Number(d.revenue ?? 0),
      orders: Number(d.orders ?? d.ordersCount ?? 0),
      discounts: Number(d.discounts ?? d.discount ?? 0),
    }));
  },
};
