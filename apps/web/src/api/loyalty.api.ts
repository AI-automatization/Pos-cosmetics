import { apiClient } from './client';
import type { LoyaltyAccount, LoyaltyTransaction, LoyaltyConfig } from '@/types/loyalty';

export interface LoyaltyStats {
  activeCustomers: number;
  todayEarned: number;
  todayRedeemed: number;
  totalPoints: number;
}

export interface PaginatedAccounts {
  items: (LoyaltyAccount & { customer?: { id: string; name: string; phone?: string | null } })[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedTransactions {
  items: (LoyaltyTransaction & { customer?: { id: string; name: string } })[];
  total: number;
  page: number;
  limit: number;
}

export interface AdjustPointsDto {
  customerId: string;
  points: number;
  description?: string;
}

export interface EarnPointsDto {
  customerId: string;
  amount: number;
  orderId?: string;
}

export const loyaltyApi = {
  getConfig(): Promise<LoyaltyConfig> {
    return apiClient
      .get<LoyaltyConfig>('/loyalty/config')
      .then((r) => r.data);
  },

  updateConfig(dto: Partial<LoyaltyConfig>): Promise<LoyaltyConfig> {
    return apiClient
      .patch<LoyaltyConfig>('/loyalty/config', dto)
      .then((r) => r.data);
  },

  getStats(): Promise<LoyaltyStats> {
    return apiClient
      .get<LoyaltyStats>('/loyalty/stats')
      .then((r) => r.data);
  },

  getAccount(customerId: string): Promise<LoyaltyAccount | null> {
    return apiClient
      .get<LoyaltyAccount>(`/loyalty/accounts/${customerId}`)
      .then((r) => r.data)
      .catch(() => null);
  },

  listAccounts(params: {
    page?: number;
    limit?: number;
    minPoints?: number;
  }): Promise<PaginatedAccounts> {
    return apiClient
      .get<PaginatedAccounts>('/loyalty/accounts', { params })
      .then((r) => r.data);
  },

  listTransactions(params: {
    page?: number;
    limit?: number;
    type?: string;
    customerId?: string;
  }): Promise<PaginatedTransactions> {
    return apiClient
      .get<PaginatedTransactions>('/loyalty/transactions', { params })
      .then((r) => r.data);
  },

  getTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    return apiClient
      .get<LoyaltyTransaction[] | { items: LoyaltyTransaction[] }>(
        `/loyalty/transactions`,
        { params: { customerId, limit: 50 } },
      )
      .then((r) => (Array.isArray(r.data) ? r.data : (r.data?.items ?? [])))
      .catch(() => []);
  },

  redeem(customerId: string, points: number, orderId?: string): Promise<LoyaltyAccount> {
    return apiClient
      .post<LoyaltyAccount>('/loyalty/redeem', { customerId, points, orderId })
      .then((r) => r.data);
  },

  earnPoints(dto: EarnPointsDto): Promise<LoyaltyAccount> {
    return apiClient
      .post<LoyaltyAccount>('/loyalty/earn', dto)
      .then((r) => r.data);
  },

  adjustPoints(dto: AdjustPointsDto): Promise<LoyaltyAccount> {
    return apiClient
      .post<LoyaltyAccount>('/loyalty/adjust', dto)
      .then((r) => r.data);
  },
};
