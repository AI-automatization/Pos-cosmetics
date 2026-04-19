'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PackagePlus,
  PackageMinus,
  Package,
  AlertTriangle,
  TrendingDown,
  History,
  Truck,
  ChevronRight,
  Warehouse,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/auth/useAuth';

const NAV = [
  { label: 'Dashboard', href: '/warehouse', icon: LayoutDashboard, exact: true },
  { label: 'Nakladnoylar', href: '/warehouse/invoices', icon: PackagePlus, alsoActive: ['/warehouse/stock-in'] },
  { label: 'Hisobdan chiqarish', href: '/warehouse/write-off', icon: PackageMinus },
  { label: 'Inventar', href: '/warehouse/inventory', icon: Package },
  { label: "Muddati o'tayotganlar", href: '/warehouse/expiry', icon: AlertTriangle },
  { label: 'Kam qolganlar', href: '/warehouse/low-stock', icon: TrendingDown },
  { label: 'Harakatlar tarixi', href: '/warehouse/history', icon: History },
  { label: 'Yetkazib beruvchilar', href: '/warehouse/suppliers', icon: Truck },
];

export function WarehouseSidebar() {
  const pathname = usePathname();
  const { mutate: logout, isPending } = useLogout();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600">
          <Warehouse className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">RAOS</p>
          <p className="text-xs text-gray-400">Ombor paneli</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) || (item.alsoActive?.some((p) => pathname.startsWith(p)) ?? false);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{isPending ? 'Chiqilmoqda...' : 'Chiqish'}</span>
        </button>
      </div>
    </aside>
  );
}
