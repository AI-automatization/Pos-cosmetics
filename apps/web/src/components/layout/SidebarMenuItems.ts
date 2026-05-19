import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  CreditCard,
  BarChart2,
  Settings,
  Monitor,
  Users,
  HandCoins,
  Wallet,
  TrendingUp,
  Star,
  Building2,
  ClipboardList,
} from 'lucide-react';
import type React from 'react';

export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER' | 'CASHIER';

export interface NavChild {
  label: string;
  tKey?: string;
  href: string;
}

export interface NavItem {
  label: string;
  tKey?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
  roles: Role[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const NO_CASHIER: Role[] = ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER'];
const ADMIN_ONLY: Role[] = ['OWNER', 'ADMIN'];

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'nav.sectionMain',
    items: [
      { label: 'Dashboard', tKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard, roles: NO_CASHIER },
      { label: 'POS Kassa', tKey: 'nav.pos', href: '/pos', icon: Monitor, roles: ['CASHIER'] },
    ],
  },
  {
    title: 'nav.sectionCatalog',
    items: [
      {
        label: 'Katalog', tKey: 'nav.catalog',
        icon: Package,
        roles: ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER'],
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
    title: 'nav.sectionSales',
    items: [
      {
        label: 'Sotuv', tKey: 'nav.sales',
        icon: ShoppingCart,
        roles: NO_CASHIER,
        children: [
          { label: 'Buyurtmalar', tKey: 'nav.orders', href: '/sales/orders' },
          { label: 'Qaytarishlar', tKey: 'nav.returns', href: '/sales/returns' },
          { label: 'Chegirmalar', tKey: 'nav.promotions', href: '/promotions' },
          { label: 'Promo kodlar', tKey: 'promo.title', href: '/promotions/codes' },
          { label: 'Smenalar', tKey: 'nav.shifts', href: '/sales/shifts' },
        ],
      },
      { label: "To'lovlar", tKey: 'nav.paymentHistory', href: '/payments/history', icon: CreditCard, roles: NO_CASHIER },
      {
        label: 'Loyalty', tKey: 'loyalty.title',
        icon: Star,
        roles: NO_CASHIER,
        children: [
          { label: 'Dashboard', tKey: 'loyalty.dashboard', href: '/loyalty' },
          { label: 'Mijoz ballari', tKey: 'loyalty.customers', href: '/loyalty/customers' },
          { label: 'Ball tarixi', tKey: 'loyalty.history', href: '/loyalty/history' },
          { label: 'Sozlamalar', tKey: 'loyalty.settings', href: '/loyalty/settings' },
        ],
      },
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
        label: 'Xodimlar', tKey: 'nav.workers',
        icon: Users,
        href: '/workers',
        roles: ADMIN_ONLY,
      },
    ],
  },
  {
    title: 'nav.sectionFinance',
    items: [
      {
        label: 'Moliya', tKey: 'nav.finance',
        icon: Wallet,
        roles: ['OWNER', 'ADMIN'],
        children: [
          { label: 'Foyda va zarar', tKey: 'nav.pnl', href: '/finance/pnl' },
          { label: 'Xarajatlar', tKey: 'nav.expenses', href: '/finance/expenses' },
        ],
      },
      { label: 'Analitika', tKey: 'nav.analytics', href: '/analytics', icon: TrendingUp, roles: NO_CASHIER },
      {
        label: 'Hisobotlar', tKey: 'nav.reports',
        icon: BarChart2,
        roles: NO_CASHIER,
        children: [
          { label: 'Kunlik daromad', tKey: 'nav.dailyRevenue', href: '/reports/daily-revenue' },
          { label: 'Top mahsulotlar', tKey: 'nav.topProducts', href: '/reports/top-products' },
          { label: 'Smenalar', tKey: 'nav.shiftReports', href: '/reports/shifts' },
          { label: 'Filiallar', tKey: 'nav.branchComparison', href: '/reports/branches' },
          { label: 'Hisobot yaratish', tKey: 'nav.reportBuilder', href: '/reports/builder' },
        ],
      },
    ],
  },
  {
    title: 'nav.sectionManagement',
    items: [
      { label: 'Topshiriqlar', tKey: 'nav.tasks', href: '/tasks', icon: ClipboardList, roles: ['OWNER', 'ADMIN', 'MANAGER'] },
      { label: 'Filiallar', tKey: 'nav.branches', href: '/settings/branches', icon: Building2, roles: ['OWNER', 'ADMIN'] },
    ],
  },
  {
    title: 'nav.sectionSettings',
    items: [
      {
        label: 'Sozlamalar', tKey: 'nav.settings',
        icon: Settings,
        roles: ADMIN_ONLY,
        children: [
          { label: 'Foydalanuvchilar', tKey: 'nav.users', href: '/settings/users' },
          { label: 'Printer', tKey: 'nav.printer', href: '/settings/printer' },
          { label: 'Audit log', tKey: 'nav.auditLog', href: '/settings/audit-log' },
          { label: 'Hisob va tarif', tKey: 'nav.billing', href: '/settings/billing' },
          { label: "To'lov usullari", tKey: 'nav.paymentMethods', href: '/settings/payment-methods' },
        ],
      },
    ],
  },
];

export function getNavSections(role: string | undefined): NavSection[] {
  const r = (role ?? 'ADMIN') as Role;
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(r)),
  })).filter((section) => section.items.length > 0);
}
