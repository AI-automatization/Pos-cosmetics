import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';
import { PaginatedResponse } from './inventory.api';

export interface PaymentBreakdown {
  readonly method: 'cash' | 'terminal' | 'click' | 'payme' | 'transfer';
  readonly amount: number;
  readonly percentage: number;
}

export interface Shift {
  readonly id: string;
  readonly branchId: string;
  readonly branchName: string;
  readonly cashierId: string;
  readonly cashierName: string;
  readonly openedAt: string;
  readonly closedAt: string | null;
  readonly status: 'open' | 'closed';
  readonly totalRevenue: number;
  readonly totalOrders: number;
  readonly avgOrderValue: number;
  readonly totalRefunds: number;
  readonly totalVoids: number;
  readonly totalDiscounts: number;
  readonly paymentBreakdown: PaymentBreakdown[];
}

export interface ShiftSummary {
  totalRevenue: number;
  totalOrders: number;
  totalShifts: number;
  avgRevenuePerShift: number;
}

export interface ShiftsParams {
  branchId?: string | null;
  fromDate?: string;
  toDate?: string;
  cashierId?: string;
  status?: 'open' | 'closed';
  page?: number;
  limit?: number;
}

export const shiftsApi = {
  async getShifts(params: ShiftsParams): Promise<PaginatedResponse<Shift>> {
    const { data } = await apiClient.get<PaginatedResponse<Shift>>(ENDPOINTS.SHIFTS, {
      params: {
        branch_id: params.branchId ?? undefined,
        from_date: params.fromDate,
        to_date: params.toDate,
        cashier_id: params.cashierId,
        status: params.status,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return data;
  },

  async getShiftById(id: string): Promise<Shift> {
    const { data } = await apiClient.get<Shift>(`${ENDPOINTS.SHIFTS}/${id}`);
    return data;
  },

  async getShiftSummary(params: ShiftsParams): Promise<ShiftSummary> {
    const { data } = await apiClient.get<ShiftSummary>(ENDPOINTS.SHIFTS_SUMMARY, {
      params: {
        branch_id: params.branchId ?? undefined,
        from_date: params.fromDate,
        to_date: params.toDate,
      },
    });
    return data;
  },
};
