import { api } from './client';
import type { AuthTokens } from '@raos/types';

interface LoginPayload {
  slug: string;
  email: string;
  password: string;
}

interface UserProfileRaw {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  branchId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  branchId?: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const { data } = await api.post<AuthTokens>('/auth/login', payload);
    return data;
  },

  refresh: async (token: string): Promise<{ accessToken: string }> => {
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh', { token });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  me: async (): Promise<UserProfile> => {
    const { data } = await api.get<UserProfileRaw>('/auth/me');
    return {
      id: data.id,
      email: data.email,
      name: `${data.firstName} ${data.lastName}`.trim(),
      role: data.role,
      tenantId: data.tenantId,
      branchId: data.branchId,
    };
  },
};
