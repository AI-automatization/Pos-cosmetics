import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuthStore } from '@/store/auth.store';
import { setNavigationRef } from '@/api/client';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function RootNavigator(): React.JSX.Element {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    void loadUser();
    setNavigationRef(navigationRef as Parameters<typeof setNavigationRef>[0]);
  }, [loadUser]);

  if (isLoading) return <></>;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
