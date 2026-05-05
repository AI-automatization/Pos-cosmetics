// StockMovementTypes.ts

export type MovementType =
  | 'IN'
  | 'OUT'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'RETURN_IN'
  | 'TESTER'
  | 'WRITE_OFF';

export interface StockMovement {
  id: string;
  productId: string;
  product?: { id: string; name: string; sku: string | null };
  warehouseId: string;
  warehouse?: { id: string; name: string };
  type: MovementType;
  quantity: number;
  costPrice: number | null;
  note: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  userId: string | null;
  user?: { id: string; firstName: string; lastName: string };
  refId: string | null;
  refType: string | null;
  createdAt: string;
}

export interface StockMovementsResponse {
  items: StockMovement[];
  total: number;
  page: number;
  limit: number;
}

export type TypeFilter =
  | 'ALL'
  | 'IN'
  | 'OUT'
  | 'ADJUSTMENT'
  | 'TRANSFER'
  | 'RETURN'
  | 'WRITE_OFF';

export const TYPE_CFG: Record<
  MovementType,
  { label: string; bg: string; text: string; sign: '+' | '-' | '~' }
> = {
  IN:           { label: 'Kirim',               bg: '#F0FDF4', text: '#16A34A', sign: '+' },
  OUT:          { label: 'Chiqim',              bg: '#FEF2F2', text: '#DC2626', sign: '-' },
  ADJUSTMENT:   { label: 'Tuzatish',            bg: '#FFFBEB', text: '#D97706', sign: '~' },
  TRANSFER_IN:  { label: "Ko'chirish (kirim)",  bg: '#F5F3FF', text: '#7C3AED', sign: '+' },
  TRANSFER_OUT: { label: "Ko'chirish (chiqim)", bg: '#F5F3FF', text: '#7C3AED', sign: '-' },
  RETURN_IN:    { label: 'Qaytarish',           bg: '#EFF6FF', text: '#2563EB', sign: '+' },
  TESTER:       { label: 'Namuna',              bg: '#F3F4F6', text: '#6B7280', sign: '-' },
  WRITE_OFF:    { label: 'Hisobdan chiqarish',  bg: '#FFF7ED', text: '#EA580C', sign: '-' },
};

export const TYPE_FILTER_CFG: Record<TypeFilter, { label: string }> = {
  ALL:        { label: 'Barchasi' },
  IN:         { label: 'Kirim' },
  OUT:        { label: 'Chiqim' },
  ADJUSTMENT: { label: 'Tuzatish' },
  TRANSFER:   { label: "Ko'chirish" },
  RETURN:     { label: 'Qaytarish' },
  WRITE_OFF:  { label: 'Hisobdan' },
};
