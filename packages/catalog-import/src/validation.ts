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
