import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';
import { PaginatedResponse } from './inventory.api';

export type AgingBucketKey = '0_30' | '31_60' | '61_90' | '90_plus';

export interface CustomerDebt {
  readonly customerId: string;
  readonly customerName: string;
  readonly phone: string;
  readonly branchName: string;
  readonly totalDebt: number;
  readonly overdueAmount: number;
  readonly daysSinceLastPayment: number;
  readonly agingBucket: AgingBucketKey;
  readonly lastPurchaseDate: string;
}

export interface DebtSummary {
  totalDebt: number;
  overdueDebt: number;
  overdueCount: number;
  debtorCount: number;
  avgDebt: number;
}

export interface AgingBucket {
  label: string;
  amount: number;
  customerCount: number;
  bucket: AgingBucketKey;
}

export interface AgingReport {
  buckets: AgingBucket[];
}

export interface DebtCustomersParams {
  branchId?: string | null;
  agingBucket?: AgingBucketKey;
  sort?: 'amount' | 'days';
  page?: number;
  limit?: number;
}

export const debtsApi = {
  async getSummary(branchId?: string | null): Promise<DebtSummary> {
    const { data } = await apiClient.get<DebtSummary>(ENDPOINTS.DEBTS_SUMMARY, {
      params: { branch_id: branchId ?? undefined },
    });
    return data;
  },

  async getAgingReport(branchId?: string | null): Promise<AgingReport> {
    const { data } = await apiClient.get<AgingReport>(ENDPOINTS.DEBTS_AGING_REPORT, {
      params: { branch_id: branchId ?? undefined },
    });
    return data;
  },

  async getCustomers(params: DebtCustomersParams): Promise<PaginatedResponse<CustomerDebt>> {
    const { data } = await apiClient.get<PaginatedResponse<CustomerDebt>>(ENDPOINTS.DEBTS_CUSTOMERS, {
      params: {
        branch_id: params.branchId ?? undefined,
        aging_bucket: params.agingBucket,
        sort: params.sort,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return data;
  },

  async getCustomerById(id: string): Promise<CustomerDebt> {
    const { data } = await apiClient.get<CustomerDebt>(`${ENDPOINTS.DEBTS_CUSTOMERS}/${id}`);
    return data;
  },
};
