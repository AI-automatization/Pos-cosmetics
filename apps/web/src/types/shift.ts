// Shift domain types
// TODO: Move to packages/types/ after Polat implements T-013 (Sales Prisma schema)

export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface Shift {
  id: string;
  cashierName: string;
  openingCash: number;
  closingCash: number | null;
  notes: string | null;
  status: ShiftStatus;
  openedAt: string;
  closedAt: string | null;
  salesCount: number;
  revenue: number;
  cashRevenue: number;
  cardRevenue: number;
}

export interface ShiftTotals {
  revenue: number;
  cashRevenue: number;
  cardRevenue: number;
}

// API DTOs
export interface OpenShiftDto {
  cashierName: string;
  openingCash: number;
}

export interface CloseShiftDto {
  closingCash: number;
  notes?: string;
}
