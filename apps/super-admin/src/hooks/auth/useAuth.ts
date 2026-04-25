'use client';

import {
  SA_TOKEN_KEY,
  SA_ADMIN_ID_KEY,
  SA_ADMIN_ROLE_KEY,
  SA_SESSION_COOKIE,
  SA_ROLE_COOKIE,
} from '@/api/client';

export function useLogout() {
  const logout = () => {
    localStorage.removeItem(SA_TOKEN_KEY);
    localStorage.removeItem(SA_ADMIN_ID_KEY);
    localStorage.removeItem(SA_ADMIN_ROLE_KEY);
    document.cookie = `${SA_SESSION_COOKIE}=; path=/; max-age=0`;
    document.cookie = `${SA_ROLE_COOKIE}=; path=/; max-age=0`;
    window.location.href = '/login';
  };
  return { logout, isPending: false };
}
