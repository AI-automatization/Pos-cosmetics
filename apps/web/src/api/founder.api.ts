import { apiClient } from './client';
import type {
  FounderStats,
  RevenuePoint,
  TenantSummary,
  FounderError,
  TopTenantBar,
} from '@/types/founder';

type AdminMetricsResponse = {
  tenants: { total: number; active: number };
  sales: {
    today: { orders: number; revenue: number };
    month: { orders: number; revenue: number };
  };
};

type AdminTenant = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export const founderApi = {
  /** Backend: GET /admin/metrics — global aggregate metrics */
  getStats: (): Promise<FounderStats> =>
    apiClient.get<AdminMetricsResponse>('/admin/metrics').then((r) => {
      const d = r.data;
      return {
        totalTenants: d.tenants?.total ?? 0,
        activeTenants: d.tenants?.active ?? 0,
        inactiveTenants: (d.tenants?.total ?? 0) - (d.tenants?.active ?? 0),
        totalSalesToday: d.sales?.today?.orders ?? 0,
        totalRevenueToday: d.sales?.today?.revenue ?? 0,
        totalOrdersToday: d.sales?.today?.orders ?? 0,
        totalRevenueMonth: d.sales?.month?.revenue ?? 0,
      } satisfies FounderStats;
    }),

  /** No backend endpoint — hooks fall back to demo data */
  getRevenueSeries: (_days = 14): Promise<RevenuePoint[]> =>
    Promise.reject(new Error('no-endpoint')),

  /** Backend: GET /admin/tenants */
  listTenants: (params?: { search?: string; status?: string }): Promise<TenantSummary[]> =>
    apiClient
      .get<AdminTenant[] | { items: AdminTenant[]; data: AdminTenant[] }>('/admin/tenants', { params })
      .then((r) => {
        const items: AdminTenant[] = Array.isArray(r.data)
          ? r.data
          : (r.data as { items?: AdminTenant[]; data?: AdminTenant[] }).items
            ?? (r.data as { data?: AdminTenant[] }).data
            ?? [];
        return items.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          status: (t.isActive ? 'ACTIVE' : 'INACTIVE') as TenantSummary['status'],
          salesToday: 0,
          revenueToday: 0,
          errorsLast24h: 0,
          lastActivityAt: t.updatedAt ?? t.createdAt,
          createdAt: t.createdAt,
        })) satisfies TenantSummary[];
      }),

  /** Backend: GET /admin/tenants/:id */
  getTenant: (id: string): Promise<TenantSummary> =>
    apiClient.get<AdminTenant>(`/admin/tenants/${id}`).then((r) => {
      const t = r.data;
      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: (t.isActive ? 'ACTIVE' : 'INACTIVE') as TenantSummary['status'],
        salesToday: 0,
        revenueToday: 0,
        errorsLast24h: 0,
        lastActivityAt: t.updatedAt ?? t.createdAt,
        createdAt: t.createdAt,
      } satisfies TenantSummary;
    }),

  /** No backend endpoint — hooks fall back to demo data */
  getTopTenants: (): Promise<TopTenantBar[]> =>
    Promise.reject(new Error('no-endpoint')),

  /** No backend endpoint — hooks fall back to demo data */
  getErrors: (_params?: {
    tenantId?: string;
    type?: string;
    severity?: string;
  }): Promise<FounderError[]> =>
    Promise.reject(new Error('no-endpoint')),
};
