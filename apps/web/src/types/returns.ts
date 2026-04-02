export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReturnItem {
  id: string;
  orderItemId: string;
  productId: string;
  quantity: number;
  amount: number;
}

export interface Return {
  id: string;
  orderId: string;
  userId: string;
  reason: string | null;
  total: number;
  status: ReturnStatus;
  approvedBy: string | null;
  createdAt: string;
  items: ReturnItem[];
}

export interface CreateReturnDto {
  orderId: string;
  items: { orderItemId: string; productId: string; quantity: number }[];
  reason?: string;
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  PENDING: 'Kutilmoqda',
  APPROVED: 'Tasdiqlangan',
  REJECTED: 'Rad etilgan',
};
