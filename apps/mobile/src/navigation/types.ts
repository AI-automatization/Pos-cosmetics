import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Biometric: undefined;
};

// Tab Navigator (5 tabs)
export type TabParamList = {
  Dashboard: undefined;
  Sales: undefined;
  Nasiya: undefined;
  Inventory: undefined;
  RealEstate: undefined;
};

// Dashboard Stack
export type DashboardStackParamList = {
  Dashboard: undefined;
  BranchDetail: { branchId: string; branchName: string };
};

// Sales Stack (SaleDetail RootStack ga ko'chirildi)
export type SalesStackParamList = {
  SalesList: undefined;
};

// Nasiya Stack
export type NasiyaStackParamList = {
  DebtorsList: undefined;
  DebtDetail: { debtorId: string; customerName: string };
};

// Inventory Stack
export type InventoryStackParamList = {
  StockLevels: undefined;
  LowStock: undefined;
  BarcodeScanner: undefined;
  Scanner: undefined;
};

// Settings Stack (ichki navigatsiya saqlanadi)
export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  NotificationPrefs: undefined;
  BranchSelector: undefined;
};

// Real Estate Stack
export type RealEstateStackParamList = {
  Properties: undefined;
  PropertyDetail: { propertyId: string; propertyName: string };
  RentalPayments: { propertyId: string; propertyName: string };
};

// Root Navigator
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  MainTabs: NavigatorScreenParams<TabParamList>;
  Settings: undefined;
  AIInsights: undefined;
  SaleDetail: { saleId: string };
  AlertDetail: { alertId: string };
};

// Navigation props helpers
export type AuthNavProp = NativeStackNavigationProp<AuthStackParamList>;
export type TabNavProp = BottomTabNavigationProp<TabParamList>;
