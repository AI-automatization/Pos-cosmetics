import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// T-387: httpOnly cookie (server-set) is the primary auth signal
const SA_ACCESS_TOKEN_COOKIE = 'sa_access_token';
// Fallback: client-set session flag (backward compat)
const SA_SESSION_COOKIE = 'sa_session_active';
const SA_ROLE_COOKIE = 'sa_user_role';

function hasValidSession(request: NextRequest): boolean {
  // T-387: Primary check — httpOnly cookie set by backend
  const httpOnlyToken = request.cookies.get(SA_ACCESS_TOKEN_COOKIE)?.value;
  if (httpOnlyToken) return true;

  // Fallback: client-set cookies (will be removed in future)
  const sessionActive = request.cookies.get(SA_SESSION_COOKIE)?.value;
  const userRole = request.cookies.get(SA_ROLE_COOKIE)?.value;
  return !!(sessionActive && userRole === 'SUPER_ADMIN');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login page — public
  if (pathname === '/login') {
    if (hasValidSession(request)) {
      return NextResponse.redirect(new URL('/founder/overview', request.url));
    }
    return NextResponse.next();
  }

  // All other routes require valid session
  if (!hasValidSession(request)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|api/).*)',
};
