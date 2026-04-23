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
  method: 'CASH' | 'CARD' | 'TERMINAL' | 'NASIYA' | 'DEBT' | 'CLICK' | 'PAYME' | 'TRANSFER';
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

// ─── Database Manager ────────────────────────────────────────────────────────

export interface DbTableInfo {
  name: string;
  rowCount: number;
  sizeBytes: number;
  hasTenantId: boolean;
}

export interface DbColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
}

export interface DbTableSchema {
  columns: DbColumnInfo[];
  indexes: string[];
}

export interface DbTableData {
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
}

export interface DbStats {
  dbSizeMb: number;
  activeConnections: number;
  maxConnections: number;
  uptime: string;
  version: string;
  tablesCount: number;
}

export interface DbMigration {
  id: string;
  name: string;
  startedAt: string;
  finishedAt: string | null;
  stepsCount: number;
}

export interface DbQueryResult {
  rows: Record<string, unknown>[];
  columns: string[];
  rowCount: number;
  executionTimeMs: number;
  type: 'SELECT' | 'DML' | 'DDL';
  message?: string;
}
