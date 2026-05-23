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

// ─── ABC Analysis types ──────────────────────────────────
interface AbcRawRow {
  productId: string;
  productName: string;
  revenue: number;
  revenuePct: number;
  cumulativePct: number;
  category: 'A' | 'B' | 'C';
}

export interface AbcProduct {
  readonly productId: string;
  readonly productName: string;
  readonly revenue: number;
  readonly pct: number;
}

export interface AbcGroup {
  readonly group: 'A' | 'B' | 'C';
  readonly products: AbcProduct[];
  readonly totalRevenue: number;
  readonly revenueShare: number;
}

function mapAbcGroups(rows: AbcRawRow[]): AbcGroup[] {
  const grouped: Record<string, AbcProduct[]> = { A: [], B: [], C: [] };
  for (const r of rows) {
    const key = r.category ?? 'C';
    (grouped[key] ??= []).push({
      productId: r.productId,
      productName: r.productName,
      revenue: Number(r.revenue ?? 0),
      pct: Number(r.revenuePct ?? 0),
    });
  }
  const grandTotal = rows.reduce((s, r) => s + Number(r.revenue ?? 0), 0);
  return (['A', 'B', 'C'] as const).map((g) => {
    const products = grouped[g] ?? [];
    const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
    return {
      group: g,
      products,
      totalRevenue,
      revenueShare: grandTotal > 0 ? (totalRevenue / grandTotal) * 100 : 0,
    };
  });
}

// ─── Dead Stock types ───────────────────────────────────
export interface DeadStockItem {
  readonly productId: string;
  readonly productName: string;
  readonly sku: string | null;
  readonly totalStock: number;
  readonly lastSoldAt: string | null;
  readonly carryingCost: number;
  readonly daysIdle: number;
}

/** Branch comparison report item for owner reports */
export interface BranchReport {
  readonly branchId: string;
  readonly branchName: string;
  readonly revenue: number;
  readonly orders: number;
  readonly avgOrderValue: number;
  readonly growth: number;
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

  async getBranchReport(period?: string): Promise<BranchReport[]> {
    try {
      const { data } = await apiClient.get<BranchReport[] | { items: BranchReport[] }>(
        ENDPOINTS.ANALYTICS_REVENUE_BY_BRANCH,
        { params: { period } },
      );
      if (Array.isArray(data)) return data;
      if (Array.isArray((data as { items: BranchReport[] }).items)) {
        return (data as { items: BranchReport[] }).items;
      }
      return [];
    } catch {
      return [];
    }
  },

  async getAbcAnalysis(from?: string, to?: string): Promise<AbcGroup[]> {
    try {
      const { data } = await apiClient.get<AbcRawRow[]>('/analytics/abc', {
        params: { from, to },
      });
      const rows = Array.isArray(data) ? data : [];
      return mapAbcGroups(rows);
    } catch {
      return [];
    }
  },

  async getDeadStock(days = 90): Promise<DeadStockItem[]> {
    try {
      const res = await apiClient.get('/analytics/dead-stock', { params: { days } });
      const raw = Array.isArray(res.data) ? res.data : [];
      return raw.map((r: Record<string, unknown>) => ({
        productId: String(r.productId ?? ''),
        productName: String(r.productName ?? ''),
        sku: r.sku != null ? String(r.sku) : null,
        totalStock: Number(r.totalStock ?? 0),
        lastSoldAt: r.lastSoldAt != null ? String(r.lastSoldAt) : null,
        carryingCost: Number(r.carryingCost ?? 0),
        daysIdle: Number(r.daysIdle ?? 0),
      }));
    } catch {
      return [];
    }
  },
};
