'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { promoApi } from '@/api/promo.api';
import { useTranslation } from '@/i18n/i18n-context';
import type { CreatePromoCodeDto, UpdatePromoCodeDto } from '@/types/promo-code';

const KEY = ['promo-codes'] as const;

export function usePromoCodes(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...KEY, page, limit],
    queryFn: () => promoApi.list({ page, limit }),
    staleTime: 30_000,
  });
}

export function useCreatePromoCode() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: CreatePromoCodeDto) => promoApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(t('toast.promoCodeCreated'));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message ?? t('toast.genericError');
      toast.error(msg);
    },
  });
}

export function useUpdatePromoCode() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePromoCodeDto }) =>
      promoApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(t('toast.promoCodeUpdated'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}

export function useDeletePromoCode() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => promoApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(t('toast.promoCodeDeleted'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}

export function useTogglePromoCode() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      promoApi.update(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}
