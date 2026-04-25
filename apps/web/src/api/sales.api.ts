import { apiClient } from './client';
import type { CreateOrderDto, Order } from '@/types/sales';

export const salesApi = {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // 1. Map frontend DTO → backend CreateOrderDto
    const backendDto = {
      shiftId: dto.shiftId || undefined,
      customerId: dto.customerId,
      notes: dto.note,
      discountAmount: dto.orderDiscount,
      discountType: dto.orderDiscountType === 'percent' ? 'PERCENT' : 'FIXED',
      items: dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.sellPrice,
        discountAmount:
          item.lineDiscount > 0
            ? Math.round(item.sellPrice * item.quantity * (item.lineDiscount / 100))
            : undefined,
      })),
    };

    const order = await apiClient.post<Order>('/sales/orders', backendDto).then((r) => r.data);

    if (dto.payments.length === 0) return order;

    // 2. Separate payment types
    const bonusPayment = dto.payments.find((p) => p.method === 'BONUS' && p.amount > 0);
    const nasiyaPayment = dto.payments.find((p) => p.method === 'NASIYA' && p.amount > 0);
    const regularPayments = dto.payments.filter(
      (p) => p.method !== 'BONUS' && p.method !== 'NASIYA' && p.amount > 0,
    );

    // 3. Bonus → redeem loyalty points
    if (bonusPayment && dto.customerId && dto.bonusPoints && dto.bonusPoints > 0) {
      await apiClient
        .post('/loyalty/redeem', {
          customerId: dto.customerId,
          points: dto.bonusPoints,
        })
        .catch(() => {
          // Loyalty redeem failure should not block the sale
        });
    }

    // 4. Nasiya → create debt record
    if (nasiyaPayment && dto.customerId) {
      await apiClient
        .post('/nasiya', {
          customerId: dto.customerId,
          orderId: order.id,
          totalAmount: nasiyaPayment.amount,
        })
        .catch(() => {
          // Debt creation failure should not block the sale
        });
    }

    // 5. Regular payments (CASH, CARD) + NASIYA as DEBT intent → /payments/split
    const methodMap: Record<string, string> = {
      CASH: 'CASH',
      CARD: 'TERMINAL',
      NASIYA: 'DEBT',
    };

    const paymentsPayload = [
      ...regularPayments.map((p) => ({
        orderId: order.id,
        method: methodMap[p.method] ?? p.method,
        amount: p.amount,
      })),
      // Nasiya also creates a DEBT payment intent for tracking
      ...(nasiyaPayment
        ? [{ orderId: order.id, method: 'DEBT', amount: nasiyaPayment.amount }]
        : []),
      // Bonus payment as a separate tracking intent (CASH type — bonus discount applied)
      ...(bonusPayment
        ? [{ orderId: order.id, method: 'CASH', amount: bonusPayment.amount, meta: { type: 'BONUS_REDEEM' } }]
        : []),
    ].filter((p) => p.amount > 0);

    if (paymentsPayload.length > 0) {
      const intents = await apiClient
        .post<{ id: string }[]>('/payments/split', { payments: paymentsPayload })
        .then((r) => r.data);

      // Settle all intents
      await Promise.allSettled(
        intents.map((intent) => apiClient.patch(`/payments/${intent.id}/settle`)),
      );
    }

    return order;
  },

  getOrder(id: string) {
    return apiClient.get<Order>(`/sales/orders/${id}`).then((r) => r.data);
  },
};
