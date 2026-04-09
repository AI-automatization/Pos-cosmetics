'use client';

import { useEffect } from 'react';
import { usePOSStore } from '@/store/pos.store';
import type { CartItem } from '@/types/sales';

export const CUSTOMER_DISPLAY_CHANNEL = 'pos-customer-display';

export type CustomerDisplayMessage =
  | {
      type: 'CART_UPDATE';
      items: CartItem[];
      subtotal: number;
      discountAmount: number;
      total: number;
    }
  | { type: 'SALE_COMPLETE'; orderNumber: string; total: number; change: number }
  | { type: 'CART_CLEAR' };

/** Opens a new window/tab with the customer-facing display */
export function openCustomerDisplay() {
  window.open('/pos/customer-display', 'customer-display', 'width=1024,height=768,menubar=no,toolbar=no,location=no');
}

/** Broadcasts sale complete event to customer display window */
export function broadcastSaleComplete(orderNumber: string, total: number, change: number) {
  if (typeof window === 'undefined') return;
  const ch = new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL);
  ch.postMessage({ type: 'SALE_COMPLETE', orderNumber, total, change } satisfies CustomerDisplayMessage);
  ch.close();
}

/** Watches the POS store and broadcasts cart state changes to the customer display */
export function useCustomerDisplayBroadcast() {
  const store = usePOSStore();
  const { items } = store.carts[store.activeCartId] ?? { items: [] };
  const { totals } = store;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ch = new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL);
    const { subtotal, discountAmount, total } = totals();

    const msg: CustomerDisplayMessage =
      items.length === 0
        ? { type: 'CART_CLEAR' }
        : { type: 'CART_UPDATE', items, subtotal, discountAmount, total };

    ch.postMessage(msg);
    ch.close();
  }, [items, totals]);
}
