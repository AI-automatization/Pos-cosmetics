import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackParamList } from './types';
import DashboardScreen from '../screens/Dashboard/index';
import InventoryScreen from '../screens/Inventory/index';
import DebtsScreen from '../screens/Debts/index';
import PnLScreen from '../screens/Finance/PnLScreen';
import DailyRevenueScreen from '../screens/Finance/DailyRevenueScreen';
import ShiftReportScreen from '../screens/Reports/ShiftReportScreen';
import BranchReportScreen from '../screens/Reports/BranchReportScreen';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="Debts" component={DebtsScreen} />
      <Stack.Screen name="PnL" component={PnLScreen} />
      <Stack.Screen name="DailyRevenue" component={DailyRevenueScreen} />
      <Stack.Screen name="ShiftReport" component={ShiftReportScreen} />
      <Stack.Screen name="BranchReport" component={BranchReportScreen} />
    </Stack.Navigator>
  );
}
