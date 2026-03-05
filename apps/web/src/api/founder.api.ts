import { apiClient } from './client';
import type {
  FounderStats,
  RevenuePoint,
  TenantSummary,
  FounderError,
  TopTenantBar,
} from '@/types/founder';

export const founderApi = {
  getStats: (): Promise<FounderStats> =>
    apiClient.get<FounderStats>('/founder/stats').then((r) => r.data),

  getRevenueSeries: (days = 14): Promise<RevenuePoint[]> =>
    apiClient
      .get<RevenuePoint[]>('/founder/revenue-series', { params: { days } })
      .then((r) => r.data),

  listTenants: (params?: { search?: string; status?: string }): Promise<TenantSummary[]> =>
    apiClient.get<TenantSummary[]>('/founder/tenants', { params }).then((r) => r.data),

  getTenant: (id: string): Promise<TenantSummary> =>
    apiClient.get<TenantSummary>(`/founder/tenants/${id}`).then((r) => r.data),

  getTopTenants: (): Promise<TopTenantBar[]> =>
    apiClient.get<TopTenantBar[]>('/founder/top-tenants').then((r) => r.data),

  getErrors: (params?: {
    tenantId?: string;
    type?: string;
    severity?: string;
  }): Promise<FounderError[]> =>
    apiClient.get<FounderError[]>('/founder/errors', { params }).then((r) => r.data),
};
