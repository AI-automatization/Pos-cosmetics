import { apiClient } from './client';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user';

export const usersApi = {
  listUsers(branchId?: string) {
    const params = branchId ? `?branchId=${branchId}` : '';
    return apiClient
      .get<User[] | { data: User[] }>(`/users${params}`)
      .then((r) => (Array.isArray(r.data) ? r.data : (r.data as { data: User[] }).data ?? []));
  },
  createUser(dto: CreateUserDto) {
    return apiClient.post<User>('/users', dto).then((r) => r.data);
  },
  updateUser(id: string, dto: UpdateUserDto) {
    return apiClient.patch<User>(`/users/${id}`, dto).then((r) => r.data);
  },
  deactivateUser(id: string) {
    return apiClient.patch<User>(`/users/${id}`, { isActive: false }).then((r) => r.data);
  },
};
