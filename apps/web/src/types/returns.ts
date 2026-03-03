// Returns domain types

export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReturnReason = 'DEFECTIVE' | 'WRONG_ITEM' | 'CUSTOMER_CHANGE' | 'OTHER';

export interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  sellPrice: number;
  lineTotal: number;
}

export interface Return {
  id: string;
  orderId: string;
  orderNumber: string;
  cashierName: string;
  reason: ReturnReason;
  items: ReturnItem[];
  totalAmount: number;
  status: ReturnStatus;
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface CreateReturnDto {
  orderId: string;
  reason: ReturnReason;
  items: { productId: string; quantity: number }[];
  note?: string;
}

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  DEFECTIVE: "Nuqsonli mahsulot",
  WRONG_ITEM: "Noto'g'ri mahsulot",
  CUSTOMER_CHANGE: "Xaridor fikri o'zgardi",
  OTHER: "Boshqa sabab",
};

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  PENDING: "Kutilmoqda",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};
