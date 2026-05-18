'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

const NAV = [
  { tKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { tKey: 'nav.catalog', href: '/catalog/products', icon: Package },
  { tKey: 'nav.inventory', href: '/inventory', icon: Boxes },
  { tKey: 'nav.sales', href: '/sales/orders', icon: ShoppingCart },
  { tKey: 'nav.nasiya', href: '/nasiya', icon: CreditCard },
  { tKey: 'nav.workers', href: '/workers', icon: Users },
  { tKey: 'nav.reports', href: '/reports', icon: BarChart2 },
];

export function ManagerSidebar({ mobileOpen, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
    <aside className={cn(
      'flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white',
      'fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
    )}>
      {/* Logo — RAOS canonical cyan icon */}
      <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-4">
        <div className="flex h-7 w-7 overflow-hidden rounded-lg shadow-sm shadow-raos-cyan/30 ring-1 ring-raos-cyan/20">
          <Image src="/icon.png" alt="RAOS" width={28} height={28} priority />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">RAOS</p>
          <p className="text-xs text-gray-400">{t('nav.managerPanel')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-raos-cyan/10 text-raos-cyan-dark'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{t(item.tKey)}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
    </>
  );
}
