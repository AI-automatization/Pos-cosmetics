import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from './types';
import { useAuthStore } from '@/store/auth.store';
import { useAppStore } from '@/store/app.store';
import { setNavigationRef } from '@/api/client';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import OnboardingScreen, { ONBOARDING_KEY } from '@/screens/Onboarding';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function RootNavigator(): React.JSX.Element {
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
          <Stack.Screen name="App" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
