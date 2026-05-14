import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from '../payments.service';
import { PaymentMethod, Prisma } from '@prisma/client';
import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * T-395: Click to'lov tizimi adapteri — real business logic
 * Hujjat: https://docs.click.uz/
 *
 * Click flow:
 *   1. Prepare: order tekshirish → PaymentIntent yaratish
 *   2. Complete: to'lov natijasi → PaymentIntent settle/fail
 *
 * Click error codes:
 *   0  = Success
 *  -1  = SIGN CHECK FAILED
 *  -2  = Incorrect parameter amount
 *  -4  = Already paid
 *  -5  = Order not found
 *  -6  = Transaction does not exist
 *  -9  = Transaction cancelled
 */

const PII_FIELDS = ['card_number', 'card_num', 'pan', 'phone', 'email'];

function sanitizeForLog(body: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (PII_FIELDS.some((pii) => k.toLowerCase().includes(pii))) {
      clean[k] = '[REDACTED]';
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

export interface ClickWebhookBody {
  click_trans_id: string;
  service_id: string;
  click_paydoc_id?: string;
  merchant_trans_id: string;  // our orderId
  merchant_prepare_id?: string; // PaymentIntent ID (from Prepare response)
  amount: string;
  action: string; // 0=prepare, 1=complete
  error: number;
  error_note: string;
  sign_time: string;
  sign_string: string;
}

export interface ClickResponse {
  click_trans_id: string;
  merchant_trans_id: string;
  merchant_prepare_id?: string | null;
  merchant_confirm_id?: string | null;
  error: number;
  error_note: string;
}

@Injectable()
export class ClickProvider {
  private readonly logger = new Logger(ClickProvider.name);
  readonly name = 'CLICK';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  private get serviceId(): string {
    return this.config.get('CLICK_SERVICE_ID', '');
  }

  private get merchantId(): string {
    return this.config.get('CLICK_MERCHANT_ID', '');
  }

  private get secretKey(): string {
    return this.config.get('CLICK_SECRET_KEY', '');
  }

  private get isConfigured(): boolean {
    return !!(this.serviceId && this.merchantId && this.secretKey);
  }

  /**
   * Click checkout URL yaratish
   */
  createCheckoutUrl(amount: number, orderId: string): string {
    if (!this.isConfigured) {
      this.logger.warn('CLICK_SERVICE_ID, CLICK_MERCHANT_ID yoki CLICK_SECRET_KEY sozlanmagan');
      return '';
    }

    const params = new URLSearchParams({
      service_id: this.serviceId,
      merchant_id: this.merchantId,
      amount: String(amount),
      transaction_param: orderId,
      return_url: this.config.get('APP_URL', 'https://raos.uz'),
    });

    return `https://my.click.uz/services/pay?${params.toString()}`;
  }

  /**
   * Click webhook signature tekshirish (MD5 + timingSafeEqual)
   */
  verifySignature(body: ClickWebhookBody): boolean {
    if (!this.isConfigured) return false;

    const parts = [
      String(body.click_trans_id ?? ''),
      this.serviceId,
      this.secretKey,
      String(body.merchant_trans_id ?? ''),
    ];

    if (String(body.action) === '1' && body.merchant_prepare_id) {
      parts.push(String(body.merchant_prepare_id));
    }

    parts.push(
      String(body.amount ?? ''),
      String(body.action ?? ''),
      String(body.sign_time ?? ''),
    );

    const raw = parts.join('');
    const expected = createHash('md5').update(raw).digest('hex');
    const received = String(body.sign_string ?? '');

    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(received);

    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  }

  // ─── Prepare: order validation + PaymentIntent creation ───

  async handlePrepare(body: ClickWebhookBody): Promise<ClickResponse> {
    const safeBody = sanitizeForLog(body as unknown as Record<string, unknown>);
    this.logger.log('Click Prepare', { body: safeBody });

    const clickTransId = String(body.click_trans_id);
    const orderId = String(body.merchant_trans_id);
    const amount = Number(body.amount);

    // Click error dan kelsa
    const clickError = Number(body.error ?? 0);
    if (clickError < 0) {
      this.logger.warn('Click Prepare — error from Click', { error: clickError });
      return this.clickResponse(clickTransId, orderId, { error: clickError, error_note: body.error_note || 'Error from Click' });
    }

    // Idempotency: bu click_trans_id + prepare allaqachon processed?
    const idempotencyKey = `${clickTransId}:prepare`;
    const existing = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_externalTxId: { provider: 'CLICK', externalTxId: idempotencyKey } },
    });
    if (existing) {
      this.logger.log('Click Prepare — idempotent return', { clickTransId });
      const intentId = (existing.payload as Record<string, unknown>)?.paymentIntentId as string | undefined;
      return this.clickResponse(clickTransId, orderId, {
        merchant_prepare_id: intentId ?? orderId,
        error: 0,
        error_note: 'Success',
      });
    }

    // Order tekshirish
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, tenantId: true, total: true, status: true },
    });

    if (!order) {
      this.logger.warn('Click Prepare — order not found', { orderId });
      return this.clickResponse(clickTransId, orderId, { error: -5, error_note: 'Order not found' });
    }

    if (order.status === 'VOIDED' || order.status === 'RETURNED') {
      return this.clickResponse(clickTransId, orderId, { error: -9, error_note: 'Order cancelled' });
    }

    // Amount tekshiruv (Click so'm yuboradi)
    const expectedAmount = Number(order.total);
    if (Math.abs(amount - expectedAmount) > 0.01) {
      this.logger.warn('Click Prepare — amount mismatch', {
        orderId,
        expected: expectedAmount,
        received: amount,
      });
      return this.clickResponse(clickTransId, orderId, { error: -2, error_note: 'Incorrect amount' });
    }

    // Allaqachon to'langan?
    const settledPayment = await this.prisma.paymentIntent.findFirst({
      where: { orderId, tenantId: order.tenantId, provider: 'CLICK', status: 'SETTLED' },
    });
    if (settledPayment) {
      return this.clickResponse(clickTransId, orderId, { error: -4, error_note: 'Already paid' });
    }

    // PaymentIntent yaratish
    const intent = await this.paymentsService.createPaymentIntent(order.tenantId, {
      orderId,
      method: PaymentMethod.CLICK,
      amount: expectedAmount,
      provider: 'CLICK',
      providerRef: clickTransId,
    });

    // Webhook event saqlash (idempotency)
    await this.prisma.paymentWebhookEvent.create({
      data: {
        provider: 'CLICK',
        externalTxId: idempotencyKey,
        tenantId: order.tenantId,
        action: 'prepare',
        payload: { clickTransId, orderId, amount, paymentIntentId: intent.id } as Prisma.InputJsonValue,
      },
    });

    this.logger.log('Click Prepare — success', {
      clickTransId,
      orderId,
      intentId: intent.id,
      tenantId: order.tenantId,
    });

    return this.clickResponse(clickTransId, orderId, {
      merchant_prepare_id: intent.id,
      error: 0,
      error_note: 'Success',
    });
  }

  // ─── Complete: settle or fail PaymentIntent ───────────────

  async handleComplete(body: ClickWebhookBody): Promise<ClickResponse> {
    const safeBody = sanitizeForLog(body as unknown as Record<string, unknown>);
    this.logger.log('Click Complete', { body: safeBody });

    const clickTransId = String(body.click_trans_id);
    const orderId = String(body.merchant_trans_id);
    const intentId = body.merchant_prepare_id ? String(body.merchant_prepare_id) : null;
    const clickError = Number(body.error ?? 0);

    // Idempotency: bu click_trans_id + complete allaqachon processed?
    const idempotencyKey = `${clickTransId}:complete`;
    const existing = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_externalTxId: { provider: 'CLICK', externalTxId: idempotencyKey } },
    });
    if (existing) {
      this.logger.log('Click Complete — idempotent return', { clickTransId });
      const savedPayload = existing.payload as Record<string, unknown> | null;
      return this.clickResponse(clickTransId, orderId, {
        merchant_confirm_id: intentId,
        error: (savedPayload?.error as number) ?? 0,
        error_note: (savedPayload?.error_note as string) ?? 'Success',
      });
    }

    // Order tenantId aniqlash
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { tenantId: true },
    });
    const tenantId = order?.tenantId ?? null;

    // Cancelled by user
    if (clickError === -1) {
      this.logger.warn('Click Complete — user cancelled', { clickTransId, orderId });
      if (intentId && tenantId) {
        await this.failPaymentIntent(intentId);
      }
      await this.recordWebhookEvent(idempotencyKey, tenantId, 'complete', { clickTransId, orderId, error: -9, error_note: 'Transaction cancelled' });
      return this.clickResponse(clickTransId, orderId, { merchant_confirm_id: null, error: -9, error_note: 'Transaction cancelled' });
    }

    // Already paid
    if (clickError === -4) {
      this.logger.warn('Click Complete — already paid', { clickTransId, orderId });
      await this.recordWebhookEvent(idempotencyKey, tenantId, 'complete', { clickTransId, orderId, error: -4, error_note: 'Already paid' });
      return this.clickResponse(clickTransId, orderId, { merchant_confirm_id: intentId, error: -4, error_note: 'Already paid' });
    }

    // Other errors
    if (clickError < 0) {
      this.logger.warn('Click Complete — error', { error: clickError, note: body.error_note });
      if (intentId && tenantId) {
        await this.failPaymentIntent(intentId);
      }
      await this.recordWebhookEvent(idempotencyKey, tenantId, 'complete', { clickTransId, orderId, error: clickError, error_note: body.error_note });
      return this.clickResponse(clickTransId, orderId, { merchant_confirm_id: null, error: clickError, error_note: body.error_note || 'Payment error' });
    }

    // Success (error === 0) → settle PaymentIntent → triggers payment.settled → Ledger
    if (!intentId || !tenantId) {
      this.logger.error('Click Complete — missing intentId or tenantId', { clickTransId, orderId, intentId, tenantId });
      return this.clickResponse(clickTransId, orderId, { merchant_confirm_id: null, error: -6, error_note: 'Transaction does not exist' });
    }

    try {
      await this.paymentsService.settlePayment(tenantId, intentId);
    } catch (err) {
      this.logger.error('Click Complete — settle failed', {
        clickTransId,
        intentId,
        error: (err as Error).message,
      });
      return this.clickResponse(clickTransId, orderId, { merchant_confirm_id: null, error: -7, error_note: 'Internal error' });
    }

    await this.recordWebhookEvent(idempotencyKey, tenantId, 'complete', { clickTransId, orderId, intentId, error: 0, error_note: 'Success' });

    this.logger.log('Click Complete — settled', {
      clickTransId,
      orderId,
      intentId,
      tenantId,
    });

    return this.clickResponse(clickTransId, orderId, {
      merchant_confirm_id: intentId,
      error: 0,
      error_note: 'Success',
    });
  }

  // ─── Helpers ──────────────────────────────────────────────

  private clickResponse(
    clickTransId: string,
    merchantTransId: string,
    data: { merchant_prepare_id?: string | null; merchant_confirm_id?: string | null; error: number; error_note: string },
  ): ClickResponse {
    const res: ClickResponse = {
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
      error: data.error,
      error_note: data.error_note,
    };
    if ('merchant_prepare_id' in data) res.merchant_prepare_id = data.merchant_prepare_id;
    if ('merchant_confirm_id' in data) res.merchant_confirm_id = data.merchant_confirm_id;
    return res;
  }

  private async recordWebhookEvent(
    idempotencyKey: string,
    tenantId: string | null,
    action: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.paymentWebhookEvent.create({
      data: {
        provider: 'CLICK',
        externalTxId: idempotencyKey,
        tenantId,
        action,
        payload: payload as Prisma.InputJsonValue,
      },
    });
  }

  private async failPaymentIntent(intentId: string): Promise<void> {
    try {
      await this.prisma.paymentIntent.updateMany({
        where: { id: intentId, status: { in: ['CREATED', 'CONFIRMED'] } },
        data: { status: 'FAILED' },
      });
    } catch (err) {
      this.logger.error('Failed to update PaymentIntent to FAILED', {
        intentId,
        error: (err as Error).message,
      });
    }
  }
}
