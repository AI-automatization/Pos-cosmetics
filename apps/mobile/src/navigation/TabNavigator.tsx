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
  RealEstateStackParamList,
  SettingsStackParamList,
} from './types';

import DashboardScreen from '@/screens/Dashboard';
import BranchDetailScreen from '@/screens/Dashboard/BranchDetail';
import SalesListScreen from '@/screens/Sales';
import DebtorsListScreen from '@/screens/Nasiya';
import DebtDetailScreen from '@/screens/Nasiya/DebtDetail';
import StockLevelsScreen from '@/screens/Inventory';
import LowStockScreen from '@/screens/Inventory/LowStockList';
import BarcodeScannerScreen from '@/screens/Inventory/BarcodeScanner';
import PropertiesScreen from '@/screens/RealEstate';
import PropertyDetailScreen from '@/screens/RealEstate/PropertyDetail';
import RentalPaymentsScreen from '@/screens/RealEstate/RentalPayments';
import SettingsScreen from '@/screens/Settings';
import ProfileScreen from '@/screens/Settings/Profile';
import NotificationPrefsScreen from '@/screens/Settings/NotificationPrefs';
import BranchSelectorScreen from '@/screens/Settings/BranchSelector';

const Tab = createBottomTabNavigator<TabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const SalesStack = createNativeStackNavigator<SalesStackParamList>();
const NasiyaStack = createNativeStackNavigator<NasiyaStackParamList>();
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>();
const RealEstateStack = createNativeStackNavigator<RealEstateStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function DashboardNavigator(): React.JSX.Element {
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
      <SalesStack.Screen
        name="SalesList"
        component={SalesListScreen}
        options={{ title: t('sales.title') }}
      />
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

function RealEstateNavigator(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <RealEstateStack.Navigator>
      <RealEstateStack.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{ title: t('realestate.title') }}
      />
      <RealEstateStack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={({ route }) => ({ title: route.params.propertyName })}
      />
      <RealEstateStack.Screen
        name="RentalPayments"
        component={RentalPaymentsScreen}
        options={({ route }) => ({ title: route.params.propertyName })}
      />
    </RealEstateStack.Navigator>
  );
}

export function SettingsNavigator(): React.JSX.Element {
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
            Dashboard: focused ? 'home' : 'home-outline',
            Sales: focused ? 'receipt' : 'receipt-outline',
            Nasiya: focused ? 'people' : 'people-outline',
            Inventory: focused ? 'cube' : 'cube-outline',
            RealEstate: focused ? 'business' : 'business-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardNavigator} options={{ title: t('nav.dashboard') }} />
      <Tab.Screen name="Sales" component={SalesNavigator} options={{ title: t('nav.sales') }} />
      <Tab.Screen name="Nasiya" component={NasiyaNavigator} options={{ title: t('nav.nasiya') }} />
      <Tab.Screen name="Inventory" component={InventoryNavigator} options={{ title: t('nav.inventory') }} />
      <Tab.Screen name="RealEstate" component={RealEstateNavigator} options={{ title: t('nav.realestate') }} />
    </Tab.Navigator>
  );
}
