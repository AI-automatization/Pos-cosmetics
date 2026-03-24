import api from './client';

export interface LoginPayload {
  slug: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  me: async (): Promise<MeResponse> => {
    const { data } = await api.get<MeResponse>('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
