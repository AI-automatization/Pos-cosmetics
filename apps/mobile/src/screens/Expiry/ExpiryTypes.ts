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
  label: string;
} {
  const C_RED    = '#DC2626';
  const C_ORANGE = '#D97706';
  const C_GREEN  = '#16A34A';

  if (daysLeft < 0) {
    return { bg: '#FEF2F2', text: C_RED, label: `${Math.abs(daysLeft)} kun o'tdi` };
  }
  if (daysLeft <= 7) {
    return { bg: '#FEF2F2', text: C_RED, label: `${daysLeft} kun qoldi` };
  }
  if (daysLeft <= 30) {
    return { bg: '#FEF2F2', text: C_RED, label: `${daysLeft} kun qoldi` };
  }
  if (daysLeft <= 60) {
    return { bg: '#FFFBEB', text: C_ORANGE, label: `${daysLeft} kun qoldi` };
  }
  return { bg: '#F0FDF4', text: C_GREEN, label: `${daysLeft} kun qoldi` };
}
