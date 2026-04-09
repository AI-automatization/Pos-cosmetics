import { apiClient } from './client';
import type { Shift, ShiftsQuery } from '@/types/shift';

interface PaginatedShifts {
  items: Shift[];
  total: number;
  page: number;
  limit: number;
}

export const shiftsApi = {
  list(params: ShiftsQuery = {}) {
    return apiClient
      .get<PaginatedShifts>('/sales/shifts', { params })
      .then((r) => {
        const d = r.data as unknown as Record<string, unknown>;
        type RawShift = Shift & { user?: { firstName?: string; lastName?: string } | null };
        const raw = Array.isArray(d) ? d : (d.items as RawShift[]) ?? [];
        return {
          items: raw.map((s: RawShift) => ({
            ...s,
            cashierName: s.user
              ? `${s.user.firstName ?? ''} ${s.user.lastName ?? ''}`.trim() || '—'
              : (s.cashierName ?? '—'),
            salesCount: s.salesCount ?? 0,
            revenue: s.revenue ?? 0,
            cashRevenue: s.cashRevenue ?? 0,
            cardRevenue: s.cardRevenue ?? 0,
          })),
          total: (d.total as number) ?? raw.length,
          page: (d.page as number) ?? 1,
          limit: (d.limit as number) ?? 20,
        };
      });
  },
};
