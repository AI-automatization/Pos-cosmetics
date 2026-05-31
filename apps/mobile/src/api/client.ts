import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../config';
import { useAuthStore } from '../store/auth.store';

/* ---------- Axios instance ---------- */

const api = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/* ---------- _retry flag uchun tip kengaytmasi ---------- */

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/* ---------- Refresh Token Mutex (Shared Promise) ---------- */

/**
 * Parallel 401 lar uchun mutex pattern:
 *  - Birinchi 401 → refreshPromise yaratiladi, refresh so'rovi yuboriladi
 *  - Keyingi 401 lar → mavjud refreshPromise ni kutadi (yangi so'rov yuborMASdi)
 *  - Refresh tugagach (muvaffaqiyatli yoki xato) → refreshPromise = null
 */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // Agar allaqachon refresh jarayonda bo'lsa — mavjud promise ni kutish
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const storedRefreshToken =
        await SecureStore.getItemAsync('refresh_token');
      if (!storedRefreshToken) {
        throw new Error('no_refresh');
      }

      // userId ham kerak — backend { userId, refreshToken } kutadi
      const userStr = await SecureStore.getItemAsync('user');
      const userId = userStr
        ? (JSON.parse(userStr) as { id: string }).id
        : null;
      if (!userId) {
        throw new Error('no_user');
      }

      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(`${CONFIG.API_URL}/auth/refresh`, {
        userId,
        refreshToken: storedRefreshToken,
      });

      await SecureStore.setItemAsync('access_token', data.accessToken);
      await SecureStore.setItemAsync('refresh_token', data.refreshToken);

      return data.accessToken;
    } catch (refreshErr: unknown) {
      // Refresh muvaffaqiyatsiz — logout
      await useAuthStore.getState().clearAuth();
      throw refreshErr;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    // Muvaffaqiyatli yoki xato — promise ni tozalash
    refreshPromise = null;
  }
}

/* ---------- Request interceptor: token qo'shish ---------- */

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ---------- Response interceptor: 401 → refresh + retry ---------- */

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const config = err.config as RetryableConfig | undefined;

    // 401 va hali retry qilinmagan bo'lsa — refresh token orqali yangilash
    if (status === 401 && config && !config._retry) {
      config._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        // Yangi token bilan asl so'rovni qayta yuborish
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(config);
      } catch {
        // refreshAccessToken ichida clearAuth chaqirilgan
        // Asl xatoni qaytarish
        return Promise.reject(err);
      }
    }

    return Promise.reject(err);
  },
);

export default api;
export { api };
export { api as apiClient };
