import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths — auth shart emas
const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — o'tkazib yuborish
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    // Agar foydalanuvchi allaqachon login qilgan bo'lsa, dashboardga redirect
    const sessionActive = request.cookies.get('session_active')?.value;
    if (sessionActive && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Static files, Next.js internals — skip
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Auth tekshirish
  const sessionActive = request.cookies.get('session_active')?.value;
  if (!sessionActive) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Role-based routing
  const userRole = request.cookies.get('user_role')?.value;
  const isWarehousePath = pathname.startsWith('/warehouse');
  const isManagerPath = pathname.startsWith('/manager');
  const isPosPath = pathname.startsWith('/pos');

  if (userRole === 'WAREHOUSE' && !isWarehousePath) {
    return NextResponse.redirect(new URL('/warehouse', request.url));
  }

  if (userRole === 'CASHIER' && !isPosPath) {
    return NextResponse.redirect(new URL('/pos', request.url));
  }

  if (userRole === 'MANAGER' && !isManagerPath && !isWarehousePath && !isPosPath) {
    return NextResponse.redirect(new URL('/manager-dashboard', request.url));
  }

  if (userRole && userRole !== 'WAREHOUSE' && isWarehousePath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
