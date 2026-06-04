import { processImportRows, PROGRESS_INTERVAL } from '@raos/catalog-import';
import type { ProductImportRow, ImportProgress } from '@raos/catalog-import';
import type { PrismaClient } from '@prisma/client';

type MockPrisma = {
  unit: { findMany: jest.Mock };
  category: { findMany: jest.Mock };
  product: { findMany: jest.Mock; update: jest.Mock; create: jest.Mock };
};

function makePrisma(overrides: Partial<{ existing: unknown[]; units: unknown[]; categories: unknown[] }> = {}): MockPrisma {
  return {
    unit: { findMany: jest.fn().mockResolvedValue(overrides.units ?? []) },
    category: { findMany: jest.fn().mockResolvedValue(overrides.categories ?? []) },
    product: {
      findMany: jest.fn().mockResolvedValue(overrides.existing ?? []),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
    },
  };
}

const TENANT = 'tenant-1';

describe('processImportRows', () => {
  it('creates new products and resolves unit/category from preloaded maps', async () => {
    const prisma = makePrisma({
      units: [{ id: 'u1', name: 'dona' }],
      categories: [{ id: 'c1', name: 'Kosmetika' }],
    });
    const rows: ProductImportRow[] = [
      { name: 'Cream', sku: 'A-1', price: 100, unit: 'DONA', categoryName: 'kosmetika' },
    ];
    const summary = await processImportRows(prisma as unknown as PrismaClient, TENANT, rows);
    expect(summary).toEqual({ created: 1, updated: 0, skipped: 0, errors: [] });
    expect(prisma.product.create).toHaveBeenCalledTimes(1);
    const arg = prisma.product.create.mock.calls[0][0];
    expect(arg.data.unitId).toBe('u1');
    expect(arg.data.categoryId).toBe('c1');
  });

  it('is idempotent: a re-run of existing rows produces only updates', async () => {
    const prisma = makePrisma({
      existing: [{ id: 'p1', sku: 'A-1', barcode: null, costPrice: 5, minStockLevel: 0 }],
    });
    const rows: ProductImportRow[] = [{ name: 'Cream v2', sku: 'A-1', price: 120 }];
    const summary = await processImportRows(prisma as unknown as PrismaClient, TENANT, rows);
    expect(summary.created).toBe(0);
    expect(summary.updated).toBe(1);
    expect(prisma.product.update).toHaveBeenCalledTimes(1);
    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it('does NOT issue per-row lookup queries (batch preload)', async () => {
    const prisma = makePrisma();
    const rows: ProductImportRow[] = Array.from({ length: 10 }, (_, i) => ({
      name: `P${i}`, sku: `S-${i}`, price: 1,
    }));
    await processImportRows(prisma as unknown as PrismaClient, TENANT, rows);
    expect(prisma.unit.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.category.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
  });

  it('skips invalid rows with a per-row error and still imports valid ones', async () => {
    const prisma = makePrisma();
    const rows: ProductImportRow[] = [
      { name: '', sku: 'A-1', price: 1 },
      { name: 'Ok', sku: 'A-2', price: 1 },
    ];
    const summary = await processImportRows(prisma as unknown as PrismaClient, TENANT, rows);
    expect(summary.created).toBe(1);
    expect(summary.skipped).toBe(1);
    expect(summary.errors[0]).toMatch(/^Qator 2:/);
  });

  it('skips the 2nd duplicate-barcode row (validation B)', async () => {
    const prisma = makePrisma();
    const rows: ProductImportRow[] = [
      { name: 'A', barcode: '12345678', price: 1 },
      { name: 'B', barcode: '12345678', price: 1 },
    ];
    const summary = await processImportRows(prisma as unknown as PrismaClient, TENANT, rows);
    expect(summary.created).toBe(1);
    expect(summary.skipped).toBe(1);
    expect(summary.errors[0]).toMatch(/takror/);
  });

  it('reports progress every PROGRESS_INTERVAL rows and once at the end', async () => {
    const prisma = makePrisma();
    const total = PROGRESS_INTERVAL + 5;
    const rows: ProductImportRow[] = Array.from({ length: total }, (_, i) => ({
      name: `P${i}`, sku: `S-${i}`, price: 1,
    }));
    const seen: ImportProgress[] = [];
    await processImportRows(prisma as unknown as PrismaClient, TENANT, rows, (p) => { seen.push(p); });
    expect(seen.map((p) => p.processed)).toEqual([PROGRESS_INTERVAL, total]);
    expect(seen[seen.length - 1].total).toBe(total);
  });

  it('does not double-emit the final progress when total is an exact multiple of PROGRESS_INTERVAL', async () => {
    const prisma = makePrisma();
    const total = PROGRESS_INTERVAL * 2;
    const rows: ProductImportRow[] = Array.from({ length: total }, (_, i) => ({
      name: `P${i}`, sku: `S-${i}`, price: 1,
    }));
    const seen: ImportProgress[] = [];
    await processImportRows(prisma as unknown as PrismaClient, TENANT, rows, (p) => { seen.push(p); });
    expect(seen.map((p) => p.processed)).toEqual([PROGRESS_INTERVAL, total]);
  });

  it('preserves existing costPrice and minStockLevel when the row omits them', async () => {
    const prisma = makePrisma({
      existing: [{ id: 'p1', sku: 'A-1', barcode: null, costPrice: 7, minStockLevel: 3 }],
    });
    const rows: ProductImportRow[] = [{ name: 'Cream', sku: 'A-1', price: 100 }];
    await processImportRows(prisma as unknown as PrismaClient, TENANT, rows);
    const arg = prisma.product.update.mock.calls[0][0];
    expect(arg.data.costPrice).toBe(7);
    expect(arg.data.minStockLevel).toBe(3);
  });
});
