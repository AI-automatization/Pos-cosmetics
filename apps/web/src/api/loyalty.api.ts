import { apiClient } from './client';
import type { LoyaltyAccount, LoyaltyTransaction, LoyaltyConfig } from '@/types/loyalty';

export const loyaltyApi = {
  getConfig(): Promise<LoyaltyConfig> {
    return apiClient
      .get<LoyaltyConfig>('/loyalty/config')
      .then((r) => r.data);
  },

  getAccount(customerId: string): Promise<LoyaltyAccount | null> {
    return apiClient
      .get<LoyaltyAccount>(`/loyalty/account/${customerId}`)
      .then((r) => r.data)
      .catch(() => null);
  },

  getTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    return apiClient
      .get<LoyaltyTransaction[] | { items: LoyaltyTransaction[] }>(
        `/loyalty/transactions/${customerId}`,
      )
      .then((r) => (Array.isArray(r.data) ? r.data : (r.data?.items ?? [])))
      .catch(() => []);
  },

  redeem(customerId: string, points: number, orderId?: string): Promise<LoyaltyAccount> {
    return apiClient
      .post<LoyaltyAccount>('/loyalty/redeem', { customerId, points, orderId })
      .then((r) => r.data);
  },
};
