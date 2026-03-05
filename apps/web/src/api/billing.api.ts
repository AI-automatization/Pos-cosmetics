import { apiClient } from './client';
import type { BillingPlan, TenantSubscription, UsageStats } from '@/types/billing';

export const billingApi = {
  getSubscription() {
    return apiClient.get<TenantSubscription>('/billing/subscription').then((r) => r.data);
  },

  getPlans() {
    return apiClient
      .get<BillingPlan[]>('/billing/plans')
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },

  getUsage() {
    return apiClient.get<UsageStats>('/billing/usage').then((r) => r.data);
  },

  upgrade(planSlug: string, months = 1) {
    return apiClient
      .post<TenantSubscription>('/billing/upgrade', { planSlug, months })
      .then((r) => r.data);
  },
};
