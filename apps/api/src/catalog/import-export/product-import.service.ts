/**
 * T-130 + #104: Product bulk import/export (CSV / XLSX)
 * Import: parse file → delegate to @raos/catalog-import engine
 * Export: fetch products → generate XLSX/CSV
 */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { processImportRows } from '@raos/catalog-import';
import type { ProductImportRow, ImportSummary } from '@raos/catalog-import';

@Injectable()
export class ProductImportService {
  private readonly logger = new Logger(ProductImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── IMPORT ────────────────────────────────────────────────────

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

  // ─── TEMPLATE ──────────────────────────────────────────────────

  async generateTemplate(): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Import shablon');
    ws.columns = [
      { header: "Nomi", key: 'name', width: 30 },
      { header: "SKU", key: 'sku', width: 15 },
      { header: "Barkod", key: 'barcode', width: 15 },
      { header: "Narx (so'm)", key: 'price', width: 15 },
      { header: "Tannarx", key: 'costPrice', width: 15 },
      { header: "O'lchov", key: 'unit', width: 10 },
      { header: "Kategoriya", key: 'category', width: 20 },
      { header: "Min zaxira", key: 'minStock', width: 12 },
    ];
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
    // Example rows
    ws.addRow({ name: "Chanel No.5 100ml", sku: 'CH-N5-100', barcode: '3145891255300', price: 1200000, costPrice: 850000, unit: 'dona', category: 'Kosmetika', minStock: 5 });
    ws.addRow({ name: "Nivea Cream 300ml", sku: 'NIV-300', barcode: '', price: 58000, costPrice: 38000, unit: 'dona', category: 'Kosmetika', minStock: 20 });
    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf as ArrayBuffer);
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

  private async parseBuffer(buffer: Buffer, mimeType: string): Promise<ProductImportRow[]> {
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
    const rows: ProductImportRow[] = [];

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

  private parseCsv(content: string): ProductImportRow[] {
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = this.parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
    return lines.slice(1).map((line) => {
      const values: Record<string, string> = {};
      const cells = this.parseCsvLine(line);
      headers.forEach((h, i) => { values[h] = (cells[i] ?? '').trim(); });
      return this.mapRow(values);
    });
  }

  /** RFC-4180 compliant CSV line parser — handles quoted fields with commas and escaped quotes */
  private parseCsvLine(line: string): string[] {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { current += '"'; i++; } // escaped ""
          else inQuotes = false;
        } else {
          current += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        cells.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current);
    return cells;
  }

  private mapRow(v: Record<string, string>): ProductImportRow {
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
}
