import { api } from './client';

export interface RevenueData {
  period: 'daily' | 'weekly' | 'monthly';
  amount: number;
  currency: string;
  trend: number;
  branchId?: string;
  branchName?: string;
}

export interface BranchRevenue {
  branchId: string;
  branchName: string;
  revenue: number;
  trend: number;
}

export interface InsightItem {
  id: string;
  type: 'TREND' | 'DEADSTOCK' | 'MARGIN' | 'FORECAST';
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
}

export interface BranchRevenueItem {
  branchId: string;
  branchName: string;
  revenue: number;
  orders: number;
  stockValue: number;
}

export interface BranchComparisonItem {
  branchId: string;
  branchName: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface SalesTrendPoint {
  date: string;
  period: string;
  revenue: number;
  orders: number;
  avgBasket: number;
}

export const analyticsApi = {
  getRevenue: async (branchId?: string): Promise<RevenueData[]> => {
    const { data } = await api.get<RevenueData[]>('/analytics/revenue', {
      params: { branchId },
    });
    return data;
  },

  getBranchComparison: async (): Promise<BranchRevenue[]> => {
    const { data } = await api.get<BranchRevenue[]>('/analytics/branches/comparison');
    return data;
  },

  getInsights: async (branchId?: string): Promise<InsightItem[]> => {
    const { data } = await api.get<InsightItem[]>('/analytics/insights', {
      params: { branchId },
    });
    return data;
  },

  getRevenueByBranch: async (period?: string): Promise<BranchRevenueItem[]> => {
    const { data } = await api.get<BranchRevenueItem[]>('/analytics/branches/revenue', {
      params: { period },
    });
    return data;
  },

  getSalesTrend: async (params: {
    period?: string;
    from?: string;
    to?: string;
    branchId?: string;
  }): Promise<SalesTrendPoint[]> => {
    const res = await api.get('/analytics/sales-trend', { params });
    return Array.isArray(res.data) ? res.data : [];
  },
};
