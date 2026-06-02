import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingInvoice } from '@prisma/client';
import PDFDocument from 'pdfkit';

@Injectable()
export class BillingInvoiceService {
  private readonly logger = new Logger(BillingInvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createInvoice(paymentId: string) {
    const payment = await this.prisma.billingPayment.findUnique({
      where: { id: paymentId },
      include: { plan: true, tenant: true },
    });
    if (!payment || payment.status !== 'PAID') return null;

    const existing = await this.prisma.billingInvoice.findUnique({
      where: { paymentId },
    });
    if (existing) return existing;

    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = await this.prisma.billingInvoice.create({
      data: {
        invoiceNumber,
        tenantId: payment.tenantId,
        paymentId: payment.id,
        planName: payment.plan.name,
        planSlug: payment.plan.slug,
        months: payment.months,
        amount: payment.amount,
        provider: payment.provider,
        companyName: payment.tenant.name,
        companyStir: payment.tenant.stir ?? null,
      },
    });

    this.logger.log(`Invoice created: ${invoiceNumber} tenant=${payment.tenantId} amount=${payment.amount}`);
    return invoice;
  }

  async getInvoicesByTenant(tenantId: string) {
    return this.prisma.billingInvoice.findMany({
      where: { tenantId },
      orderBy: { issuedAt: 'desc' },
      take: 50,
    });
  }

  async getInvoice(id: string) {
    const invoice = await this.prisma.billingInvoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async getInvoiceByNumber(invoiceNumber: string) {
    const invoice = await this.prisma.billingInvoice.findUnique({ where: { invoiceNumber } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  generatePdf(invoice: BillingInvoice): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('TEZ KOD MCHJ', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('STIR: 313057467 | tezcode@tezcode.dev', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
    doc.moveDown();

    // Invoice title
    doc.fontSize(16).font('Helvetica-Bold').text('INVOICE / HISOB-FAKTURA', { align: 'center' });
    doc.moveDown();

    // Invoice details
    const detailsTop = doc.y;
    doc.fontSize(10).font('Helvetica');

    doc.font('Helvetica-Bold').text('Invoice:', 50, detailsTop);
    doc.font('Helvetica').text(invoice.invoiceNumber, 160, detailsTop);

    doc.font('Helvetica-Bold').text('Sana:', 50, detailsTop + 18);
    doc.font('Helvetica').text(invoice.issuedAt.toLocaleDateString('uz-UZ'), 160, detailsTop + 18);

    doc.font('Helvetica-Bold').text('Mijoz:', 50, detailsTop + 36);
    doc.font('Helvetica').text(invoice.companyName ?? '-', 160, detailsTop + 36);

    if (invoice.companyStir) {
      doc.font('Helvetica-Bold').text('STIR:', 50, detailsTop + 54);
      doc.font('Helvetica').text(invoice.companyStir, 160, detailsTop + 54);
    }

    doc.font('Helvetica-Bold').text("To'lov usuli:", 350, detailsTop);
    doc.font('Helvetica').text(invoice.provider, 440, detailsTop);

    doc.moveDown(5);

    // Table header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.rect(50, tableTop, 495, 22).fill('#f0f0f0').stroke('#cccccc');
    doc.fillColor('#000000');
    doc.text('#', 55, tableTop + 6, { width: 30 });
    doc.text('Tavsif', 90, tableTop + 6, { width: 200 });
    doc.text('Muddat', 295, tableTop + 6, { width: 80 });
    doc.text('Summa', 420, tableTop + 6, { width: 120, align: 'right' });

    // Table row
    const rowTop = tableTop + 24;
    doc.font('Helvetica').fontSize(10);
    doc.rect(50, rowTop, 495, 24).stroke('#cccccc');
    doc.text('1', 55, rowTop + 7, { width: 30 });
    doc.text(`${invoice.planName} tarif rejasi`, 90, rowTop + 7, { width: 200 });
    doc.text(`${invoice.months} oy`, 295, rowTop + 7, { width: 80 });

    const amount = Number(invoice.amount);
    doc.text(`${amount.toLocaleString('uz-UZ')} so'm`, 420, rowTop + 7, { width: 120, align: 'right' });

    // Total
    const totalTop = rowTop + 30;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text("Jami:", 350, totalTop);
    doc.text(`${amount.toLocaleString('uz-UZ')} so'm`, 420, totalTop, { width: 120, align: 'right' });

    // Footer
    doc.moveDown(4);
    doc.fontSize(9).font('Helvetica').fillColor('#666666');
    doc.text('Bu hujjat TEZ KOD MCHJ tomonidan avtomatik yaratilgan.', 50, undefined, { align: 'center' });
    doc.text('https://tezcode.dev | https://raos.uz', { align: 'center' });

    doc.end();
    return doc;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `INV-RAOS-${yearMonth}-`;

    const last = await this.prisma.billingInvoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
    });

    let seq = 1;
    if (last) {
      const lastSeq = parseInt(last.invoiceNumber.slice(prefix.length), 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(5, '0')}`;
  }
}
