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
};
