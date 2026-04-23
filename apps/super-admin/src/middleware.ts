import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login page — public
  if (pathname === '/login') {
    const sessionActive = request.cookies.get('session_active')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    if (sessionActive && userRole === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/founder/overview', request.url));
    }
    return NextResponse.next();
  }

  // All other routes require SUPER_ADMIN session
  const sessionActive = request.cookies.get('session_active')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  if (!sessionActive || userRole !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|api/).*)',
};
