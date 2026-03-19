'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi } from '@/api/catalog.api';
import { extractErrorMessage } from '@/lib/utils';
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
  return useMutation({
    mutationFn: (dto: CreateVariantDto) => catalogApi.createVariant(productId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      toast.success('Variant qo\'shildi');
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, dto }: { variantId: string; dto: UpdateVariantDto }) =>
      catalogApi.updateVariant(productId, variantId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      toast.success('Variant yangilandi');
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => catalogApi.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', productId] });
      toast.success('Variant o\'chirildi');
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}
