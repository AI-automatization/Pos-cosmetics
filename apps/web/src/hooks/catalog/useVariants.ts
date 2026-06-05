'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi } from '@/api/catalog.api';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { CreateVariantDto, UpdateVariantDto } from '@/types/catalog';

export function useVariants(productId: string | undefined) {
  return useQuery({
    queryKey: ['variants', productId],
    queryFn: () => catalogApi.getVariants(productId!),
    enabled: !!productId,
  });
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: CreateVariantDto) => catalogApi.createVariant(productId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      toast.success(t('toast.variantCreated'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ variantId, dto }: { variantId: string; dto: UpdateVariantDto }) =>
      catalogApi.updateVariant(productId, variantId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      toast.success(t('toast.variantUpdated'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (variantId: string) => catalogApi.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      toast.success(t('toast.variantDeleted'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}
