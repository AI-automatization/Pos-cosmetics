import { api } from './client';

// ─── Types ─────────────────────────────────────────────────
export type SubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELLED'
  | 'EXPIRED';

export interface SubscriptionPlan {
  id:           string;
  name:         string;
  slug:         string;
  priceMonthly: number;
  maxBranches:  number;
  maxProducts:  number;
  maxUsers:     number;
  trialDays:    number;
  features:     Record<string, unknown>;
  isActive:     boolean;
  sortOrder:    number;
}

export interface TenantSubscription {
  id:           string;
  planId:       string;
  status:       SubscriptionStatus;
  startedAt:    string;
  expiresAt:    string | null;
  trialEndsAt:  string | null;
  plan:         SubscriptionPlan;
}

export interface BillingUsage {
  branches: { used: number; max: number };
  products: { used: number; max: number };
  users:    { used: number; max: number };
}

// ─── API ───────────────────────────────────────────────────
export const billingApi = {
  getSubscription: (): Promise<TenantSubscription> =>
    api.get<TenantSubscription>('/billing/subscription').then(r => r.data),

  getPlans: (): Promise<SubscriptionPlan[]> =>
    api.get<SubscriptionPlan[]>('/billing/plans').then(r => r.data),

  getUsage: (): Promise<BillingUsage> =>
    api.get<BillingUsage>('/billing/usage').then(r => r.data),
};
