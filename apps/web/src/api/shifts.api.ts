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
        const raw = Array.isArray(d) ? d : (d.items as Shift[]) ?? [];
        return {
          items: raw.map((s: Shift & { id?: string }) => ({
            ...s,
            cashierName: s.cashierName ?? '—',
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
