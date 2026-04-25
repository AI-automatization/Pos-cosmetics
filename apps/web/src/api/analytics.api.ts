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

interface AbcRawRow {
  productId: string;
  productName: string;
  revenue: number;
  revenuePct: number;
  cumulativePct: number;
  category: 'A' | 'B' | 'C';
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
  getSalesTrend(params: { period?: string; from?: string; to?: string; branchId?: string }) {
    return apiClient
      .get<SalesTrendPoint[]>('/analytics/sales-trend', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getTopProducts(params: { from?: string; to?: string; limit?: number; sortBy?: string; branchId?: string }) {
    return apiClient
      .get<TopProduct[]>('/analytics/top-products', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getDeadStock(params: { days?: number; branchId?: string } = {}) {
    return apiClient
      .get<DeadStockItem[]>('/analytics/dead-stock', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getMargin(params: { from?: string; to?: string; categoryId?: string; branchId?: string } = {}) {
    return apiClient
      .get<MarginItem[]>('/analytics/margin', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getAbc(params: { from?: string; to?: string } = {}): Promise<AbcGroup[]> {
    return apiClient
      .get<AbcRawRow[] | AbcGroup[]>('/analytics/abc', { params })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : [];
        if (raw.length === 0) return [];
        // Backend returns flat rows with 'category' field — group them
        if ('category' in raw[0]) {
          const rows = raw as AbcRawRow[];
          const totalRev = rows.reduce((s, r) => s + Number(r.revenue), 0);
          const groups: Record<string, AbcGroup> = {};
          for (const row of rows) {
            const g = row.category;
            if (!groups[g]) {
              groups[g] = { group: g, products: [], totalRevenue: 0, revenueShare: 0 };
            }
            groups[g].products.push({
              productId: row.productId,
              productName: row.productName,
              revenue: Number(row.revenue),
              pct: Number(row.revenuePct),
            });
            groups[g].totalRevenue += Number(row.revenue);
          }
          for (const g of Object.values(groups)) {
            g.revenueShare = totalRev > 0 ? (g.totalRevenue / totalRev) * 100 : 0;
          }
          return (['A', 'B', 'C'] as const)
            .map((k) => groups[k])
            .filter((g): g is AbcGroup => !!g);
        }
        // Already grouped format
        return raw as AbcGroup[];
      });
  },
  getCashierPerformance(params: { from?: string; to?: string; branchId?: string } = {}) {
    return apiClient
      .get<Array<CashierPerf & { firstName?: string; lastName?: string }>>('/analytics/cashier-performance', { params })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : [];
        return raw.map((c) => ({
          ...c,
          name: c.name || `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || null,
        })) as CashierPerf[];
      });
  },
  getHourlyHeatmap(params: { from?: string; to?: string; branchId?: string } = {}) {
    return apiClient
      .get<HeatmapCell[]>('/analytics/hourly-heatmap', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
};
