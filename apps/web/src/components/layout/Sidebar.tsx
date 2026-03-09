'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  CreditCard,
  BarChart2,
  Settings,
  ChevronDown,
  Store,
  Monitor,
  Users,
  HandCoins,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'POS Kassa', href: '/pos', icon: Monitor },
  {
    label: 'Katalog',
    icon: Package,
    children: [
      { label: 'Mahsulotlar', href: '/catalog/products' },
      { label: 'Kategoriyalar', href: '/catalog/categories' },
      { label: 'Yetkazib beruvchilar', href: '/catalog/suppliers' },
    ],
  },
  {
    label: 'Inventar',
    icon: Warehouse,
    children: [
      { label: 'Zaxira holati', href: '/inventory' },
      { label: 'Kirim (Nakladnoy)', href: '/inventory/stock-in' },
      { label: 'Chiqim', href: '/inventory/stock-out' },
      { label: 'Kam zaxira', href: '/inventory/low-stock' },
      { label: 'Yaroqlilik muddati', href: '/inventory/expiry' },
    ],
  },
  {
    label: 'Sotuv',
    icon: ShoppingCart,
    children: [
      { label: 'Buyurtmalar', href: '/sales/orders' },
      { label: 'Qaytarishlar', href: '/sales/returns' },
      { label: 'Smenalar', href: '/sales/shifts' },
      { label: 'Aksiyalar', href: '/sales/promotions' },
    ],
  },
  { label: 'To\'lovlar', href: '/payments/history', icon: CreditCard },
  {
    label: 'Nasiya',
    icon: HandCoins,
    children: [
      { label: 'Qarzlar ro\'yxati', href: '/nasiya' },
      { label: 'Aging hisobot', href: '/nasiya/aging' },
    ],
  },
  {
    label: 'Xaridorlar',
    icon: Users,
    children: [
      { label: 'Barcha xaridorlar', href: '/customers' },
    ],
  },
  {
    label: 'Moliya',
    icon: Wallet,
    children: [
      { label: 'Xarajatlar', href: '/finance/expenses' },
    ],
  },
  { label: 'Analitika', href: '/analytics', icon: TrendingUp },
  {
    label: 'Hisobotlar',
    icon: BarChart2,
    children: [
      { label: 'Umumiy', href: '/reports' },
      { label: 'Kunlik sotuv', href: '/reports/daily-revenue' },
      { label: 'Top mahsulotlar', href: '/reports/top-products' },
      { label: 'Smenalar', href: '/reports/shifts' },
      { label: 'Filiallar', href: '/reports/branches' },
      { label: 'Eksport', href: '/reports/export' },
    ],
  },
  {
    label: 'Sozlamalar',
    icon: Settings,
    children: [
      { label: 'Printer', href: '/settings/printer' },
      { label: 'Foydalanuvchilar', href: '/settings/users' },
      { label: 'Audit log', href: '/settings/audit-log' },
      { label: 'Hisob va tarif', href: '/settings/billing' },
    ],
  },
];

function NavGroup({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = item.children?.some((c) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isActive ?? false);

  if (item.href) {
    const active = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
          active
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="ml-8 mt-1 flex flex-col gap-0.5">
          {item.children?.map((child) => {
            const active = pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition',
                  active
                    ? 'font-medium text-blue-700'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Store className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">RAOS</p>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavGroup key={item.label} item={item} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3">
        <p className="text-xs text-gray-400">RAOS v1.0 · Kosmetika POS</p>
      </div>
    </aside>
  );
}
