import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from '../payments.service';
import { PaymentMethod } from '@prisma/client';
import { timingSafeEqual } from 'node:crypto';

/**
 * T-393: Payme to'lov tizimi adapteri — REAL business logic
 * Payme JSON-RPC 2.0 protocol: https://developer.paycom.uz/
 *
 * Transaction states:
 *   1  = created (kutilmoqda)
 *   2  = completed (to'langan)
 *  -1  = cancelled before perform
 *  -2  = cancelled after perform
 *
 * Error codes (Payme protocol):
 *  -31001 = Invalid amount
 *  -31003 = Transaction not found
 *  -31050 = Order not found
 *  -31051 = Order already has active transaction
 *  -31008 = Unable to perform operation
 *  -32504 = Forbidden (auth)
 *  -32601 = Method not found
 */

// Payme transaction timeout: 12 soat (ms)
const PAYME_TX_TIMEOUT_MS = 12 * 60 * 60 * 1000;

interface PaymeParams {
  id?: string;
  time?: number;
  amount?: number;
  reason?: number;
  account?: { order_id?: string };
}

interface PaymeRpcResult {
  result?: Record<string, unknown>;
  error?: { code: number; message: { uz: string; ru: string; en: string } };
}

@Injectable()
export class PaymeProvider {
  private readonly logger = new Logger(PaymeProvider.name);
  readonly name = 'PAYME';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  private get merchantId(): string {
    return this.config.get('PAYME_MERCHANT_ID', '');
  }

  private get secretKey(): string {
    return this.config.get('PAYME_SECRET_KEY', '');
  }

  private get isConfigured(): boolean {
    return !!(this.merchantId && this.secretKey);
  }

  /**
   * Payme checkout URL yaratish (QR yoki redirect uchun)
   * @param amount UZS so'm
   * @param orderId internal order ID
   * @param description chek tavsifi
   */
  createCheckoutUrl(amount: number, orderId: string, description: string): string {
    if (!this.isConfigured) {
      this.logger.warn('PAYME_MERCHANT_ID yoki PAYME_SECRET_KEY sozlanmagan');
      return '';
    }

    const isTest = this.config.get('NODE_ENV') !== 'production';
    const base = isTest
      ? 'https://checkout.test.paycom.uz'
      : 'https://checkout.paycom.uz';

    // amount * 100 = tiyin
    const params = Buffer.from(
      `m=${this.merchantId};ac.order_id=${orderId};a=${amount * 100};d=${encodeURIComponent(description)}`,
    ).toString('base64');

    return `${base}/${params}`;
  }

  /**
   * Payme webhook Basic auth tekshirish
   * Header: "Basic base64(Paycom:<secret>)"
   */
  verifyWebhook(authHeader: string): boolean {
    if (!this.secretKey) return false;
    if (!authHeader || !authHeader.startsWith('Basic ')) return false;

    try {
      const decoded = Buffer.from(authHeader.slice(6), 'base64').toString();
      const colonIdx = decoded.indexOf(':');
      if (colonIdx === -1) return false;

      const key = decoded.slice(colonIdx + 1);
      const keyBuf = Buffer.from(key);
      const secretBuf = Buffer.from(this.secretKey);

      if (keyBuf.length !== secretBuf.length) return false;
      return timingSafeEqual(keyBuf, secretBuf);
    } catch {
      return false;
    }
  }

  /**
   * Payme JSON-RPC method handler — real business logic
   */
  async handleMethod(method: string, params: PaymeParams): Promise<PaymeRpcResult> {
    this.logger.log(`Payme method: ${method}`, {
      paymeId: params.id,
      orderId: params.account?.order_id,
    });

    switch (method) {
      case 'CheckPerformTransaction':
        return this.checkPerformTransaction(params);
      case 'CreateTransaction':
        return this.createTransaction(params);
      case 'PerformTransaction':
        return this.performTransaction(params);
      case 'CancelTransaction':
        return this.cancelTransaction(params);
      case 'CheckTransaction':
        return this.checkTransaction(params);
      default:
        return this.rpcError(-32601, 'Method not found');
    }
  }

  // ─── CheckPerformTransaction ──────────────────────────────

  private async checkPerformTransaction(params: PaymeParams): Promise<PaymeRpcResult> {
    const orderId = params.account?.order_id;
    const amount = params.amount;

    if (!orderId) return this.rpcError(-31050, 'Order ID not provided');
    if (!amount || amount <= 0) return this.rpcError(-31001, 'Invalid amount');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, tenantId: true, total: true, status: true },
    });

    if (!order) return this.rpcError(-31050, 'Order not found');
    if (order.status === 'VOIDED' || order.status === 'RETURNED') {
      return this.rpcError(-31008, 'Order is cancelled or returned');
    }

    // Amount tekshiruv: Payme tiyin yuboradi, DB da UZS so'm
    const expectedTiyin = Number(order.total) * 100;
    if (amount !== expectedTiyin) {
      this.logger.warn('Payme amount mismatch', {
        orderId,
        expected: expectedTiyin,
        received: amount,
      });
      return this.rpcError(-31001, 'Incorrect amount');
    }

    // Aktiv Payme tranzaksiya bor-yo'qligini tekshirish
    const existingTx = await this.prisma.paymeTransaction.findFirst({
      where: { orderId, state: { in: [1, 2] } },
    });
    if (existingTx) {
      return this.rpcError(-31051, 'Order already has an active transaction');
    }

    return { result: { allow: true } };
  }

  // ─── CreateTransaction ────────────────────────────────────

  private async createTransaction(params: PaymeParams): Promise<PaymeRpcResult> {
    const { id: paymeId, time: paymeTime, amount, account } = params;
    const orderId = account?.order_id;

    if (!paymeId) return this.rpcError(-31003, 'Transaction ID required');
    if (!orderId) return this.rpcError(-31050, 'Order ID not provided');
    if (!amount || amount <= 0) return this.rpcError(-31001, 'Invalid amount');

    // Idempotency: agar bu paymeId bilan tranzaksiya allaqachon bor
    const existing = await this.prisma.paymeTransaction.findUnique({
      where: { paymeId },
    });

    if (existing) {
      // Agar boshqa order uchun → xato
      if (existing.orderId !== orderId) {
        return this.rpcError(-31008, 'Transaction belongs to another order');
      }

      // Timeout tekshiruvi
      if (existing.state === 1) {
        const elapsed = Date.now() - Number(existing.createTime);
        if (elapsed > PAYME_TX_TIMEOUT_MS) {
          // Expire: cancel with reason 4 (timeout)
          await this.prisma.paymeTransaction.update({
            where: { id: existing.id },
            data: { state: -1, reason: 4, cancelTime: BigInt(Date.now()) },
          });
          return this.rpcError(-31008, 'Transaction expired');
        }
      }

      // Idempotent qaytarish (state 1 yoki 2)
      return {
        result: {
          create_time: Number(existing.createTime),
          transaction: existing.id,
          state: existing.state,
        },
      };
    }

    // Order tekshirish
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, tenantId: true, total: true, status: true },
    });

    if (!order) return this.rpcError(-31050, 'Order not found');
    if (order.status === 'VOIDED' || order.status === 'RETURNED') {
      return this.rpcError(-31008, 'Order is cancelled or returned');
    }

    const expectedTiyin = Number(order.total) * 100;
    if (amount !== expectedTiyin) {
      return this.rpcError(-31001, 'Incorrect amount');
    }

    // Boshqa aktiv tranzaksiya bor-yo'qligini tekshirish
    const activeTx = await this.prisma.paymeTransaction.findFirst({
      where: { orderId, state: 1 },
    });
    if (activeTx) {
      // Eski tranzaksiyani timeout bo'lganmi tekshirish
      const elapsed = Date.now() - Number(activeTx.createTime);
      if (elapsed > PAYME_TX_TIMEOUT_MS) {
        await this.prisma.paymeTransaction.update({
          where: { id: activeTx.id },
          data: { state: -1, reason: 4, cancelTime: BigInt(Date.now()) },
        });
      } else {
        return this.rpcError(-31051, 'Order already has an active transaction');
      }
    }

    const createTime = paymeTime ?? Date.now();

    // PaymentIntent yaratish
    const intent = await this.paymentsService.createPaymentIntent(order.tenantId, {
      orderId,
      method: PaymentMethod.PAYME,
      amount: Number(order.total),
      provider: 'PAYME',
      providerRef: paymeId,
    });

    // PaymeTransaction yaratish
    const tx = await this.prisma.paymeTransaction.create({
      data: {
        tenantId: order.tenantId,
        paymeId,
        orderId,
        paymentIntentId: intent.id,
        amount,
        state: 1,
        createTime: BigInt(createTime),
      },
    });

    this.logger.log('Payme transaction created', {
      txId: tx.id,
      paymeId,
      orderId,
      tenantId: order.tenantId,
    });

    return {
      result: {
        create_time: createTime,
        transaction: tx.id,
        state: 1,
      },
    };
  }

  // ─── PerformTransaction ───────────────────────────────────

  private async performTransaction(params: PaymeParams): Promise<PaymeRpcResult> {
    const paymeId = params.id;
    if (!paymeId) return this.rpcError(-31003, 'Transaction ID required');

    const tx = await this.prisma.paymeTransaction.findUnique({
      where: { paymeId },
    });

    if (!tx) return this.rpcError(-31003, 'Transaction not found');

    // Allaqachon bajarilgan — idempotent
    if (tx.state === 2) {
      return {
        result: {
          perform_time: Number(tx.performTime),
          transaction: tx.id,
          state: 2,
        },
      };
    }

    // Bekor qilingan tranzaksiyani bajarib bo'lmaydi
    if (tx.state < 0) {
      return this.rpcError(-31008, 'Transaction is cancelled');
    }

    // Timeout tekshiruvi
    const elapsed = Date.now() - Number(tx.createTime);
    if (elapsed > PAYME_TX_TIMEOUT_MS) {
      await this.prisma.paymeTransaction.update({
        where: { id: tx.id },
        data: { state: -1, reason: 4, cancelTime: BigInt(Date.now()) },
      });
      return this.rpcError(-31008, 'Transaction expired');
    }

    const performTime = Date.now();

    // PaymentIntent ni settle qilish → payment.settled event → LedgerService
    if (tx.paymentIntentId) {
      try {
        await this.paymentsService.settlePayment(tx.tenantId, tx.paymentIntentId);
      } catch (err) {
        this.logger.error('Failed to settle PaymentIntent', {
          paymeId,
          intentId: tx.paymentIntentId,
          error: (err as Error).message,
        });
        return this.rpcError(-31008, 'Unable to settle payment');
      }
    }

    // PaymeTransaction state ni yangilash
    await this.prisma.paymeTransaction.update({
      where: { id: tx.id },
      data: { state: 2, performTime: BigInt(performTime) },
    });

    this.logger.log('Payme transaction performed', {
      txId: tx.id,
      paymeId,
      tenantId: tx.tenantId,
    });

    return {
      result: {
        perform_time: performTime,
        transaction: tx.id,
        state: 2,
      },
    };
  }

  // ─── CancelTransaction ────────────────────────────────────

  private async cancelTransaction(params: PaymeParams): Promise<PaymeRpcResult> {
    const paymeId = params.id;
    const reason = params.reason;
    if (!paymeId) return this.rpcError(-31003, 'Transaction ID required');

    const tx = await this.prisma.paymeTransaction.findUnique({
      where: { paymeId },
    });

    if (!tx) return this.rpcError(-31003, 'Transaction not found');

    // Allaqachon bekor qilingan — idempotent
    if (tx.state < 0) {
      return {
        result: {
          cancel_time: Number(tx.cancelTime),
          transaction: tx.id,
          state: tx.state,
          reason: tx.reason,
        },
      };
    }

    const cancelTime = Date.now();

    // state=1 → -1 (before perform), state=2 → -2 (after perform)
    const newState = tx.state === 2 ? -2 : -1;

    // Agar to'lov bajarilgan bo'lsa → reverse qilish
    if (tx.state === 2 && tx.paymentIntentId) {
      try {
        await this.paymentsService.reversePayment(tx.tenantId, tx.paymentIntentId);
      } catch (err) {
        this.logger.error('Failed to reverse PaymentIntent', {
          paymeId,
          intentId: tx.paymentIntentId,
          error: (err as Error).message,
        });
        return this.rpcError(-31008, 'Unable to cancel performed transaction');
      }
    }

    await this.prisma.paymeTransaction.update({
      where: { id: tx.id },
      data: { state: newState, reason, cancelTime: BigInt(cancelTime) },
    });

    this.logger.log('Payme transaction cancelled', {
      txId: tx.id,
      paymeId,
      state: newState,
      reason,
      tenantId: tx.tenantId,
    });

    return {
      result: {
        cancel_time: cancelTime,
        transaction: tx.id,
        state: newState,
        reason,
      },
    };
  }

  // ─── CheckTransaction ─────────────────────────────────────

  private async checkTransaction(params: PaymeParams): Promise<PaymeRpcResult> {
    const paymeId = params.id;
    if (!paymeId) return this.rpcError(-31003, 'Transaction ID required');

    const tx = await this.prisma.paymeTransaction.findUnique({
      where: { paymeId },
    });

    if (!tx) return this.rpcError(-31003, 'Transaction not found');

    return {
      result: {
        create_time: Number(tx.createTime),
        perform_time: tx.performTime ? Number(tx.performTime) : 0,
        cancel_time: tx.cancelTime ? Number(tx.cancelTime) : 0,
        transaction: tx.id,
        state: tx.state,
        reason: tx.reason ?? null,
      },
    };
  }

  // ─── Helper: JSON-RPC error ───────────────────────────────

  private rpcError(code: number, message: string): PaymeRpcResult {
    return {
      error: {
        code,
        message: { uz: message, ru: message, en: message },
      },
    };
  }
}
