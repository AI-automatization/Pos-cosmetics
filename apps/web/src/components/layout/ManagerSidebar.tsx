'use client';

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
  BriefcaseBusiness,
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

export function ManagerSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <BriefcaseBusiness className="h-4 w-4 text-white" />
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
                    ? 'bg-blue-50 text-blue-700'
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
  );
}
