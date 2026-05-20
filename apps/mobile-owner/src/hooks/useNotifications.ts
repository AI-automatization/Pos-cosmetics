import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { Platform } from 'react-native';

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  // Push token registration is not supported in Expo Go (removed in SDK 53)
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    if (!user || isExpoGo) return;

    void (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync();

      await authApi.registerPushToken({
        token: tokenData.data,
        platform: Platform.OS,
        tenantId: user.tenantId,
        userId: user.id,
      });
    })();
  }, [user]);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  // Invalidate queries on notification received
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ['alerts-active'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });
    return () => subscription.remove();
  }, [queryClient]);
}
