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
  Nasiya:
    | {
        openNewDebt?: boolean;
        amount?: number;
        products?: Array<{
          product: { id: string; name: string; sellPrice: number };
          qty: number;
        }>;
      }
    | undefined;
  Kirim: undefined;
  Ombor: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
