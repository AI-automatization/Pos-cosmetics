export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD';

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  tenantId: string;
  points: number;
  // These fields are not returned by backend yet — kept optional for UI compatibility
  totalEarned?: number;
  totalRedeemed?: number;
  tier?: LoyaltyTier;
  createdAt: string;
  updatedAt: string;
}

export type LoyaltyTxType = 'EARN' | 'REDEEM' | 'ADJUST' | 'EXPIRE';

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: LoyaltyTxType;
  points: number;
  description?: string | null;
  orderId?: string | null;
  createdAt: string;
}

/** Backend LoyaltyConfig — fetched from /loyalty/config */
export interface LoyaltyConfig {
  earnRate: number;    // X so'm = 1 ball (default: 1000)
  redeemRate: number;  // 1 ball = X so'm discount (default: 100)
  isActive: boolean;
  minRedeem: number;   // Minimal points to redeem at once
}

export const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  earnRate: 1000,
  redeemRate: 100,
  isActive: true,
  minRedeem: 50,
};
