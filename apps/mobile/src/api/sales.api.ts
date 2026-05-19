import type { Order, Shift, OpenShiftPayload, CloseShiftPayload, CreateOrderPayload } from '@raos/types';
import api from './client';

/**
 * T-447: packages/types dagi Order da paymentMethod yo'q.
 * packages/types zonasiga tegmasdan, mobile-lokal intersection type yaratildi.
 */
export type OrderWithMethod = Order & { paymentMethod?: string | null };

export interface ShiftDetail extends Shift {
  totalRevenue?: number;
  totalOrders?: number;
  cashAmount?: number;
  cardAmount?: number;
  nasiyaAmount?: number;
  expenses?: number;
  user?: { firstName: string; lastName: string };
  paymentBreakdown?: { method: string; amount: number }[];
}

export interface SaleItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number | string;   // backend sends as string
  unitPrice: number | string;  // backend field name (not "price")
  total: number | string;
}

export interface SaleDetail {
  id: string;
  orderNumber: number;
  status: string;
  subtotal: number | string;
  discountAmount: number | string;
  taxAmount: number | string;
  total: number | string;
  notes: string | null;
  createdAt: string;
  paymentMethod?: string | null;
  branchName?: string;
  cashierName?: string;
  currency?: string;
  items: SaleItem[];
}

export interface QuickStats {
  totalSalesToday: number;
  totalRevenueToday: number;
  currency: string;
  ordersCount: number;
  avgOrderValue: number;
}

export interface ActiveShift {
  id: string;
  branchId: string;
  branchName: string;
  cashierName: string;
  openedAt: string;
  totalSales: number;
  currency: string;
}

export interface OrdersFilter {
  from?: string;
  to?: string;
  limit?: number;
  page?: number;
}

export interface PaginatedOrders {
  data: OrderWithMethod[];
  total: number;
  page: number;
  limit: number;
}

// Backend shift response type (different shape than ShiftDetail)
interface BackendShiftResponse {
  id: string;
  tenantId?: string;
  userId?: string;
  branchId?: string | null;
  branchName?: string;
  cashierId?: string;
  cashierName?: string;
  openedAt: string;
  closedAt?: string | null;
  status?: string;
  openingCash?: number;
  closingCash?: number | null;
  totalRevenue?: number;
  totalOrders?: number;
  expectedCash?: number | null;
  notes?: string | null;
  createdAt?: string;
  paymentBreakdown?: Record<string, number>;
}

function mapShiftDetail(raw: BackendShiftResponse): ShiftDetail {
  const pb = raw.paymentBreakdown ?? {};
  const nameParts = (raw.cashierName ?? '').split(' ');
  const status = (raw.status ?? 'OPEN').toUpperCase() as 'OPEN' | 'CLOSED';

  return {
    id: raw.id,
    tenantId: raw.tenantId ?? '',
    userId: raw.userId ?? raw.cashierId ?? '',
    branchId: raw.branchId ?? null,
    status,
    openedAt: new Date(raw.openedAt),
    closedAt: raw.closedAt ? new Date(raw.closedAt) : null,
    openingCash: raw.openingCash ?? 0,
    closingCash: raw.closingCash ?? null,
    expectedCash: raw.expectedCash ?? null,
    notes: raw.notes ?? null,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(raw.openedAt),
    totalRevenue: raw.totalRevenue,
    totalOrders: raw.totalOrders,
    cashAmount: pb.cash ?? pb.naqd ?? 0,
    cardAmount: (pb.card ?? 0) + (pb.terminal ?? 0),
    nasiyaAmount: pb.nasiya ?? pb.debt ?? 0,
    expenses: 0,
    user: raw.cashierName
      ? { firstName: nameParts[0] ?? '', lastName: nameParts.slice(1).join(' ') }
      : undefined,
    paymentBreakdown: pb
      ? Object.entries(pb).map(([method, amount]) => ({ method, amount }))
      : undefined,
  };
}

export const salesApi = {
  getOrders: async (filter?: OrdersFilter): Promise<PaginatedOrders> => {
    const { data: res } = await api.get<{ items?: OrderWithMethod[]; data?: OrderWithMethod[]; total: number; page: number; limit: number }>('/sales/orders', {
      params: filter,
    });
    return {
      data: res.items ?? res.data ?? [],
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  },

  getOrderById: async (orderId: string): Promise<OrderWithMethod> => {
    const { data } = await api.get<OrderWithMethod>(`/sales/orders/${orderId}`);
    return data;
  },

  getQuickStats: async (branchId?: string): Promise<QuickStats> => {
    const { data } = await api.get<QuickStats>('/sales/quick-stats', { params: { branchId } });
    return data;
  },

  getActiveShifts: async (branchId?: string): Promise<ActiveShift[]> => {
    const { data } = await api.get<ActiveShift[]>('/sales/shifts/active', { params: { branchId } });
    return data;
  },

  getById: async (saleId: string): Promise<SaleDetail> => {
    const { data } = await api.get<SaleDetail>(`/sales/orders/${saleId}`);
    return data;
  },

  getCurrentShift: async (): Promise<Shift | null> => {
    try {
      const { data } = await api.get<Shift>('/sales/shifts/current');
      return data;
    } catch {
      return null;
    }
  },

  openShiftApi: async (payload: OpenShiftPayload): Promise<Shift> => {
    const { data } = await api.post<Shift>('/sales/shifts/open', payload);
    return data;
  },

  closeShiftApi: async (id: string, payload: CloseShiftPayload): Promise<Shift> => {
    const { data } = await api.post<Shift>(`/sales/shifts/${id}/close`, payload);
    return data;
  },

  getShiftById: async (id: string): Promise<ShiftDetail> => {
    const { data } = await api.get<BackendShiftResponse>(`/sales/shifts/${id}`);
    return mapShiftDetail(data);
  },

  getShifts: async (page = 1, limit = 5): Promise<{ items: ShiftDetail[]; total: number }> => {
    const { data } = await api.get<{ items: BackendShiftResponse[]; total: number }>('/sales/shifts', {
      params: { page, limit },
    });
    return {
      items: (data.items ?? []).map(mapShiftDetail),
      total: data.total,
    };
  },

  createOrder: async (payload: CreateOrderPayload): Promise<OrderWithMethod> => {
    const { data } = await api.post<OrderWithMethod>('/sales/orders', payload);
    return data;
  },

  returnOrder: async (
    orderId: string,
    body: { items: { orderItemId: string; productId: string; quantity: number }[]; reason: string },
  ): Promise<void> => {
    await api.post('/sales/returns', { orderId, ...body });
  },
};
