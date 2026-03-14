import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

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
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
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
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
          `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}/auth/refresh`,
          { token: refreshToken },
        );

        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch {
        const currentToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        // DEV bypass: dev-token bilan logout qilma
        if (__DEV__ && currentToken === 'dev-token') {
          return Promise.reject(error);
        }

        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);

        const { useAuthStore } = await import('../store/auth.store');
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  },
);

export const ACCESS_TOKEN_KEY_EXPORT = ACCESS_TOKEN_KEY;
export const REFRESH_TOKEN_KEY_EXPORT = REFRESH_TOKEN_KEY;
