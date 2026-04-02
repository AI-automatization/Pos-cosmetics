import * as Notifications from 'expo-notifications';

export type NotificationType =
  | 'LOW_STOCK'
  | 'LARGE_SALE'
  | 'RENTAL_PAYMENT_DUE'
  | 'SUSPICIOUS_ACTIVITY'
  | 'AI_INSIGHT'
  | 'SHIFT_OPENED'
  | 'SHIFT_CLOSED'
  | 'SYSTEM_ALERT';

export interface NotificationPayload {
  type: NotificationType;
  alertId?: string;
  branchId?: string;
  metadata?: Record<string, unknown>;
}

export function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  navigate: (screen: string, params?: object) => void,
): void {
  const data = response.notification.request.content.data as unknown as NotificationPayload | undefined;
  if (!data) return;

  switch (data.type) {
    case 'LOW_STOCK':
      navigate('InventoryTab');
      break;
    case 'SUSPICIOUS_ACTIVITY':
    case 'AI_INSIGHT':
    case 'LARGE_SALE':
    case 'RENTAL_PAYMENT_DUE':
    case 'SHIFT_OPENED':
    case 'SHIFT_CLOSED':
    case 'SYSTEM_ALERT':
      if (data.alertId) {
        navigate('AlertsTab', { screen: 'AlertDetail', params: { alertId: data.alertId } });
      } else {
        navigate('AlertsTab');
      }
      break;
    default:
      navigate('DashboardTab');
  }
}
