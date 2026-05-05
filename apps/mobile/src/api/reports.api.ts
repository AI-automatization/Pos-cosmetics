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
};
