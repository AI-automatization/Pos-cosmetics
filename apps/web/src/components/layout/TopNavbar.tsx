'use client';

import { Bell, ChevronDown, User, Menu, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCurrentUser, useLogout } from '@/hooks/auth/useAuth';
import { useUnreadCount, useMarkAllRead } from '@/hooks/notifications/useNotifications';
import { useTranslation } from '@/i18n/i18n-context';
import { useMobileSidebar } from '@/components/layout/mobile-sidebar-context';
import { SyncStatusBar } from '@/components/SyncStatus/SyncStatusBar';
import { cn } from '@/lib/utils';
import { LOCALES } from '@/i18n/index';

/* ─── Route → Page title map ─────────────────────────────────────────────── */

const PAGE_TITLES: [string, string][] = [
  ['/dashboard', 'Dashboard'],
  ['/catalog/products', 'Mahsulotlar'],
  ['/catalog/categories', 'Kategoriyalar'],
  ['/catalog/suppliers', 'Yetkazib beruvchilar'],
  ['/inventory/low-stock', 'Kam zaxira'],
  ['/inventory/expiry', 'Yaroqlilik muddati'],
  ['/inventory/transfer', "Ko'chirish"],
  ['/inventory/stock-in', "Kirim qo'shish"],
  ['/inventory', 'Inventar'],
  ['/sales/orders', 'Buyurtmalar'],
  ['/sales/returns', 'Qaytarishlar'],
  ['/sales/shifts', 'Smenalar'],
  ['/promotions', 'Aksiyalar'],
  ['/payments/history', "To'lovlar"],
  ['/nasiya/aging', 'Aging hisobot'],
  ['/nasiya', 'Nasiya'],
  ['/workers', 'Xodimlar'],
  ['/finance/pnl', 'Foyda va zarar'],
  ['/finance/expenses', 'Xarajatlar'],
  ['/finance/exchange-rates', 'Valyuta kurslari'],
  ['/analytics', 'Analitika'],
  ['/reports/daily-revenue', 'Kunlik daromad'],
  ['/reports/top-products', 'Top mahsulotlar'],
  ['/reports/shifts', 'Smenalar hisoboti'],
  ['/reports/branches', 'Filiallar taqqoslama'],
  ['/reports/builder', 'Hisobot yaratish'],
  ['/reports', 'Hisobotlar'],
  ['/tasks', 'Topshiriqlar'],
  ['/settings/branches', 'Filiallar'],
  ['/settings/users', 'Foydalanuvchilar'],
  ['/settings/printer', 'Printer'],
  ['/settings/audit-log', 'Audit log'],
  ['/settings/billing', 'Hisob va tarif'],
];

function getPageTitle(pathname: string): string {
  for (const [prefix, title] of PAGE_TITLES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return title;
    }
  }
  return 'RAOS';
}

/* ─── Language switcher ───────────────────────────────────────────────────── */

const LANG_LABELS: Record<string, string> = { uz: 'UZ', ru: 'RU', en: 'EN' };

function LangSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      {LOCALES.map(({ value }) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          className={cn(
            'rounded-md px-2 py-1 text-xs font-semibold transition-all',
            locale === value
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          {LANG_LABELS[value] ?? value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ─── Notification Bell ───────────────────────────────────────────────────── */

function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAllRead } = useMarkAllRead();

  return (
    <button
      type="button"
      onClick={() => { if (unreadCount > 0) markAllRead(); }}
      className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
      aria-label="Bildirishnomalar"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

/* ─── User Menu ───────────────────────────────────────────────────────────── */

function UserMenu() {
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const displayName = user
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : 'Admin';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 transition hover:bg-gray-50"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium text-gray-700 leading-tight">{displayName}</p>
          {user && (
            <p className="text-xs text-gray-400 leading-tight capitalize">
              {user.role.toLowerCase()}
            </p>
          )}
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-lg">
          {user && (
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              {user.tenant && (
                <p className="mt-1 text-xs text-blue-600 font-medium">{user.tenant.name}</p>
              )}
            </div>
          )}
          <div className="border-t border-gray-100 mt-1 pt-1 px-1 pb-1">
            <button
              type="button"
              onClick={() => { logout(); }}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Chiqilmoqda...' : 'Chiqish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── TopNavbar ───────────────────────────────────────────────────────────── */

export function TopNavbar() {
  const pathname = usePathname();
  const { toggle } = useMobileSidebar();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 shadow-[0_1px_0_0_#f3f4f6]">
      {/* Mobile burger */}
      <button
        type="button"
        onClick={toggle}
        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 md:hidden"
        aria-label="Menyu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-sm font-semibold text-gray-900 md:text-base">
        {pageTitle}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <SyncStatusBar />
        <LangSwitcher />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
