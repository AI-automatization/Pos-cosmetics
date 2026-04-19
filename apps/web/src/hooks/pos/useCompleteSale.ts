'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { salesApi } from '@/api/sales.api';
import { inventoryApi } from '@/api/inventory.api';
import { extractErrorMessage } from '@/lib/utils';
import { usePOSStore } from '@/store/pos.store';
import { useLoyaltyConfig } from '@/hooks/customers/useLoyalty';
import { DEFAULT_LOYALTY_CONFIG } from '@/types/loyalty';
import type { Order } from '@/types/sales';

export function useCompleteSale(onSuccess: (order: Order) => void) {
  const store = usePOSStore();
  const cart = store.carts[store.activeCartId];
  const { items, orderDiscount, orderDiscountType, paymentMethod, cashAmount, cardAmount, bonusPoints, splitNasiyaAmount, selectedCustomer } = cart;
  const { shiftId, totals, clearCart, recordSale } = store;
  const { data: loyaltyConfig } = useLoyaltyConfig();
  const redeemRate = loyaltyConfig?.redeemRate ?? DEFAULT_LOYALTY_CONFIG.redeemRate;

  const mutation = useMutation({
    mutationFn: () => {
      const { total } = totals();

      let payments: { method: 'CASH' | 'CARD' | 'NASIYA' | 'BONUS'; amount: number }[];
      if (paymentMethod === 'cash') {
        payments = [{ method: 'CASH', amount: total }];
      } else if (paymentMethod === 'card') {
        payments = [{ method: 'CARD', amount: total }];
      } else if (paymentMethod === 'nasiya') {
        payments = [{ method: 'NASIYA', amount: total }];
      } else {
        // split — include all non-zero components
        payments = (
          [
            cashAmount > 0 ? { method: 'CASH' as const, amount: cashAmount } : null,
            cardAmount > 0 ? { method: 'CARD' as const, amount: cardAmount } : null,
            splitNasiyaAmount > 0 ? { method: 'NASIYA' as const, amount: splitNasiyaAmount } : null,
            bonusPoints > 0 ? { method: 'BONUS' as const, amount: bonusPoints * redeemRate } : null,
          ] as (typeof payments[0] | null)[]
        ).filter((p): p is typeof payments[0] => p !== null);
      }

      const needsCustomer =
        paymentMethod === 'nasiya' ||
        (paymentMethod === 'split' && (splitNasiyaAmount > 0 || bonusPoints > 0));

      return salesApi.createOrder({
        shiftId: shiftId ?? '',
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          sellPrice: item.sellPrice,
          lineDiscount: item.lineDiscount,
        })),
        orderDiscount,
        orderDiscountType,
        payments,
        ...(needsCustomer && selectedCustomer ? { customerId: selectedCustomer.id } : {}),
      });
    },
    onSuccess: (order) => {
      // Snapshot items BEFORE clearing — currentStock saqlangan
      const soldItems = items.map((i) => ({
        productId: i.productId,
        name: i.name,
        remainingStock: (i.currentStock ?? 0) - i.quantity,
      }));

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
        toast.success(`Sotuv #${order.orderNumber ?? order.id?.slice(0, 8) ?? '—'} yakunlandi!`);
      }

      // Low-stock check — success toast dan keyin ko'rinsin
      setTimeout(() => {
        soldItems.forEach(({ productId, name, remainingStock }) => {
          if (remainingStock <= 0) {
            // Avtomatik zapros
            inventoryApi.sendRestockRequest({ productId, productName: name, currentStock: 0 });
            toast.error(`${name}: Tugadi! Omborchiga xabar yuborildi.`, { duration: 8000 });
          } else if (remainingStock <= 5) {
            // Manual zapros (button)
            toast.warning(`${name}: ${remainingStock} ta qoldi`, {
              duration: 15000,
              action: {
                label: 'Omborchiga yuborish',
                onClick: () =>
                  inventoryApi.sendRestockRequest({
                    productId,
                    productName: name,
                    currentStock: remainingStock,
                  }),
              },
            });
          } else if (remainingStock <= 10) {
            // Faqat warning
            toast.warning(`${name}: ${remainingStock} ta qoldi`, { duration: 5000 });
          }
        });
      }, 150);
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const canComplete = items.length > 0 && (() => {
    const { total } = totals();
    if (paymentMethod === 'cash') return cashAmount >= total;
    if (paymentMethod === 'card') return true;
    if (paymentMethod === 'nasiya') return selectedCustomer !== null && !selectedCustomer.isBlocked;
    // split: sum of all parts must cover total; if nasiya or bonus part present, customer required
    const covered = cashAmount + cardAmount + splitNasiyaAmount + bonusPoints * redeemRate;
    const needsCustomer = splitNasiyaAmount > 0 || bonusPoints > 0;
    return covered >= total && (!needsCustomer || (selectedCustomer !== null && !selectedCustomer.isBlocked));
  })();

  return { mutate: mutation.mutate, isPending: mutation.isPending, canComplete };
}
