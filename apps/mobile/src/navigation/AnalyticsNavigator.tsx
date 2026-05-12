import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AnalyticsStackParamList } from './types';
import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';
import AbcAnalysisScreen from '../screens/Analytics/AbcAnalysisScreen';
import MarginAnalysisScreen from '../screens/Analytics/MarginAnalysisScreen';
import CashierPerformanceScreen from '../screens/Analytics/CashierPerformanceScreen';
import DeadStockScreen from '../screens/Analytics/DeadStockScreen';

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

export default function AnalyticsNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnalyticsMain" component={AnalyticsScreen} />
      <Stack.Screen name="AbcAnalysis" component={AbcAnalysisScreen} />
      <Stack.Screen name="MarginAnalysis" component={MarginAnalysisScreen} />
      <Stack.Screen name="CashierPerformance" component={CashierPerformanceScreen} />
      <Stack.Screen name="DeadStock" component={DeadStockScreen} />
    </Stack.Navigator>
  );
}
