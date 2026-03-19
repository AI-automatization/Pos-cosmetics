'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { billingApi } from '@/api/billing.api';
import { extractErrorMessage } from '@/lib/utils';

export const BILLING_KEY = 'billing';

export function useSubscription() {
  return useQuery({
    queryKey: [BILLING_KEY, 'subscription'],
    queryFn: () => billingApi.getSubscription(),
    staleTime: 60_000,
  });
}

export function useBillingPlans() {
  return useQuery({
    queryKey: [BILLING_KEY, 'plans'],
    queryFn: () => billingApi.getPlans(),
    staleTime: 300_000,
  });
}

export function useUsageStats() {
  return useQuery({
    queryKey: [BILLING_KEY, 'usage'],
    queryFn: () => billingApi.getUsage(),
    staleTime: 60_000,
  });
}

export function useUpgradePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planSlug, months }: { planSlug: string; months?: number }) =>
      billingApi.upgrade(planSlug, months),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BILLING_KEY] });
      toast.success('Tarif muvaffaqiyatli yangilandi!');
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}
