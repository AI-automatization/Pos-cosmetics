import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import type {
  TabParamList,
  DashboardStackParamList,
  SalesStackParamList,
  NasiyaStackParamList,
  InventoryStackParamList,
  AlertsStackParamList,
  SettingsStackParamList,
} from './types';

import DashboardScreen from '@/screens/Dashboard';
import BranchDetailScreen from '@/screens/Dashboard/BranchDetail';
import SalesListScreen from '@/screens/Sales';
import SaleDetailScreen from '@/screens/Sales/SaleDetail';
import DebtorsListScreen from '@/screens/Nasiya';
import DebtDetailScreen from '@/screens/Nasiya/DebtDetail';
import StockLevelsScreen from '@/screens/Inventory';
import LowStockScreen from '@/screens/Inventory/LowStockList';
import BarcodeScannerScreen from '@/screens/Inventory/BarcodeScanner';
import AlertsListScreen from '@/screens/Alerts';
import AlertDetailScreen from '@/screens/Alerts/AlertDetail';
import SettingsScreen from '@/screens/Settings';
import ProfileScreen from '@/screens/Settings/Profile';
import NotificationPrefsScreen from '@/screens/Settings/NotificationPrefs';
import BranchSelectorScreen from '@/screens/Settings/BranchSelector';

const Tab = createBottomTabNavigator<TabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const SalesStack = createNativeStackNavigator<SalesStackParamList>();
const NasiyaStack = createNativeStackNavigator<NasiyaStackParamList>();
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>();
const AlertsStack = createNativeStackNavigator<AlertsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function DashboardNavigator(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="BranchDetail"
        component={BranchDetailScreen}
        options={({ route }) => ({ title: route.params.branchName })}
      />
    </DashboardStack.Navigator>
  );
}

function SalesNavigator(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <SalesStack.Navigator>
      <SalesStack.Screen name="SalesList" component={SalesListScreen} options={{ title: t('sales.title') }} />
      <SalesStack.Screen name="SaleDetail" component={SaleDetailScreen} options={{ title: t('sales.detail') }} />
    </SalesStack.Navigator>
  );
}

function NasiyaNavigator(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <NasiyaStack.Navigator>
      <NasiyaStack.Screen name="DebtorsList" component={DebtorsListScreen} options={{ title: t('nasiya.title') }} />
      <NasiyaStack.Screen
        name="DebtDetail"
        component={DebtDetailScreen}
        options={({ route }) => ({ title: route.params.customerName })}
      />
    </NasiyaStack.Navigator>
  );
}

function InventoryNavigator(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <InventoryStack.Navigator>
      <InventoryStack.Screen name="StockLevels" component={StockLevelsScreen} options={{ title: t('inventory.title') }} />
      <InventoryStack.Screen name="LowStock" component={LowStockScreen} options={{ title: t('inventory.lowStock') }} />
      <InventoryStack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ title: t('scanner.title'), headerShown: false }}
      />
    </InventoryStack.Navigator>
  );
}

function AlertsNavigator(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <AlertsStack.Navigator>
      <AlertsStack.Screen name="AlertsList" component={AlertsListScreen} options={{ title: t('alerts.title') }} />
      <AlertsStack.Screen name="AlertDetail" component={AlertDetailScreen} options={{ title: '' }} />
    </AlertsStack.Navigator>
  );
}

function SettingsNavigator(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
      <SettingsStack.Screen name="Profile" component={ProfileScreen} options={{ title: t('settings.profile') }} />
      <SettingsStack.Screen name="NotificationPrefs" component={NotificationPrefsScreen} options={{ title: t('settings.notifications') }} />
      <SettingsStack.Screen name="BranchSelector" component={BranchSelectorScreen} options={{ title: t('settings.branch') }} />
    </SettingsStack.Navigator>
  );
}

export default function TabNavigator(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1a56db',
        tabBarInactiveTintColor: '#6b7280',
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            DashboardTab: focused ? 'home' : 'home-outline',
            SalesTab: focused ? 'receipt' : 'receipt-outline',
            NasiyaTab: focused ? 'people' : 'people-outline',
            InventoryTab: focused ? 'cube' : 'cube-outline',
            AlertsTab: focused ? 'notifications' : 'notifications-outline',
            SettingsTab: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardNavigator} options={{ title: t('nav.dashboard') }} />
      <Tab.Screen name="SalesTab" component={SalesNavigator} options={{ title: t('nav.sales') }} />
      <Tab.Screen name="NasiyaTab" component={NasiyaNavigator} options={{ title: t('nav.nasiya') }} />
      <Tab.Screen name="InventoryTab" component={InventoryNavigator} options={{ title: t('nav.inventory') }} />
      <Tab.Screen name="AlertsTab" component={AlertsNavigator} options={{ title: t('nav.alerts') }} />
      <Tab.Screen name="SettingsTab" component={SettingsNavigator} options={{ title: t('nav.settings') }} />
    </Tab.Navigator>
  );
}
