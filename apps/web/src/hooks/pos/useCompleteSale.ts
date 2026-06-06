'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { salesApi } from '@/api/sales.api';
import { inventoryApi } from '@/api/inventory.api';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { usePOSStore } from '@/store/pos.store';
import { useSyncStore } from '@/store/sync.store';
import { useLoyaltyConfig } from '@/hooks/customers/useLoyalty';
import { DEFAULT_LOYALTY_CONFIG } from '@/types/loyalty';
import type { Order, ApiPaymentMethod } from '@/types/sales';

export function useCompleteSale(onSuccess: (order: Order) => void) {
  const { t } = useTranslation();
  const store = usePOSStore();
  const cart = store.carts[store.activeCartId];
  const { items, orderDiscount, orderDiscountType, paymentMethod, cardType, cashAmount, cardAmount, bonusPoints, splitNasiyaAmount, selectedCustomer } = cart;
  const { shiftId, totals, clearCart, recordSale } = store;
  const { addPendingOrder } = useSyncStore();
  const { data: loyaltyConfig } = useLoyaltyConfig();
  const redeemRate = loyaltyConfig?.redeemRate ?? DEFAULT_LOYALTY_CONFIG.redeemRate;

  const mutation = useMutation({
    mutationFn: () => {
      const { total } = totals();

      const CARD_TYPE_MAP = { terminal: 'TERMINAL', payme: 'PAYME', click: 'CLICK' } as const;
      const cardMethod = CARD_TYPE_MAP[cardType] ?? 'TERMINAL';

      let payments: { method: ApiPaymentMethod; amount: number }[];
      if (paymentMethod === 'cash') {
        payments = [{ method: 'CASH', amount: total }];
      } else if (paymentMethod === 'card') {
        payments = [{ method: cardMethod, amount: total }];
      } else if (paymentMethod === 'nasiya') {
        payments = [{ method: 'NASIYA', amount: total }];
      } else if (paymentMethod === 'bonus') {
        payments = [{ method: 'BONUS', amount: total }];
      } else {
        // split — include all non-zero components
        payments = (
          [
            cashAmount > 0 ? { method: 'CASH', amount: cashAmount } : null,
            cardAmount > 0 ? { method: cardMethod, amount: cardAmount } : null,
            splitNasiyaAmount > 0 ? { method: 'NASIYA' as const, amount: splitNasiyaAmount } : null,
            bonusPoints > 0 ? { method: 'BONUS' as const, amount: bonusPoints * redeemRate } : null,
          ] as (typeof payments[0] | null)[]
        ).filter((p): p is typeof payments[0] => p !== null);
      }

      const needsCustomer =
        paymentMethod === 'nasiya' ||
        paymentMethod === 'bonus' ||
        (paymentMethod === 'split' && (splitNasiyaAmount > 0 || bonusPoints > 0));

      const orderPayload: import('@/types/sales').CreateOrderDto = {
        shiftId: shiftId ?? '',
        items: items.map((item) => ({
          productId: item.productId,
          ...(item.variantId ? { variantId: item.variantId } : {}),
          quantity: item.quantity,
          sellPrice: item.sellPrice,
          lineDiscount: item.lineDiscount,
        })),
        orderDiscount,
        orderDiscountType,
        payments,
        ...(needsCustomer && selectedCustomer ? { customerId: selectedCustomer.id } : {}),
        ...(bonusPoints > 0 ? { bonusPoints } : {}),
      };

      // Offline fallback: queue order in localStorage
      // navigator.onLine unreliable (returns true if WiFi connected but no internet)
      // Also check sync store state which uses actual ping-based detection
      const isOffline = !navigator.onLine || useSyncStore.getState().state === 'offline';
      if (isOffline) {
        const label = `${items.length} ta mahsulot — ${total.toLocaleString()} so'm`;
        addPendingOrder({
          id: crypto.randomUUID(),
          label,
          createdAt: new Date().toISOString(),
          payload: orderPayload,
        });
        const { total: totalAmt } = totals();
        const cash = paymentMethod === 'cash' ? totalAmt : paymentMethod === 'split' ? cashAmount : 0;
        const card = paymentMethod === 'card' ? totalAmt : paymentMethod === 'split' ? cardAmount : 0;
        recordSale(totalAmt, cash, card);
        clearCart();
        toast.warning(t('toast.offlineOrderSaved'), { duration: 6000 });
        return Promise.resolve({} as Order);
      }

      return salesApi.createOrder(orderPayload);
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
          t('toast.nasiyaSaleComplete', { customer: selectedCustomer?.name ?? '—' }),
        );
      } else {
        toast.success(t('toast.saleComplete', { orderNumber: order.orderNumber ?? order.id?.slice(0, 8) ?? '—' }));
      }

      // Loyalty: show earned points toast if customer selected
      if (selectedCustomer && loyaltyConfig?.isActive) {
        const earnRate = loyaltyConfig.earnRate ?? DEFAULT_LOYALTY_CONFIG.earnRate;
        const earned = Math.floor(total / earnRate);
        if (earned > 0) {
          toast.info(t('toast.loyaltyEarned', { name: selectedCustomer.name, earned: String(earned) }), { duration: 5000 });
          // Attach to order for receipt display
          order.loyaltyEarned = earned;
        }
      }

      // Low-stock check — success toast dan keyin ko'rinsin
      setTimeout(() => {
        soldItems.forEach(({ productId, name, remainingStock }) => {
          if (remainingStock <= 0) {
            // Avtomatik zapros
            inventoryApi.sendRestockRequest({ productId, productName: name, currentStock: 0 });
            toast.error(t('toast.productOutOfStock', { name }), { duration: 8000 });
          } else if (remainingStock <= 5) {
            // Manual zapros (button)
            toast.warning(t('toast.productLowStock', { name, remaining: String(remainingStock) }), {
              duration: 15000,
              action: {
                label: t('toast.sendToWarehouse'),
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
            toast.warning(t('toast.productLowStock', { name, remaining: String(remainingStock) }), { duration: 5000 });
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
    if (paymentMethod === 'bonus') return selectedCustomer !== null && !selectedCustomer.isBlocked && bonusPoints > 0;
    // split: sum of all parts must cover total; if nasiya or bonus part present, customer required
    const covered = cashAmount + cardAmount + splitNasiyaAmount + bonusPoints * redeemRate;
    const needsCustomer = splitNasiyaAmount > 0 || bonusPoints > 0;
    return covered >= total && (!needsCustomer || (selectedCustomer !== null && !selectedCustomer.isBlocked));
  })();

  return { mutate: mutation.mutate, isPending: mutation.isPending, canComplete };
}
