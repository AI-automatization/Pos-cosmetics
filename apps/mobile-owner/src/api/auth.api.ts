import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterPushTokenParams {
  token: string;
  platform: string;
  tenantId: string;
  userId: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const slug = process.env.EXPO_PUBLIC_TENANT_SLUG ?? '';
    const { data } = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH_LOGIN, { email, password, slug });
    return data;
  },

  async refreshToken(userId: string, refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>(ENDPOINTS.AUTH_REFRESH, { userId, refreshToken });
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH_LOGOUT);
  },

  async registerPushToken(params: RegisterPushTokenParams): Promise<void> {
    await apiClient.post(ENDPOINTS.DEVICES_REGISTER_PUSH_TOKEN, params);
  },
};
