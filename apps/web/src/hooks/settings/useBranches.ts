'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { branchesApi, type CreateBranchDto, type UpdateBranchDto } from '@/api/branches.api';
import { useTranslation } from '@/i18n/i18n-context';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.getAll(),
    staleTime: 60_000,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: CreateBranchDto) => branchesApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] });
      toast.success(t('toast.branchCreated'));
    },
    onError: (err: Error) => {
      toast.error(err.message ?? t('toast.genericError'));
    },
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBranchDto }) =>
      branchesApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] });
      toast.success(t('toast.branchUpdated'));
    },
    onError: (err: Error) => {
      toast.error(err.message ?? t('toast.genericError'));
    },
  });
}

export function useDeactivateBranch() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => branchesApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] });
      toast.success(t('toast.branchDeleted'));
    },
    onError: (err: Error) => {
      toast.error(err.message ?? t('toast.genericError'));
    },
  });
}
