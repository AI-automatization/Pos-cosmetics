import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingProvider } from '@prisma/client';

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
