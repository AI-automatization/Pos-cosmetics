import { apiClient } from './client';
import { getUserIdFromCookie } from './token';

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
  refreshToken?: string; // backend sends via httpOnly cookie, not in response body
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

  refresh: async (): Promise<AuthTokens> => {
    // httpOnly cookie автоматически отправляется (withCredentials: true)
    const userId = getUserIdFromCookie();
    const { data } = await apiClient.post<AuthTokens>('/auth/refresh', { userId });
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
