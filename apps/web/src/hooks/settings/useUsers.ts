'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/api/users.api';
import { extractErrorMessage } from '@/lib/utils';
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
  return useMutation({
    mutationFn: (dto: CreateUserDto) => usersApi.createUser(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast.success("Foydalanuvchi qo'shildi!");
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err) || 'Xato yuz berdi'),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) => usersApi.updateUser(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast.success("Foydalanuvchi yangilandi!");
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err) || 'Xato yuz berdi'),
  });
}
