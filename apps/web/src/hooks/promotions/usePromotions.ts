'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { promotionsApi } from '@/api/promotions.api';
import type { CreatePromotionDto, UpdatePromotionDto } from '@/types/promotion';

const KEY = ['promotions'] as const;

export function usePromotions() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => promotionsApi.list(),
    staleTime: 60_000,
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePromotionDto) => promotionsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Aksiya qo'shildi!");
    },
    onError: () => toast.error('Xato yuz berdi'),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePromotionDto }) =>
      promotionsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Aksiya yangilandi!');
    },
    onError: () => toast.error('Xato yuz berdi'),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Aksiya o'chirildi!");
    },
    onError: () => toast.error('Xato yuz berdi'),
  });
}

export function useTogglePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      promotionsApi.update(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error('Xato yuz berdi'),
  });
}
