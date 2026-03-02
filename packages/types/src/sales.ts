// ─── SALES TYPES ──────────────────────────────────────────────

export type ShiftStatus = 'OPEN' | 'CLOSED';
export type OrderStatus = 'COMPLETED' | 'RETURNED' | 'VOIDED';
export type DiscountType = 'PERCENT' | 'FIXED';
export type FiscalStatus = 'NONE' | 'PENDING' | 'SENT' | 'FAILED';
export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Shift {
  id: string;
  tenantId: string;
  userId: string;
  branchId: string | null;
  status: ShiftStatus;
  openedAt: Date;
  closedAt: Date | null;
  openingCash: number;
  closingCash: number | null;
  expectedCash: number | null;
  notes: string | null;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discountAmount: number;
  total: number;
}

export interface Order {
  id: string;
  tenantId: string;
  shiftId: string | null;
  userId: string;
  branchId: string | null;
  customerId: string | null;
  orderNumber: number;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  discountType: DiscountType;
  taxAmount: number;
  total: number;
  notes: string | null;
  fiscalStatus: FiscalStatus;
  fiscalId: string | null;
  fiscalQr: string | null;
  items: OrderItem[];
  createdAt: Date;
}

export interface ReturnItem {
  id: string;
  returnId: string;
  orderItemId: string;
  productId: string;
  quantity: number;
  amount: number;
}

export interface Return {
  id: string;
  tenantId: string;
  orderId: string;
  userId: string;
  reason: string | null;
  total: number;
  status: ReturnStatus;
  approvedBy: string | null;
  items: ReturnItem[];
  createdAt: Date;
}

// ─── REQUEST TYPES ────────────────────────────────────────────

export interface CreateOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

export interface CreateOrderPayload {
  shiftId?: string;
  branchId?: string;
  customerId?: string;
  items: CreateOrderItem[];
  discountAmount?: number;
  discountType?: DiscountType;
  notes?: string;
}

export interface CreateReturnItem {
  orderItemId: string;
  productId: string;
  quantity: number;
}

export interface CreateReturnPayload {
  orderId: string;
  reason?: string;
  items: CreateReturnItem[];
}

export interface OpenShiftPayload {
  branchId?: string;
  openingCash?: number;
  notes?: string;
}

export interface CloseShiftPayload {
  closingCash: number;
  notes?: string;
}

// ─── RECEIPT TYPE ─────────────────────────────────────────────

export interface ReceiptResponse {
  orderNumber: number;
  date: Date;
  cashier: string;
  customer: string | null;
  items: {
    name: string;
    qty: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payments: { method: string; amount: number }[];
}
