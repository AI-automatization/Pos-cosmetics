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
  goToNotifications: () => void,
): void {
  const data = response.notification.request.content.data as unknown as
    | NotificationPayload
    | undefined;

  // A bare tap with no/unknown payload still opens the notifications list.
  if (!data) {
    goToNotifications();
    return;
  }

  switch (data.type) {
    case 'LOW_STOCK':
    case 'LARGE_SALE':
    case 'RENTAL_PAYMENT_DUE':
    case 'SUSPICIOUS_ACTIVITY':
    case 'AI_INSIGHT':
    case 'SHIFT_OPENED':
    case 'SHIFT_CLOSED':
    case 'SYSTEM_ALERT':
    default:
      goToNotifications();
      break;
  }
}
