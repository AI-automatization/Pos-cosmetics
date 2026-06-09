import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken, getUserIdFromCookie, clearUserIdFallback } from './token';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000,
});

// Request: JWT из памяти (не localStorage)
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Shared refresh promise — deduplication
let refreshPromise: Promise<string> | null = null;

function clearAuthAndRedirect() {
  if (typeof window === 'undefined') return;
  clearAccessToken();
  clearUserIdFallback();
  document.cookie = 'session_active=; path=/; max-age=0';
  document.cookie = 'user_role=; path=/; max-age=0'; // legacy pre-#141 cookie
  document.cookie = 'user_id=; path=/; max-age=0';
  // #141: role_sig is httpOnly — ask the server to clear it (keepalive survives unload).
  void fetch('/api/session', { method: 'DELETE', keepalive: true }).catch(() => {});
  window.location.href = '/login';
}

// Response: 401 → refresh через httpOnly cookie, 5xx → error report
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const requestUrl = err.config?.url ?? '';
    const isAuthCall = requestUrl.includes('/auth/login')
      || requestUrl.includes('/auth/refresh')
      || requestUrl.includes('/auth/register');

    // 401 на auth endpoints (login/refresh/register) — не пытаемся refresh
    if (err.response?.status === 401 && isAuthCall) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;

      try {
        // refreshToken автоматически отправляется как httpOnly cookie (withCredentials: true)
        if (!refreshPromise) {
          const userId = getUserIdFromCookie();
          refreshPromise = apiClient
            .post<{ accessToken: string }>('/auth/refresh', { userId })
            .then((r) => {
              setAccessToken(r.data.accessToken);
              return r.data.accessToken;
            })
            .finally(() => { refreshPromise = null; });
        }
        const newToken = await refreshPromise;
        err.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(err.config);
      } catch {
        clearAuthAndRedirect();
        return Promise.reject(err);
      }
    }

    if (err.response?.status >= 500 && typeof window !== 'undefined') {
      reportClientError({
        error: err.message,
        stack: err.stack,
        url: window.location.pathname,
      });
    }

    return Promise.reject(err);
  },
);

function reportClientError(payload: { error: string; stack?: string; url?: string }) {
  apiClient
    .post('/logs/client-error', {
      source: 'web',
      userAgent: navigator.userAgent,
      ...payload,
    })
    .catch(() => {
      // silent — log endpoint fail bo'lsa yutib yuborish
    });
}
