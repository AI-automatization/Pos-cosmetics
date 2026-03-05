'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi } from '@/api/catalog.api';
import { extractErrorMessage } from '@/lib/utils';
import type { ProductsQuery, CreateProductDto, UpdateProductDto } from '@/types/catalog';

export const PRODUCTS_KEY = 'products';

export function useProducts(filters: ProductsQuery = {}) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, filters],
    queryFn: () => catalogApi.getProducts(filters),
    staleTime: 30_000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProductDto) => catalogApi.createProduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Mahsulot muvaffaqiyatli qo\'shildi!');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      catalogApi.updateProduct(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Mahsulot yangilandi!');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Mahsulot o\'chirildi!');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}
