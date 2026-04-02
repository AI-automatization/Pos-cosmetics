'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  AlertOctagon,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Overview', href: '/founder/overview', icon: LayoutDashboard },
  { label: 'Tenantlar', href: '/founder/tenants', icon: Building2 },
  { label: 'Error log', href: '/founder/errors', icon: AlertOctagon },
];

export function FounderSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">RAOS</p>
          <p className="text-xs text-gray-400">Founder Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3">
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-violet-50 text-violet-700'
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

      {/* Back to admin */}
      <div className="border-t border-gray-200 p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 transition hover:text-gray-600"
        >
          ← Admin panelga
        </Link>
      </div>
    </aside>
  );
}
