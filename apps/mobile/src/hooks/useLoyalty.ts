import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  loyaltyApi,
  DEFAULT_LOYALTY_CONFIG,
} from '@/api/loyalty.api';
import type {
  LoyaltyAccount,
  LoyaltyConfig,
  RedeemResponse,
} from '@/api/loyalty.api';

// ─── Query hooks ────────────────────────────────────

export function useLoyaltyConfig() {
  return useQuery<LoyaltyConfig>({
    queryKey: ['loyalty-config'],
    queryFn: loyaltyApi.getConfig,
    staleTime: 10 * 60_000, // config rarely changes
    placeholderData: DEFAULT_LOYALTY_CONFIG,
  });
}

export function useLoyaltyAccount(customerId: string | null) {
  return useQuery<LoyaltyAccount | null>({
    queryKey: ['loyalty-account', customerId],
    queryFn: () => loyaltyApi.getAccount(customerId!),
    enabled: !!customerId,
    staleTime: 30_000,
  });
}

// ─── Mutation hooks ─────────────────────────────────

interface RedeemParams {
  readonly customerId: string;
  readonly points: number;
  readonly orderId?: string;
}

export function useRedeemPoints() {
  const queryClient = useQueryClient();

  return useMutation<RedeemResponse, Error, RedeemParams>({
    mutationFn: ({ customerId, points, orderId }) =>
      loyaltyApi.redeem(customerId, points, orderId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['loyalty-account', variables.customerId],
      });
    },
  });
}

// ─── Utility helpers ────────────────────────────────

/** Convert loyalty points to UZS discount amount */
export function pointsToMoney(points: number, redeemRate: number): number {
  return points * redeemRate;
}

/** Convert UZS amount to how many points it would earn */
export function moneyToPoints(amount: number, earnRate: number): number {
  return Math.floor(amount / earnRate);
}
