import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SalesStackParamList } from './types';
import SalesScreen from '../screens/Sales';
import SaleDetailScreen from '../screens/Sales/SaleDetailScreen';

const Stack = createNativeStackNavigator<SalesStackParamList>();

export default function SalesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SalesList" component={SalesScreen} />
      <Stack.Screen name="SaleDetail" component={SaleDetailScreen} />
    </Stack.Navigator>
  );
}
