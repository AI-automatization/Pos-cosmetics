import { apiClient } from './client';
import type { Shift, ShiftsQuery } from '@/types/shift';

interface RawShift extends Shift {
  user?: { firstName?: string; lastName?: string } | null;
  totalRevenue?: number;
  totalOrders?: number;
  paymentBreakdown?: { cash?: number; card?: number };
}

interface PaginatedShifts {
  items: RawShift[];
  total: number;
  page: number;
  limit: number;
}

export const shiftsApi = {
  list(params: ShiftsQuery = {}) {
    return apiClient
      .get<PaginatedShifts | RawShift[]>('/sales/shifts', { params })
      .then((r) => {
        const d = r.data;
        const raw: RawShift[] = Array.isArray(d) ? d : d.items ?? [];
        const paginated = Array.isArray(d) ? null : d;
        return {
          items: raw.map((s) => ({
            ...s,
            cashierName: s.user
              ? `${s.user.firstName ?? ''} ${s.user.lastName ?? ''}`.trim() || '—'
              : (s.cashierName ?? '—'),
            salesCount: s.totalOrders ?? s.salesCount ?? 0,
            revenue: s.totalRevenue ?? s.revenue ?? 0,
            cashRevenue: s.paymentBreakdown?.cash ?? s.cashRevenue ?? 0,
            cardRevenue: s.paymentBreakdown?.card ?? s.cardRevenue ?? 0,
          })),
          total: paginated?.total ?? raw.length,
          page: paginated?.page ?? 1,
          limit: paginated?.limit ?? 20,
        };
      });
  },
};
