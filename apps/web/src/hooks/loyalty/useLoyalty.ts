'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { loyaltyApi } from '@/api/loyalty.api';
import type { AdjustPointsDto, EarnPointsDto } from '@/api/loyalty.api';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
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

export function useUpdateLoyaltyConfig() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: Partial<typeof DEFAULT_LOYALTY_CONFIG>) =>
      loyaltyApi.updateConfig(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'config'] });
      toast.success(t('toast.settingsSaved'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useLoyaltyStats() {
  return useQuery({
    queryKey: [LOYALTY_KEY, 'stats'],
    queryFn: () => loyaltyApi.getStats(),
    staleTime: 60_000,
    retry: false,
  });
}

export function useLoyaltyAccounts(page: number, limit: number, minPoints?: number) {
  return useQuery({
    queryKey: [LOYALTY_KEY, 'accounts', page, limit, minPoints],
    queryFn: () => loyaltyApi.listAccounts({ page, limit, minPoints }),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useLoyaltyTransactions(
  page: number,
  limit: number,
  type?: string,
  customerId?: string,
) {
  return useQuery({
    queryKey: [LOYALTY_KEY, 'transactions', page, limit, type, customerId],
    queryFn: () =>
      loyaltyApi.listTransactions({
        page,
        limit,
        type: type || undefined,
        customerId: customerId || undefined,
      }),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
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

export function useAdjustPoints() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: AdjustPointsDto) => loyaltyApi.adjustPoints(dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'accounts'] });
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'account', vars.customerId] });
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'transactions'] });
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'stats'] });
      toast.success(t('toast.pointsAdjusted'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useEarnPoints() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: EarnPointsDto) => loyaltyApi.earnPoints(dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'accounts'] });
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'account', vars.customerId] });
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'transactions'] });
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'stats'] });
      toast.success(t('toast.pointsEarned'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useRedeemPoints() {
  const qc = useQueryClient();
  const { t } = useTranslation();
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
      qc.invalidateQueries({ queryKey: [LOYALTY_KEY, 'transactions'] });
      toast.success(t('toast.pointsRedeemed'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

/** 1 ball = redeemRate so'm chegirma */
export function pointsToMoney(points: number, redeemRate = DEFAULT_LOYALTY_CONFIG.redeemRate) {
  return points * redeemRate;
}

/** amount so'm = X ball */
export function moneyToPoints(amount: number, earnRate = DEFAULT_LOYALTY_CONFIG.earnRate) {
  return Math.floor(amount / earnRate);
}
