import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths — auth shart emas
const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — o'tkazib yuborish
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    // Agar foydalanuvchi allaqachon login qilgan bo'lsa, rol bo'yicha redirect
    const sessionActive = request.cookies.get('session_active')?.value;
    if (sessionActive && pathname === '/login') {
      const role = request.cookies.get('user_role')?.value;
      if (role === 'WAREHOUSE') {
        return NextResponse.redirect(new URL('/warehouse', request.url));
      }
      if (role === 'CASHIER') {
        return NextResponse.redirect(new URL('/pos', request.url));
      }
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
  const isPosPath = pathname.startsWith('/pos');

  if (userRole === 'WAREHOUSE' && !isWarehousePath) {
    return NextResponse.redirect(new URL('/warehouse', request.url));
  }

  if (userRole === 'CASHIER' && !isPosPath) {
    return NextResponse.redirect(new URL('/pos', request.url));
  }

  // MANAGER admin panelni role-filtered Sidebar bilan ishlatadi — alohida redirect kerak emas

  if (userRole && userRole !== 'WAREHOUSE' && isWarehousePath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Finance va Settings faqat OWNER/ADMIN uchun
  const isFinancePath = pathname.startsWith('/finance') || pathname.startsWith('/realestate');
  const isSettingsPath = pathname.startsWith('/settings');
  const privilegedRoles = ['OWNER', 'ADMIN'];

  if (isFinancePath && userRole && !privilegedRoles.includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isSettingsPath && userRole && !privilegedRoles.includes(userRole)) {
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
