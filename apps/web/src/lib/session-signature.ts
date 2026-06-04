/**
 * #141: Tamper-evident role cookie signing (Web Crypto — Edge + Node compatible).
 *
 * The role cookie was previously client-writable (set via `document.cookie`), so any
 * user could forge `user_role=OWNER` in DevTools and reach privileged UI. We now sign
 * the role with a server-only secret (HMAC-SHA256). The middleware verifies the
 * signature on every request; a forged or edited cookie fails verification and is
 * treated as "no role" (default-deny on privileged routes).
 *
 * Web Crypto (`crypto.subtle`) is used instead of `node:crypto` because Next.js
 * middleware runs on the Edge runtime, where `node:crypto` is unavailable.
 */

const ALGO = { name: 'HMAC', hash: 'SHA-256' } as const;
const SEPARATOR = '.';

function base64UrlEncode(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(role: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    ALGO,
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(ALGO, key, new TextEncoder().encode(role));
  return base64UrlEncode(signature);
}

/** Length-safe, constant-time string comparison (avoids early-exit timing leak). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Returns the signed cookie value `${role}.${base64url(HMAC-SHA256(role))}`. */
export async function signRole(role: string, secret: string): Promise<string> {
  if (!role) throw new Error('signRole: role required');
  if (!secret) throw new Error('signRole: secret required');
  const signature = await hmac(role, secret);
  return `${role}${SEPARATOR}${signature}`;
}

/** Returns the role if the signature is valid, otherwise null (forged/edited/missing). */
export async function verifyRole(
  token: string | undefined,
  secret: string,
): Promise<string | null> {
  if (!token || !secret) return null;
  // Roles are dot-free enum values (OWNER/ADMIN/…), so lastIndexOf splits unambiguously.
  const idx = token.lastIndexOf(SEPARATOR);
  if (idx <= 0 || idx >= token.length - 1) return null;
  const role = token.slice(0, idx);
  const provided = token.slice(idx + 1);
  const expected = await hmac(role, secret);
  return timingSafeEqual(provided, expected) ? role : null;
}

/**
 * Server-only signing secret. Throws in production if unset (callers fail closed:
 * the route handler returns 500, the middleware treats every role as unverified).
 * A fixed dev secret keeps local development working without configuration.
 */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SIGNING_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') return 'dev-insecure-session-signing-secret';
  throw new Error('SESSION_SIGNING_SECRET is not set');
}
