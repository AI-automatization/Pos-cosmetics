// Ombor screen — types, constants and status utilities
import type { LowStockItem } from '../../api/inventory.api';

// ─── Stock status ───────────────────────────────────────
export type StockStatus = 'MAVJUD' | 'KAM' | 'TUGADI';

export interface StatusConfig {
  readonly iconBg:     string;
  readonly iconColor:  string;
  readonly badgeBg:    string;
  readonly badgeText:  string;
  readonly stockColor: string;
  readonly label:      string;
}

export function getStatus(item: LowStockItem): StockStatus {
  if (item.stock === 0) return 'TUGADI';
  if (item.stock <= item.minStockLevel) return 'KAM';
  return 'MAVJUD';
}

export const STATUS_CFG: Record<StockStatus, StatusConfig> = {
  MAVJUD: {
    iconBg:     '#F0FDF4',
    iconColor:  '#16A34A',
    badgeBg:    '#F0FDF4',
    badgeText:  '#16A34A',
    stockColor: '#16A34A',
    label:      'MAVJUD',
  },
  KAM: {
    iconBg:     '#FFFBEB',
    iconColor:  '#D97706',
    badgeBg:    '#FFFBEB',
    badgeText:  '#D97706',
    stockColor: '#D97706',
    label:      'KAM',
  },
  TUGADI: {
    iconBg:     '#FEF2F2',
    iconColor:  '#DC2626',
    badgeBg:    '#FEF2F2',
    badgeText:  '#DC2626',
    stockColor: '#DC2626',
    label:      'TUGAGAN',
  },
};

// ─── Filter tabs ────────────────────────────────────────
export type FilterTab = 'ALL' | 'KAM' | 'TUGADI';

export interface TabItem {
  readonly key:   FilterTab;
  readonly label: string;
}

export const TABS: TabItem[] = [
  { key: 'ALL',    label: 'Barchasi' },
  { key: 'KAM',   label: 'KAM'      },
  { key: 'TUGADI', label: 'TUGAGAN' },
];
