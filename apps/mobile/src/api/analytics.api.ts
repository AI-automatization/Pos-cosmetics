import { api } from './client';
import type { AbcRawRow, AbcGroup, BranchComparisonItem, DeadStockItem } from '@raos/types';
import { mapAbcGroups } from '@raos/types';

export type { AbcGroup, AbcProduct, DeadStockItem, BranchComparisonItem } from '@raos/types';

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

export interface SalesTrendPoint {
  date: string;
  period: string;
  revenue: number;
  orders: number;
  avgBasket: number;
}

// ─── Raw API response types (backend field mapping) ─────
/** Raw shape returned by GET /analytics/branch-comparison */
interface BranchComparisonRaw {
  readonly branchId?: string;
  readonly id?: string;
  readonly branchName?: string;
  readonly name?: string;
  readonly revenue?: number;
  readonly orders?: number;
  readonly orderCount?: number;
  readonly avgOrderValue?: number;
}

/** Raw shape returned by GET /analytics/revenue-by-branch */
interface RevenueByBranchRaw {
  readonly branchId?: string;
  readonly id?: string;
  readonly branchName?: string;
  readonly name?: string;
  readonly revenue?: number;
  readonly totalRevenue?: number;
  readonly total?: number;
  readonly sales?: number;
  readonly orders?: number;
  readonly orderCount?: number;
  readonly count?: number;
  readonly stockValue?: number;
  readonly stock?: number;
}

/** Raw shape returned by GET /analytics/dead-stock */
interface DeadStockRaw {
  readonly productId?: string;
  readonly productName?: string;
  readonly sku?: string | null;
  readonly totalStock?: number | string;
  readonly lastSoldAt?: string | null;
  readonly carryingCost?: number | string;
  readonly daysIdle?: number | string;
}

/** Raw shape returned by GET /analytics/cashier-performance */
interface CashierPerfRaw {
  readonly userId?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly ordersCount?: number | string;
  readonly revenue?: number | string;
  readonly avgBasket?: number | string;
  readonly returnsCount?: number | string;
  readonly shiftsCount?: number | string;
}

/** Raw shape returned by GET /analytics/margin */
interface MarginRaw {
  readonly productId?: string;
  readonly productName?: string;
  readonly categoryName?: string | null;
  readonly revenue?: number | string;
  readonly costTotal?: number | string;
  readonly grossProfit?: number | string;
  readonly marginPct?: number | string;
  readonly qtySold?: number | string;
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

// ─── Cashier Performance types ──────────────────────────
export interface CashierPerfItem {
  readonly userId: string;
  readonly name: string;
  readonly ordersCount: number;
  readonly revenue: number;
  readonly avgBasket: number;
  readonly returnsCount: number;
  readonly shiftsCount: number;
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
    return raw.map((b: BranchComparisonRaw) => ({
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
      return raw.map((b: RevenueByBranchRaw) => ({
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

  getDeadStock: async (days = 90): Promise<DeadStockItem[]> => {
    try {
      const res = await api.get('/analytics/dead-stock', { params: { days } });
      const raw = Array.isArray(res.data) ? res.data : [];
      return raw.map((r: DeadStockRaw) => ({
        productId: r.productId ?? '',
        productName: r.productName ?? '',
        sku: r.sku ?? null,
        totalStock: Number(r.totalStock ?? 0),
        lastSoldAt: r.lastSoldAt ?? null,
        carryingCost: Number(r.carryingCost ?? 0),
        daysIdle: Number(r.daysIdle ?? 0),
      }));
    } catch {
      return [];
    }
  },

  getCashierPerformance: async (from?: string, to?: string): Promise<CashierPerfItem[]> => {
    try {
      const res = await api.get('/analytics/cashier-performance', { params: { from, to } });
      const raw = Array.isArray(res.data) ? res.data : [];
      return raw.map((r: CashierPerfRaw) => ({
        userId: r.userId ?? '',
        name: [r.firstName, r.lastName].filter(Boolean).join(' ') || 'Nomsiz',
        ordersCount: Number(r.ordersCount ?? 0),
        revenue: Number(r.revenue ?? 0),
        avgBasket: Number(r.avgBasket ?? 0),
        returnsCount: Number(r.returnsCount ?? 0),
        shiftsCount: Number(r.shiftsCount ?? 0),
      }));
    } catch {
      return [];
    }
  },

  getMarginAnalysis: async (from?: string, to?: string): Promise<MarginItem[]> => {
    try {
      const res = await api.get('/analytics/margin', { params: { from, to } });
      const raw = Array.isArray(res.data) ? res.data : [];
      return raw.map((r: MarginRaw) => ({
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
