import type { ProductImportRow } from './types';

// A — EAN-8 / UPC-A / EAN-13 / ITF-14. Internal barcodes fail EAN checksum, so no checksum here.
export const BARCODE_PATTERN = /^\d{8}$|^\d{12,14}$/;

// Returns a human-readable Uzbek reason, or null when the row is valid.
export function validateRow(row: ProductImportRow): string | null {
  if (!row.name || !row.name.trim()) return 'name (nomi) majburiy';
  if (typeof row.price !== 'number' || !Number.isFinite(row.price) || row.price < 0) {
    return `narx noto'g'ri: ${row.price}`;
  }
  const sku = row.sku?.trim();
  const barcode = row.barcode?.trim();
  // D — every row must be matchable on re-import (otherwise import is non-idempotent)
  if (!sku && !barcode) return 'SKU yoki barkod majburiy (kamida bittasi)';
  // A — barcode format
  if (barcode && !BARCODE_PATTERN.test(barcode)) {
    return `barkod formati noto'g'ri: ${row.barcode}`;
  }
  return null;
}

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

// B (sku) — returns 0-based indices of rows that repeat a sku already seen earlier in the file.
export function findDuplicateSkuIndices(
  rows: ReadonlyArray<{ sku?: string }>,
): Set<number> {
  const seen = new Set<string>();
  const dups = new Set<number>();
  rows.forEach((row, i) => {
    const sku = row.sku?.trim();
    if (!sku) return;
    if (seen.has(sku)) dups.add(i);
    else seen.add(sku);
  });
  return dups;
}
