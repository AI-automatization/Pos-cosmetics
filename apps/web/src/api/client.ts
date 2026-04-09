import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request: JWT qo'shish
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: 401 → refresh, 5xx → error report
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        // userId ni JWT payload dan olish (localStorage['user_id'] hali set bo'lmagan bo'lishi mumkin)
        // JWT payload public — signature verification shart emas, faqat sub kerak
        const currentToken = localStorage.getItem('access_token');
        let userId: string | null = null;
        if (currentToken) {
          try {
            userId = JSON.parse(atob(currentToken.split('.')[1]))?.sub ?? null;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_e) { /* ignore parse errors */ }
        }
        // refreshToken body da emas — httpOnly cookie withCredentials: true bilan yuboriladi (T-347)
        const { data } = await apiClient.post('/auth/refresh', { userId });
        localStorage.setItem('access_token', data.accessToken);
        err.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(err.config);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
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
