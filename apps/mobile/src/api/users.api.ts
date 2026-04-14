import api from './client';
import type { AppUser, UserRole } from '../screens/Settings/UserCard';

// ─── Request body types ────────────────────────────────

export interface CreateUserBody {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
}

// ─── API response shape (server dan keladi) ────────────

interface UserApiResponse {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  lastLogin?: string;
  createdAt?: string;
}

// ─── Mapper ───────────────────────────────────────────

function mapUser(u: UserApiResponse, fallback?: CreateUserBody): AppUser {
  return {
    id: u.id,
    firstName: u.firstName ?? fallback?.firstName ?? '',
    lastName: u.lastName ?? fallback?.lastName ?? '',
    email: u.email ?? fallback?.email ?? '',
    phone: u.phone ?? fallback?.phone ?? null,
    role: (u.role as UserRole) ?? fallback?.role ?? 'VIEWER',
    isActive: u.isActive ?? true,
    lastLogin: u.lastLoginAt ?? u.lastLogin ?? null,
    createdAt: u.createdAt ?? new Date().toISOString(),
  };
}

// ─── usersApi ─────────────────────────────────────────

export const usersApi = {
  getAll: async (): Promise<AppUser[]> => {
    const { data } = await api.get<UserApiResponse[]>('/users');
    return data.map((u) => mapUser(u));
  },

  create: async (body: CreateUserBody): Promise<AppUser> => {
    const { data } = await api.post<UserApiResponse>('/users', body);
    return mapUser(data, body);
  },

  update: async (id: string, body: UpdateUserBody): Promise<void> => {
    await api.patch(`/users/${id}`, body);
  },

  toggleActive: async (id: string, isActive: boolean): Promise<void> => {
    await api.patch(`/users/${id}`, { isActive });
  },
};
