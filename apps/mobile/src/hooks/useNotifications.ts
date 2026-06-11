import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { handleNotificationResponse } from '../notifications/handlers';
import { navigateToNotifications, runWhenReady } from '../navigation/navigationRef';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const queryClient = useQueryClient();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // Notification kelganda dashboard badge query ni invalidate qil
        queryClient.invalidateQueries({ queryKey: ['alerts-active'] });
      },
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationResponse(response, navigateToNotifications);
      },
    );

    // Cold start: app launched from a killed state by tapping a notification.
    // The response listener does NOT fire for the launch notification, so query
    // it explicitly and defer navigation until the container is ready.
    void Notifications.getLastNotificationResponseAsync()
      .then((lastResponse) => {
        if (cancelled || !lastResponse) return;
        runWhenReady(() => {
          handleNotificationResponse(lastResponse, navigateToNotifications);
        });
      })
      .catch(() => {
        // Notifications are best-effort; cold-start failure is non-blocking.
      });

    return () => {
      cancelled = true;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}

async function registerForPushNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'RAOS Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // expo-modules-core PermissionResponse tipi pnpm hoisting tufayli
  // NotificationPermissionsStatus ichida resolve bo'lmaydi —
  // shuning uchun granted property ga type assertion kerak
  type PermissionResult = Notifications.NotificationPermissionsStatus & { granted: boolean };
  const existingPermission = (await Notifications.getPermissionsAsync()) as PermissionResult;
  let isGranted = existingPermission.granted;

  if (!isGranted) {
    const newPermission = (await Notifications.requestPermissionsAsync()) as PermissionResult;
    isGranted = newPermission.granted;
  }

  if (!isGranted) return;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenData.data;
    await api.post('/notifications/register-token', { token: expoPushToken });
  } catch {
    // EAS projectId yo'q yoki token registration failed — notifications are non-blocking
  }
}
