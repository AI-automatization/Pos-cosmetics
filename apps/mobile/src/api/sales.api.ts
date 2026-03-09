import { api } from './client';
import type { PaginatedResponse, PaginationQuery } from '@raos/types';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  branchId: string;
  branchName: string;
  cashierName: string;
  items: SaleItem[];
  total: number;
  currency: string;
  paymentMethod: string;
  status: 'COMPLETED' | 'REFUNDED' | 'PARTIAL_REFUND';
  createdAt: string;
}

export interface SalesQuery extends PaginationQuery {
  branchId?: string;
  from?: string;
  to?: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface QuickStats {
  ordersCount: number;
  avgBasket: number;
  currency: string;
  topProducts: TopProduct[];
}

export interface ActiveShift {
  id: string;
  branchId: string;
  branchName: string;
  cashierName: string;
  openedAt: string;
  openingCash: number;
  currency: string;
}

// ─── Backend raw shapes ──────────────────────────────────────────────────────

interface OrderItemRaw {
  productId: string;
  productName: string;
  quantity: string | number;
  unitPrice: string | number;
  total: string | number;
  product: { id: string; name: string } | null;
}

interface OrderRaw {
  id: string;
  branchId: string;
  status: string;
  total: string | number;
  createdAt: string;
  items: OrderItemRaw[];
  user: { id: string; firstName: string; lastName: string } | null;
}

// Backend: { items, total, page, limit } — not PaginatedResponse<T>
interface OrdersResponse {
  items: OrderRaw[];
  total: number;
  page: number;
  limit: number;
}

interface ShiftRaw {
  id: string;
  branchId: string;
  openedAt: string;
  openingCash: string | number;
  user: { id: string; firstName: string; lastName: string } | null;
  branch: { id: string; name: string } | null;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapOrderStatus(status: string): Sale['status'] {
  if (status === 'RETURNED') return 'REFUNDED';
  if (status === 'COMPLETED') return 'COMPLETED';
  return 'PARTIAL_REFUND';
}

function mapOrderRaw(raw: OrderRaw): Sale {
  const cashierName =
    raw.user
      ? `${raw.user.firstName} ${raw.user.lastName}`.trim()
      : '';
  return {
    id: raw.id,
    branchId: raw.branchId,
    branchName: raw.branchId,   // branchName not in order response — use branchId as fallback
    cashierName,
    items: raw.items.map((item) => ({
      productId: item.productId,
      productName: item.productName ?? item.product?.name ?? '',
      quantity: Number(item.quantity),
      price: Number(item.unitPrice),
      total: Number(item.total),
    })),
    total: Number(raw.total),
    currency: 'UZS',
    paymentMethod: 'CASH',      // not in order response — payment is in PaymentIntent
    status: mapOrderStatus(raw.status),
    createdAt: raw.createdAt,
  };
}

function mapShiftRaw(raw: ShiftRaw): ActiveShift {
  return {
    id: raw.id,
    branchId: raw.branchId,
    branchName: raw.branch?.name ?? raw.branchId,
    cashierName: raw.user
      ? `${raw.user.firstName} ${raw.user.lastName}`.trim()
      : '',
    openedAt: raw.openedAt,
    openingCash: Number(raw.openingCash),
    currency: 'UZS',
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

// READ ONLY — financial mutations TAQIQLANGAN
export const salesApi = {
  // Backend returns { items, total, page, limit } — mapped to PaginatedResponse<Sale>
  getAll: async (query: SalesQuery = {}): Promise<PaginatedResponse<Sale>> => {
    const { data } = await api.get<OrdersResponse>('/sales/orders', {
      params: query,
    });
    const items = Array.isArray(data?.items) ? data.items : [];
    return {
      data: items.map(mapOrderRaw),
      meta: {
        total: data?.total ?? 0,
        page: data?.page ?? 1,
        limit: data?.limit ?? 20,
        totalPages: data?.total && data?.limit ? Math.ceil(data.total / data.limit) : 0,
      },
    };
  },

  getById: async (id: string): Promise<Sale> => {
    const { data } = await api.get<OrderRaw>(`/sales/orders/${id}`);
    return mapOrderRaw(data);
  },

  // Backend returns { ordersCount, avgBasket, currency, topProducts } — matches QuickStats
  getQuickStats: async (branchId?: string): Promise<QuickStats> => {
    const { data } = await api.get<QuickStats>('/sales/quick-stats', {
      params: { branchId },
    });
    return data;
  },

  // Backend returns ShiftRaw[] — mapped to ActiveShift[]
  getActiveShifts: async (branchId?: string): Promise<ActiveShift[]> => {
    const { data } = await api.get<ShiftRaw[]>('/sales/shifts/active', {
      params: { branchId },
    });
    const items = Array.isArray(data) ? data : [];
    return items.map(mapShiftRaw);
  },
};
