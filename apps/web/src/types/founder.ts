export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  salesToday: number;
  revenueToday: number;
  errorsLast24h: number;
  lastActivityAt: string;
  createdAt: string;
}

export interface FounderStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalSalesToday: number;
  totalRevenueToday: number;
  totalOrdersToday: number;
  totalRevenueMonth: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface LiveSaleTick {
  id: string;
  tenantName: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'NASIYA';
  at: string;
}

export interface FounderError {
  id: string;
  tenantId: string;
  tenantName: string;
  type: 'API' | 'CLIENT' | 'SYNC';
  severity: 'ERROR' | 'WARN' | 'CRITICAL';
  message: string;
  stack?: string;
  url?: string;
  userId?: string;
  occurredAt: string;
}

export interface TopTenantBar {
  name: string;
  revenue: number;
}
