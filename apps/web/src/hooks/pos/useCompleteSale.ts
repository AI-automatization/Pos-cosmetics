'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { salesApi } from '@/api/sales.api';
import { extractErrorMessage } from '@/lib/utils';
import { usePOSStore } from '@/store/pos.store';
import type { Order } from '@/types/sales';

export function useCompleteSale(onSuccess: (order: Order) => void) {
  const {
    items,
    orderDiscount,
    orderDiscountType,
    paymentMethod,
    cashAmount,
    cardAmount,
    selectedCustomer,
    shiftId,
    totals,
    clearCart,
    recordSale,
  } = usePOSStore();

  const mutation = useMutation({
    mutationFn: () => {
      const { total } = totals();

      const payments =
        paymentMethod === 'cash'
          ? [{ method: 'CASH' as const, amount: total }]
          : paymentMethod === 'card'
            ? [{ method: 'CARD' as const, amount: total }]
            : paymentMethod === 'nasiya'
              ? [{ method: 'NASIYA' as const, amount: total }]
              : [
                  { method: 'CASH' as const, amount: cashAmount },
                  { method: 'CARD' as const, amount: cardAmount },
                ];

      return salesApi.createOrder({
        shiftId: shiftId ?? 'demo-shift',
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          sellPrice: item.sellPrice,
          lineDiscount: item.lineDiscount,
        })),
        orderDiscount,
        orderDiscountType,
        payments,
        ...(paymentMethod === 'nasiya' && selectedCustomer
          ? { customerId: selectedCustomer.id }
          : {}),
      });
    },
    onSuccess: (order) => {
      const { total } = totals();
      const cash =
        paymentMethod === 'cash'
          ? total
          : paymentMethod === 'split'
            ? cashAmount
            : 0;
      const card =
        paymentMethod === 'card'
          ? total
          : paymentMethod === 'split'
            ? cardAmount
            : 0;

      recordSale(total, cash, card);
      clearCart();
      onSuccess(order);

      if (paymentMethod === 'nasiya') {
        toast.success(
          `Nasiya savdo yakunlandi! Xaridor: ${selectedCustomer?.name ?? '—'}`,
        );
      } else {
        toast.success(`Sotuv #${order.orderNumber ?? order.id.slice(0, 8)} yakunlandi!`);
      }
    },
    onError: (err: unknown, _vars, _ctx) => {
      const isNetwork =
        (err instanceof AxiosError && !err.response) ||
        extractErrorMessage(err).includes('Server xatosi');

      if (isNetwork) {
        // Demo mode — backend tayyor bo'lgunicha local order
        const { total } = totals();
        const { subtotal, discountAmount } = totals();
        const demoOrder: Order = {
          id: `demo-${Date.now()}`,
          orderNumber: `DEMO-${Math.floor(Math.random() * 9000 + 1000)}`,
          items: [],
          subtotal,
          discountAmount,
          total,
          payments: [],
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
        };
        const cash =
          paymentMethod === 'cash' ? total : paymentMethod === 'split' ? cashAmount : 0;
        const card =
          paymentMethod === 'card' ? total : paymentMethod === 'split' ? cardAmount : 0;
        recordSale(total, cash, card);
        clearCart();
        onSuccess(demoOrder);
        if (paymentMethod === 'nasiya') {
          toast.success(`Nasiya savdo yakunlandi! (demo rejim)`);
        } else {
          toast.success(`Sotuv ${demoOrder.orderNumber} yakunlandi! (demo rejim)`);
        }
      } else {
        toast.error(extractErrorMessage(err));
      }
    },
  });

  const canComplete = items.length > 0 && (() => {
    const { total } = totals();
    if (paymentMethod === 'cash') return cashAmount >= total;
    if (paymentMethod === 'card') return true;
    if (paymentMethod === 'nasiya') return selectedCustomer !== null && !selectedCustomer.isBlocked;
    return cashAmount + cardAmount >= total; // split
  })();

  return { mutate: mutation.mutate, isPending: mutation.isPending, canComplete };
}
