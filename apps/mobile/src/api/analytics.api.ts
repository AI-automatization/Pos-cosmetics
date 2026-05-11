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

// ─── Margin Analysis types ──────────────────────────────
export interface MarginItem {
  readonly productId: string;
  readonly productName: string;
  readonly categoryName: string | null;
  readonly revenue: number;
  readonly costTotal: number;
  readonly grossProfit: number;
  readonly marginPct: number;
  readonly qtySold: number;
}

export const analyticsApi = {
  getRevenue: async (branchId?: string): Promise<RevenueData[]> => {
    const { data } = await api.get<RevenueData[]>('/analytics/revenue', {
      params: { branchId },
    });
    return data;
  },

  getBranchComparison: async (): Promise<BranchComparisonItem[]> => {
    const res = await api.get('/analytics/branch-comparison');
    const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data?.items ?? []);
    return raw.map((b: any) => ({
      branchId:      b.branchId      ?? b.id      ?? '',
      branchName:    b.branchName    ?? b.name    ?? '',
      revenue:       b.revenue       ?? 0,
      orders:        b.orders        ?? b.orderCount ?? 0,
      avgOrderValue: b.avgOrderValue ?? 0,
    }));
  },

  getInsights: async (branchId?: string): Promise<InsightItem[]> => {
    const { data } = await api.get<InsightItem[]>('/analytics/insights', {
      params: { branchId },
    });
    return data;
  },

  getRevenueByBranch: async (period?: string): Promise<BranchRevenueItem[]> => {
    try {
      const res = await api.get('/analytics/revenue-by-branch', { params: { period } });
      const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data?.items ?? []);
      return raw.map((b: any) => ({
        branchId:   b.branchId   ?? b.id   ?? '',
        branchName: b.branchName ?? b.name ?? '',
        revenue:    b.revenue    ?? b.totalRevenue ?? b.total ?? b.sales ?? 0,
        orders:     b.orders     ?? b.orderCount   ?? b.count ?? 0,
        stockValue: b.stockValue ?? b.stock        ?? 0,
      }));
    } catch {
      return [];
    }
  },

  getAbcAnalysis: async (from?: string, to?: string): Promise<AbcGroup[]> => {
    try {
      const { data } = await api.get<AbcRawRow[]>('/analytics/abc', {
        params: { from, to },
      });
      const rows = Array.isArray(data) ? data : [];
      return mapAbcGroups(rows);
    } catch {
      return [];
    }
  },

  getMarginAnalysis: async (from?: string, to?: string): Promise<MarginItem[]> => {
    try {
      const res = await api.get('/analytics/margin', { params: { from, to } });
      const raw = Array.isArray(res.data) ? res.data : [];
      return raw.map((r: any) => ({
        productId: r.productId ?? '',
        productName: r.productName ?? '',
        categoryName: r.categoryName ?? null,
        revenue: Number(r.revenue ?? 0),
        costTotal: Number(r.costTotal ?? 0),
        grossProfit: Number(r.grossProfit ?? 0),
        marginPct: Number(r.marginPct ?? 0),
        qtySold: Number(r.qtySold ?? 0),
      }));
    } catch {
      return [];
    }
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
