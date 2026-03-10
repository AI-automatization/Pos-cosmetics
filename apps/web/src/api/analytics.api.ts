import { apiClient } from './client';

export interface SalesTrendPoint {
  period: string;
  revenue: number;
  orders: number;
  avgBasket: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  qtySold: number;
  revenue: number;
  costTotal: number;
  margin: number;
}

export interface DeadStockItem {
  productId: string;
  productName: string;
  sku: string | null;
  totalStock: number;
  lastSoldAt: string | null;
  carryingCost: number;
  daysIdle: number;
}

export interface MarginItem {
  productId: string;
  productName: string;
  categoryName: string | null;
  revenue: number;
  costTotal: number;
  grossProfit: number;
  marginPct: number;
  qtySold: number;
}

export interface AbcGroup {
  group: 'A' | 'B' | 'C';
  products: { productId: string; productName: string; revenue: number; pct: number }[];
  totalRevenue: number;
  revenueShare: number;
}

export interface CashierPerf {
  userId: string;
  name: string;
  ordersCount: number;
  revenue: number;
  avgBasket: number;
  returnsCount: number;
}

export interface HeatmapCell {
  hour: number;
  dow: number;
  ordersCount: number;
  revenue: number;
}

export const analyticsApi = {
  getSalesTrend(params: { period?: string; from?: string; to?: string }) {
    return apiClient
      .get<SalesTrendPoint[]>('/analytics/sales-trend', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getTopProducts(params: { from?: string; to?: string; limit?: number; sortBy?: string }) {
    return apiClient
      .get<TopProduct[]>('/analytics/top-products', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getDeadStock(params: { days?: number } = {}) {
    return apiClient
      .get<DeadStockItem[]>('/analytics/dead-stock', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getMargin(params: { from?: string; to?: string; categoryId?: string } = {}) {
    return apiClient
      .get<MarginItem[]>('/analytics/margin', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getAbc(params: { from?: string; to?: string } = {}) {
    return apiClient
      .get<AbcGroup[]>('/analytics/abc', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getCashierPerformance(params: { from?: string; to?: string } = {}) {
    return apiClient
      .get<CashierPerf[]>('/analytics/cashier-performance', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getHourlyHeatmap(params: { from?: string; to?: string } = {}) {
    return apiClient
      .get<HeatmapCell[]>('/analytics/hourly-heatmap', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
};
