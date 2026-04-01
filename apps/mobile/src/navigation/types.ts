export type AuthStackParamList = {
  Login: undefined;
  Biometric: undefined;
};

export type SalesStackParamList = {
  SalesList: undefined;
  SaleDetail: { orderId: string; orderNumber: number };
};

export type TabParamList = {
  Dashboard: undefined;
  Savdo: undefined;
  SavdoTarixi: undefined;
  Nasiya: undefined;
  Kirim: undefined;
  Settings: undefined;
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
