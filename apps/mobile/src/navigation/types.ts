import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Biometric: undefined;
};

// Tab Navigator
export type TabParamList = {
  DashboardTab: undefined;
  SalesTab: undefined;
  NasiyaTab: undefined;
  InventoryTab: undefined;
  AlertsTab: undefined;
  SettingsTab: undefined;
};

// Dashboard Stack
export type DashboardStackParamList = {
  Dashboard: undefined;
  BranchDetail: { branchId: string; branchName: string };
};

// Sales Stack
export type SalesStackParamList = {
  SalesList: undefined;
  SaleDetail: { saleId: string };
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
};

// Alerts Stack
export type AlertsStackParamList = {
  AlertsList: undefined;
  AlertDetail: { alertId: string };
};

// Settings Stack
export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  NotificationPrefs: undefined;
  BranchSelector: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  App: undefined;
};

// Navigation props helpers
export type AuthNavProp = NativeStackNavigationProp<AuthStackParamList>;
export type TabNavProp = BottomTabNavigationProp<TabParamList>;
