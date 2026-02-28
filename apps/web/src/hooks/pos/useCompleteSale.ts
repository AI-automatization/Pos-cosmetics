'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { salesApi } from '@/api/sales.api';
import { extractErrorMessage } from '@/lib/utils';
import { usePOSStore } from '@/store/pos.store';
import type { Order } from '@/types/sales';

export function useCompleteSale(onSuccess: (order: Order) => void) {
  const { items, orderDiscount, orderDiscountType, paymentMethod, cashAmount, cardAmount,
    shiftId, totals, clearCart, incrementSalesCount } = usePOSStore();

  const mutation = useMutation({
    mutationFn: () => {
      const { total } = totals();

      const payments =
        paymentMethod === 'cash'
          ? [{ method: 'CASH' as const, amount: total }]
          : paymentMethod === 'card'
            ? [{ method: 'CARD' as const, amount: total }]
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
      });
    },
    onSuccess: (order) => {
      incrementSalesCount();
      clearCart();
      onSuccess(order);
      toast.success(`Sotuv #${order.orderNumber ?? order.id.slice(0, 8)} yakunlandi!`);
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const canComplete = items.length > 0 && (() => {
    const { total } = totals();
    if (paymentMethod === 'cash') return cashAmount >= total;
    if (paymentMethod === 'card') return true;
    return cashAmount + cardAmount >= total;
  })();

  return { mutate: mutation.mutate, isPending: mutation.isPending, canComplete };
}
