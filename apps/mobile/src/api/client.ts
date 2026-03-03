import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../config';

export const navigationRef = {
  resetToAuth: (): void => {},
};

const api = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    if (!axios.isAxiosError(err)) return Promise.reject(err);

    const status = err.response?.status;
    const config = err.config as typeof err.config & { _retry?: boolean };

    if (status === 401 && !config?._retry) {
      config._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) throw new Error('no_refresh');

        const { data } = await axios.post(`${CONFIG.API_URL}/auth/refresh`, {
          token: refreshToken,
        });
        await SecureStore.setItemAsync('access_token', data.accessToken);
        if (config.headers) {
          config.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return api(config);
      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        navigationRef.resetToAuth();
      }
    }

    return Promise.reject(err);
  },
);

export default api;
