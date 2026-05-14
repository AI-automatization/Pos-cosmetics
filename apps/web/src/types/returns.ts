export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type RefundMethod = 'CASH' | 'TERMINAL';

// i18n key map — use with t() to get translated labels
export const REFUND_METHOD_KEYS: Record<RefundMethod, string> = {
  CASH: 'returns.cashRefund',
  TERMINAL: 'returns.cardRefund',
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

// i18n key map — use with t() to get translated labels
export const RETURN_STATUS_KEYS: Record<ReturnStatus, string> = {
  PENDING: 'common.pending',
  APPROVED: 'common.approved',
  REJECTED: 'returns.rejected',
};
