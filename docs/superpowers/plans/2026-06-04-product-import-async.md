# Async Product Import + Progress Implementation Plan (#104 / I-8)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared import engine, async BullMQ processing for large files (≥200 rows) with progress polling, validation (barcode format + in-file duplicates + required identifier), and onboarding wiring — on top of the existing synchronous T-130 import.

**Architecture:** A new framework-agnostic package `@raos/catalog-import` holds the validation + batch-preload upsert engine. The API parses the file, counts rows, and either runs the engine inline (`<200` → sync 200) or enqueues a BullMQ `product-import` job (`≥200` → 202 + `jobId`). The worker runs the same engine and writes progress into the job. The web polls `GET /catalog/products/import/:jobId` for progress.

**Tech Stack:** TypeScript 5.7, NestJS 11, Prisma 6 (`@prisma/client`), BullMQ + Redis, jest + ts-jest, Next.js 15 (web), pnpm workspaces + turbo.

---

## File Structure

| File | Responsibility |
|---|---|
| `packages/catalog-import/package.json` | New workspace package `@raos/catalog-import` |
| `packages/catalog-import/tsconfig.json` | Extends repo base config |
| `packages/catalog-import/src/types.ts` | `ProductImportRow`, `ImportSummary`, `ImportProgress` |
| `packages/catalog-import/src/validation.ts` | `validateRow` (A+D+name+price), `findDuplicateBarcodeIndices` (B) |
| `packages/catalog-import/src/engine.ts` | `processImportRows` — batch preload + per-row upsert + progress |
| `packages/catalog-import/src/index.ts` | Public re-exports |
| `apps/api/src/catalog/import-export/validation.spec.ts` | Engine validation unit tests (CI-gated via api) |
| `apps/api/src/catalog/import-export/engine.spec.ts` | Engine unit tests with mock Prisma (CI-gated via api) |
| `apps/api/src/catalog/import-export/product-import.service.ts` | Modify — delegate to engine, add `parse()` + `processSync()` |
| `apps/api/src/catalog/import-export/product-import.controller.ts` | Modify — threshold branch + `GET import/:jobId` |
| `apps/api/src/catalog/import-export/product-import.controller.spec.ts` | Controller unit tests (CI-gated via api) |
| `apps/api/src/common/queue/queue.service.ts` | Modify — `PRODUCT_IMPORT`, `ProductImportJob`, `addProductImportJob`, `getProductImportJobStatus` |
| `apps/worker/src/config.ts` | Modify — add `PRODUCT_IMPORT` to `QUEUE_NAMES` |
| `apps/worker/src/workers/product-import.worker.ts` | New worker + testable `runProductImportJob` |
| `apps/worker/src/workers/__tests__/product-import.worker.spec.ts` | Worker handler unit test (CI-gated via worker) |
| `apps/worker/src/main.ts` | Modify — register the worker |
| `apps/web/src/api/import.api.ts` | Modify — discriminated union + `getImportStatus` |
| `apps/web/src/app/(admin)/catalog/import/page.tsx` | Modify — async progress polling + progress bar + `skipped` |
| `apps/web/src/app/(admin)/onboarding/page.tsx` | Modify — step 3 action → `/catalog/import` |
| `apps/web/src/i18n/locales/{uz,ru,en}.json` | Modify — step3 labels → "import" |

**Constants (no magic numbers):**
- `IMPORT_SYNC_THRESHOLD = 200` (controller)
- `PROGRESS_INTERVAL = 25` (engine)
- `BARCODE_PATTERN = /^\d{8}$|^\d{12,14}$/` (validation)
- `IMPORT_MAX_FILE_SIZE = 15 * 1024 * 1024` (controller, raised from 5 MB)

---

## Test-runner decision (read before starting)

- CI `Unit Tests` runs **only** `pnpm --filter api test` and `pnpm --filter worker test`. Packages are **not** test-gated.
- Therefore: the engine's tests live in **apps/api**'s jest suite (`testRegex: '.*\.spec\.ts'`, rootDir `src`), importing the package via `@raos/catalog-import`. They use the established mock-Prisma pattern (plain object of `jest.fn()`s cast `as unknown as PrismaClient`).
- Worker tests live in `apps/worker/src/workers/__tests__/*.spec.ts` (worker `testMatch`).
- Web has **no** test runner and **no** CI test step → web tasks are verified by `pnpm --filter web exec tsc --noEmit` + `pnpm --filter web build` + a manual browser smoke. Do **not** invent web jest tests.

---

## Task 1: Scaffold `@raos/catalog-import` package + wire as workspace dependency

**Files:**
- Create: `packages/catalog-import/package.json`
- Create: `packages/catalog-import/tsconfig.json`
- Create: `packages/catalog-import/src/types.ts`
- Create: `packages/catalog-import/src/index.ts`
- Modify: `apps/api/package.json` (add dependency)
- Modify: `apps/worker/package.json` (add dependency)

- [ ] **Step 1: Create the package manifest**

Create `packages/catalog-import/package.json` (mirrors `@raos/utils`; adds `@prisma/client` for the engine's types):

```json
{
  "name": "@raos/catalog-import",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

- [ ] **Step 2: Create the tsconfig**

Create `packages/catalog-import/tsconfig.json` (identical shape to `packages/utils/tsconfig.json`):

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create the public types**

Create `packages/catalog-import/src/types.ts`:

```ts
export interface ProductImportRow {
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  unit?: string;
  categoryName?: string;
  description?: string;
  minStock?: number;
}

export interface ImportSummary {
  created: number;
  updated: number;
  skipped: number; // rows that failed validation or threw
  errors: string[]; // `Qator N: <reason>` — human-readable, per row
}

export interface ImportProgress {
  processed: number;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}
```

- [ ] **Step 4: Create a temporary index barrel**

Create `packages/catalog-import/src/index.ts` (engine/validation exports added in later tasks):

```ts
export * from './types';
```

- [ ] **Step 5: Add the package as a workspace dependency to api and worker**

In `apps/api/package.json`, add to `"dependencies"` (keep alphabetical near `@prisma/client`):

```json
    "@raos/catalog-import": "workspace:*",
```

In `apps/worker/package.json`, add to `"dependencies"`:

```json
    "@raos/catalog-import": "workspace:*",
```

- [ ] **Step 6: Install and typecheck**

Run: `pnpm install`
Then: `pnpm --filter @raos/catalog-import typecheck`
Expected: install links the workspace package; typecheck exits 0.

- [ ] **Step 7: Commit**

```bash
git add packages/catalog-import apps/api/package.json apps/worker/package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
feat(catalog): scaffold @raos/catalog-import package (#104)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Row validation (A + D + name + price)

**Files:**
- Create: `packages/catalog-import/src/validation.ts`
- Test: `apps/api/src/catalog/import-export/validation.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/api/src/catalog/import-export/validation.spec.ts`:

```ts
import { validateRow, BARCODE_PATTERN } from '@raos/catalog-import';
import type { ProductImportRow } from '@raos/catalog-import';

const base: ProductImportRow = { name: 'Cream', sku: 'A-1', price: 100 };

describe('validateRow', () => {
  it('accepts a valid row with sku', () => {
    expect(validateRow(base)).toBeNull();
  });

  it('rejects an empty name', () => {
    expect(validateRow({ ...base, name: '  ' })).toMatch(/nomi/);
  });

  it('rejects a negative price', () => {
    expect(validateRow({ ...base, price: -1 })).toMatch(/narx/);
  });

  it('rejects a non-finite price', () => {
    expect(validateRow({ ...base, price: NaN })).toMatch(/narx/);
  });

  it('rejects a row with neither sku nor barcode (validation D)', () => {
    expect(validateRow({ name: 'X', price: 10 })).toMatch(/SKU yoki barkod/);
  });

  it('accepts a row with only a valid barcode', () => {
    expect(validateRow({ name: 'X', price: 10, barcode: '12345678' })).toBeNull();
  });

  it('rejects a malformed barcode (validation A)', () => {
    expect(validateRow({ name: 'X', price: 10, barcode: '1234567890' })).toMatch(/barkod formati/);
  });

  it('accepts EAN-8, EAN-13, ITF-14', () => {
    expect(BARCODE_PATTERN.test('12345678')).toBe(true);
    expect(BARCODE_PATTERN.test('1234567890123')).toBe(true);
    expect(BARCODE_PATTERN.test('12345678901234')).toBe(true);
    expect(BARCODE_PATTERN.test('123')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter api exec jest --config jest.config.js validation.spec`
Expected: FAIL — `Cannot find module '@raos/catalog-import'` export `validateRow` (not implemented yet).

- [ ] **Step 3: Implement the validation module**

Create `packages/catalog-import/src/validation.ts`:

```ts
import type { ProductImportRow } from './types';

// A — EAN-8 / UPC-A / EAN-13 / ITF-14. Internal barcodes fail EAN checksum, so no checksum here.
export const BARCODE_PATTERN = /^\d{8}$|^\d{12,14}$/;

// Returns a human-readable Uzbek reason, or null when the row is valid.
export function validateRow(row: ProductImportRow): string | null {
  if (!row.name || !row.name.trim()) return 'name (nomi) majburiy';
  if (typeof row.price !== 'number' || !Number.isFinite(row.price) || row.price < 0) {
    return `narx noto'g'ri: ${row.price}`;
  }
  const hasSku = !!row.sku && row.sku.trim() !== '';
  const hasBarcode = !!row.barcode && row.barcode.trim() !== '';
  // D — every row must be matchable on re-import (otherwise import is non-idempotent)
  if (!hasSku && !hasBarcode) return 'SKU yoki barkod majburiy (kamida bittasi)';
  // A — barcode format
  if (hasBarcode && !BARCODE_PATTERN.test(row.barcode!.trim())) {
    return `barkod formati noto'g'ri: ${row.barcode}`;
  }
  return null;
}
```

- [ ] **Step 4: Export it**

Edit `packages/catalog-import/src/index.ts` to add:

```ts
export * from './validation';
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter api exec jest --config jest.config.js validation.spec`
Expected: PASS (8 tests green).

- [ ] **Step 6: Commit**

```bash
git add packages/catalog-import/src/validation.ts packages/catalog-import/src/index.ts apps/api/src/catalog/import-export/validation.spec.ts
git commit -m "$(cat <<'EOF'
feat(catalog): row validation (barcode format + required identifier) (#104)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: In-file duplicate barcode detection (validation B)

**Files:**
- Modify: `packages/catalog-import/src/validation.ts`
- Test: `apps/api/src/catalog/import-export/validation.spec.ts` (extend)

- [ ] **Step 1: Write the failing test**

Append to `apps/api/src/catalog/import-export/validation.spec.ts`:

```ts
import { findDuplicateBarcodeIndices } from '@raos/catalog-import';

describe('findDuplicateBarcodeIndices', () => {
  it('flags the 2nd+ occurrence of a barcode, not the first', () => {
    const rows = [
      { name: 'A', price: 1, barcode: '12345678' },
      { name: 'B', price: 1, barcode: '99999999' },
      { name: 'C', price: 1, barcode: '12345678' },
      { name: 'D', price: 1, barcode: '12345678' },
    ];
    const dups = findDuplicateBarcodeIndices(rows);
    expect([...dups].sort()).toEqual([2, 3]);
  });

  it('ignores empty/missing barcodes', () => {
    const rows = [
      { name: 'A', price: 1, sku: 'A-1' },
      { name: 'B', price: 1, barcode: '' },
      { name: 'C', price: 1, sku: 'C-1' },
    ];
    expect(findDuplicateBarcodeIndices(rows).size).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter api exec jest --config jest.config.js validation.spec`
Expected: FAIL — `findDuplicateBarcodeIndices is not a function`.

- [ ] **Step 3: Implement**

Append to `packages/catalog-import/src/validation.ts`:

```ts
// B — returns 0-based indices of rows that repeat a barcode already seen earlier in the file.
export function findDuplicateBarcodeIndices(
  rows: ReadonlyArray<{ barcode?: string }>,
): Set<number> {
  const seen = new Set<string>();
  const dups = new Set<number>();
  rows.forEach((row, i) => {
    const bc = row.barcode?.trim();
    if (!bc) return;
    if (seen.has(bc)) dups.add(i);
    else seen.add(bc);
  });
  return dups;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter api exec jest --config jest.config.js validation.spec`
Expected: PASS (10 tests green).

- [ ] **Step 5: Commit**

```bash
git add packages/catalog-import/src/validation.ts apps/api/src/catalog/import-export/validation.spec.ts
git commit -m "$(cat <<'EOF'
feat(catalog): detect duplicate barcodes within an import file (#104)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Import engine `processImportRows` (batch preload + upsert + progress)

**Files:**
- Create: `packages/catalog-import/src/engine.ts`
- Test: `apps/api/src/catalog/import-export/engine.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/api/src/catalog/import-export/engine.spec.ts`:

```ts
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
      { name: '', sku: 'A-1', price: 1 }, // invalid name → row 2
      { name: 'Ok', sku: 'A-2', price: 1 }, // valid
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
    const total = PROGRESS_INTERVAL + 5; // 30
    const rows: ProductImportRow[] = Array.from({ length: total }, (_, i) => ({
      name: `P${i}`, sku: `S-${i}`, price: 1,
    }));
    const seen: ImportProgress[] = [];
    await processImportRows(prisma as unknown as PrismaClient, TENANT, rows, (p) => { seen.push(p); });
    // one at PROGRESS_INTERVAL, one final at total
    expect(seen.map((p) => p.processed)).toEqual([PROGRESS_INTERVAL, total]);
    expect(seen[seen.length - 1].total).toBe(total);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter api exec jest --config jest.config.js engine.spec`
Expected: FAIL — `processImportRows`/`PROGRESS_INTERVAL` not exported.

- [ ] **Step 3: Implement the engine**

Create `packages/catalog-import/src/engine.ts`:

```ts
import type { PrismaClient } from '@prisma/client';
import type { ProductImportRow, ImportSummary, ImportProgress } from './types';
import { validateRow, findDuplicateBarcodeIndices } from './validation';

export const PROGRESS_INTERVAL = 25;

type ExistingProduct = {
  id: string;
  sku: string | null;
  barcode: string | null;
  costPrice: unknown;
  minStockLevel: unknown;
};

export async function processImportRows(
  prisma: PrismaClient,
  tenantId: string,
  rows: ProductImportRow[],
  onProgress?: (p: ImportProgress) => void | Promise<void>,
): Promise<ImportSummary> {
  const duplicateBarcodes = findDuplicateBarcodeIndices(rows);

  // Batch preload — turns ~3*N lookups into 3 queries (fixes T-130 N+1).
  const [units, categories] = await Promise.all([
    prisma.unit.findMany({ where: { tenantId }, select: { id: true, name: true } }),
    prisma.category.findMany({ where: { tenantId }, select: { id: true, name: true } }),
  ]);
  const unitByName = new Map(units.map((u) => [u.name.toLowerCase(), u.id]));
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

  const skus = rows.map((r) => r.sku?.trim()).filter((s): s is string => !!s);
  const barcodes = rows.map((r) => r.barcode?.trim()).filter((b): b is string => !!b);
  const existing: ExistingProduct[] =
    skus.length || barcodes.length
      ? await prisma.product.findMany({
          where: {
            tenantId,
            OR: [
              ...(skus.length ? [{ sku: { in: skus } }] : []),
              ...(barcodes.length ? [{ barcode: { in: barcodes } }] : []),
            ],
          },
          select: { id: true, sku: true, barcode: true, costPrice: true, minStockLevel: true },
        })
      : [];
  const bySku = new Map<string, ExistingProduct>();
  const byBarcode = new Map<string, ExistingProduct>();
  for (const p of existing) {
    if (p.sku) bySku.set(p.sku, p);
    if (p.barcode) byBarcode.set(p.barcode, p);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  const report = async (processed: number) => {
    if (!onProgress) return;
    await onProgress({ processed, total: rows.length, created, updated, skipped, errors });
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2; // header = row 1

    if (duplicateBarcodes.has(i)) {
      skipped++;
      errors.push(`Qator ${lineNum}: barkod fayl ichida takrorlangan: ${row.barcode}`);
    } else {
      const err = validateRow(row);
      if (err) {
        skipped++;
        errors.push(`Qator ${lineNum}: ${err}`);
      } else {
        try {
          const unitId = row.unit ? unitByName.get(row.unit.toLowerCase()) : undefined;
          const categoryId = row.categoryName
            ? categoryByName.get(row.categoryName.toLowerCase())
            : undefined;
          const sku = row.sku?.trim() || undefined;
          const barcode = row.barcode?.trim() || undefined;
          const found =
            (sku && bySku.get(sku)) || (barcode && byBarcode.get(barcode)) || null;

          if (found) {
            await prisma.product.update({
              where: { id: found.id },
              data: {
                name: row.name,
                sellPrice: row.price,
                costPrice: row.costPrice ?? (found.costPrice as never),
                minStockLevel: row.minStock ?? (found.minStockLevel as never),
                ...(unitId && { unitId }),
                ...(categoryId && { categoryId }),
                ...(row.description !== undefined && { description: row.description }),
              },
            });
            updated++;
          } else {
            await prisma.product.create({
              data: {
                tenantId,
                name: row.name,
                sku: sku ?? null,
                barcode: barcode ?? null,
                sellPrice: row.price,
                costPrice: row.costPrice ?? 0,
                minStockLevel: row.minStock ?? 0,
                description: row.description ?? null,
                unitId: unitId ?? null,
                categoryId: categoryId ?? null,
              },
            });
            created++;
          }
        } catch (e) {
          skipped++;
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(`Qator ${lineNum}: ${msg}`);
        }
      }
    }

    if ((i + 1) % PROGRESS_INTERVAL === 0) await report(i + 1);
  }

  await report(rows.length);
  return { created, updated, skipped, errors };
}
```

- [ ] **Step 4: Export it**

Edit `packages/catalog-import/src/index.ts` to add:

```ts
export * from './engine';
```

The full `index.ts` is now:

```ts
export * from './types';
export * from './validation';
export * from './engine';
```

- [ ] **Step 5: Run to verify pass**

Run: `pnpm --filter api exec jest --config jest.config.js engine.spec`
Expected: PASS (6 tests green).

- [ ] **Step 6: Commit**

```bash
git add packages/catalog-import/src/engine.ts packages/catalog-import/src/index.ts apps/api/src/catalog/import-export/engine.spec.ts
git commit -m "$(cat <<'EOF'
feat(catalog): import engine with batch preload, upsert and progress (#104)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: BullMQ queue wiring (`product-import` job + status read)

**Files:**
- Modify: `apps/api/src/common/queue/queue.service.ts`
- Modify: `apps/worker/src/config.ts`

This task is glue/config (needs Redis to run) — verified by `tsc`, exercised through mocks in Tasks 6–7.

- [ ] **Step 1: Add the queue name + job payload to the API queue service**

In `apps/api/src/common/queue/queue.service.ts`, add to the `QUEUE_NAMES` object (after `SYNC_PROCESS`):

```ts
  PRODUCT_IMPORT: 'product-import',
```

Add the import near the top of the file (after the existing imports):

```ts
import type { ProductImportRow, ImportSummary, ImportProgress } from '@raos/catalog-import';
```

Add the job payload interface (after `SyncProcessJob`):

```ts
export interface ProductImportJob {
  tenantId: string;
  userId: string;
  rows: ProductImportRow[];
}
```

- [ ] **Step 2: Add the enqueue + status methods**

In `apps/api/src/common/queue/queue.service.ts`, add after `addSyncProcessJob` (before the AI section):

```ts
  async addProductImportJob(data: ProductImportJob) {
    // attempts: 1 — re-running a partial import is the user's explicit choice; upsert makes a manual re-run safe.
    return this.getQueue(QUEUE_NAMES.PRODUCT_IMPORT).add('import-products', data, {
      attempts: 1,
      removeOnComplete: 50,
      removeOnFail: 50,
    });
  }

  async getProductImportJobStatus(jobId: string): Promise<{
    status: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed' | 'not_found';
    progress: ImportProgress | null;
    result: ImportSummary | null;
    failedReason?: string;
  }> {
    const job = await this.getQueue(QUEUE_NAMES.PRODUCT_IMPORT).getJob(jobId);
    if (!job) return { status: 'not_found', progress: null, result: null };
    const state = (await job.getState()) as
      | 'completed' | 'failed' | 'active' | 'waiting' | 'delayed';
    const progress =
      job.progress && typeof job.progress === 'object'
        ? (job.progress as ImportProgress)
        : null;
    return {
      status: state,
      progress,
      result: state === 'completed' ? (job.returnvalue as ImportSummary) : null,
      ...(state === 'failed' ? { failedReason: job.failedReason } : {}),
    };
  }
```

- [ ] **Step 3: Add the queue name to the worker config**

In `apps/worker/src/config.ts`, add to the `QUEUE_NAMES` object (after `SYNC_PROCESS`):

```ts
  PRODUCT_IMPORT: 'product-import',
```

- [ ] **Step 4: Typecheck both**

Run: `pnpm --filter api exec tsc --noEmit && pnpm --filter worker exec tsc --noEmit`
Expected: both exit 0. (Requires `pnpm --filter api exec prisma generate` to have run if the client is stale.)

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/common/queue/queue.service.ts apps/worker/src/config.ts
git commit -m "$(cat <<'EOF'
feat(infra): add product-import queue, job payload and status read (#104)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Product-import worker

**Files:**
- Create: `apps/worker/src/workers/product-import.worker.ts`
- Test: `apps/worker/src/workers/__tests__/product-import.worker.spec.ts`
- Modify: `apps/worker/src/main.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/worker/src/workers/__tests__/product-import.worker.spec.ts`:

```ts
import { runProductImportJob } from '../product-import.worker';
import type { PrismaClient } from '@prisma/client';

function makePrisma() {
  return {
    unit: { findMany: jest.fn().mockResolvedValue([]) },
    category: { findMany: jest.fn().mockResolvedValue([]) },
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
    },
  };
}

describe('runProductImportJob', () => {
  it('processes rows and reports progress via job.updateProgress', async () => {
    const prisma = makePrisma();
    const updateProgress = jest.fn().mockResolvedValue(undefined);
    const job = {
      id: 'job-1',
      data: {
        tenantId: 't1',
        userId: 'u1',
        rows: [{ name: 'A', sku: 'A-1', price: 10 }],
      },
      updateProgress,
    };

    const summary = await runProductImportJob(prisma as unknown as PrismaClient, job as never);

    expect(summary.created).toBe(1);
    expect(prisma.product.create).toHaveBeenCalledTimes(1);
    // final progress report always fires
    expect(updateProgress).toHaveBeenCalled();
    const lastArg = updateProgress.mock.calls[updateProgress.mock.calls.length - 1][0];
    expect(lastArg).toMatchObject({ processed: 1, total: 1 });
  });

  it('propagates an engine throw so BullMQ marks the job failed', async () => {
    const prisma = makePrisma();
    prisma.unit.findMany.mockRejectedValue(new Error('db down'));
    const job = {
      id: 'job-2',
      data: { tenantId: 't1', userId: 'u1', rows: [{ name: 'A', sku: 'A-1', price: 10 }] },
      updateProgress: jest.fn(),
    };
    await expect(
      runProductImportJob(prisma as unknown as PrismaClient, job as never),
    ).rejects.toThrow('db down');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter worker test product-import.worker`
Expected: FAIL — `Cannot find module '../product-import.worker'`.

- [ ] **Step 3: Implement the worker**

Create `apps/worker/src/workers/product-import.worker.ts`:

```ts
import { Worker, Job } from 'bullmq';
import { processImportRows } from '@raos/catalog-import';
import type { ProductImportRow, ImportSummary } from '@raos/catalog-import';
import { PrismaClient } from '@prisma/client';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import prisma from '../prisma';
import { logJobStart, logJobDone, logJobError } from '../logger';

interface ProductImportJob {
  tenantId: string;
  userId: string;
  rows: ProductImportRow[];
}

const IMPORT_CONCURRENCY = 2; // keep low to avoid starving the pool during a large import

// Exported for unit testing — the pure job body, free of Redis/BullMQ wiring.
export async function runProductImportJob(
  db: PrismaClient,
  job: Job<ProductImportJob>,
): Promise<ImportSummary> {
  const { tenantId, rows } = job.data;
  return processImportRows(db, tenantId, rows, (p) => job.updateProgress(p));
}

export function createProductImportWorker(): Worker {
  const worker = new Worker<ProductImportJob>(
    QUEUE_NAMES.PRODUCT_IMPORT,
    async (job: Job<ProductImportJob>) => {
      const start = Date.now();
      logJobStart(QUEUE_NAMES.PRODUCT_IMPORT, job.id!, job.name, {
        tenantId: job.data.tenantId,
        rows: job.data.rows.length,
      });
      const summary = await runProductImportJob(prisma, job);
      logJobDone(QUEUE_NAMES.PRODUCT_IMPORT, job.id!, job.name, Date.now() - start);
      return summary;
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: IMPORT_CONCURRENCY,
    },
  );

  worker.on('failed', (job, err) => {
    logJobError(QUEUE_NAMES.PRODUCT_IMPORT, job?.id ?? 'unknown', job?.name ?? '', err);
  });

  return worker;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm --filter worker test product-import.worker`
Expected: PASS (2 tests green).

- [ ] **Step 5: Register the worker in main.ts**

In `apps/worker/src/main.ts`, add the import (after the `createSyncProcessWorker` import):

```ts
import { createProductImportWorker } from './workers/product-import.worker';
```

Add to the `workers` array (after `createSyncProcessWorker()`):

```ts
    createProductImportWorker(),
```

Add `'product-import'` to the `queues` array in the `workers_ready` log (after `'sync-process'`):

```ts
      'product-import',
```

- [ ] **Step 6: Typecheck the worker**

Run: `pnpm --filter worker exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add apps/worker/src/workers/product-import.worker.ts apps/worker/src/workers/__tests__/product-import.worker.spec.ts apps/worker/src/main.ts
git commit -m "$(cat <<'EOF'
feat(worker): product-import worker running the shared engine (#104)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Service delegation + controller threshold + status endpoint

**Files:**
- Modify: `apps/api/src/catalog/import-export/product-import.service.ts`
- Modify: `apps/api/src/catalog/import-export/product-import.controller.ts`
- Test: `apps/api/src/catalog/import-export/product-import.controller.spec.ts`

- [ ] **Step 1: Refactor the service to expose `parse()` + `processSync()` and delegate to the engine**

In `apps/api/src/catalog/import-export/product-import.service.ts`:

Add the engine import after the existing imports:

```ts
import { processImportRows } from '@raos/catalog-import';
import type { ProductImportRow, ImportSummary } from '@raos/catalog-import';
```

Delete the local `interface ProductRow { ... }` block (lines 10–20) — it is replaced by `ProductImportRow` from the package. Update the private helpers `parseBuffer`, `parseCsv`, `mapRow`, `validateRow` signatures to use `ProductImportRow` instead of `ProductRow`.

Replace the entire `importFromBuffer(...)` method (lines 30–111) with these two public methods (the per-row upsert loop and `validateRow` private method are removed — validation now lives in the engine):

```ts
  // Public: parse a raw upload into rows (format handling stays in the API layer).
  async parse(buffer: Buffer, mimeType: string): Promise<ProductImportRow[]> {
    return this.parseBuffer(buffer, mimeType);
  }

  // Public: run the engine inline (sync path, small files).
  async processSync(tenantId: string, rows: ProductImportRow[]): Promise<ImportSummary> {
    const summary = await processImportRows(this.prisma, tenantId, rows);
    this.logger.log(
      `Import (sync) tenantId=${tenantId}: created=${summary.created}, updated=${summary.updated}, skipped=${summary.skipped}, errors=${summary.errors.length}`,
    );
    return summary;
  }
```

Also delete the now-unused `private validateRow(...)` method (lines 265–268), since validation moved into `@raos/catalog-import`. Keep `parseBuffer`, `parseCsv`, `mapRow`, `generateTemplate`, `exportToXlsx`, `exportToCsv` unchanged except for the `ProductRow` → `ProductImportRow` type rename.

- [ ] **Step 2: Write the failing controller tests**

Create `apps/api/src/catalog/import-export/product-import.controller.spec.ts`:

```ts
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProductImportController, IMPORT_SYNC_THRESHOLD } from './product-import.controller';
import { ProductImportService } from './product-import.service';
import { QueueService } from '../../common/queue/queue.service';

function makeRes() {
  const res: { status: jest.Mock; statusCode?: number } = {
    status: jest.fn().mockImplementation((c: number) => {
      res.statusCode = c;
      return res;
    }),
  };
  return res;
}

function makeFile(over: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    buffer: Buffer.from('x'),
    mimetype: 'text/csv',
    size: 10,
    ...over,
  } as Express.Multer.File;
}

describe('ProductImportController', () => {
  let controller: ProductImportController;
  let service: { parse: jest.Mock; processSync: jest.Mock };
  let queue: { addProductImportJob: jest.Mock; getProductImportJobStatus: jest.Mock };

  beforeEach(async () => {
    service = { parse: jest.fn(), processSync: jest.fn() };
    queue = { addProductImportJob: jest.fn(), getProductImportJobStatus: jest.fn() };
    const mod = await Test.createTestingModule({
      controllers: [ProductImportController],
      providers: [
        { provide: ProductImportService, useValue: service },
        { provide: QueueService, useValue: queue },
      ],
    }).compile();
    controller = mod.get(ProductImportController);
  });

  it('rejects a missing file', async () => {
    const res = makeRes();
    await expect(
      controller.importProducts('t1', 'u1', undefined as never, res as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an unsupported mime type', async () => {
    const res = makeRes();
    await expect(
      controller.importProducts('t1', 'u1', makeFile({ mimetype: 'image/png' }), res as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an empty file (no parsed rows)', async () => {
    service.parse.mockResolvedValue([]);
    const res = makeRes();
    await expect(
      controller.importProducts('t1', 'u1', makeFile(), res as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('runs sync for < threshold rows and returns mode=sync with 200', async () => {
    service.parse.mockResolvedValue(new Array(IMPORT_SYNC_THRESHOLD - 1).fill({ name: 'A', sku: 'A-1', price: 1 }));
    service.processSync.mockResolvedValue({ created: 1, updated: 0, skipped: 0, errors: [] });
    const res = makeRes();
    const out = await controller.importProducts('t1', 'u1', makeFile(), res as never);
    expect(out).toMatchObject({ mode: 'sync', created: 1, skipped: 0 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(queue.addProductImportJob).not.toHaveBeenCalled();
  });

  it('enqueues for >= threshold rows and returns mode=async with 202 + jobId + total', async () => {
    const rows = new Array(IMPORT_SYNC_THRESHOLD).fill({ name: 'A', sku: 'A-1', price: 1 });
    service.parse.mockResolvedValue(rows);
    queue.addProductImportJob.mockResolvedValue({ id: 'job-9' });
    const res = makeRes();
    const out = await controller.importProducts('t1', 'u1', makeFile(), res as never);
    expect(out).toEqual({ mode: 'async', jobId: 'job-9', total: IMPORT_SYNC_THRESHOLD });
    expect(res.status).toHaveBeenCalledWith(202);
    expect(service.processSync).not.toHaveBeenCalled();
  });

  it('delegates status reads to the queue', async () => {
    queue.getProductImportJobStatus.mockResolvedValue({ status: 'active', progress: null, result: null });
    const out = await controller.importStatus('job-9');
    expect(queue.getProductImportJobStatus).toHaveBeenCalledWith('job-9');
    expect(out.status).toBe('active');
  });
});
```

- [ ] **Step 3: Run to verify failure**

Run: `pnpm --filter api exec jest --config jest.config.js product-import.controller.spec`
Expected: FAIL — `IMPORT_SYNC_THRESHOLD`/`importStatus` not exported; `importProducts` signature mismatch.

- [ ] **Step 4: Implement the controller changes**

Replace `apps/api/src/catalog/import-export/product-import.controller.ts` with:

```ts
/**
 * #104 (T-130 + async): Product bulk import/export endpoints
 * POST /catalog/products/import       → upload CSV/XLSX; < threshold = sync 200, >= threshold = async 202 + jobId
 * GET  /catalog/products/import/:jobId → async job status + progress + result
 * GET  /catalog/products/export        → download XLSX or CSV
 */
import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ServiceUnavailableException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProductImportService } from './product-import.service';
import { QueueService } from '../../common/queue/queue.service';

export const IMPORT_SYNC_THRESHOLD = 200;
const IMPORT_MAX_FILE_SIZE = 15 * 1024 * 1024;

@ApiTags('Catalog')
@ApiBearerAuth()
@Controller('catalog/products')
export class ProductImportController {
  constructor(
    private readonly importService: ProductImportService,
    private readonly queueService: QueueService,
  ) {}

  @Post('import')
  @ApiOperation({ summary: '#104: Mahsulotlarni CSV/XLSX dan import (sync yoki async)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: IMPORT_MAX_FILE_SIZE } }))
  async importProducts(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!file) throw new BadRequestException('Fayl tanlanmagan');
    const allowedTypes = [
      'text/csv',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Faqat CSV yoki XLSX fayllar qabul qilinadi');
    }

    const rows = await this.importService.parse(file.buffer, file.mimetype);
    if (rows.length === 0) throw new BadRequestException('Faylda mahsulot topilmadi');

    if (rows.length < IMPORT_SYNC_THRESHOLD) {
      const summary = await this.importService.processSync(tenantId, rows);
      res.status(HttpStatus.OK);
      return { mode: 'sync' as const, ...summary };
    }

    try {
      const job = await this.queueService.addProductImportJob({ tenantId, userId, rows });
      res.status(HttpStatus.ACCEPTED);
      return { mode: 'async' as const, jobId: job.id!, total: rows.length };
    } catch {
      // Redis down — do NOT silently run thousands of rows synchronously.
      throw new ServiceUnavailableException(
        'Import xizmati vaqtincha ishlamayapti; kichikroq fayl bilan urinib ko\'ring.',
      );
    }
  }

  @Get('import/:jobId')
  @ApiOperation({ summary: '#104: Async import jobi holati + progress' })
  async importStatus(@Param('jobId') jobId: string) {
    return this.queueService.getProductImportJobStatus(jobId);
  }

  @Get('import/template')
  @ApiOperation({ summary: 'Download import template XLSX' })
  async downloadTemplate(@Res() res: Response) {
    const buf = await this.importService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="RAOS-import-template.xlsx"');
    res.send(buf);
  }

  @Get('export')
  @ApiOperation({ summary: 'T-130: Mahsulotlarni XLSX/CSV ga eksport qilish' })
  @ApiQuery({ name: 'format', required: false, enum: ['xlsx', 'csv'], description: 'Default: xlsx' })
  async exportProducts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('format') format: string = 'xlsx',
    @Res() res: Response,
  ) {
    if (format === 'csv') {
      const csv = await this.importService.exportToCsv(tenantId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="products-${tenantId}.csv"`);
      res.send(csv);
    } else {
      const buf = await this.importService.exportToXlsx(tenantId);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="products-${tenantId}.xlsx"`);
      res.send(buf);
    }
  }
}
```

> **Route ordering note:** `@Get('import/:jobId')` is declared **before** `@Get('import/template')`. Nest matches in declaration order, and `:jobId` would otherwise swallow `template`. To keep `import/template` working, the literal route must win — so either declare `import/template` first, OR (chosen here) keep the param route but verify in Step 5 that the template download still resolves. If the template test breaks, move the `import/template` handler above `import/:jobId`.

Correct the ordering now: in the file above, **move the `downloadTemplate` (`@Get('import/template')`) handler above the `importStatus` (`@Get('import/:jobId')`) handler** so the literal path is matched first.

- [ ] **Step 5: Run to verify pass**

Run: `pnpm --filter api exec jest --config jest.config.js product-import.controller.spec`
Expected: PASS (7 tests green).

- [ ] **Step 6: Full api test + typecheck**

Run: `pnpm --filter api test && pnpm --filter api exec tsc --noEmit`
Expected: all green, tsc exit 0 (confirms the `ProductRow` → `ProductImportRow` rename compiles and no orphaned references remain).

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/catalog/import-export/product-import.service.ts apps/api/src/catalog/import-export/product-import.controller.ts apps/api/src/catalog/import-export/product-import.controller.spec.ts
git commit -m "$(cat <<'EOF'
feat(catalog): threshold-based sync/async import + job status endpoint (#104)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Web API layer — discriminated union + status polling call

**Files:**
- Modify: `apps/web/src/api/import.api.ts`

Web has no test runner; verify with `tsc` + `build`.

- [ ] **Step 1: Rewrite the import API client**

Replace `apps/web/src/api/import.api.ts` with:

```ts
import { apiClient } from './client';

export interface ImportSummary {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface ImportProgress {
  processed: number;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export type UploadResult =
  | ({ mode: 'sync' } & ImportSummary)
  | { mode: 'async'; jobId: string; total: number };

export interface ImportJobStatus {
  status: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed' | 'not_found';
  progress: ImportProgress | null;
  result: ImportSummary | null;
  failedReason?: string;
}

export const importApi = {
  uploadFile(file: File): Promise<UploadResult> {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<UploadResult>('/catalog/products/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })
      .then((r) => r.data);
  },

  getImportStatus(jobId: string): Promise<ImportJobStatus> {
    return apiClient
      .get<ImportJobStatus>(`/catalog/products/import/${jobId}`)
      .then((r) => r.data);
  },

  async downloadTemplate(): Promise<void> {
    const res = await apiClient.get('/catalog/products/import/template', {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RAOS-import-template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportXlsx(): Promise<void> {
    const res = await apiClient.get('/catalog/products/export', {
      params: { format: 'xlsx' },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportCsv(): Promise<void> {
    const res = await apiClient.get('/catalog/products/export', {
      params: { format: 'csv' },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter web exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/api/import.api.ts
git commit -m "$(cat <<'EOF'
feat(admin): import API discriminated union + job status polling (#104)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Web import page — async progress polling + progress bar + skipped

**Files:**
- Modify: `apps/web/src/app/(admin)/catalog/import/page.tsx`

Verify with `tsc` + `build` + manual browser smoke.

- [ ] **Step 1: Update imports, types and constants**

In `apps/web/src/app/(admin)/catalog/import/page.tsx`:

Change the React import (line 3) to add `useEffect` and `useRef` (already imported):

```ts
import { useState, useCallback, useRef, useEffect } from 'react';
```

Change the api import (line 12) to pull types:

```ts
import { importApi } from '@/api/import.api';
import type { ImportSummary, ImportProgress } from '@/api/import.api';
```

Replace the local `ImportResult` interface (lines 16–20) and `PageState` (line 22) with:

```ts
type PageState = 'idle' | 'uploading' | 'processing' | 'done';

const POLL_INTERVAL_MS = 1500;
```

(`ImportSummary`/`ImportProgress` now come from the api module; remove the local `ImportResult` type.)

- [ ] **Step 2: Add async state and replace `handleImport`**

Replace the `result` state line (line 42) and add progress + job state:

```ts
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [asyncError, setAsyncError] = useState<string | null>(null);
```

Replace `handleImport` (lines 89–109) with:

```ts
  const handleImport = async () => {
    if (!selectedFile) return;
    setState('uploading');
    setAsyncError(null);
    try {
      const data = await importApi.uploadFile(selectedFile);
      if (data.mode === 'sync') {
        const { mode: _m, ...summary } = data;
        setResult(summary);
        setState('done');
        notifySummary(summary);
      } else {
        setJobId(data.jobId);
        setProgress({ processed: 0, total: data.total, created: 0, updated: 0, skipped: 0, errors: [] });
        setState('processing');
      }
    } catch {
      toast.error("Import amalga oshmadi. Fayl formatini tekshiring va qaytadan urinib ko'ring.");
      setState('idle');
    }
  };

  const notifySummary = (s: ImportSummary) => {
    if (s.errors.length === 0) {
      toast.success(`Import muvaffaqiyatli: ${s.created} ta yaratildi, ${s.updated} ta yangilandi`);
    } else {
      toast.warning(
        `Import tugadi: ${s.created} yaratildi, ${s.updated} yangilandi, ${s.skipped} o'tkazib yuborildi, ${s.errors.length} xato`,
      );
    }
  };
```

- [ ] **Step 3: Add the polling effect**

Add after the handlers (e.g. before `handleReset`):

```ts
  useEffect(() => {
    if (state !== 'processing' || !jobId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const st = await importApi.getImportStatus(jobId);
        if (cancelled) return;
        if (st.progress) setProgress(st.progress);
        if (st.status === 'completed' && st.result) {
          setResult(st.result);
          setState('done');
          notifySummary(st.result);
        } else if (st.status === 'failed' || st.status === 'not_found') {
          setAsyncError(st.failedReason ?? 'Import jarayoni muvaffaqiyatsiz tugadi');
          setState('idle');
        }
      } catch {
        // transient poll error — keep polling
      }
    };
    const id = setInterval(tick, POLL_INTERVAL_MS);
    void tick();
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [state, jobId]);
```

- [ ] **Step 4: Reset clears async state**

Update `handleReset` (lines 111–115) to also clear progress/job/error:

```ts
  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(null);
    setJobId(null);
    setAsyncError(null);
    setState('idle');
  };
```

- [ ] **Step 5: Render the progress bar + async error**

Add this block immediately **before** the `{/* Results */}` block (before line 281, `{state === 'done' && result && (`):

```tsx
      {/* Async progress */}
      {state === 'processing' && progress && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-3 font-semibold text-gray-900">Import qilinmoqda...</p>
          <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gray-900 transition-all"
              style={{
                width: `${progress.total ? Math.round((progress.processed / progress.total) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {progress.processed} / {progress.total} — {progress.created} yaratildi,{' '}
            {progress.updated} yangilandi, {progress.skipped} o'tkazib yuborildi
          </p>
        </div>
      )}

      {/* Async failure */}
      {asyncError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="flex-1 text-sm text-red-700">{asyncError}</span>
          <button
            type="button"
            onClick={handleImport}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Qayta urinish
          </button>
        </div>
      )}
```

- [ ] **Step 6: Surface `skipped` in the results panel**

In the results summary (after the "updated" badge, before the errors badge — around line 299), add:

```tsx
            {result.skipped > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  {result.skipped} ta o'tkazib yuborildi
                </span>
              </div>
            )}
```

Also gate the drop-zone hide on the new state — change `{state !== 'done' && (` for the drop zone (line 203) to also hide while processing:

```tsx
        {state !== 'done' && state !== 'processing' && (
```

Do the same for the selected-file info (line 237) and the import button (line 256): replace `state !== 'done'` with `state !== 'done' && state !== 'processing'`.

- [ ] **Step 7: Typecheck + build**

Run: `pnpm --filter web exec tsc --noEmit && pnpm --filter web build`
Expected: tsc exit 0; build succeeds.

- [ ] **Step 8: Commit**

```bash
git add "apps/web/src/app/(admin)/catalog/import/page.tsx"
git commit -m "$(cat <<'EOF'
feat(admin): async import progress bar + polling + skipped count (#104)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Onboarding step 3 → import flow + i18n

**Files:**
- Modify: `apps/web/src/app/(admin)/onboarding/page.tsx`
- Modify: `apps/web/src/i18n/locales/uz.json`
- Modify: `apps/web/src/i18n/locales/ru.json`
- Modify: `apps/web/src/i18n/locales/en.json`

- [ ] **Step 1: Rewire step 3 action**

In `apps/web/src/app/(admin)/onboarding/page.tsx`, change the step 3 entry in `STEP_META` (line 14):

```ts
  { id: 3, icon: Package,   action: '/catalog/import', titleKey: 'step3Title', descKey: 'step3Desc', actionKey: 'step3Action' },
```

- [ ] **Step 2: Update i18n labels (uz)**

In `apps/web/src/i18n/locales/uz.json` (lines 1357–1359):

```json
    "step3Title": "Mahsulotlarni import qiling",
    "step3Desc": "Excel/CSV fayl orqali mahsulotlarni ommaviy yuklang",
    "step3Action": "Mahsulot import qilish",
```

- [ ] **Step 3: Update i18n labels (ru)**

In `apps/web/src/i18n/locales/ru.json` (lines 1357–1359):

```json
    "step3Title": "Импортируйте товары",
    "step3Desc": "Массовая загрузка товаров через Excel/CSV файл",
    "step3Action": "Импорт товаров",
```

- [ ] **Step 4: Update i18n labels (en)**

In `apps/web/src/i18n/locales/en.json` (lines 1357–1359):

```json
    "step3Title": "Import Products",
    "step3Desc": "Bulk-upload products via an Excel/CSV file",
    "step3Action": "Import Products",
```

- [ ] **Step 5: Typecheck + build**

Run: `pnpm --filter web exec tsc --noEmit && pnpm --filter web build`
Expected: tsc exit 0; build succeeds (validates JSON well-formedness too).

- [ ] **Step 6: Commit**

```bash
git add "apps/web/src/app/(admin)/onboarding/page.tsx" apps/web/src/i18n/locales/uz.json apps/web/src/i18n/locales/ru.json apps/web/src/i18n/locales/en.json
git commit -m "$(cat <<'EOF'
feat(admin): onboarding step 3 routes to product import (#104)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Final verification (before opening the PR)

- [ ] **Zone check (Ibrat zone — must be empty):**

Run: `git diff main --name-only | grep -v -E "^(apps/(api|web|pos|bot|worker)|packages|docs)/"`
Expected: empty (only Ibrat zones + shared `packages/` + `docs/` touched; `packages/` is a coordinated shared change announced per Shared File Protocol).

- [ ] **Full gated suites:**

Run:
```bash
pnpm --filter api exec prisma generate
pnpm --filter api test
pnpm --filter worker test
pnpm --filter api exec tsc --noEmit
pnpm --filter web exec tsc --noEmit
pnpm --filter worker exec tsc --noEmit
pnpm --filter web build
```
Expected: all green.

- [ ] **Manual browser smoke (async path):** upload a ≥200-row file → progress bar advances → results panel shows created/updated/skipped; upload a <200-row file → immediate results.

---

## Self-Review (against the spec)

**Spec coverage:**
- Hybrid threshold (sync `<200` / async `≥200`) → Task 7 controller. ✓
- Progress via HTTP polling → Task 5 `getProductImportJobStatus`, Task 8 `getImportStatus`, Task 9 polling effect. ✓
- Validation A (barcode format) + B (in-file duplicate) + D (required identifier) → Tasks 2–3, enforced in engine Task 4. ✓
- Shared engine in `@raos/catalog-import`, consumed by api (sync) + worker (async) → Tasks 1, 4, 6, 7. ✓
- BullMQ `product-import` queue in both api + worker, names matched; `attempts: 1`, `removeOnComplete/Fail: 50` → Task 5. ✓
- Batch preload fixes N+1; `concurrency: 2` worker → Tasks 4, 6. ✓
- `skipped` surfaced in web → Tasks 8–9. ✓
- Onboarding step 3 → `/catalog/import` + i18n uz/ru/en → Task 10. ✓
- File size cap raised to 15 MB; empty file → 400; Redis down → 503 → Task 7. ✓
- Out of scope (export changes, EAN checksum, WebSocket, multi-sheet) → not touched. ✓

**Type consistency:** `ProductImportRow` / `ImportSummary` / `ImportProgress` defined once in `packages/catalog-import/src/types.ts` and re-imported everywhere (queue.service, worker, web mirrors the shape). `processImportRows(prisma, tenantId, rows, onProgress?)` signature identical across engine def (Task 4), worker call (Task 6), service call (Task 7). `IMPORT_SYNC_THRESHOLD` exported from the controller and reused in its spec. ✓

**Placeholder scan:** every code step contains complete code; no TBD/TODO left in new code (the pre-existing `// TODO` in `data-export.worker.ts` is untouched). ✓
