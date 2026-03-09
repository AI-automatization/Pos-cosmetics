import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request: JWT qo'shish
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh queue — bir vaqtda faqat 1 ta refresh call
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function drainQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// Response: 401 → refresh (once), 5xx → error report
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // /auth/ endpointlari uchun loop oldini olish
    if (original?.url?.includes('/auth/')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        // session_active cookie ni tozalash (middleware redirect qilmasin)
        document.cookie = 'session_active=; path=/; max-age=0';
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !original._retry) {
      // Refresh allaqachon ketayotgan bo'lsa — navbatga qo'yish
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
          // Agar refresh 10s da tugamasa — reject
          setTimeout(() => reject(err), 10_000);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post('/auth/refresh');
        const token: string = data.accessToken ?? data.access_token;
        localStorage.setItem('access_token', token);
        original.headers.Authorization = `Bearer ${token}`;
        drainQueue(token);
        return apiClient(original);
      } catch {
        refreshQueue = [];
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          // session_active cookie ni tozalash (middleware redirect qilmasin)
          document.cookie = 'session_active=; path=/; max-age=0';
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
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
