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

/** Shift report with cash reconciliation fields */
export interface ShiftReport {
  readonly id: string;
  readonly cashierName: string;
  readonly branchName: string;
  readonly openedAt: string;
  readonly closedAt: string | null;
  readonly status: 'open' | 'closed';
  readonly totalRevenue: number;
  readonly totalOrders: number;
  readonly cashRevenue: number;
  readonly cardRevenue: number;
  readonly openingCash: number;
  readonly expectedCash: number;
  readonly closingCash: number | null;
  readonly discrepancy: number | null;
}

export interface ShiftReportParams {
  from?: string;
  to?: string;
  branchId?: string | null;
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

  async getShiftReports(params: ShiftReportParams): Promise<ShiftReport[]> {
    const { data } = await apiClient.get<ShiftReport[] | { items: ShiftReport[] }>(
      ENDPOINTS.SHIFTS,
      {
        params: {
          from_date: params.from,
          to_date: params.to,
          branch_id: params.branchId ?? undefined,
          include_cash: true,
          limit: 100,
        },
      },
    );
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as { items: ShiftReport[] }).items)) {
      return (data as { items: ShiftReport[] }).items;
    }
    return [];
  },
};
