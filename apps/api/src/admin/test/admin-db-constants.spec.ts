/**
 * T-459: Security tests — Column validation & data masking
 * Tests SQL injection prevention via column name validation
 */
import { BadRequestException } from '@nestjs/common';
import {
  assertColumnsAllowed,
  VALID_COL_RE,
  maskRow,
  processWriteData,
  assertTableAllowed,
  REDACTED_FIELDS,
} from '../admin-db-constants';
import type { ColumnInfo } from '../admin-db-constants';

const mockColMap = new Map<string, ColumnInfo>([
  ['id', { name: 'id', type: 'text', nullable: false, defaultValue: null, isPrimaryKey: true }],
  ['name', { name: 'name', type: 'text', nullable: false, defaultValue: null, isPrimaryKey: false }],
  ['email', { name: 'email', type: 'text', nullable: true, defaultValue: null, isPrimaryKey: false }],
  ['tenant_id', { name: 'tenant_id', type: 'text', nullable: false, defaultValue: null, isPrimaryKey: false }],
]);

describe('Column Validation — SQL Injection Prevention', () => {

  describe('VALID_COL_RE regex', () => {
    it('allows normal column names', () => {
      expect(VALID_COL_RE.test('name')).toBe(true);
      expect(VALID_COL_RE.test('tenant_id')).toBe(true);
      expect(VALID_COL_RE.test('created_at')).toBe(true);
      expect(VALID_COL_RE.test('_private')).toBe(true);
    });

    it('rejects SQL injection payloads', () => {
      expect(VALID_COL_RE.test('name"; DROP TABLE users--')).toBe(false);
      expect(VALID_COL_RE.test("name' OR '1'='1")).toBe(false);
      expect(VALID_COL_RE.test('1=1; --')).toBe(false);
      expect(VALID_COL_RE.test('col UNION SELECT')).toBe(false);
    });

    it('rejects special characters', () => {
      expect(VALID_COL_RE.test('name-with-dash')).toBe(false);
      expect(VALID_COL_RE.test('name.with.dot')).toBe(false);
      expect(VALID_COL_RE.test('name with space')).toBe(false);
      expect(VALID_COL_RE.test('')).toBe(false);
    });

    it('rejects names starting with numbers', () => {
      expect(VALID_COL_RE.test('1column')).toBe(false);
      expect(VALID_COL_RE.test('123')).toBe(false);
    });
  });

  describe('assertColumnsAllowed', () => {
    it('passes for valid existing columns', () => {
      expect(() => assertColumnsAllowed(['name', 'email'], mockColMap, 'users')).not.toThrow();
    });

    it('throws for non-existent column', () => {
      expect(() => assertColumnsAllowed(['name', 'nonexistent'], mockColMap, 'users'))
        .toThrow(BadRequestException);
    });

    it('throws for SQL injection in column name', () => {
      expect(() => assertColumnsAllowed(['name"; DROP TABLE users--'], mockColMap, 'users'))
        .toThrow(BadRequestException);
    });

    it('throws for empty column name', () => {
      expect(() => assertColumnsAllowed([''], mockColMap, 'users'))
        .toThrow(BadRequestException);
    });
  });

  describe('assertTableAllowed', () => {
    it('allows whitelisted tables', () => {
      expect(() => assertTableAllowed('users')).not.toThrow();
      expect(() => assertTableAllowed('orders')).not.toThrow();
      expect(() => assertTableAllowed('products')).not.toThrow();
    });

    it('blocks non-whitelisted tables', () => {
      expect(() => assertTableAllowed('pg_shadow')).toThrow(BadRequestException);
      expect(() => assertTableAllowed('information_schema')).toThrow(BadRequestException);
      expect(() => assertTableAllowed('evil_table')).toThrow(BadRequestException);
    });
  });
});

describe('Data Masking', () => {
  it('redacts password_hash', () => {
    const row = maskRow({ id: '1', password_hash: '$2b$12$secret', name: 'Test' });
    expect(row['password_hash']).toBe('[REDACTED]');
    expect(row['name']).toBe('Test');
  });

  it('redacts pin_hash', () => {
    const row = maskRow({ id: '1', pin_hash: 'hashed_pin' });
    expect(row['pin_hash']).toBe('[REDACTED]');
  });

  it('redacts refresh_token', () => {
    const row = maskRow({ refresh_token: 'secret_token' });
    expect(row['refresh_token']).toBe('[REDACTED]');
  });

  it('serializes BigInt to string', () => {
    const row = maskRow({ id: BigInt(12345678901234) });
    expect(row['id']).toBe('12345678901234');
  });

  it('serializes Date to ISO string', () => {
    const d = new Date('2026-01-15T12:00:00Z');
    const row = maskRow({ created_at: d });
    expect(row['created_at']).toBe('2026-01-15T12:00:00.000Z');
  });

  it('passes through normal values unchanged', () => {
    const row = maskRow({ name: 'Test', count: 42, active: true });
    expect(row).toEqual({ name: 'Test', count: 42, active: true });
  });
});

describe('processWriteData', () => {
  it('hashes password fields', async () => {
    const result = await processWriteData({ password_hash: 'plaintext123', name: 'Test' });
    expect(result['password_hash']).not.toBe('plaintext123');
    expect((result['password_hash'] as string).startsWith('$2')).toBe(true);
    expect(result['name']).toBe('Test');
  });

  it('hashes pin_hash fields', async () => {
    const result = await processWriteData({ pin_hash: '1234' });
    expect(result['pin_hash']).not.toBe('1234');
    expect((result['pin_hash'] as string).startsWith('$2')).toBe(true);
  });

  it('skips id field when allowId=false', async () => {
    const result = await processWriteData({ id: 'should-skip', name: 'Test' }, false);
    expect(result['id']).toBeUndefined();
    expect(result['name']).toBe('Test');
  });

  it('keeps id when allowId=true', async () => {
    const result = await processWriteData({ id: 'keep-me', name: 'Test' }, true);
    expect(result['id']).toBe('keep-me');
  });
});
