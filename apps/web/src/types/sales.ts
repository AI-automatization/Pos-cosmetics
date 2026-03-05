// Sales & POS domain types
// TODO: Move shared types to packages/types/ after T-013/T-014 backend implementation

import type { ProductUnit } from './catalog';

export interface CartItem {
  productId: string;
  name: string;
  barcode: string | null;
  sku: string;
  sellPrice: number;
  quantity: number;
  lineDiscount: number; // % (0-100)
  unit: ProductUnit;
}

export type DiscountType = 'percent' | 'fixed';
export type PaymentMethod = 'cash' | 'card' | 'split' | 'nasiya';

export interface CartTotals {
  subtotal: number;       // before discount
  discountAmount: number; // total discount amount
  total: number;          // final payable
  change: number;         // cash change back to customer
}

export interface ShiftInfo {
  shiftId: string | null;
  cashierName: string;
  openedAt: Date | null;
  salesCount: number;
}

// API DTOs (ready for when Polat implements T-014)
export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  sellPrice: number;
  lineDiscount: number;
}

export interface PaymentEntryDto {
  method: 'CASH' | 'CARD' | 'NASIYA';
  amount: number;
}

export interface CreateOrderDto {
  shiftId: string;
  items: CreateOrderItemDto[];
  orderDiscount: number;
  orderDiscountType: DiscountType;
  payments: PaymentEntryDto[];
  customerId?: string; // nasiya uchun MAJBURIY
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  payments: PaymentEntry[];
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sellPrice: number;
  lineDiscount: number;
  lineTotal: number;
}

export interface PaymentEntry {
  method: 'CASH' | 'CARD';
  amount: number;
}
