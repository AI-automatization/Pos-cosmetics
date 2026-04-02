'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { loyaltyApi } from '@/api/loyalty.api';
import { extractErrorMessage } from '@/lib/utils';
import { DEFAULT_LOYALTY_CONFIG } from '@/types/loyalty';

export const LOYALTY_KEY = 'loyalty';

export function useLoyaltyConfig() {
  return useQuery({
    queryKey: [LOYALTY_KEY, 'config'],
    queryFn: () => loyaltyApi.getConfig(),
    staleTime: 5 * 60_000,
    retry: false,
    placeholderData: DEFAULT_LOYALTY_CONFIG,
  });
}

export function useLoyaltyAccount(customerId: string | null | undefined) {
  return useQuery({
    queryKey: [LOYALTY_KEY, 'account', customerId],
    queryFn: () => loyaltyApi.getAccount(customerId!),
    enabled: !!customerId,
    staleTime: 30_000,
  });
}

export function useLoyaltyTransactions(customerId: string | null | undefined) {
  return useQuery({
    queryKey: [LOYALTY_KEY, 'transactions', customerId],
    queryFn: () => loyaltyApi.getTransactions(customerId!),
    enabled: !!customerId,
    staleTime: 60_000,
  });
}

export function useRedeemPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      points,
      orderId,
    }: {
      customerId: string;
      points: number;
      orderId?: string;
    }) => loyaltyApi.redeem(customerId, points, orderId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'account', vars.customerId] });
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'transactions', vars.customerId] });
      toast.success('Bonuslar muvaffaqiyatli sarflandi!');
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

/** 1 ball = 100 so'm chegirma (default config) */
export function pointsToMoney(points: number, redeemRate = DEFAULT_LOYALTY_CONFIG.redeemRate) {
  return points * redeemRate;
}

/** 1000 so'm = 1 ball */
export function moneyToPoints(amount: number, earnRate = DEFAULT_LOYALTY_CONFIG.earnRate) {
  return Math.floor(amount / earnRate);
}
