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
    iconBg:     '#EEF2FF',
    iconColor:  '#5B5BD6',
    badgeBg:    '#D1FAE5',
    badgeText:  '#10B981',
    stockColor: '#10B981',
    label:      'MAVJUD',
  },
  KAM: {
    iconBg:     '#FEF3C7',
    iconColor:  '#F59E0B',
    badgeBg:    '#FEF3C7',
    badgeText:  '#F59E0B',
    stockColor: '#F59E0B',
    label:      'KAM',
  },
  TUGADI: {
    iconBg:     '#FEE2E2',
    iconColor:  '#EF4444',
    badgeBg:    '#FEE2E2',
    badgeText:  '#EF4444',
    stockColor: '#EF4444',
    label:      'TUGADI',
  },
};

// ─── Filter tabs ────────────────────────────────────────
export type FilterTab = 'ALL' | 'KAM' | 'TUGADI';

export interface TabItem {
  readonly key:   FilterTab;
  readonly label: string;
}

export const TABS: TabItem[] = [
  { key: 'ALL',    label: 'Hammasi' },
  { key: 'KAM',   label: 'Kam'     },
  { key: 'TUGADI', label: 'Tugadi' },
];
