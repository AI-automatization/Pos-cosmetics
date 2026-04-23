'use client';

export function useLogout() {
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_id');
    localStorage.removeItem('admin_role');
    document.cookie = 'session_active=; path=/; max-age=0';
    document.cookie = 'user_role=; path=/; max-age=0';
    window.location.href = '/login';
  };
  return { logout, isPending: false };
}
