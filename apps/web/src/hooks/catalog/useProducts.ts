'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi } from '@/api/catalog.api';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { ProductsQuery, CreateProductDto, UpdateProductDto } from '@/types/catalog';

export const PRODUCTS_KEY = 'products';

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: () => catalogApi.getUnits(),
    staleTime: 300_000,
  });
}

export function useProducts(filters: ProductsQuery = {}) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, filters],
    queryFn: () => catalogApi.getProducts(filters),
    staleTime: 60_000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (dto: CreateProductDto) => catalogApi.createProduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success(t('toast.productCreated'));
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      catalogApi.updateProduct(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success(t('toast.productUpdated'));
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success(t('toast.productDeleted'));
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}
