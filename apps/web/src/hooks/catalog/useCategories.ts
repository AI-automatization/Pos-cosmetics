'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi } from '@/api/catalog.api';
import { extractErrorMessage } from '@/lib/utils';
import type { CreateCategoryDto, UpdateCategoryDto } from '@/types/catalog';

export const CATEGORIES_KEY = 'categories';

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: () => catalogApi.getCategories(),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCategoryDto) => catalogApi.createCategory(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      toast.success('Kategoriya qo\'shildi!');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) =>
      catalogApi.updateCategory(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      toast.success('Kategoriya yangilandi!');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      toast.success('Kategoriya o\'chirildi!');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}
