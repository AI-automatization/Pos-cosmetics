import { apiClient } from './client';

export interface PaymentIntent {
  id: string;
  orderId: string;
  method: 'CASH' | 'TERMINAL' | 'CLICK' | 'PAYME' | 'TRANSFER' | 'DEBT';
  status: 'CREATED' | 'CONFIRMED' | 'SETTLED' | 'FAILED' | 'REVERSED';
  amount: number;
  provider: string | null;
  createdAt: string;
}

export const paymentsApi = {
  getOrderPayments(orderId: string) {
    return apiClient
      .get<PaymentIntent[]>(`/payments/order/${orderId}`)
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  getPayment(id: string) {
    return apiClient.get<PaymentIntent>(`/payments/${id}`).then((r) => r.data);
  },
};
