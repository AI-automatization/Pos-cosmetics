'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/api/users.api';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { CreateUserDto, UpdateUserDto } from '@/types/user';

export const USERS_KEY = 'users';

export function useUsers(branchId?: string) {
  return useQuery({
    queryKey: [USERS_KEY, branchId],
    queryFn: () => usersApi.listUsers(branchId),
    staleTime: 60_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (dto: CreateUserDto) => usersApi.createUser(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast.success(t('toast.userCreated'));
    },
    onError: (err: unknown) => {
      const msg = extractErrorMessage(err);
      if (msg.toLowerCase().includes('already exists')) {
        toast.error(t('toast.emailAlreadyExists'));
      } else {
        toast.error(msg || t('toast.genericError'));
      }
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) => usersApi.updateUser(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast.success(t('toast.userUpdated'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err) || t('toast.genericError')),
  });
}

export function useResetPassword() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersApi.resetPassword(id, newPassword),
    onSuccess: () => toast.success(t('toast.passwordUpdated')),
    onError: (err: unknown) => toast.error(extractErrorMessage(err) || t('toast.genericError')),
  });
}
