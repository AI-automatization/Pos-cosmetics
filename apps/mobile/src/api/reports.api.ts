import type { SalesSummary, DailyRevenue, TopProduct } from '@raos/types';
import api from './client';

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
};
