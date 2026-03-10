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

    // Create payment intents via /payments/split
    if (dto.payments.length > 0) {
      await apiClient.post('/payments/split', {
        payments: dto.payments.map((p) => ({
          orderId: order.id,
          method: p.method,
          amount: p.amount,
        })),
      });
    }

    return order;
  },

  getOrder(id: string) {
    return apiClient.get<Order>(`/sales/orders/${id}`).then((r) => r.data);
  },
};
