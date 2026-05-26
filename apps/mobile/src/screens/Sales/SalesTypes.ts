// ─── Sales screen types, METHOD_STYLE and helpers ─────────────
import type { Order, OrderItem, OrderStatus } from '@raos/types';

export type PayMethod = 'NAQD' | 'KARTA' | 'NASIYA' | 'ARALASH';

export interface Payment {
  readonly method: PayMethod;
  readonly amount: number;
}

export interface SaleProduct {
  readonly name: string;
  readonly qty: number;
  readonly price: number;
}

export type { OrderStatus };

export interface Sale {
  readonly id: string;
  readonly num: number;
  readonly time: string;
  readonly items: number;
  readonly amount: number;
  readonly status: OrderStatus;
  readonly payments: Payment[];
  readonly products: SaleProduct[];
}

// ─── Method display config ─────────────────────────────────────
export const METHOD_STYLE: Record<
  PayMethod,
  { readonly bg: string; readonly text: string; readonly label: string; readonly icon: string }
> = {
  NAQD:    { bg: '#D1FAE5', text: '#059669', label: 'NAQD',    icon: '💵' },
  KARTA:   { bg: '#DBEAFE', text: '#2563EB', label: 'KARTA',   icon: '💳' },
  NASIYA:  { bg: '#FEF3C7', text: '#D97706', label: 'NASIYA',  icon: '🕐' },
  ARALASH: { bg: '#F3F4F6', text: '#374151', label: 'ARALASH', icon: '🔀' },
};

// ─── Helpers ───────────────────────────────────────────────────
export function fmt(n: number): string {
  return n.toLocaleString('ru-RU');
}

export function fmtStat(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

export function parsePayment(order: Order): Payment[] {
  const notes = order.notes ?? '';
  if (notes.includes('ARALASH')) return [{ method: 'ARALASH', amount: order.total }];
  if (notes.includes('KARTA'))   return [{ method: 'KARTA',   amount: order.total }];
  if (notes.includes('NASIYA'))  return [{ method: 'NASIYA',  amount: order.total }];
  return [{ method: 'NAQD', amount: order.total }];
}

export function orderToSale(order: Order): Sale {
  return {
    id:       order.id,
    num:      order.orderNumber,
    time:     new Date(order.createdAt).toLocaleTimeString('uz-UZ', {
                hour: '2-digit',
                minute: '2-digit',
              }),
    items:    order.items.length,
    amount:   order.total,
    status:   order.status,
    payments: parsePayment(order),
    products: order.items.map((item: OrderItem) => ({
      name:  item.productName,
      qty:   item.quantity,
      price: item.unitPrice,
    })),
  };
}
