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
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import { useTranslation } from '@/i18n/i18n-context';

/* ─── Types ─── */

type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER' | 'CASHIER';

interface NavChild {
  label: string;
  tKey?: string;
  href: string;
}

interface NavItem {
  label: string;
  tKey?: string;
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
const ADMIN_ONLY: Role[] = ['OWNER', 'ADMIN'];

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Asosiy',
    items: [
      { label: 'Dashboard', tKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ALL },
      { label: 'POS Kassa', tKey: 'nav.pos', href: '/pos', icon: Monitor, roles: ['CASHIER'] },
    ],
  },
  {
    title: 'Katalog',
    items: [
      {
        label: 'Katalog', tKey: 'nav.catalog',
        icon: Package,
        roles: ['ADMIN', 'MANAGER', 'VIEWER'],
        children: [
          { label: 'Mahsulotlar', tKey: 'nav.products', href: '/catalog/products' },
          { label: 'Kategoriyalar', tKey: 'nav.categories', href: '/catalog/categories' },
          { label: 'Yetkazib beruvchilar', tKey: 'nav.suppliers', href: '/catalog/suppliers' },
        ],
      },
      {
        label: 'Inventar', tKey: 'nav.inventory',
        icon: Warehouse,
        roles: ['ADMIN', 'MANAGER', 'VIEWER'],
        children: [
          { label: 'Zaxira holati', tKey: 'nav.stockLevels', href: '/inventory' },
          { label: 'Kam zaxira', tKey: 'nav.lowStock', href: '/inventory/low-stock' },
          { label: 'Yaroqlilik muddati', tKey: 'nav.expiry', href: '/inventory/expiry' },
          { label: "Ko'chirish", tKey: 'nav.transfer', href: '/inventory/transfer' },
        ],
      },
    ],
  },
  {
    title: 'Savdo',
    items: [
      {
        label: 'Sotuv', tKey: 'nav.sales',
        icon: ShoppingCart,
        roles: NO_CASHIER,
        children: [
          { label: 'Buyurtmalar', tKey: 'nav.orders', href: '/sales/orders' },
          { label: 'Qaytarishlar', tKey: 'nav.returns', href: '/sales/returns' },
          { label: 'Aksiyalar', tKey: 'nav.promotions', href: '/promotions' },
          { label: 'Smenalar', tKey: 'nav.shifts', href: '/sales/shifts' },
        ],
      },
      { label: "To'lovlar", tKey: 'nav.paymentHistory', href: '/payments/history', icon: CreditCard, roles: NO_CASHIER },
      {
        label: 'Nasiya', tKey: 'nav.nasiya',
        icon: HandCoins,
        roles: NO_CASHIER,
        children: [
          { label: "Qarzlar ro'yxati", tKey: 'nav.nasiya', href: '/nasiya' },
          { label: 'Aging hisobot', tKey: 'nav.aging', href: '/nasiya/aging' },
        ],
      },
      {
        label: 'Xaridorlar', tKey: 'nav.customers',
        icon: Users,
        roles: NO_CASHIER,
        children: [{ label: 'Barcha xaridorlar', tKey: 'nav.customers', href: '/customers' }],
      },
    ],
  },
  {
    title: 'Moliya',
    items: [
      {
        label: 'Moliya', tKey: 'nav.finance',
        icon: Wallet,
        roles: ['OWNER', 'ADMIN'],
        children: [
          { label: 'Foyda va zarar', tKey: 'nav.pnl', href: '/finance/pnl' },
          { label: 'Xarajatlar', tKey: 'nav.expenses', href: '/finance/expenses' },
          { label: 'Valyuta kurslari', tKey: 'nav.exchangeRates', href: '/finance/exchange-rates' },
        ],
      },
      { label: 'Analitika', tKey: 'nav.analytics', href: '/analytics', icon: TrendingUp, roles: NO_CASHIER },
      { label: "Ko'chmas mulk", tKey: 'nav.realEstate', href: '/realestate', icon: Building2, roles: ['OWNER', 'ADMIN'] },
      {
        label: 'Hisobotlar', tKey: 'nav.reports',
        icon: BarChart2,
        roles: NO_CASHIER,
        children: [
          { label: 'Umumiy', tKey: 'nav.reports', href: '/reports' },
          { label: 'Kunlik sotuv', tKey: 'nav.dailyRevenue', href: '/reports/daily-revenue' },
          { label: 'Top mahsulotlar', tKey: 'nav.topProducts', href: '/reports/top-products' },
          { label: 'Smenalar', tKey: 'nav.shiftReports', href: '/reports/shifts' },
          { label: 'Filiallar', tKey: 'nav.branchComparison', href: '/reports/branches' },
          { label: 'Hisobot yaratish', tKey: 'nav.reportBuilder', href: '/reports/builder' },
        ],
      },
    ],
  },
  {
    title: 'Sozlamalar',
    items: [
      {
        label: 'Sozlamalar', tKey: 'nav.settings',
        icon: Settings,
        roles: ADMIN_ONLY,
        children: [
          { label: 'Foydalanuvchilar', tKey: 'nav.users', href: '/settings/users' },
          { label: 'Filiallar', tKey: 'nav.branches', href: '/settings/branches' },
          { label: 'Printer', tKey: 'nav.printer', href: '/settings/printer' },
          { label: 'Audit log', tKey: 'nav.auditLog', href: '/settings/audit-log' },
          { label: 'Hisob va tarif', tKey: 'nav.billing', href: '/settings/billing' },
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
  const { t } = useTranslation();
  const active = pathname === item.href || pathname.startsWith(item.href + '/');
  const label = item.tKey ? t(item.tKey) : item.label;

  return (
    <Link
      href={item.href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition',
        collapsed ? 'justify-center' : 'gap-3',
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
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
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="ml-8 mt-1 flex flex-col gap-0.5">
          {item.children?.map((child) => {
            const active = pathname.startsWith(child.href);
            const childLabel = child.tKey ? t(child.tKey) : child.label;
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
