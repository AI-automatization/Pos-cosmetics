'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { authApi, type LoginPayload } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/utils';

const SESSION_COOKIE = 'session_active';
const ROLE_COOKIE = 'user_role';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function setSessionCookie(role?: string) {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  if (role) {
    document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`;
}

export function useCurrentUser() {
  const hasToken =
    typeof window !== 'undefined' && !!localStorage.getItem('access_token');

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60_000,
    enabled: hasToken,
  });

  // Ensure role cookie always matches the actual user role (fixes stale CASHIER cookie bug)
  useEffect(() => {
    if (query.data?.role) {
      document.cookie = `${ROLE_COOKIE}=${query.data.role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    }
  }, [query.data?.role]);

  return query;
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const tokens = await authApi.login(payload);
      localStorage.setItem('access_token', tokens.accessToken);
      // refreshToken httpOnly cookie da saqlanadi (T-347) — localStorage ga kerak emas
      setSessionCookie();
      return tokens;
    },
    onSuccess: async () => {
      try {
        const user = await authApi.me();
        queryClient.setQueryData(['auth', 'me'], user);
        localStorage.setItem('user_id', user.id);
        setSessionCookie(user.role); // set role cookie for middleware routing

        if (user.role === 'WAREHOUSE') {
          router.push('/warehouse');
        } else if (user.role === 'CASHIER') {
          router.push('/pos');
        } else if (user.role === 'MANAGER') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard');
        }
      } catch {
        // /auth/me failed after login — still deliver user somewhere usable
        router.push('/dashboard');
      }
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

/** Returns true if current user can create/edit/delete (VIEWER cannot) */
export function useCanEdit(): boolean {
  const { data: user } = useCurrentUser();
  return user?.role !== 'VIEWER';
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } finally {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        clearSessionCookie();
        queryClient.clear();
      }
    },
    onSuccess: () => {
      router.push('/login');
    },
    onError: () => {
      // Even on error, clear local state and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      clearSessionCookie();
      router.push('/login');
    },
  });
}
