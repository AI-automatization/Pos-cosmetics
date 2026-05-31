// ExpiryTypes.ts — tip ta'riflar

export interface ExpiryItem {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  batchNumber: string | null;
  expiryDate: string;
  qty: number;
  daysLeft: number;
}

export interface ExpiredItem {
  productId: string;
  productName: string;
  batchNumber: string | null;
  expiryDate: string;
  qty: number;
}

export type ExpiryTab = 'EXPIRING' | 'EXPIRED';
export type DaysFilter = 30 | 60 | 90;

export function getStatusConfig(daysLeft: number): {
  bg: string;
  text: string;
} {
  const C_RED    = '#DC2626';
  const C_ORANGE = '#D97706';
  const C_GREEN  = '#16A34A';

  if (daysLeft < 0) {
    return { bg: '#FEF2F2', text: C_RED };
  }
  if (daysLeft <= 7) {
    return { bg: '#FEF2F2', text: C_RED };
  }
  if (daysLeft <= 30) {
    return { bg: '#FEF2F2', text: C_RED };
  }
  if (daysLeft <= 60) {
    return { bg: '#FFFBEB', text: C_ORANGE };
  }
  return { bg: '#F0FDF4', text: C_GREEN };
}
