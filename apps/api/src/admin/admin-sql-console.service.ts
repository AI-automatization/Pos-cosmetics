import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Поля, которые маскируются при чтении
const REDACTED_FIELDS = new Set([
  'password_hash', 'passwordhash', 'pin_hash', 'pinhash',
  'refresh_token', 'refreshtoken', 'key_hash', 'keyhash',
]);

@Injectable()
export class AdminSqlConsoleService {
  private readonly logger = new Logger(AdminSqlConsoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async executeQuery(sql: string, adminId?: string, confirmDestructive = false) {
    const trimmed = sql.trim();
    if (!trimmed) throw new BadRequestException('Пустой запрос');

    if (this.containsMultipleStatements(trimmed)) {
      this.logger.error(`SQL CONSOLE BLOCKED [MULTI-STMT]: ${trimmed.slice(0, 200)}`, { adminId });
      throw new BadRequestException(
        'Bir nechta SQL buyruq (`;` bilan ajratilgan) taqiqlangan. Faqat bitta buyruq yuboring.',
      );
    }

    const upperSql = trimmed.toUpperCase();
    const isExplain = upperSql.startsWith('EXPLAIN');
    const explainContainsDml = isExplain && /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE)\b/.test(upperSql);
    const isSelect = (upperSql.startsWith('SELECT') || upperSql.startsWith('WITH') || (isExplain && !explainContainsDml));
    const isDml = upperSql.startsWith('INSERT') || upperSql.startsWith('UPDATE') || upperSql.startsWith('DELETE') || explainContainsDml;
    const isDdl = upperSql.startsWith('DROP') || upperSql.startsWith('ALTER') || upperSql.startsWith('TRUNCATE') || upperSql.startsWith('CREATE');

    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && (!isSelect || isDml || isDdl)) {
      this.logger.error(`SQL CONSOLE BLOCKED [PROD]: ${trimmed.slice(0, 200)}`, { adminId });
      throw new BadRequestException('Production muhitda faqat SELECT so\'rovlari ruxsat etiladi.');
    }

    if (upperSql.startsWith('WITH') && /\b(INSERT|UPDATE|DELETE)\b/.test(upperSql)) {
      this.logger.error(`SQL CONSOLE BLOCKED [CTE-DML]: ${trimmed.slice(0, 200)}`, { adminId });
      throw new BadRequestException('CTE (WITH) ichida DML (INSERT/UPDATE/DELETE) taqiqlangan.');
    }

    if (isDdl) {
      this.logger.error(`SQL CONSOLE BLOCKED [DDL]: ${trimmed.slice(0, 200)}`, { adminId });
      throw new BadRequestException('DDL операции (DROP, ALTER, TRUNCATE, CREATE) тақиқланган.');
    }

    if (isDml && this.isDestructiveDml(upperSql) && !confirmDestructive) {
      this.logger.warn(`SQL CONSOLE DESTRUCTIVE BLOCKED: ${trimmed.slice(0, 200)}`, { adminId });
      throw new BadRequestException(
        'Destructive DML (DELETE/UPDATE without WHERE) aniqlandi. x-confirm-destructive: yes header yuborib tasdiqlang.',
      );
    }

    const start = Date.now();
    const type: 'SELECT' | 'DML' = isDml ? 'DML' : 'SELECT';

    await this.recordAuditLog(adminId ?? 'unknown', type, trimmed);

    try {
      if (isSelect) {
        const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(trimmed);
        const masked = rows.map((row) => this.maskRow(row));
        const columns = masked.length > 0 ? Object.keys(masked[0]) : [];
        return { rows: masked, columns, rowCount: masked.length, executionTimeMs: Date.now() - start, type };
      }

      const result = await this.prisma.$executeRawUnsafe(trimmed);
      this.logger.warn(`SQL CONSOLE DML EXECUTED: ${trimmed.slice(0, 500)}`, {
        affectedRows: result, executionTimeMs: Date.now() - start, adminId,
      });

      return {
        rows: [], columns: [],
        rowCount: typeof result === 'number' ? result : 0,
        executionTimeMs: Date.now() - start, type,
        message: `${type} выполнен. Затронуто строк: ${result}`,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown SQL error';
      this.logger.error(`SQL CONSOLE ERROR: ${msg}`, { sql: trimmed.slice(0, 300), adminId });
      throw new BadRequestException('SQL query failed. Check server logs for details.');
    }
  }

  private containsMultipleStatements(sql: string): boolean {
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < sql.length; i++) {
      const ch = sql[i];
      if (ch === "'" && !inDouble) inSingle = !inSingle;
      else if (ch === '"' && !inSingle) inDouble = !inDouble;
      else if (ch === ';' && !inSingle && !inDouble) {
        const rest = sql.slice(i + 1).trim();
        if (rest.length > 0) return true;
      }
    }
    return false;
  }

  private isDestructiveDml(upperSql: string): boolean {
    if (/\bDELETE\b/.test(upperSql) && !upperSql.includes('WHERE')) return true;
    if (/\bUPDATE\b/.test(upperSql) && !upperSql.includes('WHERE')) return true;
    return false;
  }

  private async recordAuditLog(adminId: string, sqlType: string, query: string): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO admin_sql_audit_log (id, admin_id, sql_type, query, executed_at)
        VALUES (gen_random_uuid(), ${adminId}, ${sqlType}, ${query.slice(0, 2000)}, NOW())
      `;
    } catch {
      this.logger.warn(`SQL CONSOLE AUDIT [${sqlType}]: ${query.slice(0, 500)}`, {
        adminId, timestamp: new Date().toISOString(),
      });
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
}
