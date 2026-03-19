export type OrderStatus = 'COMPLETED' | 'RETURNED' | 'VOIDED';
export type FiscalStatus = 'NONE' | 'PENDING' | 'SENT' | 'FAILED';
export type PaymentMethod = 'CASH' | 'CARD' | 'NASIYA';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod?: PaymentMethod;
  customerId?: string | null;
  customerName?: string | null;
  shiftId?: string | null;
  cashierName?: string | null;
  fiscalStatus: FiscalStatus;
  notes?: string | null;
  tenantId: string;
  createdAt: string;
}

export interface OrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  from?: string;
  to?: string;
  shiftId?: string;
}
