import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';

export interface AnalyticsParams {
  branchId?: string | null;
  period?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SalesTrendParams extends AnalyticsParams {
  granularity?: 'day' | 'week' | 'month';
}

export interface TopProductsParams extends AnalyticsParams {
  limit?: number;
}

export interface RevenueData {
  today: number;
  week: number;
  month: number;
  year: number;
  todayTrend: number;
  weekTrend: number;
  monthTrend: number;
  yearTrend: number;
}

export interface OrdersData {
  total: number;
  avgOrderValue: number;
  trend: number;
}

export interface SalesTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface BranchComparisonItem {
  branchId: string;
  branchName: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  revenue: number;
  quantity: number;
}

export interface BranchRevenueItem {
  branchId: string;
  name: string;
  revenue: number;
  stockValue: number;
  orders: number;
}

export const analyticsApi = {
  async getRevenue(params: AnalyticsParams): Promise<RevenueData> {
    const { data } = await apiClient.get<RevenueData>(ENDPOINTS.ANALYTICS_REVENUE, {
      params: {
        branch_id: params.branchId ?? undefined,
        period: params.period,
        from_date: params.fromDate,
        to_date: params.toDate,
      },
    });
    return data;
  },

  async getOrders(params: AnalyticsParams): Promise<OrdersData> {
    const { data } = await apiClient.get<OrdersData>(ENDPOINTS.ANALYTICS_ORDERS, {
      params: {
        branch_id: params.branchId ?? undefined,
        period: params.period,
        from_date: params.fromDate,
        to_date: params.toDate,
      },
    });
    return data;
  },

  async getSalesTrend(params: SalesTrendParams): Promise<SalesTrendPoint[]> {
    const { data } = await apiClient.get<SalesTrendPoint[]>(ENDPOINTS.ANALYTICS_SALES_TREND, {
      params: {
        branch_id: params.branchId ?? undefined,
        from_date: params.fromDate,
        to_date: params.toDate,
        granularity: params.granularity ?? 'day',
      },
    });
    return data;
  },

  async getBranchComparison(params: AnalyticsParams): Promise<BranchComparisonItem[]> {
    const { data } = await apiClient.get<BranchComparisonItem[]>(ENDPOINTS.ANALYTICS_BRANCH_COMPARISON, {
      params: {
        period: params.period,
        from_date: params.fromDate,
        to_date: params.toDate,
      },
    });
    return data;
  },

  async getTopProducts(params: TopProductsParams): Promise<TopProduct[]> {
    const { data } = await apiClient.get<TopProduct[]>(ENDPOINTS.ANALYTICS_TOP_PRODUCTS, {
      params: {
        branch_id: params.branchId ?? undefined,
        period: params.period,
        from_date: params.fromDate,
        to_date: params.toDate,
        limit: params.limit ?? 10,
      },
    });
    return data;
  },

  async getRevenueByBranch(params: AnalyticsParams): Promise<BranchRevenueItem[]> {
    const { data } = await apiClient.get<BranchRevenueItem[]>(ENDPOINTS.ANALYTICS_REVENUE_BY_BRANCH, {
      params: {
        period: params.period,
        from_date: params.fromDate,
        to_date: params.toDate,
      },
    });
    return data;
  },
};
