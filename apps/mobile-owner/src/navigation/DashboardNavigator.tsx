import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackParamList } from './types';
import DashboardScreen from '../screens/Dashboard/index';
import InventoryScreen from '../screens/Inventory/index';
import DebtsScreen from '../screens/Debts/index';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="Debts" component={DebtsScreen} />
    </Stack.Navigator>
  );
}
