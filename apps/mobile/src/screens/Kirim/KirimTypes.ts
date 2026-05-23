// KirimTypes.ts — typelar, status konfiguratsiyasi va tab ro'yxati

import type { Receipt } from '../../api/inventory.api';
import { C } from './KirimColors';

export type ReceiptStatus = Receipt['status'];
export type FilterTab = 'ALL' | 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface StatusConfig {
  readonly bg: string;
  readonly text: string;
  readonly label: string;
  readonly icon: string;
}

export const STATUS_CFG: Record<ReceiptStatus, StatusConfig> = {
  PENDING: {
    bg:    '#FFFBEB',
    text:  C.orange,
    label: 'KUTILMOQDA',
    icon:  'time-outline',
  },
  RECEIVED: {
    bg:    '#F0FDF4',
    text:  C.green,
    label: 'QABUL QILINDI',
    icon:  'checkmark-circle-outline',
  },
  CANCELLED: {
    bg:    '#F3F4F6',
    text:  C.muted,
    label: 'BEKOR QILINDI',
    icon:  'close-circle-outline',
  },
};

export const TABS: ReadonlyArray<{ readonly key: FilterTab; readonly label: string }> = [
  { key: 'ALL',       label: 'Barchasi'      },
  { key: 'PENDING',   label: 'KUTILMOQDA'    },
  { key: 'RECEIVED',  label: 'QABUL QILINDI' },
  { key: 'CANCELLED', label: 'BEKOR QILINDI' },
];
