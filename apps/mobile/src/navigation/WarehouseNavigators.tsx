import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OmborTabStackParamList, MovementsStackParamList } from './types';
import KirimScreen from '../screens/Kirim';
import OmborScreen from '../screens/Ombor';
import WarehouseDashboardScreen from '../screens/Ombor/WarehouseDashboardScreen';
import InvoicesScreen from '../screens/Ombor/InvoicesScreen';
import RestockRequestsScreen from '../screens/Ombor/RestockRequestsScreen';
import SuppliersOmborScreen from '../screens/Ombor/SuppliersOmborScreen';
import SupplierDetailScreen from '../screens/Ombor/SupplierDetailScreen';
import TransferListScreen from '../screens/StockTransfer/TransferListScreen';
import TesterScreen from '../screens/Ombor/TesterScreen';
import StockMovementsScreen from '../screens/StockMovements';

// ─── Kirim Tab Stack (WAREHOUSE role: replaces Savdo tab) ─
const KirimTabStack = createNativeStackNavigator();

export function KirimTabNavigator(): React.JSX.Element {
  return (
    <KirimTabStack.Navigator screenOptions={{ headerShown: false }}>
      <KirimTabStack.Screen name="KirimMain" component={KirimScreen} />
    </KirimTabStack.Navigator>
  );
}

// ─── Ombor Tab Stack (WAREHOUSE role: replaces Katalog tab) ─
const OmborTabStack = createNativeStackNavigator<OmborTabStackParamList>();

export function OmborTabNavigator(): React.JSX.Element {
  return (
    <OmborTabStack.Navigator screenOptions={{ headerShown: false }}>
      <OmborTabStack.Screen name="WarehouseDashboard" component={WarehouseDashboardScreen} />
      <OmborTabStack.Screen name="OmborMain" component={OmborScreen} />
      <OmborTabStack.Screen
        name="InvoicesScreen"
        component={InvoicesScreen}
        options={{ title: 'Nakladnoylar' }}
      />
      <OmborTabStack.Screen
        name="RestockRequestsScreen"
        component={RestockRequestsScreen}
        options={{ title: "To'ldirish so'rovlari" }}
      />
      <OmborTabStack.Screen
        name="SuppliersOmborScreen"
        component={SuppliersOmborScreen}
        options={{ title: 'Yetkazib beruvchilar' }}
      />
      <OmborTabStack.Screen
        name="SupplierDetailScreen"
        component={SupplierDetailScreen}
        options={{ title: 'Yetkazib beruvchi' }}
      />
      <OmborTabStack.Screen
        name="TransferListScreen"
        component={TransferListScreen}
        options={{ title: 'Transferlar' }}
      />
      <OmborTabStack.Screen
        name="TesterScreen"
        component={TesterScreen}
        options={{ title: 'Tester' }}
      />
    </OmborTabStack.Navigator>
  );
}

// ─── Harakatlar Stack (Warehouse movements) ─────────────────
const MovementsStack = createNativeStackNavigator<MovementsStackParamList>();

export function MovementsTabNavigator(): React.JSX.Element {
  return (
    <MovementsStack.Navigator screenOptions={{ headerShown: false }}>
      <MovementsStack.Screen name="MovementsMain" component={StockMovementsScreen} />
    </MovementsStack.Navigator>
  );
}
