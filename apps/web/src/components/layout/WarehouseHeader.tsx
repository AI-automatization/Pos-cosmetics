'use client';

import { LogOut, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCurrentUser, useLogout } from '@/hooks/auth/useAuth';
import { useTranslation } from '@/i18n/i18n-context';
import { LOCALES, type Locale } from '@/i18n/index';
import { cn } from '@/lib/utils';

const WAREHOUSE_TITLES: [string, string][] = [
  ['/warehouse/invoices', 'Nakladnoylar'],
  ['/warehouse/stock-in', 'Kirim qo\'shish'],
  ['/warehouse/write-off', 'Hisobdan chiqarish'],
  ['/warehouse/inventory', 'Inventar'],
  ['/warehouse/expiry', 'Muddati tugayotganlar'],
  ['/warehouse/low-stock', 'Kam qolganlar'],
  ['/warehouse/history', 'Harakatlar tarixi'],
  ['/warehouse/suppliers', 'Yetkazib beruvchilar'],
  ['/warehouse', 'Dashboard'],
];

function getTitle(pathname: string): string {
  for (const [prefix, title] of WAREHOUSE_TITLES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return title;
  }
  return 'Ombor';
}

export function WarehouseHeader() {
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending } = useLogout();
  const { locale, setLocale } = useTranslation();
  const pathname = usePathname();
  const pageTitle = getTitle(pathname);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?'
    : '?';
  const fullName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '';

  return (
    <header className="h-14 shrink-0 flex items-center justify-between gap-4 border-b border-amber-100 bg-gradient-to-r from-amber-50/60 to-white px-5">
      {/* Page title */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-sm font-semibold text-gray-800 truncate">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Language switcher */}
        <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
          <Globe className="h-3.5 w-3.5 text-gray-400 mx-1" />
          {LOCALES.map((loc) => (
            <button
              key={loc.value}
              type="button"
              onClick={() => setLocale(loc.value as Locale)}
              title={loc.label}
              className={cn(
                'rounded-md px-2 py-1 text-[10px] font-bold uppercase transition',
                locale === loc.value
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {loc.value}
            </button>
          ))}
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{fullName}</p>
              <p className="text-[10px] font-medium text-amber-600 leading-tight uppercase">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              disabled={isPending}
              title="Chiqish"
              className="ml-1 rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
