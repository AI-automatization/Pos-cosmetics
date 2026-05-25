import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { salesApi } from '../../api/sales.api';
import { paymentsApi, type PaymentIntentResponse } from '../../api/payments.api';
import { loyaltyApi } from '../../api/loyalty.api';
import { isOnlineMethod } from './PaymentSheetTypes';
import { isNetworkOnline } from '../../hooks/useNetworkStatus';
import type { PaymentMethod } from './PaymentSheet';
import type { CartItem } from './components/utils';
import type { Customer } from '../../api/customers.api';
import type { SavdoStackParamList } from '../../navigation/types';

interface UseSavdoOrderParams {
  cart: CartItem[];
  totalPrice: number;
  shiftId: string | null;
  selectedCustomer: Customer | null;
  redeemPoints: number;
  clearCart: () => void;
  closePayment: () => void;
  resetCustomer: () => void;
  refreshQueue: () => Promise<void>;
}

export default function useSavdoOrder({
  cart,
  totalPrice,
  shiftId,
  selectedCustomer,
  redeemPoints,
  clearCart,
  closePayment,
  resetCustomer,
  refreshQueue,
}: UseSavdoOrderParams) {
  const navigation = useNavigation<NativeStackNavigationProp<SavdoStackParamList>>();
  const [orderLoading, setOrderLoading] = useState(false);
  const [onlinePaymentVisible, setOnlinePaymentVisible] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null);

  const handleConfirm = useCallback(async (method: PaymentMethod, _received: number) => {
    if (method === 'NASIYA') {
      navigation.navigate('NasiyaScreen', { openNewDebt: true, amount: totalPrice, products: cart });
      closePayment();
      clearCart();
      return;
    }
    if (!shiftId) {
      Alert.alert('Xatolik', 'Smena ochilmagan. Avval smena oching.');
      return;
    }
    // Online payment flow (PAYME / CLICK / UZUM)
    if (isOnlineMethod(method)) {
      setOrderLoading(true);
      try {
        const order = await salesApi.createOrder({
          shiftId,
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.qty,
            unitPrice: i.product.sellPrice,
          })),
          notes: `To'lov: ${method}`,
        });
        const intent = await paymentsApi.createIntent({
          orderId: order.id,
          method,
          amount: totalPrice,
        });
        setPaymentIntent(intent);
        closePayment();
        setOnlinePaymentVisible(true);
      } catch {
        Alert.alert('Xatolik', "Online to'lov yaratilmadi. Qayta urinib ko'ring.");
      } finally {
        setOrderLoading(false);
      }
      return;
    }
    // Standard payment flow (NAQD / KARTA)
    setOrderLoading(true);
    try {
      const order = await salesApi.createOrder({
        shiftId,
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.qty,
          unitPrice: i.product.sellPrice,
        })),
        notes: `To'lov: ${method}`,
      });
      if (redeemPoints > 0 && selectedCustomer) {
        try {
          await loyaltyApi.redeem(selectedCustomer.id, redeemPoints, order.id);
        } catch {
          // Don't block sale if loyalty redeem fails
        }
      }
      closePayment();
      clearCart();
      resetCustomer();
    } catch {
      const online = await isNetworkOnline();
      if (!online) {
        const { offlineQueueService } = await import('../../services/OfflineQueueService');
        await offlineQueueService.enqueue({
          shiftId: shiftId!,
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.qty,
            unitPrice: i.product.sellPrice,
          })),
          notes: `To'lov: ${method}`,
        });
        await refreshQueue();
        Alert.alert('Offline rejim', "Buyurtma saqlandi. Internet ulanganda avtomatik yuboriladi.");
        closePayment();
        clearCart();
        resetCustomer();
      } else {
        Alert.alert('Xatolik', "Buyurtma saqlanmadi. Qayta urinib ko'ring.");
      }
    } finally {
      setOrderLoading(false);
    }
  }, [cart, totalPrice, shiftId, selectedCustomer, redeemPoints, clearCart, closePayment, resetCustomer, refreshQueue, navigation]);

  const handleOnlinePaymentSuccess = useCallback(() => {
    setOnlinePaymentVisible(false);
    setPaymentIntent(null);
    clearCart();
  }, [clearCart]);

  const handleOnlinePaymentCancel = useCallback(async () => {
    if (paymentIntent) {
      try { await paymentsApi.cancelIntent(paymentIntent.id); } catch { /* noop */ }
    }
    setOnlinePaymentVisible(false);
    setPaymentIntent(null);
  }, [paymentIntent]);

  return {
    orderLoading,
    onlinePaymentVisible,
    paymentIntent,
    handleConfirm,
    handleOnlinePaymentSuccess,
    handleOnlinePaymentCancel,
  };
}
