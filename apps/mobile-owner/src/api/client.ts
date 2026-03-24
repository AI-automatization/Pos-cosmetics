import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        const userJson = await SecureStore.getItemAsync(USER_KEY);
        const userId = userJson ? (JSON.parse(userJson) as { id: string }).id : null;
        if (!refreshToken || !userId) throw new Error('No refresh credentials');

        const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}/auth/refresh`,
          { userId, refreshToken },
        );

        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        const currentToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        // DEV bypass: dev-token bilan logout qilma
        if (__DEV__ && currentToken === 'dev-token') {
          return Promise.reject(error);
        }

        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

        const { useAuthStore } = await import('../store/auth.store');
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  },
);

export const ACCESS_TOKEN_KEY_EXPORT = ACCESS_TOKEN_KEY;
export const REFRESH_TOKEN_KEY_EXPORT = REFRESH_TOKEN_KEY;
