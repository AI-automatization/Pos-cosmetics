'use client';

import { Bell, ChevronDown, User, Menu, LogOut, KeyRound, Eye, EyeOff, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCurrentUser, useLogout } from '@/hooks/auth/useAuth';
import { useUnreadCount, useMarkAllRead } from '@/hooks/notifications/useNotifications';
import { useTranslation } from '@/i18n/i18n-context';
import { useMobileSidebar } from '@/components/layout/mobile-sidebar-context';
import { SyncStatusBar } from '@/components/SyncStatus/SyncStatusBar';
import { useResetPassword } from '@/hooks/settings/useUsers';
import { cn } from '@/lib/utils';
import { LOCALES } from '@/i18n/index';

/* ─── Change Password Modal ──────────────────────────────────────────────── */

function ChangePasswordModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return;
    resetPassword({ id: userId, newPassword }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Parolni o&apos;zgartirish</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Yangi parol <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                autoFocus
                placeholder="Kamida 6 belgi"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={newPassword.length < 6 || isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Route → i18n key map ───────────────────────────────────────────────── */

const PAGE_TITLE_KEYS: [string, string][] = [
  ['/dashboard', 'nav.dashboard'],
  ['/catalog/products', 'nav.products'],
  ['/catalog/categories', 'nav.categories'],
  ['/catalog/suppliers', 'nav.suppliers'],
  ['/inventory/low-stock', 'nav.lowStock'],
  ['/inventory/expiry', 'nav.expiry'],
  ['/inventory/transfer', 'nav.transfer'],
  ['/inventory/stock-in', 'nav.stockIn'],
  ['/inventory', 'nav.inventory'],
  ['/sales/orders', 'nav.orders'],
  ['/sales/returns', 'nav.returns'],
  ['/sales/shifts', 'nav.shifts'],
  ['/promotions', 'nav.promotions'],
  ['/payments/history', 'nav.paymentHistory'],
  ['/nasiya/aging', 'nav.aging'],
  ['/nasiya', 'nav.nasiya'],
  ['/workers', 'nav.workers'],
  ['/finance/pnl', 'nav.pnl'],
  ['/finance/expenses', 'nav.expenses'],
  ['/finance/exchange-rates', 'nav.exchangeRates'],
  ['/analytics', 'nav.analytics'],
  ['/reports/daily-revenue', 'nav.dailyRevenue'],
  ['/reports/top-products', 'nav.topProducts'],
  ['/reports/shifts', 'nav.shiftReports'],
  ['/reports/branches', 'nav.branchComparison'],
  ['/reports/builder', 'nav.reportBuilder'],
  ['/reports', 'nav.reports'],
  ['/tasks', 'nav.tasks'],
  ['/settings/branches', 'nav.branches'],
  ['/settings/users', 'nav.users'],
  ['/settings/printer', 'nav.printer'],
  ['/settings/audit-log', 'nav.auditLog'],
  ['/settings/billing', 'nav.billing'],
];

function usePageTitle() {
  const { t } = useTranslation();
  const pathname = usePathname();
  for (const [prefix, key] of PAGE_TITLE_KEYS) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return t(key);
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
  const [showChangePwd, setShowChangePwd] = useState(false);
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
          <div className="border-t border-gray-100 mt-1 pt-1 px-1 pb-1 space-y-0.5">
            <button
              type="button"
              onClick={() => { setOpen(false); setShowChangePwd(true); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <KeyRound className="w-4 h-4 text-gray-400" />
              Parolni o&apos;zgartirish
            </button>
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

      {showChangePwd && user && (
        <ChangePasswordModal
          userId={user.id}
          onClose={() => setShowChangePwd(false)}
        />
      )}
    </div>
  );
}

/* ─── TopNavbar ───────────────────────────────────────────────────────────── */

export function TopNavbar() {
  const { toggle } = useMobileSidebar();
  const pageTitle = usePageTitle();

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
