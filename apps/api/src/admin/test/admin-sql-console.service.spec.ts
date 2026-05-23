/**
 * T-459: Security tests — AdminSqlConsoleService
 * Tests SQL injection prevention, DDL blocking, production restrictions
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AdminSqlConsoleService } from '../admin-sql-console.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $executeRaw: jest.fn(),
};

describe('AdminSqlConsoleService — Security', () => {
  let service: AdminSqlConsoleService;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminSqlConsoleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AdminSqlConsoleService>(AdminSqlConsoleService);
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  // ─── DDL blocking ────────────────────────────────────────────

  it('blocks DROP TABLE', async () => {
    await expect(service.executeQuery('DROP TABLE users', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('blocks ALTER TABLE', async () => {
    await expect(service.executeQuery('ALTER TABLE users ADD COLUMN hack TEXT', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('blocks TRUNCATE', async () => {
    await expect(service.executeQuery('TRUNCATE orders', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('blocks CREATE TABLE', async () => {
    await expect(service.executeQuery('CREATE TABLE evil (id text)', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  // ─── Multi-statement blocking ────────────────────────────────

  it('blocks multiple statements separated by semicolon', async () => {
    await expect(service.executeQuery('SELECT 1; DROP TABLE users', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('allows trailing semicolon (single statement)', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ result: 1 }]);
    const result = await service.executeQuery('SELECT 1;', 'admin-1');
    expect(result.type).toBe('SELECT');
  });

  it('ignores semicolons inside strings', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([]);
    const result = await service.executeQuery("SELECT * FROM users WHERE name = 'test;drop'", 'admin-1');
    expect(result.type).toBe('SELECT');
  });

  // ─── EXPLAIN ANALYZE DML bypass prevention ───────────────────

  it('blocks EXPLAIN ANALYZE with DELETE', async () => {
    await expect(service.executeQuery('EXPLAIN ANALYZE DELETE FROM orders', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('blocks EXPLAIN ANALYZE with UPDATE', async () => {
    await expect(service.executeQuery('EXPLAIN ANALYZE UPDATE users SET role = \'ADMIN\'', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('blocks EXPLAIN ANALYZE with INSERT', async () => {
    await expect(service.executeQuery('EXPLAIN ANALYZE INSERT INTO orders (id) VALUES (\'hack\')', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('allows plain EXPLAIN SELECT', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ plan: 'Seq Scan' }]);
    const result = await service.executeQuery('EXPLAIN SELECT * FROM users', 'admin-1');
    expect(result.type).toBe('SELECT');
  });

  // ─── CTE with DML blocking ──────────────────────────────────

  it('blocks WITH ... INSERT', async () => {
    await expect(service.executeQuery(
      'WITH cte AS (SELECT 1) INSERT INTO users SELECT * FROM cte', 'admin-1',
    )).rejects.toThrow(BadRequestException);
  });

  it('blocks WITH ... DELETE', async () => {
    await expect(service.executeQuery(
      'WITH old AS (SELECT id FROM users WHERE created_at < now()) DELETE FROM users WHERE id IN (SELECT id FROM old)', 'admin-1',
    )).rejects.toThrow(BadRequestException);
  });

  it('allows WITH ... SELECT (read-only CTE)', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ count: 5 }]);
    const result = await service.executeQuery(
      'WITH recent AS (SELECT * FROM orders WHERE created_at > now() - interval \'7 days\') SELECT count(*) FROM recent', 'admin-1',
    );
    expect(result.type).toBe('SELECT');
  });

  // ─── Production mode restrictions ────────────────────────────

  it('blocks INSERT in production', async () => {
    process.env.NODE_ENV = 'production';
    await expect(service.executeQuery('INSERT INTO users (email) VALUES (\'hack@evil.com\')', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('blocks UPDATE in production', async () => {
    process.env.NODE_ENV = 'production';
    await expect(service.executeQuery('UPDATE users SET role = \'ADMIN\' WHERE id = \'1\'', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('blocks DELETE in production', async () => {
    process.env.NODE_ENV = 'production';
    await expect(service.executeQuery('DELETE FROM users WHERE id = \'1\'', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('allows SELECT in production', async () => {
    process.env.NODE_ENV = 'production';
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ id: '1' }]);
    const result = await service.executeQuery('SELECT id FROM users LIMIT 1', 'admin-1');
    expect(result.type).toBe('SELECT');
  });

  // ─── Destructive DML without WHERE ───────────────────────────

  it('blocks DELETE without WHERE (needs confirmation)', async () => {
    await expect(service.executeQuery('DELETE FROM orders', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('blocks UPDATE without WHERE (needs confirmation)', async () => {
    await expect(service.executeQuery('UPDATE orders SET status = \'CANCELLED\'', 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('allows DELETE without WHERE when confirmDestructive=true', async () => {
    mockPrisma.$executeRawUnsafe.mockResolvedValue(5);
    const result = await service.executeQuery('DELETE FROM temp_table', 'admin-1', true);
    expect(result.type).toBe('DML');
  });

  // ─── Data masking ────────────────────────────────────────────

  it('masks password_hash in SELECT results', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([
      { id: '1', email: 'test@test.com', password_hash: '$2b$12$secret' },
    ]);
    const result = await service.executeQuery('SELECT * FROM users LIMIT 1', 'admin-1');
    expect(result.rows[0]!['password_hash']).toBe('[REDACTED]');
    expect(result.rows[0]!['email']).toBe('test@test.com');
  });

  it('masks refresh_token in results', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([
      { id: '1', refresh_token: 'abc123secret' },
    ]);
    const result = await service.executeQuery('SELECT * FROM sessions LIMIT 1', 'admin-1');
    expect(result.rows[0]!['refresh_token']).toBe('[REDACTED]');
  });

  // ─── Empty query ─────────────────────────────────────────────

  it('rejects empty query', async () => {
    await expect(service.executeQuery('', 'admin-1')).rejects.toThrow(BadRequestException);
  });

  it('rejects whitespace-only query', async () => {
    await expect(service.executeQuery('   ', 'admin-1')).rejects.toThrow(BadRequestException);
  });
});
