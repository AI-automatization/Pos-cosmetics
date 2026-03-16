export type NotificationType =
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'EXPIRY_WARNING'
  | 'LARGE_REFUND'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SHIFT_CLOSED'
  | 'SYSTEM_ERROR'
  | 'NASIYA_OVERDUE';

export interface AlertPayload {
  type: NotificationType;
  entityId: string;
  branchId: string;
  message: string;
}
