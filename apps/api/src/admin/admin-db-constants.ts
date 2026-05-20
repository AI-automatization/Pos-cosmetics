import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// ─── Whitelist: все 47 таблиц из Prisma schema ─────────────────────────────
export const TABLE_WHITELIST = new Set([
  'tenants', 'users', 'branches', 'event_log', 'categories', 'units',
  'products', 'product_barcodes', 'stock_snapshots', 'product_variants',
  'bundle_items', 'suppliers', 'product_suppliers', 'warehouses',
  'stock_movements', 'stock_transfers', 'stock_transfer_items',
  'shifts', 'orders', 'order_items', 'returns', 'return_items',
  'payment_intents', 'customers', 'debt_records', 'debt_payments',
  'admin_users', 'notifications', 'fcm_tokens', 'reminder_logs',
  'loyalty_configs', 'loyalty_accounts', 'loyalty_transactions',
  'journal_entries', 'journal_lines', 'audit_logs', 'expenses',
  'exchange_rates', 'z_reports', 'login_attempts', 'user_locks',
  'pin_attempts', 'client_error_logs', 'product_prices',
  'subscription_plans', 'tenant_subscriptions', 'sessions', 'sync_outbox',
  'api_keys', 'product_certificates', 'promotions', 'telegram_link_tokens',
  'bot_otp_tokens', 'tenant_settings', 'price_changes', 'feature_flags',
  'warehouse_invoices', 'warehouse_invoice_items', 'support_tickets',
  'ticket_messages', 'tasks', 'properties', 'rental_contracts',
  'rental_payments', '_prisma_migrations',
]);

// Поля, которые маскируются при чтении
export const REDACTED_FIELDS = new Set([
  'password_hash', 'passwordhash', 'pin_hash', 'pinhash',
  'refresh_token', 'refreshtoken', 'key_hash', 'keyhash',
]);

// Поля паролей — автоматически хешируются при записи
export const PASSWORD_FIELDS = new Set([
  'password_hash', 'passwordhash', 'pin_hash', 'pinhash',
]);

export const BCRYPT_ROUNDS = 12;

// ─── Types ───────────────────────────────────────────────────────────────────

export type TableInfo = {
  name: string;
  rowCount: number;
  sizeBytes: number;
  hasTenantId: boolean;
};

export type ColumnInfo = {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  udtName?: string; // PostgreSQL enum type name (e.g. "UserRole", "AdminRole")
};

export type DbStats = {
  dbSizeMb: number;
  activeConnections: number;
  maxConnections: number;
  uptime: string;
  version: string;
  tablesCount: number;
};

// ─── Shared helper functions ──────────────────────────────────────────────────

const TABLE_NAME_RE = /^[a-z_][a-z0-9_]*$/;

export function assertTableAllowed(tableName: string): void {
  if (!TABLE_NAME_RE.test(tableName)) {
    throw new BadRequestException(`Недопустимое имя таблицы: "${tableName}"`);
  }
  if (!TABLE_WHITELIST.has(tableName)) {
    throw new BadRequestException(`Таблица "${tableName}" не доступна`);
  }
}

export function maskRow(row: Record<string, unknown>): Record<string, unknown> {
  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (REDACTED_FIELDS.has(key.toLowerCase())) {
      masked[key] = '[REDACTED]';
    } else if (typeof value === 'bigint') {
      masked[key] = value.toString();
    } else if (value instanceof Date) {
      masked[key] = value.toISOString();
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

export async function processWriteData(
  data: Record<string, unknown>,
  allowId = false,
  bcryptRounds = BCRYPT_ROUNDS,
): Promise<Record<string, unknown>> {
  const processed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'id' && !allowId) continue;
    if (PASSWORD_FIELDS.has(key.toLowerCase()) && typeof value === 'string') {
      processed[key] = await bcrypt.hash(value, bcryptRounds);
    } else {
      processed[key] = value;
    }
  }
  return processed;
}

// Regex for safe column name validation (prevents SQL injection via crafted keys)
export const VALID_COL_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validates that all keys exist in the table's column map and match the safe
 * column-name regex. Throws BadRequestException on first violation.
 */
export function assertColumnsAllowed(
  keys: string[],
  colMap: Map<string, ColumnInfo>,
  tableName: string,
): void {
  for (const k of keys) {
    if (!colMap.has(k)) {
      throw new BadRequestException(`Столбец "${k}" не существует в таблице "${tableName}"`);
    }
    if (!VALID_COL_RE.test(k)) {
      throw new BadRequestException(`Недопустимое имя столбца: "${k}"`);
    }
  }
}

export function redactForLog(data: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (REDACTED_FIELDS.has(key.toLowerCase()) || PASSWORD_FIELDS.has(key.toLowerCase())) {
      safe[key] = '[REDACTED]';
    } else {
      safe[key] = value;
    }
  }
  return safe;
}
