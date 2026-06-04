import type { PrismaClient } from '@prisma/client';
import type { ProductImportRow, ImportSummary, ImportProgress } from './types';
import { validateRow, findDuplicateBarcodeIndices, findDuplicateSkuIndices } from './validation';

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
  const duplicateSkus = findDuplicateSkuIndices(rows);

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
            deletedAt: null,
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
    await onProgress({ processed, total: rows.length, created, updated, skipped, errors: [...errors] });
  };

  for (let i = 0; i < rows.length; i++) {
    const row: ProductImportRow | undefined = rows[i];
    if (!row) continue; // noUncheckedIndexedAccess guard — array bounds already checked
    const lineNum = i + 2; // header = row 1

    if (duplicateBarcodes.has(i)) {
      skipped++;
      errors.push(`Qator ${lineNum}: barkod fayl ichida takrorlangan: ${row.barcode}`);
    } else if (duplicateSkus.has(i)) {
      skipped++;
      errors.push(`Qator ${lineNum}: SKU fayl ichida takrorlangan: ${row.sku}`);
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
              where: { id: found.id, tenantId },
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

  if (rows.length % PROGRESS_INTERVAL !== 0) await report(rows.length);
  return { created, updated, skipped, errors };
}
