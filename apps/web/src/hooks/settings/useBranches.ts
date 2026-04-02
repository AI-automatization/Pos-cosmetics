'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { branchesApi, type CreateBranchDto, type UpdateBranchDto } from '@/api/branches.api';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.getAll(),
    staleTime: 60_000,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBranchDto) => branchesApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Filial muvaffaqiyatli yaratildi');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Xato yuz berdi');
    },
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBranchDto }) =>
      branchesApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Filial yangilandi');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Xato yuz berdi');
    },
  });
}

export function useDeactivateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Filial o\'chirildi');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Xato yuz berdi');
    },
  });
}
