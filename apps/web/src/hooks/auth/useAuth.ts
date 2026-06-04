'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { authApi, type LoginPayload } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/utils';
import { getAccessToken, setAccessToken, clearAccessToken, setUserIdFallback, clearUserIdFallback } from '@/api/token';

const SESSION_COOKIE = 'session_active';
const LEGACY_ROLE_COOKIE = 'user_role';
const USERID_COOKIE = 'user_id';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days
const SECURE_FLAG = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';

// #141: presence + userId are non-sensitive routing hints. The role is NO LONGER
// written here — it is set as a server-signed httpOnly cookie via POST /api/session.
function setSessionCookie(userId?: string) {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${SECURE_FLAG}`;
  if (userId) {
    document.cookie = `${USERID_COOKIE}=${userId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${SECURE_FLAG}`;
  }
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${LEGACY_ROLE_COOKIE}=; path=/; max-age=0`; // clear pre-#141 cookie
  document.cookie = `${USERID_COOKIE}=; path=/; max-age=0`;
}

// #141: ask the server to validate the accessToken (against /auth/me) and set a
// signed, tamper-evident role_sig cookie. Non-fatal on failure — the middleware
// default-denies privileged routes when role_sig is missing/invalid.
async function syncSignedRole() {
  const token = getAccessToken();
  if (!token) return;
  try {
    await fetch('/api/session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // ignore — middleware fails closed without a valid signed role
  }
}

async function clearSignedRole() {
  try {
    await fetch('/api/session', { method: 'DELETE' });
  } catch {
    // ignore
  }
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

  // #141: refresh the signed role cookie whenever the authoritative role is known.
  // Self-heals legacy sessions (pre-#141 user_role cookie) on next mount.
  useEffect(() => {
    if (query.data?.role) {
      void syncSignedRole();
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
        setSessionCookie(user.id); // session_active + userId for middleware & refresh
        await syncSignedRole(); // #141: set signed role_sig cookie before navigating
        setUserIdFallback(user.id); // localStorage fallback

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
        await clearSignedRole(); // #141: clear server-signed role cookie
        clearUserIdFallback();
        queryClient.clear();
      }
    },
    onSuccess: () => {
      router.push('/login');
    },
    onError: () => {
      clearAccessToken();
      clearSessionCookie();
      clearUserIdFallback();
      router.push('/login');
    },
  });
}
