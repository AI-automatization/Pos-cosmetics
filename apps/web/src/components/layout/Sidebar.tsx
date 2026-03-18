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
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/auth/useAuth';

/* ─── Types ─── */

type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER' | 'CASHIER';

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
  roles: Role[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* ─── Navigation Config (single source of truth) ─── */

const ALL: Role[] = ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER', 'CASHIER'];
const NO_CASHIER: Role[] = ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER'];
const STAFF: Role[] = ['ADMIN', 'MANAGER', 'VIEWER', 'CASHIER'];
const ADMIN_ONLY: Role[] = ['ADMIN'];

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Asosiy',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ALL },
      { label: 'POS Kassa', href: '/pos', icon: Monitor, roles: STAFF },
    ],
  },
  {
    title: 'Katalog',
    items: [
      {
        label: 'Katalog',
        icon: Package,
        roles: ['ADMIN', 'MANAGER', 'VIEWER'],
        children: [
          { label: 'Mahsulotlar', href: '/catalog/products' },
          { label: 'Kategoriyalar', href: '/catalog/categories' },
          { label: 'Yetkazib beruvchilar', href: '/catalog/suppliers' },
        ],
      },
      {
        label: 'Inventar',
        icon: Warehouse,
        roles: ['ADMIN', 'MANAGER', 'VIEWER'],
        children: [
          { label: 'Zaxira holati', href: '/inventory' },
          { label: 'Kam zaxira', href: '/inventory/low-stock' },
          { label: 'Yaroqlilik muddati', href: '/inventory/expiry' },
        ],
      },
    ],
  },
  {
    title: 'Savdo',
    items: [
      {
        label: 'Sotuv',
        icon: ShoppingCart,
        roles: NO_CASHIER,
        children: [
          { label: 'Buyurtmalar', href: '/sales/orders' },
          { label: 'Qaytarishlar', href: '/sales/returns' },
          { label: 'Smenalar', href: '/sales/shifts' },
        ],
      },
      { label: "To'lovlar", href: '/payments/history', icon: CreditCard, roles: NO_CASHIER },
      {
        label: 'Nasiya',
        icon: HandCoins,
        roles: NO_CASHIER,
        children: [
          { label: "Qarzlar ro'yxati", href: '/nasiya' },
          { label: 'Aging hisobot', href: '/nasiya/aging' },
        ],
      },
      {
        label: 'Xaridorlar',
        icon: Users,
        roles: NO_CASHIER,
        children: [{ label: 'Barcha xaridorlar', href: '/customers' }],
      },
    ],
  },
  {
    title: 'Moliya',
    items: [
      {
        label: 'Moliya',
        icon: Wallet,
        roles: ['OWNER', 'ADMIN'],
        children: [{ label: 'Xarajatlar', href: '/finance/expenses' }],
      },
      { label: 'Analitika', href: '/analytics', icon: TrendingUp, roles: NO_CASHIER },
      {
        label: 'Hisobotlar',
        icon: BarChart2,
        roles: NO_CASHIER,
        children: [
          { label: 'Umumiy', href: '/reports' },
          { label: 'Kunlik sotuv', href: '/reports/daily-revenue' },
          { label: 'Top mahsulotlar', href: '/reports/top-products' },
          { label: 'Smenalar', href: '/reports/shifts' },
          { label: 'Filiallar', href: '/reports/branches' },
        ],
      },
    ],
  },
  {
    title: 'Sozlamalar',
    items: [
      {
        label: 'Sozlamalar',
        icon: Settings,
        roles: ADMIN_ONLY,
        children: [
          { label: 'Foydalanuvchilar', href: '/settings/users' },
          { label: 'Printer', href: '/settings/printer' },
          { label: 'Audit log', href: '/settings/audit-log' },
          { label: 'Hisob va tarif', href: '/settings/billing' },
        ],
      },
    ],
  },
];

/* ─── Helpers ─── */

function getNavSections(role: string | undefined): NavSection[] {
  const r = (role ?? 'ADMIN') as Role;
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(r)),
  })).filter((section) => section.items.length > 0);
}

const COLLAPSE_KEY = 'raos-sidebar-collapsed';

function useCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  });
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
  if (collapsed) {
    return <div className="mx-3 my-1 border-t border-gray-200" />;
  }
  return (
    <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 first:mt-0">
      {title}
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
  const active = pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition',
        collapsed ? 'justify-center' : 'gap-3',
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && item.label}
    </Link>
  );
}

function NavGroup({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = item.children?.some((c) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isActive ?? false);

  if (item.href) {
    return <NavLink item={item as NavItem & { href: string }} collapsed={collapsed} />;
  }

  if (collapsed) {
    const firstHref = item.children?.[0]?.href ?? '#';
    return (
      <Link
        href={firstHref}
        title={item.label}
        className={cn(
          'flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
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
  const sections = getNavSections(user?.role);

  return (
    <>
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-gray-200',
        collapsed ? 'justify-center px-2' : 'gap-3 px-4',
      )}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Store className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">RAOS</p>
            <p className="text-xs text-gray-500">
              {user?.role === 'OWNER' ? 'Owner Panel' : 'Admin Panel'}
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

      {/* Nav */}
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

      {/* Collapse toggle (desktop only) */}
      <div className="hidden border-t border-gray-200 p-2 md:block">
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? 'Kengaytirish' : 'Yig\'ish'}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-xs">Yig&#39;ish</span>
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

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileOpen, onMobileClose]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden h-full shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 md:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent collapsed={collapsed} toggle={toggle} />
      </aside>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="relative flex h-full w-64 flex-col bg-white shadow-xl">
            <SidebarContent collapsed={false} toggle={toggle} onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
