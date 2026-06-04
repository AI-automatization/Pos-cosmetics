# Product Import — Async + Progress (Issue #104 / I-8)

- **Date:** 2026-06-04
- **Issue:** #104 "I-8: Mahsulot import (Excel/CSV) + onboarding"
- **Zone:** `apps/api`, `apps/worker`, `apps/web`, new `packages/catalog-import` (all Ibrat zone + shared package)
- **Branch:** `ibrat/feat-product-import`

## Context & gap analysis

Most of #104 already exists, shipped earlier as **T-130**:

| #104 requirement | Status before this work |
|---|---|
| POST import (CSV + XLSX) | Done — `apps/api/src/catalog/import-export/product-import.controller.ts` → `POST /catalog/products/import` |
| Validation (name, price) | Partial — only `name` + `price`; **barcode not validated** |
| Duplicate check | Done — upsert by SKU or barcode |
| Template download (filled sample) | Done — `GET /catalog/products/import/template` |
| Web: drag&drop, template, result + errors | Done — `apps/web/src/app/(admin)/catalog/import/page.tsx` |
| Export XLSX/CSV | Done (bonus beyond ticket) |
| **1000+ products → BullMQ background job** | **Missing — import is fully synchronous** |
| **Progress tracking / progress bar** | **Missing — only a spinner** |
| Onboarding wizard step 3 = "products import" | Partial — step 3 routes to `/catalog/products`, not the import flow |

The current `importFromBuffer` is synchronous and issues per-row `findFirst` queries (N+1). For 2–3 products that is fine; for a real cosmetics price list of 500–2000 SKUs it would exhaust the HTTP timeout, block the Nest event loop, and fan out into thousands of sequential DB round-trips. That is exactly why the ticket mandates BullMQ.

**Therefore the real scope of #104 is not "build import from scratch" but "add async processing + progress on top of T-130, and finish validation + onboarding."**

## Decisions (from brainstorming)

1. **Hybrid with threshold** — small files run synchronously inline; large files go to a BullMQ queue with `jobId` + progress polling. One endpoint decides.
2. **Progress via HTTP polling** — `GET /catalog/products/import/:jobId` returns `{status, progress, result}`; the worker writes progress into the BullMQ job (stored in Redis), the API reads it. No WebSocket bridge.
3. **Threshold by parsed row count** — the controller always parses the file (cheap, in-memory), counts rows; `< 200` → sync, `>= 200` → async.
4. **Validation set A + B + D** (see §4). No EAN checksum (overkill for the pilot; internal barcodes fail checksum).
5. **Shared engine lives in a new package** `@raos/catalog-import`, depending on `@prisma/client`, consumed by both the API (sync) and the worker (async). Kept out of `@raos/utils` so that package stays Prisma-free.

## Architecture

```
POST /catalog/products/import (multipart)
  └─ controller parses buffer → rows[]
       ├─ rows.length < 200  → engine inline (sync) → 200 OK
       │                       { mode: 'sync', created, updated, skipped, errors }
       └─ rows.length >= 200 → enqueue ProductImportJob(rows) → 202 Accepted
                               { mode: 'async', jobId, total }

worker (product-import.worker) → same engine
  → job.updateProgress({ processed, total, created, updated, skipped, errors })

GET /catalog/products/import/:jobId
  → reads BullMQ job state → { status, progress, result }

web: async response → progress screen, poll every 1.5s
  → progress bar + live counts → on completed → existing results/errors panel
```

### New BullMQ queue

- Queue name `product-import` added to **both** `apps/api/src/common/queue/queue.service.ts` (`QUEUE_NAMES`) and `apps/worker/src/config.ts` (`QUEUE_NAMES`) — they are duplicated by existing convention and MUST match.
- `QueueService.addProductImportJob(data)` — `attempts: 1` (no auto-retry: re-running a partial import is the user's explicit choice; upsert makes a manual re-run safe), `removeOnComplete: 50`, `removeOnFail: 50`.
- `ProductImportJob` payload: `{ tenantId: string; userId: string; rows: ProductImportRow[] }`. Rows are pre-parsed in the API so the worker never touches file formats.

## Shared engine: `@raos/catalog-import`

New package `packages/catalog-import` (`@raos/catalog-import`), framework-agnostic, depends on `@prisma/client`.

### Public surface

```ts
// types
export interface ProductImportRow {
  name: string
  sku?: string
  barcode?: string
  price: number
  costPrice?: number
  unit?: string
  categoryName?: string
  description?: string
  minStock?: number
}

export interface ImportSummary {
  created: number
  updated: number
  skipped: number      // rows that failed validation
  errors: string[]     // `Qator N: <reason>` — human-readable, per row
}

export interface ImportProgress {
  processed: number
  total: number
  created: number
  updated: number
  skipped: number
  errors: string[]
}

// parse (kept in the API layer, not the engine — engine is parse-agnostic)
// engine
export async function processImportRows(
  prisma: PrismaClient,
  tenantId: string,
  rows: ProductImportRow[],
  onProgress?: (p: ImportProgress) => void | Promise<void>,
): Promise<ImportSummary>
```

### Engine responsibilities

1. **Pre-scan** the file for duplicate barcodes (validation B) — build a `Set`, flag the 2nd+ occurrence as a row error before upserting.
2. **Batch preload** (fix N+1):
   - one query for all `Unit` of the tenant → `Map<lowercased name, id>`
   - one query for all `Category` of the tenant → `Map<lowercased name, id>`
   - one query for existing `Product` matching any `sku` or `barcode` present in the file → two maps (`bySku`, `byBarcode`)
3. **Per row:** validate (A + D + name + price), resolve unit/category via maps, find existing via maps, `update` or `create`.
4. **Collect errors** per row (`Qator N: ...`); invalid rows increment `skipped` and never abort the batch.
5. **Report progress** via `onProgress` every `PROGRESS_INTERVAL` rows (const, e.g. 25) and once at the end. The sync path passes no callback; the worker passes one that calls `job.updateProgress`.

The existing `ProductImportService` keeps the parse helpers (`parseBuffer`, `parseCsv`, `mapRow`) and template/export logic, but delegates the row processing to `processImportRows`. The duplicated upsert loop is removed.

## Validation (A + B + D)

Constants, no magic numbers:

- **A — barcode format:** if present, must match `/^\d{8}$|^\d{12,14}$/` (EAN-8 / UPC-A / EAN-13 / ITF-14). Empty is allowed (barcode optional).
- **B — duplicate barcode within the file:** the 2nd+ row with the same barcode → row error (otherwise upsert silently overwrites the first).
- **D — identifier required:** every row must have `sku` OR `barcode`. Without one, upsert can never match an existing product, so every re-import duplicates rows (non-idempotent). This closes a latent bug in T-130.
- **Existing rules kept:** `name` required, `price` is a number `>= 0`.

Invalid rows are skipped with a per-row message; valid rows still import. Return adds a `skipped` count (new field, surfaced in the web results panel).

## Performance

Replace per-row `findFirst` with the batch preload above. For 1000+ rows this turns ~3×N lookups into ~3 queries + N upserts. Upserts stay per-row (Prisma has no bulk upsert on composite business keys), but the lookup fan-out — the dominant cost — is eliminated. Concurrency on the worker stays low (`concurrency: 2`) to avoid starving the pool during a large import.

## Web changes

- `apps/web/src/api/import.api.ts`: `uploadFile` returns a discriminated union — `{ mode: 'sync', ...ImportSummary }` | `{ mode: 'async', jobId, total }`. Add `getImportStatus(jobId): Promise<{ status, progress, result }>`.
- `apps/web/src/app/(admin)/catalog/import/page.tsx`: add a `processing` state with a progress bar (`processed/total`%) and 1.5s polling; reuse the existing results/errors panel on completion; show `skipped` alongside created/updated. Surface async failure with a retry affordance.
- `apps/web/src/app/(admin)/onboarding/page.tsx`: step 3 `action` → `/catalog/import`; label/description i18n keys updated to "products import" (uz/ru/en).

## Error handling

- **File:** mime/extension + size validation. Raise the size cap for the import endpoint (current 5 MB) to accommodate large async files (e.g. 15 MB); empty file → 400.
- **Job failure:** the worker catches, marks the job failed with a reason; `GET :jobId` returns `failed` + message; the web shows the error and offers retry.
- **Partial success:** per-row errors are surfaced; the job/sync call never fails wholesale.
- **Redis down for an `>= 200` import:** enqueue fails → return `503` "import service temporarily unavailable; try a smaller batch." Do NOT silently run 2000 rows synchronously.

## Testing (TDD)

- **Engine (`@raos/catalog-import`) unit tests:** validation A/B/D; upsert idempotency (re-run same rows → all `updated`, 0 `created`); batch-preload correctness (units/categories/existing resolved without per-row queries); `onProgress` cadence; per-row error collection with `skipped` count.
- **Controller:** `< 200` → sync summary; `>= 200` → `202` with `jobId` + `total`; file-type/size rejection; empty file.
- **Worker:** processes a job, calls `updateProgress`, handles a thrown error → failed with reason.
- **Web:** minimal — poll → render progress → render results — following existing web test conventions.

## Out of scope

- Export changes (already done in T-130).
- EAN checksum validation.
- WebSocket progress.
- Multi-sheet / multi-file uploads.
- Image/photo import.

## Open items resolved

- Engine home: `packages/catalog-import` (chosen over `@raos/utils` to keep utils Prisma-free; over duplicating in the worker to avoid validation drift).
