import type { SalesSummary, DailyRevenue, TopProduct } from '@raos/types';
import api from './client';

export interface EmployeeActivity {
  employeeId: string;
  employeeName: string;
  ordersCount: number;
  revenue: number;
}

export type ExportType =
  | 'sales'
  | 'order-items'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'debts';

export interface ProfitReport {
  revenue: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  expensesByCategory: Array<{ category: string; total: number; count: number }>;
}

export const reportsApi = {
  getSalesSummary: async (from: string, to: string): Promise<SalesSummary> => {
    const { data } = await api.get<SalesSummary>('/reports/sales-summary', {
      params: { from, to },
    });
    return data;
  },

  getDailyRevenue: async (from: string, to: string): Promise<DailyRevenue[]> => {
    const { data } = await api.get<DailyRevenue[]>('/reports/daily-revenue', {
      params: { from, to },
    });
    return data;
  },

  getTopProducts: async (
    from: string,
    to: string,
    limit = 5,
  ): Promise<TopProduct[]> => {
    const { data } = await api.get<TopProduct[]>('/reports/top-products', {
      params: { from, to, limit },
    });
    return data;
  },

  getEmployeeActivity: async (from: string, to: string): Promise<EmployeeActivity[]> => {
    const { data } = await api.get<EmployeeActivity[]>('/reports/employee-activity', {
      params: { from, to },
    });
    return data;
  },

  exportDownload: async (
    type: ExportType,
    params: { from?: string; to?: string } = {},
  ): Promise<string> => {
    const { data } = await api.get<ArrayBuffer>(`/reports/export/${type}`, {
      params: { ...params, format: 'csv' },
      responseType: 'arraybuffer',
    });
    return new TextDecoder('utf-8').decode(data);
  },

  getProfitReport: async (from: string, to: string): Promise<ProfitReport> => {
    const res = await api.get('/reports/profit', { params: { from, to } });
    const d = res.data ?? {};
    return {
      revenue:            d.revenue            ?? 0,
      cogs:               d.cogs               ?? 0,
      grossProfit:        d.grossProfit        ?? 0,
      totalExpenses:      d.totalExpenses      ?? 0,
      netProfit:          d.netProfit          ?? 0,
      expensesByCategory: Array.isArray(d.expensesByCategory) ? d.expensesByCategory : [],
    };
  },
};
