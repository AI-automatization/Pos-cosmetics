import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from './billing.service';
import { BillingProvider, BillingPaymentStatus } from '@prisma/client';
import { timingSafeEqual, createHash } from 'node:crypto';

@Injectable()
export class BillingPaymentService {
  private readonly logger = new Logger(BillingPaymentService.name);

  // Tezcode platform merchant credentials (NOT tenant credentials)
  private readonly paymeMerchantId: string;
  private readonly paymeSecretKey: string;
  private readonly clickServiceId: string;
  private readonly clickMerchantId: string;
  private readonly clickSecretKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly billingService: BillingService,
  ) {
    this.paymeMerchantId = this.config.get<string>('PAYME_BILLING_MERCHANT_ID', '');
    this.paymeSecretKey = this.config.get<string>('PAYME_BILLING_SECRET_KEY', '');
    this.clickServiceId = this.config.get<string>('CLICK_BILLING_SERVICE_ID', '');
    this.clickMerchantId = this.config.get<string>('CLICK_BILLING_MERCHANT_ID', '');
    this.clickSecretKey = this.config.get<string>('CLICK_BILLING_SECRET_KEY', '');
    this.baseUrl = this.config.get<string>('APP_BASE_URL', 'https://app.raos.uz');
  }

  // ─── CHECKOUT ────────────────────────────────────────────────────────────

  async createCheckout(tenantId: string, planSlug: string, provider: BillingProvider, months = 1) {
    const plan = await this.billingService.getPlanBySlug(planSlug);
    const amount = Number(plan.priceMonthly) * months;

    if (amount <= 0) {
      throw new BadRequestException('Free plan does not require payment');
    }

    const payment = await this.prisma.billingPayment.create({
      data: {
        tenantId,
        planId: plan.id,
        months,
        amount,
        provider,
        status: 'PENDING',
      },
    });

    let checkoutUrl: string;
    if (provider === 'PAYME') {
      checkoutUrl = this.buildPaymeCheckoutUrl(payment.id, amount);
    } else if (provider === 'CLICK') {
      checkoutUrl = this.buildClickCheckoutUrl(payment.id, amount);
    } else {
      throw new BadRequestException(`Provider ${provider} checkout not supported yet`);
    }

    await this.prisma.billingPayment.update({
      where: { id: payment.id },
      data: { checkoutUrl },
    });

    this.logger.log(`Billing checkout created: tenant=${tenantId} plan=${planSlug} amount=${amount} provider=${provider}`);

    return {
      paymentId: payment.id,
      checkoutUrl,
      amount,
      provider,
    };
  }

  // ─── PAYME WEBHOOK ───────────────────────────────────────────────────────

  verifyPaymeAuth(authHeader: string): boolean {
    if (!this.paymeSecretKey || !authHeader) return false;
    const expected = `Basic ${Buffer.from(`Paycom:${this.paymeSecretKey}`).toString('base64')}`;
    const a = Buffer.from(authHeader);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  async handlePaymeMethod(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
    const account = params.account as { order_id?: string } | undefined;
    const paymentId = account?.order_id;

    if (method === 'CheckPerformTransaction') {
      if (!paymentId) return { error: { code: -31050, message: 'Order not found' } };
      const payment = await this.prisma.billingPayment.findUnique({ where: { id: paymentId } });
      if (!payment) return { error: { code: -31050, message: 'Order not found' } };
      if (payment.status !== 'PENDING') return { error: { code: -31008, message: 'Order not available' } };
      return { result: { allow: true } };
    }

    if (method === 'CreateTransaction') {
      if (!paymentId) return { error: { code: -31050, message: 'Order not found' } };
      const payment = await this.prisma.billingPayment.findUnique({ where: { id: paymentId } });
      if (!payment) return { error: { code: -31050, message: 'Order not found' } };

      const txId = params.id as string;
      await this.prisma.billingPayment.update({
        where: { id: paymentId },
        data: { providerTxId: txId },
      });

      return {
        result: {
          create_time: Date.now(),
          transaction: txId,
          state: 1,
        },
      };
    }

    if (method === 'PerformTransaction') {
      const txId = params.id as string;
      const payment = await this.prisma.billingPayment.findFirst({
        where: { providerTxId: txId },
      });

      if (!payment) return { error: { code: -31003, message: 'Transaction not found' } };

      if (payment.status === 'PAID') {
        return { result: { transaction: txId, perform_time: payment.paidAt?.getTime(), state: 2 } };
      }

      await this.settlePayment(payment.id);

      return {
        result: {
          transaction: txId,
          perform_time: Date.now(),
          state: 2,
        },
      };
    }

    if (method === 'CancelTransaction') {
      const txId = params.id as string;
      const payment = await this.prisma.billingPayment.findFirst({ where: { providerTxId: txId } });
      if (!payment) return { error: { code: -31003, message: 'Transaction not found' } };

      await this.prisma.billingPayment.update({
        where: { id: payment.id },
        data: { status: 'CANCELLED', failReason: 'Cancelled by provider' },
      });

      return { result: { transaction: txId, cancel_time: Date.now(), state: -1 } };
    }

    if (method === 'CheckTransaction') {
      const txId = params.id as string;
      const payment = await this.prisma.billingPayment.findFirst({ where: { providerTxId: txId } });
      if (!payment) return { error: { code: -31003, message: 'Transaction not found' } };

      const state = payment.status === 'PAID' ? 2 : payment.status === 'CANCELLED' ? -1 : 1;
      return { result: { transaction: txId, state, create_time: payment.createdAt.getTime() } };
    }

    return { error: { code: -32601, message: 'Method not found' } };
  }

  // ─── CLICK WEBHOOK ───────────────────────────────────────────────────────

  verifyClickSign(body: Record<string, unknown>): boolean {
    if (!this.clickSecretKey) return false;
    const signString = [
      body.click_trans_id,
      body.service_id,
      this.clickSecretKey,
      body.merchant_trans_id,
      body.amount,
      body.action,
      body.sign_time,
    ].join('');
    const expected = createHash('md5').update(signString).digest('hex');
    const provided = String(body.sign_string ?? '');
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  async handleClickPrepare(body: Record<string, unknown>) {
    const paymentId = String(body.merchant_trans_id ?? '');
    const payment = await this.prisma.billingPayment.findUnique({ where: { id: paymentId } });

    if (!payment || payment.status !== 'PENDING') {
      return { error: -5, error_note: 'Order not found or not available' };
    }

    await this.prisma.billingPayment.update({
      where: { id: paymentId },
      data: { providerTxId: String(body.click_trans_id) },
    });

    return {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: paymentId,
      merchant_prepare_id: payment.id,
      error: 0,
      error_note: 'Success',
    };
  }

  async handleClickComplete(body: Record<string, unknown>) {
    const paymentId = String(body.merchant_trans_id ?? '');
    const payment = await this.prisma.billingPayment.findUnique({ where: { id: paymentId } });

    if (!payment) return { error: -5, error_note: 'Order not found' };

    const action = Number(body.action);
    if (action === 0) {
      await this.settlePayment(payment.id);
      return {
        click_trans_id: body.click_trans_id,
        merchant_trans_id: paymentId,
        merchant_confirm_id: payment.id,
        error: 0,
        error_note: 'Success',
      };
    }

    await this.prisma.billingPayment.update({
      where: { id: payment.id },
      data: { status: 'CANCELLED', failReason: `Click action=${action}` },
    });
    return { error: -9, error_note: 'Transaction cancelled' };
  }

  // ─── SETTLEMENT (shared) ─────────────────────────────────────────────────

  private async settlePayment(paymentId: string) {
    const payment = await this.prisma.billingPayment.findUnique({
      where: { id: paymentId },
      include: { plan: true },
    });
    if (!payment || payment.status === 'PAID') return;

    await this.prisma.billingPayment.update({
      where: { id: paymentId },
      data: { status: 'PAID', paidAt: new Date() },
    });

    await this.billingService.upgradePlan(payment.tenantId, payment.plan.slug, payment.months);

    this.logger.log(
      `BILLING PAID: tenant=${payment.tenantId} plan=${payment.plan.name} months=${payment.months} amount=${payment.amount} provider=${payment.provider}`,
    );
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  private buildPaymeCheckoutUrl(orderId: string, amount: number): string {
    const amountTiyin = amount * 100;
    const params = Buffer.from(
      `m=${this.paymeMerchantId};ac.order_id=${orderId};a=${amountTiyin};c=${this.baseUrl}/billing/success`,
    ).toString('base64');
    return `https://checkout.paycom.uz/${params}`;
  }

  private buildClickCheckoutUrl(orderId: string, amount: number): string {
    return `https://my.click.uz/services/pay?service_id=${this.clickServiceId}&merchant_id=${this.clickMerchantId}&amount=${amount}&transaction_param=${orderId}&return_url=${this.baseUrl}/billing/success`;
  }

  // ─── PAYMENT HISTORY ─────────────────────────────────────────────────────

  async getPaymentHistory(tenantId: string) {
    return this.prisma.billingPayment.findMany({
      where: { tenantId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getPayment(id: string) {
    const payment = await this.prisma.billingPayment.findUnique({
      where: { id },
      include: { plan: true, tenant: { select: { id: true, name: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
