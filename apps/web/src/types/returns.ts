export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type RefundMethod = 'CASH' | 'TERMINAL';

export const REFUND_METHOD_LABELS: Record<RefundMethod, string> = {
  CASH: 'Naqd pul',
  TERMINAL: 'Bank kartasi',
};

export interface ReturnItem {
  id: string;
  orderItemId: string;
  productId: string;
  quantity: number;
  amount: number;
  product?: { name: string };
}

export interface Return {
  id: string;
  orderId: string;
  userId: string;
  reason: string | null;
  total: number;
  status: ReturnStatus;
  approvedBy: string | null;
  refundMethod: RefundMethod | null;
  createdAt: string;
  items: ReturnItem[];
  order?: { orderNumber: number };
  user?: { firstName: string | null; lastName: string | null };
}

export interface ReturnListResponse {
  items: Return[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreateReturnDto {
  orderId: string;
  items: { orderItemId: string; productId: string; quantity: number }[];
  reason?: string;
  refundMethod?: RefundMethod;
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  PENDING: 'Kutilmoqda',
  APPROVED: 'Tasdiqlangan',
  REJECTED: 'Rad etilgan',
};
