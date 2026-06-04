import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signRole, getSessionSecret } from '@/lib/session-signature';

/**
 * #141: Server-side session role cookie.
 *
 * The middleware must not trust a client-writable role. This route receives the
 * in-memory accessToken, validates it against the API's authoritative `/auth/me`,
 * then sets a signed httpOnly `role_sig` cookie the middleware can verify. A bogus
 * token cannot mint a role — `/auth/me` rejects it with 401.
 */

export const runtime = 'nodejs';

const ROLE_SIG_COOKIE = 'role_sig';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days — matches refresh token lifetime
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
  }

  let role: string;
  try {
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    role = ((await meRes.json()) as { role?: string }).role ?? '';
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 502 });
  }
  if (!role) {
    return NextResponse.json({ error: 'No role on profile' }, { status: 422 });
  }

  let signed: string;
  try {
    signed = await signRole(role, getSessionSecret());
  } catch {
    return NextResponse.json({ error: 'Session signing not configured' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ROLE_SIG_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return res;
}

/** Clear the signed role cookie on logout. */
export function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ROLE_SIG_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
