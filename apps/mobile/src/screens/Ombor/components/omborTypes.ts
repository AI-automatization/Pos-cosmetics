// ─── Colors ───────────────────────────────────────────
export const C = {
  bg:        '#F5F5F7',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#F3F4F6',
  primary:   '#5B5BD6',
  green:     '#10B981',
  orange:    '#F59E0B',
  red:       '#EF4444',
};

// ─── Stock status ─────────────────────────────────────
export type StockStatus = 'MAVJUD' | 'KAM' | 'TUGADI';

export function getStatus(item: { stock: number; minStockLevel: number }): StockStatus {
  if (item.stock === 0) return 'TUGADI';
  if (item.stock <= item.minStockLevel) return 'KAM';
  return 'MAVJUD';
}

export const STATUS_CFG: Record<
  StockStatus,
  {
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    stockColor: string;
    label: string;
  }
> = {
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

// ─── Filter tabs ──────────────────────────────────────
export type FilterTab = 'ALL' | 'KAM' | 'TUGADI';

export const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL',    label: 'Hammasi' },
  { key: 'KAM',   label: 'Kam'     },
  { key: 'TUGADI', label: 'Tugadi' },
];
