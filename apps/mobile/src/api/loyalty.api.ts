import api from './client';

// ─── Types ──────────────────────────────────────────

export interface LoyaltyAccount {
  readonly id: string;
  readonly customerId: string;
  readonly tenantId: string;
  readonly points: number;
  readonly totalEarned?: number;
  readonly totalRedeemed?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type LoyaltyTxType = 'EARN' | 'REDEEM' | 'ADJUST' | 'EXPIRE';

export interface LoyaltyTransaction {
  readonly id: string;
  readonly customerId: string;
  readonly type: LoyaltyTxType;
  readonly points: number;
  readonly description?: string | null;
  readonly orderId?: string | null;
  readonly createdAt: string;
}

export interface LoyaltyConfig {
  readonly earnRate: number;
  readonly redeemRate: number;
  readonly isActive: boolean;
  readonly minRedeem: number;
}

export interface RedeemResponse {
  readonly pointsRedeemed: number;
  readonly discountAmount: number;
  readonly newBalance: number;
}

export const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  earnRate: 1000,
  redeemRate: 100,
  isActive: true,
  minRedeem: 50,
};

// ─── API ────────────────────────────────────────────

export const loyaltyApi = {
  getConfig: async (): Promise<LoyaltyConfig> => {
    const { data } = await api.get<LoyaltyConfig>('/loyalty/config');
    return data;
  },

  getAccount: async (customerId: string): Promise<LoyaltyAccount | null> => {
    try {
      const { data } = await api.get<LoyaltyAccount>(
        `/loyalty/accounts/${customerId}`,
      );
      return data;
    } catch {
      return null;
    }
  },

  redeem: async (
    customerId: string,
    points: number,
    orderId?: string,
  ): Promise<RedeemResponse> => {
    const { data } = await api.post<RedeemResponse>('/loyalty/redeem', {
      customerId,
      points,
      orderId,
    });
    return data;
  },
};
