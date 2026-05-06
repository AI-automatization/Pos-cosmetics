import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// T-389: sa_ prefix — web app cookie bilan collision oldini olish
const SA_SESSION_COOKIE = 'sa_session_active';
const SA_ROLE_COOKIE = 'sa_user_role';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login page — public
  if (pathname === '/login') {
    const sessionActive = request.cookies.get(SA_SESSION_COOKIE)?.value;
    const userRole = request.cookies.get(SA_ROLE_COOKIE)?.value;
    if (sessionActive && userRole === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/founder/overview', request.url));
    }
    return NextResponse.next();
  }

  // All other routes require SUPER_ADMIN session
  const sessionActive = request.cookies.get(SA_SESSION_COOKIE)?.value;
  const userRole = request.cookies.get(SA_ROLE_COOKIE)?.value;

  if (!sessionActive || userRole !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|api/).*)',
};
