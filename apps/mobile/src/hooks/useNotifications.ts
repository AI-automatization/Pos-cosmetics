import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { api } from '@/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications(): void {
  useEffect(() => {
    if (!Device.isDevice) return;

    void registerForPushNotifications();

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      if (__DEV__) {
        console.log('[Notification received]', notification);
      }
    });

    return () => subscription.remove();
  }, []);
}

async function registerForPushNotifications(): Promise<void> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const token = await Notifications.getExpoPushTokenAsync();

  // Backend endpoint: POST /notifications/fcm-token
  await api
    .post('/notifications/fcm-token', { token: token.data, platform: 'android' })
    .catch(() => null);
}
