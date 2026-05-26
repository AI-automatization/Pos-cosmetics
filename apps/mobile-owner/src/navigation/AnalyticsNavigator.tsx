import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AnalyticsStackParamList } from './types';
import AnalyticsScreen from '../screens/Analytics';
import AbcAnalysisScreen from '../screens/Analytics/AbcAnalysisScreen';
import DeadStockScreen from '../screens/Analytics/DeadStockScreen';

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

export default function AnalyticsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnalyticsHome" component={AnalyticsScreen} />
      <Stack.Screen name="AbcAnalysis" component={AbcAnalysisScreen} />
      <Stack.Screen name="DeadStock" component={DeadStockScreen} />
    </Stack.Navigator>
  );
}
