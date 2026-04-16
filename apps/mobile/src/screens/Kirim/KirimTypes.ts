// KirimTypes.ts — typelar, status konfiguratsiyasi va tab ro'yxati

import type { Receipt } from '../../api/inventory.api';
import { C } from './KirimColors';

export type ReceiptStatus = Receipt['status'];
export type FilterTab = 'ALL' | 'PENDING' | 'RECEIVED';

export interface StatusConfig {
  readonly bg: string;
  readonly text: string;
  readonly label: string;
  readonly icon: string;
}

export const STATUS_CFG: Record<ReceiptStatus, StatusConfig> = {
  PENDING: {
    bg:    '#FEF3C7',
    text:  C.orange,
    label: 'Kutilmoqda',
    icon:  'clock-outline',
  },
  RECEIVED: {
    bg:    '#D1FAE5',
    text:  C.green,
    label: 'Qabul qilingan',
    icon:  'check-circle-outline',
  },
  CANCELLED: {
    bg:    '#F3F4F6',
    text:  C.muted,
    label: 'Bekor qilingan',
    icon:  'close-circle-outline',
  },
};

export const TABS: ReadonlyArray<{ readonly key: FilterTab; readonly label: string }> = [
  { key: 'ALL',      label: 'Hammasi'        },
  { key: 'PENDING',  label: 'Kutilmoqda'     },
  { key: 'RECEIVED', label: 'Qabul qilingan' },
];
