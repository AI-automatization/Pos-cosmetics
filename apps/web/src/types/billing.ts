export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export interface BillingPlan {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly?: number | null;
  maxBranches: number;
  maxProducts: number;
  maxUsers: number;
  features: string[];
  trialDays: number;
  sortOrder: number;
  isActive: boolean;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  planId: string;
  plan: BillingPlan;
  status: SubscriptionStatus;
  startedAt?: string | null;
  expiresAt?: string | null;
  trialEndsAt?: string | null;
  cancelledAt?: string | null;
  gracePeriodEndsAt?: string | null;
}

export interface UsageStats {
  branches: { used: number; max: number };
  products: { used: number; max: number };
  users: { used: number; max: number };
  features: string[];
}
