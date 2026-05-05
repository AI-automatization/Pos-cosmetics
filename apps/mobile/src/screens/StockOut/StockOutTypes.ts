// StockOutTypes.ts — typelar va status konfiguratsiyasi

import { C } from './StockOutColors';

export type WriteOffReason = 'DAMAGED' | 'EXPIRED' | 'LOST' | 'OTHER';
export type FilterTab = 'ALL' | 'DAMAGED' | 'EXPIRED' | 'LOST' | 'OTHER';

export interface StatusConfig {
  readonly bg: string;
  readonly text: string;
  readonly label: string;
  readonly icon: string;
}

export const STATUS_CFG: Record<WriteOffReason, StatusConfig> = {
  DAMAGED: {
    bg:    '#FEF2F2',
    text:  C.red,
    label: 'BUZILGAN',
    icon:  'warning-outline',
  },
  EXPIRED: {
    bg:    '#FFFBEB',
    text:  C.orange,
    label: "MUDDATI O'TGAN",
    icon:  'time-outline',
  },
  LOST: {
    bg:    '#F3F4F6',
    text:  C.secondary,
    label: "YO'QOLGAN",
    icon:  'search-outline',
  },
  OTHER: {
    bg:    '#EFF6FF',
    text:  C.blue,
    label: 'BOSHQA',
    icon:  'ellipsis-horizontal-circle-outline',
  },
};

export const REASON_TABS: ReadonlyArray<{ readonly key: FilterTab; readonly label: string }> = [
  { key: 'ALL',     label: 'Barchasi'       },
  { key: 'DAMAGED', label: 'Buzilgan'        },
  { key: 'EXPIRED', label: "Muddati o'tgan" },
  { key: 'LOST',    label: "Yo'qolgan"      },
  { key: 'OTHER',   label: 'Boshqa'         },
];

export interface StockLevel {
  readonly productId:    string;
  readonly name:         string;
  readonly warehouseId:  string;
  readonly warehouseName: string;
  readonly totalQty:     number;
  readonly minStockLevel: number | null;
}

export interface WriteOffPayload {
  readonly items: ReadonlyArray<{
    readonly productId: string;
    readonly qty: number;
  }>;
  readonly reason:      WriteOffReason;
  readonly note?:       string;
  readonly warehouseId?: string;
}

export interface WriteOffResponse {
  readonly created:   number;
  readonly reason:    WriteOffReason;
  readonly movements: unknown[];
}
