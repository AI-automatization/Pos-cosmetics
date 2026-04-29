import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { DashboardStackParamList } from './types';
import DashboardScreen from '../screens/Dashboard';
import NotificationsScreen from '../screens/Notifications';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
