// ─── ABC Analysis (shared between mobile + mobile-owner) ──────────

export interface AbcRawRow {
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

export function mapAbcGroups(rows: AbcRawRow[]): AbcGroup[] {
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

// ─── Dead Stock (shared) ──────────────────────────────────────────

export interface DeadStockItem {
  readonly productId: string;
  readonly productName: string;
  readonly sku: string | null;
  readonly totalStock: number;
  readonly lastSoldAt: string | null;
  readonly carryingCost: number;
  readonly daysIdle: number;
}

// ─── Branch Comparison (shared) ───────────────────────────────────

export interface BranchComparisonItem {
  branchId: string;
  branchName: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

// ─── System Health (shared) ───────────────────────────────────────

export interface ServiceStatus {
  readonly status: 'healthy' | 'degraded' | 'error';
  readonly responseMs?: number;
  readonly message?: string;
}

export interface SystemError {
  readonly id: string;
  readonly level: 'error' | 'warn' | 'info';
  readonly message: string;
  readonly occurredAt: string;
  readonly service: string;
}
