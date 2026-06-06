/** Notification type → mobile priority mapping */
export const PRIORITY_MAP: Record<string, 'low' | 'medium' | 'high'> = {
  LOW_STOCK: 'medium',
  OUT_OF_STOCK: 'high',
  EXPIRY_WARNING: 'medium',
  LARGE_REFUND: 'high',
  NASIYA_OVERDUE: 'high',
  SHIFT_CHANGED: 'low',
  SALE_COMPLETED: 'low',
  ERROR_ALERT: 'high',
  SYSTEM: 'medium',
};
