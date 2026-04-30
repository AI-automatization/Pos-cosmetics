import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { TabParamList, SavdoStackParamList, CatalogStackParamList, FinanceStackParamList, MoreStackParamList } from './types';
import { useAuthStore } from '../store/auth.store';

// Navigators
import DashboardNavigator from './DashboardNavigator';
import SavdoScreen from '../screens/Savdo';
import SmenaScreen from '../screens/Smena';
import SalesNavigator from './SalesNavigator';
import NasiyaScreen from '../screens/Nasiya';
import KirimScreen from '../screens/Kirim';
import OmborScreen from '../screens/Ombor';
import SettingsScreen from '../screens/Settings';
import MoreMenuScreen from '../screens/MoreMenu';
import BranchesScreen from '../screens/Settings/BranchesScreen';
import AuditLogScreen from '../screens/Settings/AuditLogScreen';
import CustomersScreen from '../screens/Customers/CustomersScreen';
import CustomerDetailScreen from '../screens/Customers/CustomerDetailScreen';
import PromotionsScreen from '../screens/Promotions/PromotionsScreen';
import UsersScreen from '../screens/Settings/UsersScreen';
import LowStockScreen from '../screens/Inventory/LowStockList';
import ProductsScreen from '../screens/Catalog/ProductsScreen';
import CategoriesScreen from '../screens/Catalog/CategoriesScreen';
import ProductFormScreen from '../screens/Catalog/ProductFormScreen';
import SuppliersScreen from '../screens/Catalog/SuppliersScreen';
import FinanceScreen from '../screens/Finance/FinanceScreen';
import DailyRevenueScreen from '../screens/Finance/DailyRevenueScreen';
import ExpensesScreen from '../screens/Finance/ExpensesScreen';
import PnLScreen from '../screens/Finance/PnLScreen';
import TopProductsScreen from '../screens/Finance/TopProductsScreen';
import PaymentsHistoryScreen from '../screens/Finance/PaymentsHistoryScreen';
import NasiyaAgingScreen from '../screens/Finance/NasiyaAgingScreen';
import ShiftReportsScreen from '../screens/Finance/ShiftReportsScreen';
import ReportsHubScreen from '../screens/Finance/ReportsHubScreen';
import ExchangeRatesScreen from '../screens/Finance/ExchangeRatesScreen';

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

// ─── Moliya Stack (Finance screens) ─────────────────────────
const FinanceStack = createNativeStackNavigator<FinanceStackParamList>();

function FinanceNavigator(): React.JSX.Element {
  return (
    <FinanceStack.Navigator screenOptions={{ headerShown: false }}>
      <FinanceStack.Screen name="FinanceMain" component={FinanceScreen} />
      <FinanceStack.Screen name="DailyRevenue" component={DailyRevenueScreen} />
      <FinanceStack.Screen name="Expenses" component={ExpensesScreen} />
      <FinanceStack.Screen name="PnL" component={PnLScreen} />
      <FinanceStack.Screen name="TopProducts" component={TopProductsScreen} />
      <FinanceStack.Screen name="PaymentsHistory" component={PaymentsHistoryScreen} />
      <FinanceStack.Screen name="NasiyaAging" component={NasiyaAgingScreen} />
      <FinanceStack.Screen name="ShiftReports" component={ShiftReportsScreen} />
      <FinanceStack.Screen name="ReportsHub" component={ReportsHubScreen} />
      <FinanceStack.Screen name="ExchangeRates" component={ExchangeRatesScreen} options={{ headerShown: false }} />
    </FinanceStack.Navigator>
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

// ─── Ko'proq Stack (MoreMenu + nested screens) ─────────────
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function MoreNavigator(): React.JSX.Element {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <MoreStack.Screen name="KirimScreen" component={KirimScreen} />
      <MoreStack.Screen name="OmborScreen" component={OmborScreen} />
      <MoreStack.Screen name="SettingsScreen" component={SettingsScreen} />
      <MoreStack.Screen name="BranchesScreen" component={BranchesScreen} />
      <MoreStack.Screen name="AuditLogScreen" component={AuditLogScreen} />
      <MoreStack.Screen name="CustomersScreen" component={CustomersScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="PromotionsScreen" component={PromotionsScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="UsersScreen" component={UsersScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="LowStockList" component={LowStockScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="SuppliersScreen" component={SuppliersScreen} options={{ headerShown: false }} />
    </MoreStack.Navigator>
  );
}

// ─── Kirim Tab Stack (WAREHOUSE role: replaces Savdo tab) ─
const KirimTabStack = createNativeStackNavigator();
function KirimTabNavigator(): React.JSX.Element {
  return (
    <KirimTabStack.Navigator screenOptions={{ headerShown: false }}>
      <KirimTabStack.Screen name="KirimMain" component={KirimScreen} />
    </KirimTabStack.Navigator>
  );
}

// ─── Ombor Tab Stack (WAREHOUSE role: replaces Katalog tab) ─
const OmborTabStack = createNativeStackNavigator();
function OmborTabNavigator(): React.JSX.Element {
  return (
    <OmborTabStack.Navigator screenOptions={{ headerShown: false }}>
      <OmborTabStack.Screen name="OmborMain" component={OmborScreen} />
    </OmborTabStack.Navigator>
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
      {/* Tab 1: Bosh sahifa — DashboardNavigator (Dashboard + Notifications) */}
      <Tab.Screen
        name="BoshSahifa"
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Bosh sahifa',
          tabBarIcon: ({ focused, color }) =>
            TabIcon(focused, 'home-outline', 'home', color),
        }}
      />

      {/* Tab 2: Savdo (WAREHOUSE: Kirim) — stack bilan */}
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

      {/* Tab 3: Katalog (WAREHOUSE: Ombor) — stack bilan */}
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

      {/* Tab 4: Moliya — stack bilan */}
      <Tab.Screen
        name="Moliya"
        component={FinanceNavigator}
        options={{
          tabBarLabel: 'Moliya',
          tabBarIcon: ({ focused, color }) =>
            TabIcon(focused, 'trending-up-outline', 'trending-up', color),
        }}
      />

      {/* Tab 5: Ko'proq — stack bilan (Kirim, Ombor, Settings nested) */}
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
