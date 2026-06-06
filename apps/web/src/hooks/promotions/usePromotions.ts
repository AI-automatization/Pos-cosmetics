'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { promotionsApi } from '@/api/promotions.api';
import { useTranslation } from '@/i18n/i18n-context';
import type { CreatePromotionDto, UpdatePromotionDto } from '@/types/promotion';

const KEY = ['promotions'] as const;

export function usePromotions() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => promotionsApi.list(),
    staleTime: 60_000,
  });
}

/** Returns { productId → discountPercent } for active BUNDLE and product-specific PERCENT promotions */
export function usePromoMap(): Record<string, number> {
  const { data: promotions = [] } = usePromotions();
  return useMemo(() => {
    const now = Date.now();
    const map: Record<string, number> = {};
    promotions.forEach((p) => {
      if (
        !p.isActive ||
        new Date(p.validFrom).getTime() > now ||
        (p.validTo !== null && new Date(p.validTo).getTime() < now)
      ) return;
      if (p.type === 'BUNDLE') {
        const rules = p.rules as { productIds: string[]; discount: number };
        if (Array.isArray(rules.productIds) && typeof rules.discount === 'number') {
          rules.productIds.forEach((pid) => { map[pid] = rules.discount; });
        }
      }
      // Product-specific PERCENT promotion (rules.productId set)
      if (p.type === 'PERCENT') {
        const rules = p.rules as { percent: number; productId?: string };
        if (rules.productId && typeof rules.percent === 'number' && rules.percent > 0) {
          map[rules.productId] = rules.percent;
        }
      }
    });
    return map;
  }, [promotions]);
}

/** Returns the first active store-wide PERCENT or FIXED promotion */
export function useGlobalPromo() {
  const { data: promotions = [] } = usePromotions();
  return useMemo(() => {
    const now = Date.now();
    return promotions.find(
      (p) =>
        p.isActive &&
        (p.type === 'PERCENT' || p.type === 'FIXED') &&
        new Date(p.validFrom).getTime() <= now &&
        (p.validTo === null || new Date(p.validTo).getTime() >= now),
    ) ?? null;
  }, [promotions]);
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: CreatePromotionDto) => promotionsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(t('toast.promotionCreated'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePromotionDto }) =>
      promotionsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(t('toast.promotionUpdated'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => promotionsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(t('toast.promotionDeleted'));
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}

export function useTogglePromotion() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      promotionsApi.update(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error(t('toast.genericError')),
  });
}
