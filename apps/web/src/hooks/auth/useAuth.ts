'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { authApi, type LoginPayload } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/utils';
import { getAccessToken, setAccessToken, clearAccessToken } from '@/api/token';

const SESSION_COOKIE = 'session_active';
const ROLE_COOKIE = 'user_role';
const USERID_COOKIE = 'user_id';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function setSessionCookie(role?: string, userId?: string) {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  if (role) {
    document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }
  if (userId) {
    document.cookie = `${USERID_COOKIE}=${userId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${USERID_COOKIE}=; path=/; max-age=0`;
}

export function useCurrentUser() {
  const hasSession =
    typeof window !== 'undefined' &&
    document.cookie.includes('session_active=1');

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      // Если токен в памяти потерян (перезагрузка) — refresh через httpOnly cookie
      if (!getAccessToken()) {
        try {
          const res = await authApi.refresh();
          setAccessToken(res.accessToken);
        } catch {
          return null;
        }
      }
      return authApi.me();
    },
    retry: false,
    staleTime: 5 * 60_000,
    enabled: hasSession,
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
      setAccessToken(tokens.accessToken);
      // refreshToken httpOnly cookie da saqlanadi (T-347)
      setSessionCookie();
      return tokens;
    },
    onSuccess: async () => {
      try {
        const user = await authApi.me();
        queryClient.setQueryData(['auth', 'me'], user);
        setSessionCookie(user.role, user.id); // set role + userId cookies for middleware & refresh

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
        clearAccessToken();
        clearSessionCookie();
        queryClient.clear();
      }
    },
    onSuccess: () => {
      router.push('/login');
    },
    onError: () => {
      clearAccessToken();
      clearSessionCookie();
      router.push('/login');
    },
  });
}
