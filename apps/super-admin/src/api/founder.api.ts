import { apiClient } from './client';
import type {
  FounderStats,
  RevenuePoint,
  TenantSummary,
  FounderError,
  TopTenantBar,
  DbTableInfo,
  DbTableSchema,
  DbTableData,
  DbStats,
  DbMigration,
  DbQueryResult,
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

  /** Backend: GET /admin/revenue-series?days=N */
  getRevenueSeries: (days = 14): Promise<RevenuePoint[]> =>
    apiClient.get<RevenuePoint[]>('/admin/revenue-series', { params: { days } }).then((r) => r.data),

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

  /** Backend: GET /admin/top-tenants */
  getTopTenants: (): Promise<TopTenantBar[]> =>
    apiClient.get<TopTenantBar[]>('/admin/top-tenants').then((r) => r.data),

  /** Backend: GET /admin/errors?type=&severity=&tenantId=&limit= */
  getErrors: (params?: {
    tenantId?: string;
    type?: string;
    severity?: string;
  }): Promise<FounderError[]> =>
    apiClient.get<FounderError[]>('/admin/errors', { params }).then((r) => r.data),

  // ─── Tenant Management ─────────────────────────────────────────────────────

  getTenantUsers: (id: string) =>
    apiClient.get(`/admin/tenants/${id}/users`).then((r) => r.data),

  getTenantUsage: (id: string) =>
    apiClient.get(`/admin/tenants/${id}/usage`).then((r) => r.data),

  getTenantSubscription: (id: string) =>
    apiClient.get(`/admin/tenants/${id}/subscription`).then((r) => r.data),

  getTenantAuditLog: (id: string, page?: number) =>
    apiClient.get(`/admin/tenants/${id}/audit-log`, { params: { page } }).then((r) => r.data),

  editTenant: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/admin/tenants/${id}`, data).then((r) => r.data),

  deleteTenant: (id: string) =>
    apiClient.delete(`/admin/tenants/${id}`).then((r) => r.data),

  addOwner: (
    tenantId: string,
    data: { firstName: string; lastName: string; email: string; phone?: string; password?: string },
  ) =>
    apiClient.post(`/admin/tenants/${tenantId}/owners`, data).then((r) => r.data),

  impersonateTenant: (tenantId: string) =>
    apiClient.post(`/admin/impersonate/${tenantId}`).then((r) => r.data),

  overrideSubscription: (tenantId: string, data: Record<string, unknown>) =>
    apiClient.post(`/admin/tenants/${tenantId}/subscription`, data).then((r) => r.data),

  // ─── System Health ──────────────────────────────────────────────────────────

  /** GET /admin/dlq/count — failed jobs per queue */
  getDlqCounts: (): Promise<Record<string, number>> =>
    apiClient.get('/admin/dlq/count').then((r) => r.data),

  /** GET /admin/dlq — failed jobs list */
  getDlqJobs: (queue?: string): Promise<{ id: string; name: string; queue: string; failedReason: string; timestamp: string; data: Record<string, unknown> }[]> =>
    apiClient.get('/admin/dlq', { params: { queue, limit: 50 } }).then((r) => r.data),

  /** POST /admin/dlq/:queue/:jobId/retry */
  retryDlqJob: (queue: string, jobId: string) =>
    apiClient.post(`/admin/dlq/${queue}/${jobId}/retry`).then((r) => r.data),

  /** DELETE /admin/dlq/:queue/:jobId */
  dismissDlqJob: (queue: string, jobId: string) =>
    apiClient.delete(`/admin/dlq/${queue}/${jobId}`).then((r) => r.data),

  // ─── Security ──────────────────────────────────────────────────────────────

  /** POST /admin/ip-block */
  blockIp: (ip: string, reason?: string, ttlHours?: number) =>
    apiClient.post('/admin/ip-block', { ip, reason, ttlHours }).then((r) => r.data),

  /** DELETE /admin/ip-unblock/:ip */
  unblockIp: (ip: string) =>
    apiClient.delete(`/admin/ip-unblock/${ip}`).then((r) => r.data),

  /** GET /admin/ip-block/:ip/stats */
  getIpStats: (ip: string): Promise<{ isBlocked: boolean; failedLoginCount: number }> =>
    apiClient.get(`/admin/ip-block/${ip}/stats`).then((r) => r.data),

  // ─── Admin Users ───────────────────────────────────────────────────────────

  /** POST /admin/auth/create — create new admin */
  createAdmin: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/admin/auth/create', data).then((r) => r.data),

  // ─── Database Manager ──────────────────────────────────────────────────────

  db: {
    /** GET /admin/db/tables */
    listTables: (): Promise<DbTableInfo[]> =>
      apiClient.get<DbTableInfo[]>('/admin/db/tables').then((r) => r.data),

    /** GET /admin/db/tables/:name/schema */
    getTableSchema: (tableName: string): Promise<DbTableSchema> =>
      apiClient.get<DbTableSchema>(`/admin/db/tables/${tableName}/schema`).then((r) => r.data),

    /** GET /admin/db/tables/:name/data */
    getTableData: (
      tableName: string,
      params?: { page?: number; limit?: number; tenantId?: string; sort?: string; sortDir?: string },
    ): Promise<DbTableData> =>
      apiClient.get<DbTableData>(`/admin/db/tables/${tableName}/data`, { params }).then((r) => r.data),

    /** GET /admin/db/stats */
    getStats: (): Promise<DbStats> =>
      apiClient.get<DbStats>('/admin/db/stats').then((r) => r.data),

    /** GET /admin/db/migrations */
    getMigrations: (): Promise<DbMigration[]> =>
      apiClient.get<DbMigration[]>('/admin/db/migrations').then((r) => r.data),

    /** GET /admin/db/tables/:name/export */
    getExportUrl: (tableName: string, tenantId?: string): string => {
      const base = `/admin/db/tables/${tableName}/export`;
      return tenantId ? `${base}?tenantId=${tenantId}` : base;
    },

    /** POST /admin/db/tables/:name/rows */
    createRow: (tableName: string, data: Record<string, unknown>): Promise<{ row: Record<string, unknown> }> =>
      apiClient.post(`/admin/db/tables/${tableName}/rows`, { data }).then((r) => r.data),

    /** PATCH /admin/db/tables/:name/rows/:id */
    updateRow: (
      tableName: string,
      id: string,
      data: Record<string, unknown>,
    ): Promise<{ row: Record<string, unknown>; oldValues: Record<string, unknown> }> =>
      apiClient.patch(`/admin/db/tables/${tableName}/rows/${id}`, { data }).then((r) => r.data),

    /** DELETE /admin/db/tables/:name/rows/:id */
    deleteRow: (tableName: string, id: string): Promise<{ deleted: boolean }> =>
      apiClient.delete(`/admin/db/tables/${tableName}/rows/${id}`).then((r) => r.data),

    /** DELETE /admin/db/tables/:name/rows/bulk */
    bulkDelete: (tableName: string, ids: string[]): Promise<{ deleted: number }> =>
      apiClient.delete(`/admin/db/tables/${tableName}/rows/bulk`, { data: { ids } }).then((r) => r.data),

    /** PUT /admin/db/tables/:name/rows/bulk */
    bulkUpdate: (
      tableName: string,
      ids: string[],
      data: Record<string, unknown>,
    ): Promise<{ updated: number }> =>
      apiClient.put(`/admin/db/tables/${tableName}/rows/bulk`, { ids, data }).then((r) => r.data),

    /** POST /admin/db/query — SQL Console */
    executeQuery: (sql: string): Promise<DbQueryResult> =>
      apiClient.post<DbQueryResult>('/admin/db/query', { sql }).then((r) => r.data),
  },
};
