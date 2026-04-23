'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  AlertOctagon,
  ChevronRight,
  Zap,
  LogOut,
  CreditCard,
  TrendingUp,
  Database,
  Server,
  Shield,
  Users,
  Flag,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { label: 'Обзор', href: '/founder/overview', icon: LayoutDashboard },
      { label: 'Тенанты', href: '/founder/tenants', icon: Building2 },
      { label: 'Биллинг', href: '/founder/billing', icon: CreditCard },
      { label: 'Аналитика', href: '/founder/analytics', icon: TrendingUp },
    ],
  },
  {
    title: 'Система',
    items: [
      { label: 'База данных', href: '/founder/database', icon: Database },
      { label: 'Мониторинг', href: '/founder/system', icon: Server },
      { label: 'Безопасность', href: '/founder/security', icon: Shield },
      { label: 'Ошибки', href: '/founder/errors', icon: AlertOctagon },
    ],
  },
  {
    title: 'Управление',
    items: [
      { label: 'Админы', href: '/founder/admins', icon: Users },
      { label: 'Feature Flags', href: '/founder/features', icon: Flag },
      { label: 'Настройки', href: '/founder/settings', icon: Settings },
    ],
  },
];

export function FounderSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_id');
    localStorage.removeItem('admin_role');
    document.cookie = 'session_active=; path=/; max-age=0';
    document.cookie = 'user_role=; path=/; max-age=0';
    window.location.href = '/login';
  };

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
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-4">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.title ?? idx} className="flex flex-col gap-0.5">
              {section.title && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
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
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="flex flex-col gap-1 border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}
