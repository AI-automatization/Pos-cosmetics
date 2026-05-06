import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// ─── Whitelist: все 47 таблиц из Prisma schema ─────────────────────────────
const TABLE_WHITELIST = new Set([
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
const REDACTED_FIELDS = new Set([
  'password_hash', 'passwordhash', 'pin_hash', 'pinhash',
  'refresh_token', 'refreshtoken', 'key_hash', 'keyhash',
]);

// Поля паролей — автоматически хешируются при записи
const PASSWORD_FIELDS = new Set([
  'password_hash', 'passwordhash', 'pin_hash', 'pinhash',
]);

const BCRYPT_ROUNDS = 12;

type TableInfo = {
  name: string;
  rowCount: number;
  sizeBytes: number;
  hasTenantId: boolean;
};

type ColumnInfo = {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  udtName?: string; // PostgreSQL enum type name (e.g. "UserRole", "AdminRole")
};

type DbStats = {
  dbSizeMb: number;
  activeConnections: number;
  maxConnections: number;
  uptime: string;
  version: string;
  tablesCount: number;
};

@Injectable()
export class AdminDatabaseService {
  private readonly logger = new Logger(AdminDatabaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── TABLES LIST ────────────────────────────────────────────────────────────

  async listTables(): Promise<TableInfo[]> {
    const rows = await this.prisma.$queryRaw<
      { table_name: string; row_estimate: bigint; size_bytes: bigint }[]
    >(Prisma.sql`
      SELECT
        t.table_name,
        COALESCE(s.n_live_tup, 0) AS row_estimate,
        COALESCE(pg_relation_size(quote_ident(t.table_name)), 0) AS size_bytes
      FROM information_schema.tables t
      LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name
    `);

    // Определяем какие таблицы имеют tenant_id
    const tenantCols = await this.prisma.$queryRaw<{ table_name: string }[]>(Prisma.sql`
      SELECT table_name FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name = 'tenant_id'
    `);
    const tenantTables = new Set(tenantCols.map((r) => r.table_name));

    return rows
      .filter((r) => TABLE_WHITELIST.has(r.table_name))
      .map((r) => ({
        name: r.table_name,
        rowCount: Number(r.row_estimate),
        sizeBytes: Number(r.size_bytes),
        hasTenantId: tenantTables.has(r.table_name),
      }));
  }

  // ─── TABLE SCHEMA ───────────────────────────────────────────────────────────

  async getTableSchema(tableName: string): Promise<{ columns: ColumnInfo[]; indexes: string[] }> {
    this.assertTableAllowed(tableName);

    const columns = await this.prisma.$queryRaw<
      { column_name: string; data_type: string; udt_name: string; is_nullable: string; column_default: string | null }[]
    >(Prisma.sql`
      SELECT column_name, data_type, udt_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${tableName}
      ORDER BY ordinal_position
    `);

    // Primary keys
    const pks = await this.prisma.$queryRaw<{ column_name: string }[]>(Prisma.sql`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = ${tableName}
        AND tc.constraint_type = 'PRIMARY KEY'
    `);
    const pkSet = new Set(pks.map((p) => p.column_name));

    // Indexes
    const idxRows = await this.prisma.$queryRaw<{ indexname: string }[]>(Prisma.sql`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = ${tableName}
    `);

    return {
      columns: columns.map((c) => ({
        name: c.column_name,
        type: c.data_type,
        nullable: c.is_nullable === 'YES',
        defaultValue: c.column_default,
        isPrimaryKey: pkSet.has(c.column_name),
        udtName: c.data_type === 'USER-DEFINED' ? c.udt_name : undefined,
      })),
      indexes: idxRows.map((i) => i.indexname),
    };
  }

  // ─── READ DATA ──────────────────────────────────────────────────────────────

  async getTableData(
    tableName: string,
    opts: {
      page?: number;
      limit?: number;
      tenantId?: string;
      sort?: string;
      sortDir?: 'asc' | 'desc';
      search?: string;
    },
  ) {
    this.assertTableAllowed(tableName);

    const page = opts.page ?? 1;
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = (page - 1) * limit;
    const sortDir = opts.sortDir === 'desc' ? 'DESC' : 'ASC';

    // Получаем колонки для валидации sort
    const schema = await this.getTableSchema(tableName);
    const colNames = new Set(schema.columns.map((c) => c.name));
    const sortCol = opts.sort && colNames.has(opts.sort) ? opts.sort : 'id';
    const hasTenantId = colNames.has('tenant_id');

    // Строим WHERE
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (opts.tenantId && hasTenantId) {
      conditions.push(`tenant_id = $${paramIdx}`);
      params.push(opts.tenantId);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countSql = `SELECT COUNT(*)::int AS total FROM "${tableName}" ${whereClause}`;
    const countResult = await this.prisma.$queryRawUnsafe<{ total: number }[]>(countSql, ...params);
    const total = countResult[0]?.total ?? 0;

    // Data
    const dataSql = `SELECT * FROM "${tableName}" ${whereClause} ORDER BY "${sortCol}" ${sortDir} LIMIT ${limit} OFFSET ${offset}`;
    const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(dataSql, ...params);

    // Маскировка и сериализация
    const masked = rows.map((row) => this.maskRow(row));

    return { rows: masked, total, page, limit };
  }

  // ─── CREATE ROW ─────────────────────────────────────────────────────────────

  async createRow(tableName: string, data: Record<string, unknown>) {
    this.assertTableAllowed(tableName);

    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Данные для создания не переданы');
    }

    const schema = await this.getTableSchema(tableName);
    const colMap = new Map(schema.columns.map((c) => [c.name, c]));

    // Авто-генерация ID если не передан
    if (!data.id) {
      const idCol = colMap.get('id');
      if (idCol && (idCol.type === 'text' || idCol.type === 'uuid' || idCol.type === 'character varying')) {
        const { randomUUID } = await import('node:crypto');
        data.id = randomUUID();
      }
    }

    // Авто-заполнение timestamp полей если не переданы
    const now = new Date();
    if (colMap.has('created_at') && !data.created_at) data.created_at = now;
    if (colMap.has('updated_at') && !data.updated_at) data.updated_at = now;

    const processed = await this.processWriteData(data, true);
    const keys = Object.keys(processed);
    const values = Object.values(processed);

    if (keys.length === 0) {
      throw new BadRequestException('Нет данных для создания');
    }

    // Строим INSERT — enum-колонки кастятся через ::type_name
    const colsSql = keys.map((k) => `"${k}"`).join(', ');
    const valuesSql = keys.map((k, i) => {
      const v = values[i];
      const col = colMap.get(k);
      if (v === null || v === undefined) return 'NULL';
      if (v instanceof Date) return `'${v.toISOString()}'`;
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      if (typeof v === 'number') return String(v);
      const escaped = `'${String(v).replace(/'/g, "''")}'`;
      // PostgreSQL enum cast
      if (col?.udtName) return `${escaped}::"${col.udtName}"`;
      return escaped;
    }).join(', ');
    const insertSql = `INSERT INTO "${tableName}" (${colsSql}) VALUES (${valuesSql})`;

    await this.prisma.$executeRawUnsafe(insertSql);

    // Читаем обратно
    const id = processed.id;
    const rows = id
      ? await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
          `SELECT * FROM "${tableName}" WHERE id = $1 LIMIT 1`, id,
        )
      : [];
    const row = rows[0] ?? processed;

    this.logger.log(`DB CREATE: ${tableName}`, { data: this.redactForLog(processed) });

    return { row: this.maskRow(row ?? {}) };
  }

  // ─── UPDATE ROW ─────────────────────────────────────────────────────────────

  async updateRow(tableName: string, id: string, data: Record<string, unknown>) {
    this.assertTableAllowed(tableName);

    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Данные для обновления не переданы');
    }

    // Получаем старые данные
    const oldRows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "${tableName}" WHERE id = $1 LIMIT 1`,
      id,
    );
    if (oldRows.length === 0) {
      throw new BadRequestException(`Запись не найдена: ${tableName}.id = ${id}`);
    }

    // Получаем schema для enum-cast
    const schema = await this.getTableSchema(tableName);
    const colMap = new Map(schema.columns.map((c) => [c.name, c]));

    const processed = await this.processWriteData(data);
    const keys = Object.keys(processed);
    const values = Object.values(processed);

    if (keys.length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }

    // SET clause — enum-колонки кастятся через ::type_name
    const setClause = keys.map((k, i) => {
      const col = colMap.get(k);
      if (col?.udtName) return `"${k}" = $${i + 1}::"${col.udtName}"`;
      return `"${k}" = $${i + 1}`;
    }).join(', ');
    const sql = `UPDATE "${tableName}" SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(sql, ...values, id);
    const row = rows[0];

    this.logger.log(`DB UPDATE: ${tableName}.${id}`, {
      oldData: this.redactForLog(oldRows[0] ?? {}),
      newData: this.redactForLog(processed),
    });

    return {
      row: this.maskRow(row ?? {}),
      oldValues: this.maskRow(oldRows[0] ?? {}),
    };
  }

  // ─── DELETE ROW ─────────────────────────────────────────────────────────────

  async deleteRow(tableName: string, id: string) {
    this.assertTableAllowed(tableName);

    // Получаем данные перед удалением
    const oldRows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "${tableName}" WHERE id = $1 LIMIT 1`,
      id,
    );
    if (oldRows.length === 0) {
      throw new BadRequestException(`Запись не найдена: ${tableName}.id = ${id}`);
    }

    await this.prisma.$queryRawUnsafe(`DELETE FROM "${tableName}" WHERE id = $1`, id);

    this.logger.log(`DB DELETE: ${tableName}.${id}`, {
      deletedData: this.redactForLog(oldRows[0] ?? {}),
    });

    return { deleted: true, id, deletedData: this.maskRow(oldRows[0] ?? {}) };
  }

  // ─── BULK DELETE ────────────────────────────────────────────────────────────

  async bulkDelete(tableName: string, ids: string[]) {
    this.assertTableAllowed(tableName);

    if (ids.length === 0) throw new BadRequestException('Нет ID для удаления');
    if (ids.length > 100) throw new BadRequestException('Максимум 100 записей за раз');

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `DELETE FROM "${tableName}" WHERE id IN (${placeholders})`;

    await this.prisma.$queryRawUnsafe(sql, ...ids);

    this.logger.log(`DB BULK DELETE: ${tableName}`, { ids, count: ids.length });

    return { deleted: ids.length, tableName };
  }

  // ─── BULK UPDATE ────────────────────────────────────────────────────────────

  async bulkUpdate(tableName: string, ids: string[], data: Record<string, unknown>) {
    this.assertTableAllowed(tableName);

    if (ids.length === 0) throw new BadRequestException('Нет ID для обновления');
    if (ids.length > 100) throw new BadRequestException('Максимум 100 записей за раз');

    const processed = await this.processWriteData(data);
    const keys = Object.keys(processed);
    const values = Object.values(processed);

    if (keys.length === 0) throw new BadRequestException('Нет данных для обновления');

    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const idPlaceholders = ids.map((_, i) => `$${keys.length + i + 1}`).join(', ');
    const sql = `UPDATE "${tableName}" SET ${setClause} WHERE id IN (${idPlaceholders})`;

    await this.prisma.$queryRawUnsafe(sql, ...values, ...ids);

    this.logger.log(`DB BULK UPDATE: ${tableName}`, { ids, data: this.redactForLog(processed) });

    return { updated: ids.length, tableName };
  }

  // ─── SQL CONSOLE ────────────────────────────────────────────────────────────

  async executeQuery(sql: string) {
    const trimmed = sql.trim();
    if (!trimmed) throw new BadRequestException('Пустой запрос');

    const upperSql = trimmed.toUpperCase();
    const isSelect = upperSql.startsWith('SELECT') || upperSql.startsWith('EXPLAIN') || upperSql.startsWith('WITH');
    const isDml = upperSql.startsWith('INSERT') || upperSql.startsWith('UPDATE') || upperSql.startsWith('DELETE');
    const isDdl = upperSql.startsWith('DROP') || upperSql.startsWith('ALTER') || upperSql.startsWith('TRUNCATE') || upperSql.startsWith('CREATE');

    // T-387: DDL taqiqlangan — DROP, ALTER, TRUNCATE, CREATE
    if (isDdl) {
      this.logger.error(`SQL CONSOLE BLOCKED [DDL]: ${trimmed.slice(0, 200)}`);
      throw new BadRequestException(
        'DDL операции (DROP, ALTER, TRUNCATE, CREATE) тақиқланган. Фақат SELECT ва DML (INSERT/UPDATE/DELETE) рухсат этилган.',
      );
    }

    const start = Date.now();
    const type: 'SELECT' | 'DML' = isDml ? 'DML' : 'SELECT';

    // T-387: Audit log — har SQL query logga yoziladi
    this.logger.warn(`SQL CONSOLE [${type}]: ${trimmed.slice(0, 500)}`, {
      sqlType: type,
      sqlLength: trimmed.length,
      timestamp: new Date().toISOString(),
    });

    try {
      if (isSelect) {
        const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(trimmed);
        const masked = rows.map((row) => this.maskRow(row));
        const columns = masked.length > 0 ? Object.keys(masked[0]) : [];
        return {
          rows: masked,
          columns,
          rowCount: masked.length,
          executionTimeMs: Date.now() - start,
          type,
        };
      }

      // DML only (DDL blocked above)
      const result = await this.prisma.$executeRawUnsafe(trimmed);

      this.logger.warn(`SQL CONSOLE DML EXECUTED: ${trimmed.slice(0, 500)}`, {
        affectedRows: result,
        executionTimeMs: Date.now() - start,
      });

      return {
        rows: [],
        columns: [],
        rowCount: typeof result === 'number' ? result : 0,
        executionTimeMs: Date.now() - start,
        type,
        message: `${type} выполнен. Затронуто строк: ${result}`,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown SQL error';
      this.logger.error(`SQL CONSOLE ERROR: ${msg}`, { sql: trimmed.slice(0, 300) });
      throw new BadRequestException(`SQL ошибка: ${msg}`);
    }
  }

  // ─── DB STATS ───────────────────────────────────────────────────────────────

  async getStats(): Promise<DbStats> {
    try {
      const [sizeRawRow] = await this.prisma.$queryRaw<{ size_bytes: bigint }[]>(
        Prisma.sql`SELECT pg_database_size(current_database()) AS size_bytes`,
      );

      const [connRow] = await this.prisma.$queryRaw<{ active: bigint; total: bigint }[]>(Prisma.sql`
        SELECT
          COUNT(*) FILTER (WHERE state = 'active') AS active,
          COUNT(*) AS total
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);

      const [maxConnRow] = await this.prisma.$queryRaw<{ max_conn: string }[]>(
        Prisma.sql`SELECT current_setting('max_connections') AS max_conn`,
      );

      const [versionRow] = await this.prisma.$queryRaw<{ version: string }[]>(
        Prisma.sql`SELECT version()`,
      );

      const [uptimeRow] = await this.prisma.$queryRaw<{ uptime: string }[]>(
        Prisma.sql`SELECT date_trunc('second', current_timestamp - pg_postmaster_start_time())::text AS uptime`,
      );

      const tableCount = (await this.listTables()).length;

      return {
        dbSizeMb: Math.round(Number(sizeRawRow?.size_bytes ?? 0) / 1024 / 1024),
        activeConnections: Number(connRow?.active ?? 0),
        maxConnections: parseInt(maxConnRow?.max_conn ?? '100', 10),
        uptime: uptimeRow?.uptime ?? 'unknown',
        version: versionRow?.version?.split(',')[0] ?? 'unknown',
        tablesCount: tableCount,
      };
    } catch (error: unknown) {
      this.logger.error('DB Stats error', { error: error instanceof Error ? error.message : 'unknown' });
      return {
        dbSizeMb: 0,
        activeConnections: 0,
        maxConnections: 0,
        uptime: 'unknown',
        version: 'unknown',
        tablesCount: 0,
      };
    }
  }

  // ─── MIGRATIONS ─────────────────────────────────────────────────────────────

  async getMigrations() {
    try {
      const rows = await this.prisma.$queryRaw<
        { id: string; migration_name: string; started_at: Date; finished_at: Date | null; applied_steps_count: number }[]
      >(Prisma.sql`
        SELECT id, migration_name, started_at, finished_at, applied_steps_count
        FROM "_prisma_migrations"
        ORDER BY started_at DESC
      `);
      return rows.map((r) => ({
        id: r.id,
        name: r.migration_name,
        startedAt: r.started_at,
        finishedAt: r.finished_at,
        stepsCount: r.applied_steps_count,
      }));
    } catch {
      return [];
    }
  }

  // ─── EXPORT CSV ─────────────────────────────────────────────────────────────

  async exportTable(tableName: string, tenantId?: string): Promise<string> {
    this.assertTableAllowed(tableName);

    const schema = await this.getTableSchema(tableName);
    const hasTenantId = schema.columns.some((c) => c.name === 'tenant_id');

    let sql = `SELECT * FROM "${tableName}"`;
    const params: unknown[] = [];

    if (tenantId && hasTenantId) {
      sql += ` WHERE tenant_id = $1`;
      params.push(tenantId);
    }
    sql += ` LIMIT 50000`;

    const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(sql, ...params);
    if (rows.length === 0) return '';

    const masked = rows.map((row) => this.maskRow(row));
    const headers = Object.keys(masked[0]);
    const csvLines = [
      headers.join(','),
      ...masked.map((row) =>
        headers.map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(','),
      ),
    ];

    return csvLines.join('\n');
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────

  private assertTableAllowed(tableName: string) {
    if (!TABLE_WHITELIST.has(tableName)) {
      throw new BadRequestException(`Таблица "${tableName}" не доступна`);
    }
  }

  private maskRow(row: Record<string, unknown>): Record<string, unknown> {
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

  private async processWriteData(data: Record<string, unknown>, allowId = false): Promise<Record<string, unknown>> {
    const processed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' && !allowId) continue;
      if (PASSWORD_FIELDS.has(key.toLowerCase()) && typeof value === 'string') {
        processed[key] = await bcrypt.hash(value, BCRYPT_ROUNDS);
      } else {
        processed[key] = value;
      }
    }
    return processed;
  }

  private redactForLog(data: Record<string, unknown>): Record<string, unknown> {
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
}
