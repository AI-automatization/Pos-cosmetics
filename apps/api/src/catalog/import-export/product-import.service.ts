/**
 * T-130: Product bulk import/export (CSV / XLSX)
 * Import: parse file → validate → upsert products
 * Export: fetch products → generate XLSX/CSV
 */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

interface ProductRow {
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

@Injectable()
export class ProductImportService {
  private readonly logger = new Logger(ProductImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── IMPORT ────────────────────────────────────────────────────

  async importFromBuffer(
    tenantId: string,
    userId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ created: number; updated: number; errors: string[] }> {
    const rows = await this.parseBuffer(buffer, mimeType);
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        this.validateRow(row, i + 2); // +2 because row 1 = header

        // Find or create unit
        let unitId: string | undefined;
        if (row.unit) {
          const unit = await this.prisma.unit.findFirst({
            where: { tenantId, name: { equals: row.unit, mode: 'insensitive' } },
          });
          unitId = unit?.id;
        }

        // Find or create category
        let categoryId: string | undefined;
        if (row.categoryName) {
          const cat = await this.prisma.category.findFirst({
            where: { tenantId, name: { equals: row.categoryName, mode: 'insensitive' } },
          });
          if (cat) categoryId = cat.id;
        }

        // Upsert by SKU or barcode
        const existing = row.sku
          ? await this.prisma.product.findFirst({ where: { tenantId, sku: row.sku } })
          : row.barcode
          ? await this.prisma.product.findFirst({ where: { tenantId, barcode: row.barcode } })
          : null;

        if (existing) {
          await this.prisma.product.update({
            where: { id: existing.id },
            data: {
              name: row.name,
              sellPrice: row.price,
              costPrice: row.costPrice ?? existing.costPrice,
              minStockLevel: row.minStock ?? existing.minStockLevel,
              ...(unitId && { unitId }),
              ...(categoryId && { categoryId }),
              ...(row.description !== undefined && { description: row.description }),
            },
          });
          updated++;
        } else {
          await this.prisma.product.create({
            data: {
              tenantId,
              name: row.name,
              sku: row.sku ?? null,
              barcode: row.barcode ?? null,
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Qator ${i + 2}: ${msg}`);
        this.logger.warn(`Import error row ${i + 2}: ${msg}`);
      }
    }

    this.logger.log(`Import done tenantId=${tenantId}: created=${created}, updated=${updated}, errors=${errors.length}`);
    return { created, updated, errors };
  }

  // ─── EXPORT ────────────────────────────────────────────────────

  async exportToXlsx(tenantId: string): Promise<Buffer> {
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      include: { unit: true, category: true },
      orderBy: { name: 'asc' },
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Mahsulotlar');

    ws.columns = [
      { header: 'Nomi', key: 'name', width: 30 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Barkod', key: 'barcode', width: 15 },
      { header: 'Narx (so\'m)', key: 'price', width: 15 },
      { header: 'Tannarx', key: 'costPrice', width: 15 },
      { header: 'O\'lchov', key: 'unit', width: 10 },
      { header: 'Kategoriya', key: 'category', width: 20 },
      { header: 'Min zaxira', key: 'minStock', width: 12 },
    ];

    // Style header row
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9EAD3' },
    };

    for (const p of products) {
      ws.addRow({
        name: p.name,
        sku: p.sku ?? '',
        barcode: p.barcode ?? '',
        price: Number(p.sellPrice),
        costPrice: Number(p.costPrice),
        unit: p.unit?.name ?? '',
        category: p.category?.name ?? '',
        minStock: Number(p.minStockLevel),
      });
    }

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf as ArrayBuffer);
  }

  async exportToCsv(tenantId: string): Promise<string> {
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      include: { unit: true, category: true },
      orderBy: { name: 'asc' },
    });

    const header = ['name', 'sku', 'barcode', 'price', 'costPrice', 'unit', 'category', 'minStock'];
    const rows = products.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku ?? '',
      p.barcode ?? '',
      Number(p.sellPrice),
      Number(p.costPrice),
      p.unit?.name ?? '',
      `"${(p.category?.name ?? '').replace(/"/g, '""')}"`,
      Number(p.minStockLevel),
    ].join(','));

    return [header.join(','), ...rows].join('\n');
  }

  // ─── INTERNAL ──────────────────────────────────────────────────

  private async parseBuffer(buffer: Buffer, mimeType: string): Promise<ProductRow[]> {
    if (mimeType === 'text/csv' || mimeType === 'text/plain') {
      return this.parseCsv(buffer.toString('utf-8'));
    }
    // XLSX
    const wb = new ExcelJS.Workbook();
    // ExcelJS expects its own Buffer type; cast via ArrayBuffer
    await wb.xlsx.load(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer);
    const ws = wb.worksheets[0];
    if (!ws) throw new BadRequestException('XLSX fayl bo\'sh');

    const headers: string[] = [];
    const rows: ProductRow[] = [];

    ws.eachRow((row, rowIndex) => {
      if (rowIndex === 1) {
        row.eachCell((cell) => headers.push(String(cell.value ?? '').toLowerCase().trim()));
        return;
      }
      const values: Record<string, string> = {};
      row.eachCell((cell, colNum) => {
        values[headers[colNum - 1]] = String(cell.value ?? '').trim();
      });
      rows.push(this.mapRow(values));
    });

    return rows;
  }

  private parseCsv(content: string): ProductRow[] {
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    return lines.slice(1).map((line) => {
      const values: Record<string, string> = {};
      const cells = line.split(',');
      headers.forEach((h, i) => { values[h] = (cells[i] ?? '').trim().replace(/^"|"$/g, ''); });
      return this.mapRow(values);
    });
  }

  private mapRow(v: Record<string, string>): ProductRow {
    const get = (keys: string[]) => keys.map((k) => v[k]).find((val) => val !== undefined && val !== '') ?? '';
    return {
      name: get(['name', 'nomi']),
      sku: v['sku'] || undefined,
      barcode: (v['barcode'] || v['barkod']) || undefined,
      price: parseFloat(get(['price', "narx (so'm)", 'narx']) || '0') || 0,
      costPrice: parseFloat(get(['costprice', 'tannarx']) || '0') || undefined,
      unit: (v['unit'] || v["o'lchov"]) || undefined,
      categoryName: (v['category'] || v['kategoriya']) || undefined,
      description: v['description'] || undefined,
      minStock: parseInt(get(['minstock', 'min zaxira']) || '0', 10) || undefined,
    };
  }

  private validateRow(row: ProductRow, lineNum: number) {
    if (!row.name) throw new Error(`name (nomi) majburiy`);
    if (isNaN(row.price) || row.price < 0) throw new Error(`narx noto'g'ri: ${row.price}`);
  }
}
