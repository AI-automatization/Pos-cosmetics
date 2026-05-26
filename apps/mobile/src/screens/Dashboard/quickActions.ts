import type { Ionicons } from '@expo/vector-icons';

export interface QuickActionConfig {
  readonly icon: React.ComponentProps<typeof Ionicons>['name'];
  readonly label: string;
  readonly color: string;
  readonly bg: string;
  readonly route: string;
  readonly routeParams?: Record<string, unknown>;
}

export const OWNER_ACTIONS: readonly QuickActionConfig[] = [
  {
    icon: 'bar-chart-outline',
    label: 'Analitika',
    color: '#2563EB',
    bg: '#EFF6FF',
    route: 'Analytics',
  },
  {
    icon: 'trending-up-outline',
    label: 'Moliya',
    color: '#16A34A',
    bg: '#F0FDF4',
    route: 'Moliya',
  },
  {
    icon: 'people-outline',
    label: 'Mijozlar',
    color: '#D97706',
    bg: '#FFFBEB',
    route: 'Koproq',
  },
  {
    icon: 'pulse-outline',
    label: 'Sistema',
    color: '#7C3AED',
    bg: '#F5F3FF',
    route: 'Koproq',
  },
];

export const MANAGER_ACTIONS: readonly QuickActionConfig[] = [
  {
    icon: 'cart-outline',
    label: 'Savdo',
    color: '#2563EB',
    bg: '#EFF6FF',
    route: 'Savdo',
  },
  {
    icon: 'document-text-outline',
    label: 'Hisobot',
    color: '#0D9488',
    bg: '#F0FDFA',
    route: 'Moliya',
  },
  {
    icon: 'people-outline',
    label: 'Mijozlar',
    color: '#D97706',
    bg: '#FFFBEB',
    route: 'Koproq',
  },
  {
    icon: 'receipt-outline',
    label: 'Buyurtmalar',
    color: '#7C3AED',
    bg: '#F5F3FF',
    route: 'Koproq',
  },
];

export const CASHIER_ACTIONS: readonly QuickActionConfig[] = [
  {
    icon: 'cart-outline',
    label: 'Savdo',
    color: '#2563EB',
    bg: '#EFF6FF',
    route: 'Savdo',
  },
  {
    icon: 'grid-outline',
    label: 'Katalog',
    color: '#D97706',
    bg: '#FFFBEB',
    route: 'Katalog',
  },
  {
    icon: 'people-outline',
    label: 'Mijozlar',
    color: '#16A34A',
    bg: '#F0FDF4',
    route: 'Koproq',
    routeParams: { screen: 'CustomersScreen' },
  },
  {
    icon: 'settings-outline',
    label: 'Sozlamalar',
    color: '#7C3AED',
    bg: '#F5F3FF',
    route: 'Koproq',
    routeParams: { screen: 'SettingsScreen' },
  },
];

export const WAREHOUSE_ACTIONS: readonly QuickActionConfig[] = [
  {
    icon: 'list-outline',
    label: 'Zaxira holati',
    color: '#2563EB',
    bg: '#EFF6FF',
    route: 'Katalog',
  },
  {
    icon: 'document-text-outline',
    label: 'Nakladnoy',
    color: '#16A34A',
    bg: '#F0FDF4',
    route: 'Koproq',
  },
  {
    icon: 'notifications-outline',
    label: "So'rovlar",
    color: '#D97706',
    bg: '#FFFBEB',
    route: 'Koproq',
  },
  {
    icon: 'swap-horizontal-outline',
    label: 'Harakatlar',
    color: '#7C3AED',
    bg: '#F5F3FF',
    route: 'Moliya',
  },
];

export const DEFAULT_ACTIONS: readonly QuickActionConfig[] = [
  {
    icon: 'cart-outline',
    label: 'Savdo',
    color: '#2563EB',
    bg: '#EFF6FF',
    route: 'Savdo',
  },
  {
    icon: 'arrow-down-circle-outline',
    label: 'Kirim',
    color: '#16A34A',
    bg: '#F0FDF4',
    route: 'Koproq',
  },
  {
    icon: 'grid-outline',
    label: 'Katalog',
    color: '#D97706',
    bg: '#FFFBEB',
    route: 'Katalog',
  },
  {
    icon: 'bar-chart-outline',
    label: 'Hisobot',
    color: '#7C3AED',
    bg: '#F5F3FF',
    route: 'Moliya',
  },
];

/**
 * Rolga qarab tegishli quick action konfiguratsiyasini qaytaradi.
 */
export function getActionsForRole(
  role: string | undefined,
  isOwnerAdmin: boolean,
): readonly QuickActionConfig[] {
  if (isOwnerAdmin) return OWNER_ACTIONS;
  if (role === 'MANAGER') return MANAGER_ACTIONS;
  if (role === 'CASHIER') return CASHIER_ACTIONS;
  if (role === 'WAREHOUSE') return WAREHOUSE_ACTIONS;
  return DEFAULT_ACTIONS;
}
