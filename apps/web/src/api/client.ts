import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000, // 15s — prevents infinite hang when network is blocked
});

// Request: JWT qo'shish
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shared refresh promise — deduplication: 10 parallel 401 → only 1 refresh POST
let refreshPromise: Promise<string> | null = null;

// Clears all auth state and redirects to login.
function clearAuthAndRedirect() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  document.cookie = 'session_active=; path=/; max-age=0';
  document.cookie = 'user_role=; path=/; max-age=0';
  window.location.href = '/login';
}

// Response: 401 → refresh, 5xx → error report
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;

      // userId ni JWT payload dan olish — faqat sub kerak (signature verify shart emas)
      const currentToken = localStorage.getItem('access_token');

      // No token at all — skip refresh attempt, clear and redirect immediately
      if (!currentToken) {
        clearAuthAndRedirect();
        return Promise.reject(err);
      }

      let userId: string | null = null;
      try {
        userId = JSON.parse(atob(currentToken.split('.')[1]))?.sub ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) { /* ignore parse errors */ }

      try {
        // refreshToken httpOnly cookie withCredentials: true bilan yuboriladi (T-347)
        // Single shared promise prevents refresh storms when many requests get 401 simultaneously
        if (!refreshPromise) {
          refreshPromise = apiClient
            .post<{ accessToken: string }>('/auth/refresh', { userId })
            .then((r) => {
              localStorage.setItem('access_token', r.data.accessToken);
              return r.data.accessToken;
            })
            .finally(() => { refreshPromise = null; });
        }
        const newToken = await refreshPromise;
        err.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(err.config);
      } catch {
        clearAuthAndRedirect();
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
