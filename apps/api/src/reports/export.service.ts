import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type ExportFormat = 'csv' | 'xlsx';

export interface ExportResult {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

// ─── Native CSV builder (no external deps) ────────────────────────────────────
function buildCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
): Buffer {
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    const s = String(val);
    // Wrap in quotes if contains comma, quote, or newline
    if (/[,"\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };

  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];

  // BOM (0xEFBBBF) so Excel opens UTF-8 correctly
  return Buffer.concat([Buffer.from('\uFEFF', 'utf-8'), Buffer.from(lines.join('\r\n'), 'utf-8')]);
}

// ─── Optional XLSX builder (exceljs) ─────────────────────────────────────────
async function buildXlsx(
  headers: string[],
  rows: (string | number | null | undefined)[][],
  logger: Logger,
): Promise<Buffer | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ExcelJS: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ExcelJS = require('exceljs');
  } catch {
    logger.warn('[Export] exceljs not installed — falling back to CSV');
    return null;
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'RAOS';
  const ws = wb.addWorksheet('Data');

  ws.addRow(headers);
  const hRow = ws.getRow(1);
  hRow.font = { bold: true };
  hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  hRow.border = {
    bottom: { style: 'thin', color: { argb: 'FF999999' } },
  };

  for (const row of rows) {
    ws.addRow(row);
  }

  // Auto-width
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ws.columns.forEach((col: any) => {
    let maxLen = 10;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    col.eachCell({ includeEmpty: true }, (cell: any) => {
      const val = cell.value ? String(cell.value) : '';
      maxLen = Math.max(maxLen, val.length);
    });
    col.width = Math.min(maxLen + 2, 60);
  });

  return wb.xlsx.writeBuffer() as Promise<Buffer>;
}

// ─── ExportService ────────────────────────────────────────────────────────────

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Generic file builder ────────────────────────────────────────────────

  async buildFile(
    headers: string[],
    rows: (string | number | null | undefined)[][],
    format: ExportFormat,
  ): Promise<ExportResult> {
    if (format === 'xlsx') {
      const xlsxBuf = await buildXlsx(headers, rows, this.logger);
      if (xlsxBuf) {
        return {
          buffer: xlsxBuf as Buffer,
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          extension: 'xlsx',
        };
      }
    }

    return {
      buffer: buildCsv(headers, rows),
      contentType: 'text/csv; charset=utf-8',
      extension: 'csv',
    };
  }

  // ─── SALES export ─────────────────────────────────────────────────────────

  async exportSales(
    tenantId: string,
    from: Date,
    to: Date,
    format: ExportFormat,
  ): Promise<ExportResult> {
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: from, lte: to },
        status: { not: 'VOIDED' },
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50_000,
    });

    const headers = [
      'Tartib#', 'Sana', 'Kassir', 'Filial', 'Jami (UZS)',
      'Chegirma (UZS)', 'Soliq (UZS)', 'Status',
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt.toISOString().slice(0, 19).replace('T', ' '),
      o.user ? `${o.user.firstName} ${o.user.lastName}` : '',
      o.branch?.name ?? '',
      Number(o.total),
      Number(o.discountAmount),
      Number(o.taxAmount),
      o.status,
    ]);

    this.logger.log(`[Export] Sales: ${orders.length} rows, ${format}`, { tenantId });
    return this.buildFile(headers, rows, format);
  }

  // ─── ORDER ITEMS export ───────────────────────────────────────────────────

  async exportOrderItems(
    tenantId: string,
    from: Date,
    to: Date,
    format: ExportFormat,
  ): Promise<ExportResult> {
    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          tenantId,
          createdAt: { gte: from, lte: to },
          status: { not: 'VOIDED' },
        },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            status: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { order: { createdAt: 'desc' } },
      take: 100_000,
    });

    const headers = [
      'Buyurtma#', 'Sana', 'Kassir', 'Mahsulot', 'Miqdor',
      'Birlik narxi (UZS)', 'Chegirma (UZS)', 'Jami (UZS)',
    ];

    const rows = items.map((i) => [
      i.order.orderNumber,
      i.order.createdAt.toISOString().slice(0, 19).replace('T', ' '),
      i.order.user ? `${i.order.user.firstName} ${i.order.user.lastName}` : '',
      i.productName,
      Number(i.quantity),
      Number(i.unitPrice),
      Number(i.discountAmount),
      Number(i.total),
    ]);

    this.logger.log(`[Export] OrderItems: ${items.length} rows, ${format}`, { tenantId });
    return this.buildFile(headers, rows, format);
  }

  // ─── PRODUCTS export ──────────────────────────────────────────────────────

  async exportProducts(tenantId: string, format: ExportFormat): Promise<ExportResult> {
    const products = await this.prisma.product.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        category: { select: { name: true } },
        unit: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    const headers = [
      'ID', 'Nomi', 'SKU', 'Barcode', 'Kategoriya', 'Birlik',
      'Sotish narxi (UZS)', 'Tan narxi (UZS)', 'Min qoldiq',
      'Valyuta', 'Aktiv', 'Muddati kuzatiladimi',
    ];

    const rows = products.map((p) => [
      p.id,
      p.name,
      p.sku ?? '',
      p.barcode ?? '',
      p.category?.name ?? '',
      p.unit?.name ?? '',
      Number(p.sellPrice),
      Number(p.costPrice),
      p.minStockLevel,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p as any).costCurrency ?? 'UZS',
      p.isActive ? 'Ha' : "Yo'q",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p as any).expiryTracking ? 'Ha' : "Yo'q",
    ]);

    this.logger.log(`[Export] Products: ${products.length} rows, ${format}`, { tenantId });
    return this.buildFile(headers, rows, format);
  }

  // ─── INVENTORY (stock levels) export ─────────────────────────────────────

  async exportInventory(tenantId: string, format: ExportFormat): Promise<ExportResult> {
    type StockRow = {
      productId: string;
      productName: string;
      sku: string | null;
      warehouseName: string;
      stock: number;
    };

    const rows = await this.prisma.$queryRaw<StockRow[]>`
      SELECT
        p.id::text               AS "productId",
        p.name                   AS "productName",
        p.sku                    AS sku,
        w.name                   AS "warehouseName",
        COALESCE(SUM(CASE
          WHEN sm.type::text IN ('IN','RETURN_IN','TRANSFER_IN','ADJUSTMENT') THEN sm.quantity
          WHEN sm.type::text IN ('OUT','TRANSFER_OUT') THEN -sm.quantity
          ELSE 0
        END), 0)::float          AS stock
      FROM products p
      CROSS JOIN warehouses w
      LEFT JOIN stock_movements sm
        ON sm.product_id = p.id
       AND sm.warehouse_id = w.id
       AND sm.tenant_id = ${tenantId}
      WHERE p.tenant_id = ${tenantId}
        AND p.deleted_at IS NULL
        AND w.tenant_id = ${tenantId}
        AND w.is_active = true
      GROUP BY p.id, p.name, p.sku, w.name
      ORDER BY p.name ASC, w.name ASC
    `;

    const headers = ['Mahsulot ID', 'Mahsulot nomi', 'SKU', 'Ombor', 'Qoldiq (dona)'];
    const data = rows.map((r) => [
      r.productId,
      r.productName,
      r.sku ?? '',
      r.warehouseName,
      r.stock,
    ]);

    this.logger.log(`[Export] Inventory: ${rows.length} rows, ${format}`, { tenantId });
    return this.buildFile(headers, data, format);
  }

  // ─── CUSTOMERS export ────────────────────────────────────────────────────

  async exportCustomers(tenantId: string, format: ExportFormat): Promise<ExportResult> {
    const customers = await this.prisma.customer.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    const headers = [
      'ID', 'Ismi', 'Telefon', 'Qarz (UZS)', 'Jami xaridlar (UZS)',
      "Tashriflar soni", "So'nggi tashrif", "Qarz limiti (UZS)", 'Bloklangan',
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (customers as any[]).map((c) => [
      c.id,
      c.name,
      c.phone ?? '',
      Number(c.debtBalance ?? 0),
      Number(c.totalPurchases ?? 0),
      c.visitCount ?? 0,
      c.lastVisitAt ? new Date(c.lastVisitAt).toISOString().slice(0, 10) : '',
      Number(c.debtLimit ?? 0),
      c.isBlocked ? 'Ha' : "Yo'q",
    ]);

    this.logger.log(`[Export] Customers: ${customers.length} rows, ${format}`, { tenantId });
    return this.buildFile(headers, rows, format);
  }

  // ─── DEBTS export ─────────────────────────────────────────────────────────

  async exportDebts(tenantId: string, format: ExportFormat): Promise<ExportResult> {
    const debts = await this.prisma.debtRecord.findMany({
      where: { tenantId },
      include: {
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'ID', 'Xaridor', 'Telefon', "Qarz summasi (UZS)", "To'langan (UZS)",
      'Qoldi (UZS)', "To'lov muddati", 'Status', 'Eslatma',
    ];

    const rows = debts.map((d) => [
      d.id,
      d.customer?.name ?? '',
      d.customer?.phone ?? '',
      Number(d.totalAmount),
      Number(d.paidAmount),
      Number(d.remaining),
      d.dueDate?.toISOString().slice(0, 10) ?? '',
      d.status,
      d.notes ?? '',
    ]);

    this.logger.log(`[Export] Debts: ${debts.length} rows, ${format}`, { tenantId });
    return this.buildFile(headers, rows, format);
  }
}
