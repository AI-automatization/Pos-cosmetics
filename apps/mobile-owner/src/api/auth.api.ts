import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
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
    const { data } = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH_LOGIN, { email, password });
    return data;
  },

  async refreshToken(token: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>(ENDPOINTS.AUTH_REFRESH, { token });
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH_LOGOUT);
  },

  async registerPushToken(params: RegisterPushTokenParams): Promise<void> {
    await apiClient.post(ENDPOINTS.DEVICES_REGISTER_PUSH_TOKEN, params);
  },
};
