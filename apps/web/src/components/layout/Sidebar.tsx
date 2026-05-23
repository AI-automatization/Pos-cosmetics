'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import { useTranslation } from '@/i18n/i18n-context';
import { getNavSections, type NavItem } from './SidebarMenuItems';

/* ─── Helpers ─── */

const COLLAPSE_KEY = 'raos-sidebar-collapsed';

function useCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
  }, []);
  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      return next;
    });
  }, []);
  return { collapsed, toggle };
}

/* ─── Components ─── */

function NavSkeleton({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex flex-col gap-1 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-9 animate-pulse rounded-lg bg-gray-100"
          style={{ width: collapsed ? '100%' : `${70 + (i % 3) * 10}%` }}
        />
      ))}
    </div>
  );
}

function SectionLabel({ title, collapsed }: { title: string; collapsed: boolean }) {
  const { t } = useTranslation();
  if (collapsed) {
    return <div className="mx-3 my-1 border-t border-gray-200" />;
  }
  return (
    <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 first:mt-0">
      {t(title)}
    </p>
  );
}

function NavLink({
  item,
  collapsed,
}: {
  item: NavItem & { href: string };
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const active = pathname === item.href || pathname.startsWith(item.href + '/');
  const label = item.tKey ? t(item.tKey) : item.label;

  return (
    <Link
      href={item.href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        collapsed ? 'justify-center' : 'gap-3',
        active
          ? 'bg-raos-cyan/10 text-raos-cyan-dark shadow-sm ring-1 ring-raos-cyan/20'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
      )}
    >
      <item.icon className={cn('h-4.5 w-4.5 shrink-0', active ? 'text-raos-cyan-dark' : 'text-gray-400')} />
      {!collapsed && label}
    </Link>
  );
}

function NavGroup({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isActive = item.children?.some((c) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isActive ?? false);
  const label = item.tKey ? t(item.tKey) : item.label;

  if (item.href) {
    return <NavLink item={item as NavItem & { href: string }} collapsed={collapsed} />;
  }

  if (collapsed) {
    const firstHref = item.children?.[0]?.href ?? '#';
    return (
      <Link
        href={firstHref}
        title={label}
        className={cn(
          'flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-raos-cyan/10 text-raos-cyan-dark shadow-sm ring-1 ring-raos-cyan/20'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        )}
      >
        <item.icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-raos-cyan-dark' : 'text-gray-400')} />
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-raos-cyan/10 text-raos-cyan-dark shadow-sm ring-1 ring-raos-cyan/20'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        )}
      >
        <item.icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-raos-cyan-dark' : 'text-gray-400')} />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="ml-7 mt-0.5 flex flex-col gap-0.5 border-l border-gray-100 pl-3">
          {item.children?.map((child) => {
            const active = pathname.startsWith(child.href);
            const childLabel = child.tKey ? t(child.tKey) : child.label;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-sm transition-colors duration-100',
                  active
                    ? 'font-semibold text-raos-cyan-dark'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                )}
              >
                {childLabel}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Sidebar Content (shared between desktop & mobile) ─── */

function SidebarContent({
  collapsed,
  toggle,
  onNavigate,
}: {
  collapsed: boolean;
  toggle: () => void;
  onNavigate?: () => void;
}) {
  const { data: user, isLoading } = useCurrentUser();
  const { t } = useTranslation();
  const sections = getNavSections(user?.role);

  return (
    <>
      <div className={cn(
        'flex h-14 items-center border-b border-gray-100',
        collapsed ? 'justify-center px-2' : 'gap-3 px-4',
      )}>
        <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded-xl shadow-sm shadow-raos-cyan/30 ring-1 ring-raos-cyan/20">
          <Image src="/icon.png" alt="RAOS" width={32} height={32} priority />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 tracking-tight">RAOS</p>
            <p className="text-[11px] text-gray-400 font-medium">
              {user?.role === 'OWNER' ? t('nav.ownerPanel') : t('nav.adminPanel')}
            </p>
          </div>
        )}
        {!collapsed && onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 md:hidden"
            aria-label="Yopish"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <NavSkeleton collapsed={collapsed} />
      ) : (
        <nav className="flex-1 overflow-y-auto p-2" onClick={onNavigate}>
          {sections.map((section) => (
            <div key={section.title}>
              <SectionLabel title={section.title} collapsed={collapsed} />
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavGroup key={item.label} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      )}

      {!collapsed && user && (
        <div className="border-t border-gray-100 p-2">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-raos-cyan to-raos-cyan-dark text-xs font-bold text-raos-bg-deep">
              {(user.firstName ?? user.email ?? 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-800">
                {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email}
              </p>
              <p className="text-[10px] font-medium text-gray-400">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      <div className="hidden border-t border-gray-200 p-2 md:block">
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? t('nav.expand') : t('nav.collapse')}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-xs">{t('nav.collapse')}</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}

/* ─── Main Sidebar ─── */

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { collapsed, toggle } = useCollapsed();

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileOpen, onMobileClose]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen]);

  return (
    <>
      <aside
        className={cn(
          'hidden h-full shrink-0 flex-col border-r border-gray-100 bg-white shadow-[1px_0_0_0_#f3f4f6] transition-[width] duration-200 md:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent collapsed={collapsed} toggle={toggle} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={onMobileClose}
          />
          <aside className="relative flex h-full w-64 flex-col bg-white shadow-xl">
            <SidebarContent collapsed={false} toggle={toggle} onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
