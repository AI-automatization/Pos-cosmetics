import { api } from './client';
import type { AuthTokens } from '@raos/types';

interface LoginPayload {
  email: string;
  password: string;
}

interface UserProfile {
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
    const { data } = await api.get<UserProfile>('/auth/me');
    return data;
  },
};
