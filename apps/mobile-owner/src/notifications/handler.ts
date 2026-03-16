import * as Notifications from 'expo-notifications';
import { AlertPayload } from './types';

let navigationRef: { navigate: (screen: string, params?: object) => void } | null = null;

export function setNavigationRef(ref: { navigate: (screen: string, params?: object) => void }): void {
  navigationRef = ref;
}

function handleForegroundNotification(notification: Notifications.Notification): void {
  // Notification shown by handler below — no extra action needed
  void notification;
}

function handleNotificationTap(response: Notifications.NotificationResponse): void {
  if (!navigationRef) return;

  const payload = response.notification.request.content.data as AlertPayload | undefined;
  if (!payload) {
    navigationRef.navigate('Main');
    return;
  }

  const { type, entityId, branchId } = payload;

  switch (type) {
    case 'LOW_STOCK':
    case 'OUT_OF_STOCK':
      navigationRef.navigate('Main', { screen: 'Inventory' });
      break;
    case 'SUSPICIOUS_ACTIVITY':
    case 'LARGE_REFUND':
      navigationRef.navigate('Main', { screen: 'Employees' });
      break;
    case 'NASIYA_OVERDUE':
      navigationRef.navigate('Main', { screen: 'Debts' });
      break;
    case 'SYSTEM_ERROR':
      navigationRef.navigate('Main', { screen: 'SystemHealth' });
      break;
    default:
      navigationRef.navigate('Main', { screen: 'Alerts' });
  }

  void entityId;
  void branchId;
}

export function setupNotificationHandlers(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  Notifications.addNotificationReceivedListener(handleForegroundNotification);
  Notifications.addNotificationResponseReceivedListener(handleNotificationTap);
}
