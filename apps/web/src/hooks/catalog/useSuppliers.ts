'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { suppliersApi } from '@/api/suppliers.api';
import { extractErrorMessage } from '@/lib/utils';
import type { CreateSupplierDto, UpdateSupplierDto } from '@/types/supplier';

export const SUPPLIERS_KEY = 'suppliers';

export function useSuppliers() {
  return useQuery({
    queryKey: [SUPPLIERS_KEY],
    queryFn: () => suppliersApi.list(),
    staleTime: 60_000,
  });
}

export function useSupplier(id: string | null) {
  return useQuery({
    queryKey: [SUPPLIERS_KEY, id],
    queryFn: () => suppliersApi.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSupplierDto) => suppliersApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
      toast.success("Yetkazib beruvchi qo'shildi!");
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSupplierDto }) =>
      suppliersApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
      toast.success('Yetkazib beruvchi yangilandi!');
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
      toast.success("Yetkazib beruvchi o'chirildi!");
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}
