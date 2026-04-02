// ─── REPORTS TYPES ────────────────────────────────────────────

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQty: number;
  totalRevenue: number;
}

export interface PaymentBreakdown {
  method: string;
  amount: number;
}

export interface SalesSummary {
  period: { from: Date; to: Date };
  orders: {
    count: number;
    grossRevenue: number;
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
  };
  returns: {
    count: number;
    total: number;
  };
  netRevenue: number;
  paymentBreakdown: PaymentBreakdown[];
}

export interface ProfitEstimate {
  period: { from: Date; to: Date };
  revenue: number;
  cogs: number;
  returns: number;
  grossProfit: number;
  grossMarginPct: string;
}

export interface ShiftReportItem {
  productName: string;
  qty: number;
  revenue: number;
}

export interface ShiftReport {
  shift: {
    id: string;
    status: string;
    cashier: string;
    branch: string | null;
    openedAt: Date;
    closedAt: Date | null;
    openingCash: number;
    closingCash: number | null;
    expectedCash: number | null;
  };
  orders: {
    count: number;
    totalRevenue: number;
    totalDiscount: number;
  };
  paymentBreakdown: PaymentBreakdown[];
  topProducts: ShiftReportItem[];
}
