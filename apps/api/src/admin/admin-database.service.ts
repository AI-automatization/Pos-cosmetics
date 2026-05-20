import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  TABLE_WHITELIST,
  TableInfo,
  ColumnInfo,
  DbStats,
  assertTableAllowed,
  assertColumnsAllowed,
  VALID_COL_RE,
  maskRow,
  processWriteData,
  redactForLog,
} from './admin-db-constants';

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
    assertTableAllowed(tableName);

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
    assertTableAllowed(tableName);

    const page = opts.page ?? 1;
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = (page - 1) * limit;
    const sortDir = opts.sortDir === 'desc' ? 'DESC' : 'ASC';

    // Получаем колонки для валидации sort
    const schema = await this.getTableSchema(tableName);
    const colNames = new Set(schema.columns.map((c) => c.name));
    const sortCol = opts.sort && colNames.has(opts.sort) && VALID_COL_RE.test(opts.sort) ? opts.sort : 'id';
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
    const masked = rows.map((row) => maskRow(row));

    return { rows: masked, total, page, limit };
  }

  // ─── CREATE ROW ─────────────────────────────────────────────────────────────

  async createRow(tableName: string, data: Record<string, unknown>) {
    assertTableAllowed(tableName);

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

    const processed = await processWriteData(data, true);
    const keys = Object.keys(processed);
    const values = Object.values(processed);

    if (keys.length === 0) {
      throw new BadRequestException('Нет данных для создания');
    }

    // SECURITY: Column names MUST exist in schema (prevents SQL injection via crafted keys)
    assertColumnsAllowed(keys, colMap, tableName);

    // Строим parameterized INSERT — $1, $2, ... вместо string interpolation
    const colsSql = keys.map((k) => `"${k}"`).join(', ');
    const paramValues: unknown[] = [];
    const placeholders = keys.map((k, i) => {
      const v = values[i];
      const col = colMap.get(k);
      paramValues.push(v);
      const placeholder = `$${i + 1}`;
      // PostgreSQL enum cast
      if (col?.udtName && typeof v === 'string') return `${placeholder}::"${col.udtName}"`;
      return placeholder;
    }).join(', ');
    const insertSql = `INSERT INTO "${tableName}" (${colsSql}) VALUES (${placeholders})`;

    await this.prisma.$executeRawUnsafe(insertSql, ...paramValues);

    // Читаем обратно
    const id = processed.id;
    const rows = id
      ? await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(
          `SELECT * FROM "${tableName}" WHERE id = $1 LIMIT 1`, id,
        )
      : [];
    const row = rows[0] ?? processed;

    this.logger.log(`DB CREATE: ${tableName}`, { data: redactForLog(processed) });

    return { row: maskRow(row ?? {}) };
  }

  // ─── UPDATE ROW ─────────────────────────────────────────────────────────────

  async updateRow(tableName: string, id: string, data: Record<string, unknown>) {
    assertTableAllowed(tableName);

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

    const processed = await processWriteData(data);
    const keys = Object.keys(processed);
    const values = Object.values(processed);

    if (keys.length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }

    // SECURITY: Column names MUST exist in schema (prevents SQL injection via crafted keys)
    assertColumnsAllowed(keys, colMap, tableName);

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
      oldData: redactForLog(oldRows[0] ?? {}),
      newData: redactForLog(processed),
    });

    return {
      row: maskRow(row ?? {}),
      oldValues: maskRow(oldRows[0] ?? {}),
    };
  }

  // ─── DELETE ROW ─────────────────────────────────────────────────────────────

  async deleteRow(tableName: string, id: string) {
    assertTableAllowed(tableName);

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
      deletedData: redactForLog(oldRows[0] ?? {}),
    });

    return { deleted: true, id, deletedData: maskRow(oldRows[0] ?? {}) };
  }

  // ─── BULK DELETE ────────────────────────────────────────────────────────────

  async bulkDelete(tableName: string, ids: string[]) {
    assertTableAllowed(tableName);

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
    assertTableAllowed(tableName);

    if (ids.length === 0) throw new BadRequestException('Нет ID для обновления');
    if (ids.length > 100) throw new BadRequestException('Максимум 100 записей за раз');

    const processed = await processWriteData(data);
    const keys = Object.keys(processed);
    const values = Object.values(processed);

    if (keys.length === 0) throw new BadRequestException('Нет данных для обновления');

    // SECURITY: Column names MUST exist in schema (prevents SQL injection via crafted keys)
    const schema = await this.getTableSchema(tableName);
    const colMap = new Map(schema.columns.map((c) => [c.name, c]));
    assertColumnsAllowed(keys, colMap, tableName);

    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const idPlaceholders = ids.map((_, i) => `$${keys.length + i + 1}`).join(', ');
    const sql = `UPDATE "${tableName}" SET ${setClause} WHERE id IN (${idPlaceholders})`;

    await this.prisma.$queryRawUnsafe(sql, ...values, ...ids);

    this.logger.log(`DB BULK UPDATE: ${tableName}`, { ids, data: redactForLog(processed) });

    return { updated: ids.length, tableName };
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
    assertTableAllowed(tableName);

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

    const masked = rows.map((row) => maskRow(row));
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
}
