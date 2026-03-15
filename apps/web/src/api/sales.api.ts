import { apiClient } from './client';
import type { CreateOrderDto, Order } from '@/types/sales';

export const salesApi = {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Map frontend DTO → backend CreateOrderDto
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
        // lineDiscount is a percentage; convert to fixed amount for backend
        discountAmount:
          item.lineDiscount > 0
            ? Math.round(item.sellPrice * item.quantity * (item.lineDiscount / 100))
            : undefined,
      })),
    };

    const order = await apiClient.post<Order>('/sales/orders', backendDto).then((r) => r.data);

    // Create and settle payment intents for POS flow
    if (dto.payments.length > 0) {
      const intents = await apiClient
        .post<{ id: string }[]>('/payments/split', {
          payments: dto.payments.map((p) => ({
            orderId: order.id,
            method: p.method,
            amount: p.amount,
          })),
        })
        .then((r) => r.data);
      // Settle all intents so analytics/reports see SETTLED revenue
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
