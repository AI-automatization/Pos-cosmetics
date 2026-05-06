import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// T-389: Super-admin localStorage/cookie keys — `sa_` prefix (web app bilan collision oldini olish)
export const SA_TOKEN_KEY = 'sa_access_token';
export const SA_ADMIN_ID_KEY = 'sa_admin_id';
export const SA_ADMIN_ROLE_KEY = 'sa_admin_role';
export const SA_SESSION_COOKIE = 'sa_session_active';
export const SA_ROLE_COOKIE = 'sa_user_role';
export const SA_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

// Request: JWT token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(SA_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function clearAuthAndRedirect() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SA_TOKEN_KEY);
  localStorage.removeItem(SA_ADMIN_ID_KEY);
  localStorage.removeItem(SA_ADMIN_ROLE_KEY);
  document.cookie = `${SA_SESSION_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${SA_ROLE_COOKIE}=; path=/; max-age=0`;
  window.location.href = '/login';
}

// Response: 401 → redirect to login (no refresh for Super Admin)
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      clearAuthAndRedirect();
      return Promise.reject(err);
    }

    if (err.response?.status >= 500 && typeof window !== 'undefined') {
      apiClient
        .post('/logs/client-error', {
          source: 'super-admin',
          error: err.message,
          stack: err.stack,
          url: window.location.pathname,
          userAgent: navigator.userAgent,
        })
        .catch(() => {});
    }

    return Promise.reject(err);
  },
);
