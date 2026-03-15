import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { authApi } from '../api/auth.api';

export async function registerPushNotifications(tenantId: string, userId: string): Promise<void> {
  // Push token registration is not supported in Expo Go (removed in SDK 53)
  if (Constants.appOwnership === 'expo') return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const tokenData = await Notifications.getExpoPushTokenAsync();

  await authApi.registerPushToken({
    token: tokenData.data,
    platform: Platform.OS,
    tenantId,
    userId,
  });
}
