'use client';

import { Bell, ChevronDown, User, Menu, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import { useUnreadCount, useMarkAllRead } from '@/hooks/notifications/useNotifications';
import { SyncStatusBar } from '@/components/SyncStatus/SyncStatusBar';
import { useTranslation } from '@/i18n/i18n-context';
import { LOCALES } from '@/i18n';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

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

function UserMenu() {
  const { data: user } = useCurrentUser();
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
    ? `${user.firstName} ${user.lastName}`.trim()
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
        <div className="text-left">
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
        </div>
      )}
    </div>
  );
}

function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="Tilni tanlash"
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium uppercase">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {LOCALES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => { setLocale(l.value); setOpen(false); }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-sm transition',
                locale === l.value
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SyncStatusBar />

        <LanguageSwitcher />

        <NotificationBell />

        <UserMenu />
      </div>
    </header>
  );
}
