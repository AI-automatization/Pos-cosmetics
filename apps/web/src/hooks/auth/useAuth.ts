'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi, type LoginPayload } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/utils';

const SESSION_COOKIE = 'session_active';

function setSessionCookie() {
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

export function useCurrentUser() {
  const hasToken =
    typeof window !== 'undefined' && !!localStorage.getItem('access_token');

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60_000,
    enabled: hasToken,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const tokens = await authApi.login(payload);
      localStorage.setItem('access_token', tokens.accessToken);
      setSessionCookie();
      return tokens;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push('/dashboard');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
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
      clearSessionCookie();
      router.push('/login');
    },
  });
}
