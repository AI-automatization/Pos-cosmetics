export type NotificationType =
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'EXPIRY_WARNING'
  | 'LARGE_REFUND'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SHIFT_CLOSED'
  | 'SHIFT_OPENED'
  | 'SYSTEM_ERROR'
  | 'NASIYA_OVERDUE'
  | 'LARGE_SALE'
  | 'NEW_EMPLOYEE'
  | 'SALE_COMPLETED';

export interface AlertPayload {
  readonly type: NotificationType;
  readonly entityId: string;
  readonly branchId: string;
  readonly message: string;
}

export interface NotificationTypeConfig {
  readonly labelKey: string;
  readonly icon: string;
  readonly color: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  LOW_STOCK:           { labelKey: 'alerts.LOW_STOCK',           icon: 'warning-outline',       color: '#F59E0B' },
  OUT_OF_STOCK:        { labelKey: 'alerts.OUT_OF_STOCK',        icon: 'alert-circle-outline',  color: '#EF4444' },
  EXPIRY_WARNING:      { labelKey: 'alerts.EXPIRY_WARNING',      icon: 'timer-outline',         color: '#F59E0B' },
  LARGE_REFUND:        { labelKey: 'alerts.LARGE_REFUND',        icon: 'return-down-back',      color: '#EF4444' },
  SUSPICIOUS_ACTIVITY: { labelKey: 'alerts.SUSPICIOUS_ACTIVITY', icon: 'eye-outline',           color: '#EF4444' },
  SHIFT_CLOSED:        { labelKey: 'alerts.SHIFT_CLOSED',        icon: 'time-outline',          color: '#6B7280' },
  SHIFT_OPENED:        { labelKey: 'alerts.SHIFT_OPENED',        icon: 'play-circle-outline',   color: '#10B981' },
  SYSTEM_ERROR:        { labelKey: 'alerts.SYSTEM_ERROR',        icon: 'bug-outline',           color: '#EF4444' },
  NASIYA_OVERDUE:      { labelKey: 'alerts.NASIYA_OVERDUE',      icon: 'cash-outline',          color: '#F59E0B' },
  LARGE_SALE:          { labelKey: 'alerts.LARGE_SALE',          icon: 'trending-up-outline',   color: '#10B981' },
  NEW_EMPLOYEE:        { labelKey: 'alerts.NEW_EMPLOYEE',        icon: 'person-add-outline',    color: '#3B82F6' },
  SALE_COMPLETED:      { labelKey: 'alerts.SALE_COMPLETED',      icon: 'checkmark-circle',      color: '#10B981' },
};
