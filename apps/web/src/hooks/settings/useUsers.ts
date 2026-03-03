'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/api/users.api';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user';

const NOW = new Date().toISOString();

const DEMO_USERS: User[] = [
  { id: 'u-1', name: 'Abdulaziz Yusupov', phone: '+998901234567', role: 'OWNER', isActive: true, lastLogin: NOW, createdAt: NOW, tenantId: 'demo' },
  { id: 'u-2', name: 'Malika Rahimova', phone: '+998902345678', role: 'ADMIN', isActive: true, lastLogin: NOW, createdAt: NOW, tenantId: 'demo' },
  { id: 'u-3', name: 'Jasur Karimov', phone: '+998903456789', role: 'CASHIER', isActive: true, lastLogin: new Date(Date.now() - 86400000).toISOString(), createdAt: NOW, tenantId: 'demo' },
  { id: 'u-4', name: 'Nilufar Xasanova', phone: '+998904567890', role: 'CASHIER', isActive: true, lastLogin: null, createdAt: NOW, tenantId: 'demo' },
  { id: 'u-5', name: "G'ayrat Toshmatov", phone: '+998905678901', role: 'VIEWER', isActive: false, lastLogin: null, createdAt: NOW, tenantId: 'demo' },
];

export const USERS_KEY = 'users';

export function useUsers() {
  return useQuery({
    queryKey: [USERS_KEY],
    queryFn: async () => {
      try {
        return await usersApi.listUsers();
      } catch {
        return DEMO_USERS;
      }
    },
    staleTime: 60_000,
    retry: 0,
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
    onError: () => toast.error("Xato yuz berdi"),
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
    onError: () => toast.error("Xato yuz berdi"),
  });
}
