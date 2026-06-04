import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyRole, getSessionSecret } from '@/lib/session-signature';

// Public paths — auth shart emas
const PUBLIC_PATHS = ['/login', '/forgot-password'];
const PRIVILEGED_ROLES = ['OWNER', 'ADMIN'];

// Fail closed: if the signing secret is unavailable, every role reads as unverified.
function readSecret(): string {
  try {
    return getSessionSecret();
  } catch {
    return '';
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = readSecret();

  // Public paths — o'tkazib yuborish
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    // Agar foydalanuvchi allaqachon login qilgan bo'lsa, rol bo'yicha redirect
    const sessionActive = request.cookies.get('session_active')?.value;
    if (sessionActive && pathname === '/login') {
      const role = await verifyRole(request.cookies.get('role_sig')?.value, secret);
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

  // #141: role is read from a server-signed, tamper-evident cookie (role_sig).
  // A forged or hand-edited cookie fails HMAC verification → null → no role.
  const userRole = await verifyRole(request.cookies.get('role_sig')?.value, secret);
  const isPrivileged = userRole !== null && PRIVILEGED_ROLES.includes(userRole);
  const isWarehousePath = pathname.startsWith('/warehouse');
  const isPosPath = pathname.startsWith('/pos');
  if (userRole === 'WAREHOUSE' && !isWarehousePath) {
    return NextResponse.redirect(new URL('/warehouse', request.url));
  }

  if (userRole === 'CASHIER' && !isPosPath) {
    return NextResponse.redirect(new URL('/pos', request.url));
  }

  // MANAGER admin panelni role-filtered Sidebar bilan ishlatadi — alohida redirect kerak emas

  if (userRole !== 'WAREHOUSE' && isWarehousePath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Finance, Settings va Real Estate faqat OWNER/ADMIN uchun.
  // Default-deny: tasdiqlanmagan/yo'q/soxta rol → privileged emas → redirect.
  const isFinancePath = pathname.startsWith('/finance') || pathname.startsWith('/realestate');
  const isSettingsPath = pathname.startsWith('/settings');

  if ((isFinancePath || isSettingsPath) && !isPrivileged) {
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
