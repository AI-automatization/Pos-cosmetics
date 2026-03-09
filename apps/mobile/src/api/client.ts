import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, TOKEN_KEYS } from '@/config/constants';

let navigationRef: { reset: (state: object) => void } | null = null;

export function setNavigationRef(ref: { reset: (state: object) => void }): void {
  navigationRef = ref;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request: JWT token qo'shish
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: 401 → refresh, boshqa xatolar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await api.post<{ accessToken: string }>('/auth/refresh', {
          token: refreshToken,
        });

        await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
        await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
        navigationRef?.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    }
    return Promise.reject(error);
  },
);
