import type { LowStockItem } from '../../../api/inventory.api';

export const C = {
  primary:   '#5B5BD6',
  green:     '#10B981',
  orange:    '#F59E0B',
  red:       '#EF4444',
  white:     '#FFFFFF',
  bg:        '#F9FAFB',
  text:      '#111827',
  secondary: '#6B7280',
  muted:     '#9CA3AF',
  border:    '#F3F4F6',
  label:     '#374151',
};

export type StockStatus = 'KAM' | 'TUGADI' | 'NORMAL';

export interface RequestItem {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  stock: number;
  minStockLevel: number;
  checked: boolean;
  qty: number;
}

export const STATUS_CFG: Record<StockStatus, { bg: string; text: string; label: string }> = {
  KAM:    { bg: '#FEF3C7', text: C.orange, label: 'KAM'    },
  TUGADI: { bg: '#FEE2E2', text: C.red,    label: 'TUGADI' },
  NORMAL: { bg: '#D1FAE5', text: C.green,  label: 'NORMAL' },
};

export function getStatus(item: { stock: number; minStockLevel: number }): StockStatus {
  if (item.stock === 0) return 'TUGADI';
  if (item.stock <= item.minStockLevel) return 'KAM';
  return 'NORMAL';
}

export function buildRequestItems(items: LowStockItem[]): RequestItem[] {
  return items.map((item) => {
    const status = getStatus(item);
    const isActive = status === 'TUGADI' || status === 'KAM';
    const qty = isActive ? Math.max(1, item.minStockLevel - item.stock) : 0;
    return {
      productId:     item.productId,
      productName:   item.productName,
      warehouseId:   item.warehouseId,
      warehouseName: item.warehouseName,
      stock:         item.stock,
      minStockLevel: item.minStockLevel,
      checked:       isActive,
      qty,
    };
  });
}
