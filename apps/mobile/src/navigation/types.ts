import type { CartItem, PaymentMethod } from '../screens/Savdo/PaymentSheetTypes';

export type AuthStackParamList = {
  Login: undefined;
  Biometric: undefined;
};

export type SalesStackParamList = {
  SalesList: undefined;
  SaleDetail: { orderId: string; orderNumber: number };
};

export type TabParamList = {
  BoshSahifa: undefined;
  Savdo: undefined;
  Katalog: undefined;
  Moliya: undefined;
  Koproq: undefined;
};

// Stack param lists for nested navigators inside tabs
export type SavdoStackParamList = {
  SavdoMain: undefined;
  SmenaScreen: undefined;
  SalesHistory: undefined;
  PaymentSuccess: {
    items: CartItem[];
    paymentMethod: PaymentMethod;
    orderNumber: string;
  };
  NasiyaScreen:
    | {
        openNewDebt?: boolean;
        amount?: number;
        products?: Array<{
          product: { id: string; name: string; sellPrice: number };
          qty: number;
        }>;
      }
    | undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  KirimScreen: undefined;
  OmborScreen: undefined;
  SettingsScreen: undefined;
  BranchesScreen: undefined;
  AuditLogScreen: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
  SaleDetail: { saleId: string };
  AlertDetail: { alertId: string };
  Settings: undefined;
  AIInsights: undefined;
};

export type DashboardStackParamList = {
  DashboardMain: undefined;
  BranchDetail: { branchId: string; branchName: string };
};

export type InventoryStackParamList = {
  InventoryMain: undefined;
  BarcodeScanner: undefined;
  LowStockList: undefined;
};

export type RealEstateStackParamList = {
  Properties: undefined;
  PropertyDetail: { propertyId: string; propertyName: string };
  RentalPayments: { propertyId: string; propertyName?: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  BranchSelector: undefined;
  Profile: undefined;
  NotificationPrefs: undefined;
};

export type NasiyaStackParamList = {
  NasiyaList: undefined;
  DebtDetail: { debtorId: string; customerName: string };
};
