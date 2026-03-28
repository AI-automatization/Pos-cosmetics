import { apiClient } from './client';
import type {
  DailyRevenue,
  TopProduct,
  ShiftReport,
  DashboardData,
  ProfitSummary,
  DateRangeQuery,
} from '@/types/reports';

export const reportsApi = {
  // B-010 fix: backend has no /reports/dashboard — aggregate from multiple endpoints
  async getDashboard(): Promise<DashboardData> {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

    const fetchProfit = (from: string, to: string): Promise<ProfitSummary | null> =>
      apiClient
        .get<ProfitSummary>('/reports/profit', { params: { from, to } })
        .then((r) => r.data)
        .catch(() => null);

    const [salesSummary, weeklyRevenue, topProducts, lowStockRes, profit, profitYesterday] =
      await Promise.all([
        apiClient
          .get('/reports/sales-summary', { params: { from: today, to: today } })
          .then((r) => r.data),
        apiClient
          .get<DailyRevenue[]>('/reports/daily-revenue', { params: { from: weekAgo, to: today } })
          .then((r) => r.data),
        apiClient
          .get<TopProduct[]>('/reports/top-products', { params: { from: weekAgo, to: today, limit: 5 } })
          .then((r) => r.data),
        apiClient
          .get('/inventory/levels', { params: { lowStock: 'true' } })
          .then((r) => r.data),
        fetchProfit(today, today),
        fetchProfit(yesterday, yesterday),
      ]);

    // B-015 fix: normalize salesSummary shape to what dashboard/page.tsx expects
    // Backend returns { orders: { count, grossRevenue, totalDiscount }, netRevenue }
    // Frontend expects { totalRevenue, ordersCount, netRevenue, discountAmount, averageOrderValue }
    const s = salesSummary ?? {};
    const ordersCount: number = s.orders?.count ?? 0;
    const totalRevenue: number = s.orders?.grossRevenue ?? 0;
    const discountAmount: number = s.orders?.totalDiscount ?? 0;
    const netRevenue: number = s.netRevenue ?? 0;
    const averageOrderValue: number = ordersCount > 0 ? totalRevenue / ordersCount : 0;

    return {
      today: { totalRevenue, ordersCount, netRevenue, discountAmount, averageOrderValue, returnsAmount: s.returns?.total ?? 0 },
      profit,
      profitYesterday,
      weeklyRevenue: Array.isArray(weeklyRevenue) ? weeklyRevenue : [],
      topProducts: Array.isArray(topProducts) ? topProducts : [],
      lowStockCount: Array.isArray(lowStockRes) ? lowStockRes.length : 0,
    };
  },

  getDailyRevenue(params: DateRangeQuery) {
    return apiClient
      .get<DailyRevenue[]>('/reports/daily-revenue', { params })
      .then((r) => {
        const data = r.data;
        if (!Array.isArray(data)) return [];
        return (data as unknown as Record<string, unknown>[]).map((d) => ({
          date: String(d.date ?? ''),
          revenue: Number(d.revenue ?? d.totalRevenue ?? 0),
          ordersCount: Number(d.ordersCount ?? d.orderCount ?? d.orders_count ?? d.count ?? 0),
          discountAmount: Number(d.discountAmount ?? d.totalDiscount ?? 0),
        }));
      });
  },

  getTopProducts(params: DateRangeQuery & { limit?: number }) {
    return apiClient
      .get<TopProduct[]>('/reports/top-products', { params })
      .then((r) => {
        const data = r.data;
        if (!Array.isArray(data)) return [];
        return (data as unknown as Record<string, unknown>[]).map((d) => ({
          productId: String(d.productId ?? d.id ?? ''),
          productName: String(d.productName ?? d.name ?? d.product_name ?? ''),
          quantity: Number(d.quantity ?? d.totalQuantity ?? d.totalQty ?? d.total_quantity ?? d.qty ?? 0),
          revenue: Number(d.revenue ?? d.totalRevenue ?? d.total_revenue ?? 0),
          ordersCount: Number(d.ordersCount ?? d.orders_count ?? d.orderCount ?? 0),
        }));
      });
  },

  // B-010 fix: backend has no /reports/shifts list — use /sales/shifts
  // Note: /sales/shifts returns raw shifts without revenue aggregates (P1 backend task for Polat)
  getShifts(_params: DateRangeQuery) {
    return apiClient
      .get<ShiftReport[]>('/sales/shifts', { params: { limit: 50 } })
      .then((r) => {
        // Normalize backend shift shape to ShiftReport type
        const items = Array.isArray(r.data) ? r.data : (r.data as { items?: ShiftReport[] }).items ?? [];
        return items.map((s: ShiftReport & { id?: string }) => ({
          ...s,
          shiftId: s.shiftId ?? s.id ?? '',
          cashierName: s.cashierName ?? '—',
          openedAt: s.openedAt ?? '',
          closedAt: s.closedAt ?? null,
          ordersCount: s.ordersCount ?? 0,
          cashRevenue: s.cashRevenue ?? 0,
          cardRevenue: s.cardRevenue ?? 0,
          totalRevenue: s.totalRevenue ?? 0,
          openingCash: s.openingCash ?? 0,
          closingCash: s.closingCash ?? null,
          expectedCash: s.expectedCash ?? 0,
          discrepancy: s.discrepancy ?? null,
        }));
      });
  },

  getEmployeeActivity(params: { from?: string; to?: string; userId?: string } = {}) {
    return apiClient
      .get<unknown[]>('/reports/employee-activity', { params })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },

  exportDownload(
    type: 'sales' | 'order-items' | 'products' | 'inventory' | 'customers' | 'debts',
    params: Record<string, string> = {},
  ) {
    return apiClient
      .get(`/reports/export/${type}`, { params, responseType: 'blob' })
      .then((r) => {
        const url = window.URL.createObjectURL(new Blob([r.data as BlobPart]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `${type}-export-${new Date().toISOString().slice(0, 10)}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  },
};
