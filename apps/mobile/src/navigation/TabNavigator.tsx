import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { TabParamList, SavdoStackParamList, CatalogStackParamList } from './types';
import { useAuthStore } from '../store/auth.store';
import { getRoleLevel } from '../utils/roles';

// Extracted navigators
import DashboardNavigator from './DashboardNavigator';
import AnalyticsNavigator from './AnalyticsNavigator';
import EmployeesNavigator from './EmployeesNavigator';
import FinanceNavigator from './FinanceNavigator';
import MoreNavigator from './MoreNavigator';
import { KirimTabNavigator, OmborTabNavigator, MovementsTabNavigator } from './WarehouseNavigators';

// Screens for inline navigators
import SalesNavigator from './SalesNavigator';
import SavdoScreen from '../screens/Savdo';
import SmenaScreen from '../screens/Smena';
import NasiyaScreen from '../screens/Nasiya';
import ProductsScreen from '../screens/Catalog/ProductsScreen';
import CategoriesScreen from '../screens/Catalog/CategoriesScreen';
import ProductFormScreen from '../screens/Catalog/ProductFormScreen';
import SuppliersScreen from '../screens/Catalog/SuppliersScreen';

// ─── Colors ───────────────────────────────────────────────
const PRIMARY = '#2563EB';
const INACTIVE = '#9CA3AF';

// ─── Spacing / sizing tokens ──────────────────────────────
const FONT_SM = 11;
const SPACING_4 = 4;
const SPACING_6 = 6;
const SPACING_8 = 8;
const TAB_HEIGHT = 60;
const ICON_SIZE = 22;

// ─── Katalog Stack (Products, Categories, ProductForm, Suppliers) ──
const CatalogStack = createNativeStackNavigator<CatalogStackParamList>();

function CatalogNavigator(): React.JSX.Element {
  return (
    <CatalogStack.Navigator screenOptions={{ headerShown: false }}>
      <CatalogStack.Screen name="CatalogMain" component={ProductsScreen} />
      <CatalogStack.Screen name="Categories" component={CategoriesScreen} />
      <CatalogStack.Screen name="ProductForm" component={ProductFormScreen} />
      <CatalogStack.Screen name="Suppliers" component={SuppliersScreen} />
    </CatalogStack.Navigator>
  );
}

// ─── Savdo Stack (SavdoMain + nested screens) ──────────────
const SavdoStack = createNativeStackNavigator<SavdoStackParamList>();

function SavdoNavigator(): React.JSX.Element {
  return (
    <SavdoStack.Navigator screenOptions={{ headerShown: false }}>
      <SavdoStack.Screen name="SavdoMain" component={SavdoScreen} />
      <SavdoStack.Screen name="SmenaScreen" component={SmenaScreen} />
      <SavdoStack.Screen name="SalesHistory" component={SalesNavigator} />
      <SavdoStack.Screen name="NasiyaScreen" component={NasiyaScreen} />
    </SavdoStack.Navigator>
  );
}

// ─── Tab icon helper ───────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon(
  focused: boolean,
  outlineName: IoniconsName,
  filledName: IoniconsName,
  color: string,
): React.JSX.Element {
  return (
    <Ionicons
      name={focused ? filledName : outlineName}
      size={ICON_SIZE}
      color={color}
    />
  );
}

// ─── Bottom Tab Navigator ──────────────────────────────────
const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator(): React.JSX.Element {
  const { user } = useAuthStore();
  const isWarehouse = user?.role === 'WAREHOUSE';
  const isCashier = user?.role === 'CASHIER';
  const isOwnerAdmin = getRoleLevel(user?.role) >= 4;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* Tab 1: Bosh sahifa — har doim */}
      <Tab.Screen
        name="BoshSahifa"
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Bosh sahifa',
          tabBarIcon: ({ focused, color }) =>
            TabIcon(focused, 'home-outline', 'home', color),
        }}
      />

      {/* Tab 2: Analitika — faqat OWNER / ADMIN */}
      {isOwnerAdmin && (
        <Tab.Screen
          name="Analytics"
          component={AnalyticsNavigator}
          options={{
            tabBarLabel: 'Analitika',
            tabBarIcon: ({ focused, color }) =>
              TabIcon(focused, 'bar-chart-outline', 'bar-chart', color),
          }}
        />
      )}

      {/* Tab 3: Xodimlar — faqat OWNER / ADMIN */}
      {isOwnerAdmin && (
        <Tab.Screen
          name="Xodimlar"
          component={EmployeesNavigator}
          options={{
            tabBarLabel: 'Xodimlar',
            tabBarIcon: ({ focused, color }) =>
              TabIcon(focused, 'people-outline', 'people', color),
          }}
        />
      )}

      {/* Tab 2/3: Savdo (WAREHOUSE: Kirim) — OWNER/ADMIN uchun emas */}
      {!isOwnerAdmin && (
        <Tab.Screen
          name="Savdo"
          component={isWarehouse ? KirimTabNavigator : SavdoNavigator}
          options={{
            tabBarLabel: isWarehouse ? 'Kirim' : 'Savdo',
            tabBarIcon: ({ focused, color }) =>
              TabIcon(
                focused,
                isWarehouse ? 'archive-outline' : 'cart-outline',
                isWarehouse ? 'archive' : 'cart',
                color,
              ),
          }}
        />
      )}

      {/* Tab 3/4: Katalog (WAREHOUSE: Ombor) — OWNER/ADMIN uchun emas */}
      {!isOwnerAdmin && (
        <Tab.Screen
          name="Katalog"
          component={isWarehouse ? OmborTabNavigator : CatalogNavigator}
          options={{
            tabBarLabel: isWarehouse ? 'Ombor' : 'Katalog',
            tabBarIcon: ({ focused, color }) =>
              TabIcon(
                focused,
                isWarehouse ? 'cube-outline' : 'grid-outline',
                isWarehouse ? 'cube' : 'grid',
                color,
              ),
          }}
        />
      )}

      {/* Tab 4/3: Moliya (WAREHOUSE: Harakatlar, CASHIER: yashirin) */}
      {!isCashier && (
        <Tab.Screen
          name="Moliya"
          component={isWarehouse ? MovementsTabNavigator : FinanceNavigator}
          options={{
            tabBarLabel: isWarehouse ? 'Harakatlar' : 'Moliya',
            tabBarIcon: ({ focused, color }) =>
              TabIcon(
                focused,
                isWarehouse ? 'swap-horizontal-outline' : 'trending-up-outline',
                isWarehouse ? 'swap-horizontal' : 'trending-up',
                color,
              ),
          }}
        />
      )}

      {/* Tab 5/4: Ko'proq — har doim */}
      <Tab.Screen
        name="Koproq"
        component={MoreNavigator}
        options={{
          tabBarLabel: "Ko'proq",
          tabBarIcon: ({ focused, color }) =>
            TabIcon(focused, 'menu-outline', 'menu', color),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: TAB_HEIGHT,
    paddingBottom: SPACING_8,
    paddingTop: SPACING_6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabBarLabel: {
    fontSize: FONT_SM,
    fontWeight: '600',
    marginBottom: SPACING_4,
  },
});
