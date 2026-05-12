/**
 * In-memory JWT access token storage.
 * НЕ localStorage — XSS не может украсть токен.
 * При перезагрузке страницы токен теряется → /auth/refresh
 * через httpOnly cookie восстанавливает его.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

/** Читает userId из cookie для refresh (бэкенд требует userId) */
export function getUserIdFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)user_id=([^;]+)/);
  return match?.[1] ?? null;
}
