import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from './types';
import { useAuthStore } from '@/store/auth.store';
import { useAppStore } from '@/store/app.store';
import { setNavigationRef } from '@/api/client';
import AuthNavigator from './AuthNavigator';
import TabNavigator, { SettingsNavigator } from './TabNavigator';
import OnboardingScreen, { ONBOARDING_KEY } from '@/screens/Onboarding';
import AIInsightsScreen from '@/screens/AIInsights';
import SaleDetailScreen from '@/screens/Sales/SaleDetail';
import AlertDetailScreen from '@/screens/Alerts/AlertDetail';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function RootNavigator(): React.JSX.Element {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const { onboardingDone, setOnboardingDone } = useAppStore();
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    void loadUser();
    setNavigationRef(navigationRef as Parameters<typeof setNavigationRef>[0]);
    void AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setOnboardingDone(val === 'true');
      setInitDone(true);
    });
  }, [loadUser, setOnboardingDone]);

  if (isLoading || !initDone) return <></>;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!onboardingDone && (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="Settings"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              component={SettingsNavigator as any}
            />
            <Stack.Screen
              name="AIInsights"
              component={AIInsightsScreen}
              options={{ headerShown: true, title: t('insights.title') }}
            />
            <Stack.Screen
              name="SaleDetail"
              component={SaleDetailScreen}
              options={{ headerShown: true, title: t('sales.detail') }}
            />
            <Stack.Screen
              name="AlertDetail"
              component={AlertDetailScreen}
              options={{ headerShown: true, title: '' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
