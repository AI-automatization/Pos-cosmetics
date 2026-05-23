import type { MoreStackParamList } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────

export interface MenuItem {
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly screen: keyof MoreStackParamList | null;
  readonly badge?: string;
}

export interface MenuGroup {
  readonly title: string;
  readonly items: readonly MenuItem[];
}

// ─── Role badge config ────────────────────────────────────

export interface RoleBadgeConfig {
  readonly bg: string;
  readonly text: string;
  readonly label: string;
}

export const ROLE_BADGE: Record<string, RoleBadgeConfig> = {
  OWNER:   { bg: '#F3E8FF', text: '#7C3AED', label: 'Egasi'     },
  ADMIN:   { bg: '#FEE2E2', text: '#DC2626', label: 'Admin'     },
  MANAGER: { bg: '#EFF6FF', text: '#2563EB', label: 'Menedzher' },
  CASHIER: { bg: '#F0FDF4', text: '#16A34A', label: 'Kassir'    },
  VIEWER:  { bg: '#F3F4F6', text: '#6B7280', label: "Ko'ruvchi" },
};

// ─── Menu group constants ─────────────────────────────────

export const INVENTAR_GROUP: MenuGroup = {
  title: 'Inventar',
  items: [
    {
      icon: 'archive-outline',
      title: 'Kirim',
      subtitle: 'Yetkazib beruvchi kirimi',
      screen: 'KirimScreen',
    },
    {
      icon: 'cube-outline',
      title: 'Ombor',
      subtitle: 'Mahsulot zaxiralari',
      screen: 'OmborScreen',
    },
  ],
};

export const BIZNES_GROUP: MenuGroup = {
  title: 'Biznes',
  items: [
    {
      icon: 'trending-up-outline',
      title: 'Moliya',
      subtitle: 'Hisobotlar va tahlil',
      screen: null,
    },
    {
      icon: 'people-outline',
      title: 'Nasiya',
      subtitle: 'Qarzlar boshqaruvi',
      screen: null,
    },
    {
      icon: 'people-outline',
      title: 'Mijozlar',
      subtitle: 'Mijozlar ro\'yxati',
      screen: 'CustomersScreen',
    },
    { icon: 'pricetag-outline', title: 'Aksiyalar', subtitle: 'Chegirmalar va aksiyalar', screen: 'PromotionsScreen' },
    { icon: 'document-text-outline', title: 'Hisobotlar', subtitle: 'Moliyaviy hisobotlar', screen: null },
  ],
};

export const BOSHQARUV_GROUP: MenuGroup = {
  title: 'Boshqaruv',
  items: [
    {
      icon: 'person-outline',
      title: 'Foydalanuvchilar',
      subtitle: "Tizim a'zolari",
      screen: 'UsersScreen',
    },
    {
      icon: 'business-outline',
      title: 'Filiallar',
      subtitle: 'Filiallar boshqaruvi',
      screen: 'BranchesScreen',
    },
    {
      icon: 'document-text-outline',
      title: 'Audit jurnali',
      subtitle: 'Tizim hodisalari',
      screen: 'AuditLogScreen',
    },
    {
      icon: 'swap-horizontal-outline' as const,
      title: 'Harakatlar tarixi',
      subtitle: 'Stock kirim va chiqim tarixi',
      screen: 'StockMovementsScreen' as keyof MoreStackParamList,
    },
  ],
};

export const OWNER_GROUP: MenuGroup = {
  title: "Egasi bo'limi",
  items: [
    {
      icon: 'time-outline',
      title: 'Smenlar',
      subtitle: 'Barcha filial smenlari',
      screen: 'ShiftsOwnerScreen' as keyof MoreStackParamList,
    },
    {
      icon: 'card-outline',
      title: 'Qarzdorlik',
      subtitle: 'Mijozlar qarzdorligi',
      screen: 'DebtsScreen' as keyof MoreStackParamList,
    },
  ],
};

export const WAREHOUSE_GROUP: MenuGroup = {
  title: "Ombor boshqaruvi",
  items: [
    {
      icon: 'storefront-outline',
      title: 'Yetkazuvchilar',
      subtitle: 'Yetkazib beruvchilar',
      screen: 'SuppliersScreen' as keyof MoreStackParamList,
    },
    {
      icon: 'swap-horizontal-outline' as const,
      title: "O'tkazma",
      subtitle: "Filiallar orasida tovar ko'chirish",
      screen: 'TransferScreen' as keyof MoreStackParamList,
    },
    {
      icon: 'trash-outline',
      title: 'Hisobdan chiqarish',
      subtitle: 'Write-off',
      screen: 'StockOutScreen' as keyof MoreStackParamList,
    },
    {
      icon: 'time-outline',
      title: 'Muddati o\'tganlar',
      subtitle: 'Expiry tracking',
      screen: 'ExpiryScreen' as keyof MoreStackParamList,
    },
    {
      icon: 'list-outline' as const,
      title: 'Transfer ro\'yxati',
      subtitle: 'Barcha transferlar holati',
      screen: 'TransferListScreen' as keyof MoreStackParamList,
    },
    {
      icon: 'analytics-outline' as const,
      title: 'Harakatlar tarixi',
      subtitle: 'Ombor harakatlari',
      screen: 'StockMovementsScreen' as keyof MoreStackParamList,
    },
  ],
};

export const SOZLAMALAR_GROUP: MenuGroup = {
  title: 'Sozlamalar',
  items: [
    {
      icon: 'settings-outline',
      title: 'Sozlamalar',
      subtitle: 'Ilova sozlamalari',
      screen: 'SettingsScreen',
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getRoleBadge(role: string): RoleBadgeConfig {
  return ROLE_BADGE[role] ?? { bg: '#F3F4F6', text: '#6B7280', label: role };
}
