import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request: JWT token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function clearAuthAndRedirect() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('admin_id');
  localStorage.removeItem('admin_role');
  document.cookie = 'session_active=; path=/; max-age=0';
  document.cookie = 'user_role=; path=/; max-age=0';
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
