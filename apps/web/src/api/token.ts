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

/** Читает userId из cookie (primary) или localStorage (fallback) для refresh */
export function getUserIdFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)user_id=([^;]+)/);
  if (match?.[1]) return match[1];
  // fallback: localStorage (для сессий до деплоя cookie)
  return localStorage.getItem('user_id');
}

/** Сохраняет userId в localStorage как fallback */
export function setUserIdFallback(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_id', userId);
}

/** Очищает userId из localStorage */
export function clearUserIdFallback(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user_id');
}
