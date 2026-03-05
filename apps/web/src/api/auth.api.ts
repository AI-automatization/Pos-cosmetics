import { apiClient } from './client';

export interface LoginPayload {
  email: string;
  password: string;
  slug: string;
}

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  tenant: { id: string; name: string; slug: string };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const { data } = await apiClient.post<AuthTokens>('/auth/login', payload);
    return data;
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<AuthUser>('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
