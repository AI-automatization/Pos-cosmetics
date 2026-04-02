import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from './reports.service';

export type PdfReportType = 'daily-revenue' | 'pnl' | 'z-report' | 'tax-report';

export interface PdfResult {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

// ─── HTML → PDF fallback ────────────────────────────────────────────────────────
function buildHtmlReport(title: string, meta: string[], sections: { heading: string; rows: string[][] }[]): Buffer {
  const tableHtml = sections.map((s) => `
    <h3>${s.heading}</h3>
    <table>
      <tbody>
        ${s.rows.map((r) => `<tr>${r.map((c, i) => i === 0 ? `<td class="label">${c}</td>` : `<td>${c}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>${title}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;margin:24px;color:#111}
  h1{font-size:16px;margin-bottom:4px}
  .meta{color:#555;font-size:10px;margin-bottom:16px}
  h3{font-size:12px;margin:16px 0 4px;border-bottom:1px solid #ccc;padding-bottom:2px}
  table{border-collapse:collapse;width:100%;margin-bottom:8px}
  td{padding:4px 8px;border:1px solid #ddd;font-size:11px}
  td.label{font-weight:bold;background:#f5f5f5;width:180px}
  @media print{body{margin:8mm}@page{size:A4;margin:12mm}}
</style></head><body>
<h1>${title}</h1>
<div class="meta">${meta.join(' &nbsp;|&nbsp; ')}</div>
${tableHtml}
</body></html>`;

  return Buffer.from(html, 'utf-8');
}

// ─── PdfExportService ────────────────────────────────────────────────────────
@Injectable()
export class PdfExportService {
  private readonly logger = new Logger(PdfExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reports: ReportsService,
  ) {}

  async exportPdf(
    tenantId: string,
    reportType: PdfReportType,
    opts: { from?: string; to?: string; date?: string },
  ): Promise<PdfResult> {
    const fromDate = opts.from ? new Date(opts.from) : new Date(new Date().setDate(1));
    const toDate = opts.to ? new Date(opts.to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, inn: true },
    });

    const shopName = tenant?.name ?? 'Do\'kon';
    const inn = (tenant as unknown as Record<string, string | null>)?.inn ?? '';
    const generatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const periodStr = `${fromDate.toISOString().slice(0, 10)} — ${toDate.toISOString().slice(0, 10)}`;

    const htmlMeta = [
      shopName,
      inn ? `INN: ${inn}` : null,
      `Davr: ${periodStr}`,
      `Yaratildi: ${generatedAt}`,
    ].filter(Boolean) as string[];

    switch (reportType) {
      case 'daily-revenue': return this.buildDailyRevenuePdf(tenantId, fromDate, toDate, shopName, htmlMeta);
      case 'pnl':           return this.buildPnlPdf(tenantId, fromDate, toDate, shopName, htmlMeta);
      case 'z-report':      return this.buildZReportPdf(tenantId, shopName, htmlMeta);
      case 'tax-report':    return this.buildTaxReportPdf(tenantId, fromDate, toDate, shopName, htmlMeta);
      default:
        throw new Error(`Unknown report type: ${String(reportType)}`);
    }
  }

  // ─── DAILY REVENUE ────────────────────────────────────────────────────────

  private async buildDailyRevenuePdf(
    tenantId: string,
    from: Date,
    to: Date,
    shopName: string,
    meta: string[],
  ): Promise<PdfResult> {
    const rows = await this.reports.getDailyRevenue(tenantId, from, to);
    const dataRows = rows.map((r: Record<string, unknown>) => [
      String(r['date'] ?? ''),
      this.fmt(Number(r['revenue'] ?? 0)),
      String(r['orderCount'] ?? '0'),
      this.fmt(Number(r['avgCheck'] ?? 0)),
      this.fmt(Number(r['returns'] ?? 0)),
    ]);

    const totalRevenue = rows.reduce((s: number, r: Record<string, unknown>) => s + Number(r['revenue'] ?? 0), 0);

    const sections = [
      {
        heading: 'Kunlik daromad (UZS)',
        rows: [
          ['Sana', 'Daromad', 'Buyurtmalar', "O'rtacha chek", 'Qaytarishlar'],
          ...dataRows,
          ['JAMI', this.fmt(totalRevenue), '', '', ''],
        ],
      },
    ];

    this.logger.log(`[PDF] daily-revenue: ${rows.length} rows`, { tenantId });
    return this.toResult(`${shopName} — Kunlik daromad`, meta, sections, 'kunlik-daromad');
  }

  // ─── P&L ─────────────────────────────────────────────────────────────────

  private async buildPnlPdf(
    tenantId: string,
    from: Date,
    to: Date,
    shopName: string,
    meta: string[],
  ): Promise<PdfResult> {
    const pnl = await this.reports.getProfitEstimate(tenantId, from, to);
    const p = pnl as Record<string, unknown>;

    const sections = [
      {
        heading: "Foyda va Zarar (P&L)",
        rows: [
          ["Yalpi daromad (Revenue)", this.fmt(Number(p['revenue'] ?? 0))],
          ["Tovar tannarxi (COGS)", this.fmt(Number(p['cogs'] ?? 0))],
          ["Yalpi foyda (Gross Profit)", this.fmt(Number(p['grossProfit'] ?? 0))],
          ["Qaytarishlar (Returns)", this.fmt(Number(p['returns'] ?? 0))],
          ["Chegirmalar (Discounts)", this.fmt(Number(p['discounts'] ?? 0))],
          ["Sof foyda (Net Profit)", this.fmt(Number(p['netProfit'] ?? 0))],
          ["Foyda marjasi (%)", `${Number(p['margin'] ?? 0).toFixed(1)} %`],
        ],
      },
    ];

    this.logger.log('[PDF] pnl generated', { tenantId });
    return this.toResult(`${shopName} — Foyda va Zarar (P&L)`, meta, sections, 'pnl');
  }

  // ─── Z-REPORT ─────────────────────────────────────────────────────────────

  private async buildZReportPdf(
    tenantId: string,
    shopName: string,
    meta: string[],
  ): Promise<PdfResult> {
    const zReports = await this.reports.getZReports(tenantId, 10);
    const zArr = zReports as Record<string, unknown>[];

    const sections = zArr.map((z) => ({
      heading: `Z-hisobot: ${String(z['date'] ?? '')}`,
      rows: [
        ['Sana', String(z['date'] ?? '')],
        ['Jami savdo (UZS)', this.fmt(Number(z['totalRevenue'] ?? 0))],
        ['Buyurtmalar soni', String(z['orderCount'] ?? '0')],
        ['Naqd (UZS)', this.fmt(Number(z['cashTotal'] ?? 0))],
        ['Karta (UZS)', this.fmt(Number(z['cardTotal'] ?? 0))],
        ['Qaytarishlar (UZS)', this.fmt(Number(z['returnTotal'] ?? 0))],
        ['Status', String(z['status'] ?? '')],
      ],
    }));

    if (sections.length === 0) {
      sections.push({ heading: 'Z-hisobotlar', rows: [["Ma'lumot yo'q", '']] });
    }

    this.logger.log(`[PDF] z-report: ${zArr.length} reports`, { tenantId });
    return this.toResult(`${shopName} — Z-hisobotlar`, meta, sections, 'z-report');
  }

  // ─── TAX REPORT ──────────────────────────────────────────────────────────

  private async buildTaxReportPdf(
    tenantId: string,
    from: Date,
    to: Date,
    shopName: string,
    meta: string[],
  ): Promise<PdfResult> {
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: from, lte: to },
        status: { not: 'VOIDED' },
      },
      select: { total: true, taxAmount: true, discountAmount: true },
    });

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const totalTax = orders.reduce((s, o) => s + Number(o.taxAmount), 0);
    const totalDiscount = orders.reduce((s, o) => s + Number(o.discountAmount), 0);
    const taxableBase = totalRevenue - totalDiscount;
    const taxRate = taxableBase > 0 ? ((totalTax / taxableBase) * 100).toFixed(2) : '0.00';

    const sections = [
      {
        heading: 'Soliq hisoboti (QQS)',
        rows: [
          ['Jami savdo (UZS)', this.fmt(totalRevenue)],
          ['Chegirmalar (UZS)', this.fmt(totalDiscount)],
          ['Soliq bazasi (UZS)', this.fmt(taxableBase)],
          ['QQS miqdori (UZS)', this.fmt(totalTax)],
          ['QQS stavkasi (%)', `${taxRate} %`],
          ['Buyurtmalar soni', String(orders.length)],
        ],
      },
    ];

    this.logger.log(`[PDF] tax-report: ${orders.length} orders`, { tenantId });
    return this.toResult(`${shopName} — Soliq hisoboti`, meta, sections, 'soliq-hisobot');
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private fmt(n: number): string {
    return n.toLocaleString('uz-UZ');
  }

  private toResult(
    title: string,
    meta: string[],
    sections: { heading: string; rows: string[][] }[],
    _filenameHint: string,
  ): PdfResult {
    const buffer = buildHtmlReport(title, meta, sections);
    return {
      buffer,
      contentType: 'text/html; charset=utf-8',
      extension: 'html',
    };
  }
}
