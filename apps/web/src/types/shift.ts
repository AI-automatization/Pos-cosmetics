export interface ShiftsQuery {
  page?: number;
  limit?: number;
  status?: ShiftStatus;
}

// Shift domain types
// TODO: Move to packages/types/ after Polat implements T-013 (Sales Prisma schema)

export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface Shift {
  id: string;
  // Backend response: cashierName not returned (linked via userId)
  // shiftsApi.list() enriches this field from user data → optional here
  cashierName?: string | null;
  openingCash: number | string;  // backend returns as string
  closingCash: number | string | null;
  notes: string | null;
  status: ShiftStatus;
  openedAt: string;
  closedAt: string | null;
  salesCount?: number;
  revenue?: number;
  cashRevenue?: number;
  cardRevenue?: number;
}

export interface ShiftTotals {
  revenue: number;
  cashRevenue: number;
  cardRevenue: number;
  cashReturned: number;
}

// API DTOs
export interface OpenShiftDto {
  // Backend only accepts openingCash — cashierName is rejected (HTTP 400)
  openingCash: number;
}

export interface CloseShiftDto {
  closingCash: number;
  notes?: string;
}
