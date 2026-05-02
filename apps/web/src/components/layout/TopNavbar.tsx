'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import { useTranslation } from '@/i18n/i18n-context';
import { useMobileSidebar } from '@/components/layout/mobile-sidebar-context';
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

/* ─── TopNavbar ───────────────────────────────────────────────────────────── */

export function TopNavbar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { toggle } = useMobileSidebar();
  const pageTitle = getPageTitle(pathname);

  const displayName = user
    ? (user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email)
    : null;

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
      <div className="flex items-center gap-3">
        <LangSwitcher />

        {displayName && (
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden flex-col lg:flex">
              <span className="max-w-[120px] truncate text-xs font-semibold text-gray-800">
                {displayName}
              </span>
              <span className="text-[10px] font-medium text-gray-400">{user?.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
