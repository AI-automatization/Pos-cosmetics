import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from '../payments.service';
import { PaymentConfigService } from '../payment-config.service';
import { PaymentMethod, Prisma } from '@prisma/client';
import { timingSafeEqual } from 'node:crypto';

/**
 * Uzum Pay to'lov tizimi adapteri
 * Hujjat: https://developer.uzumbank.uz/en/merchant/
 *
 * Uzum REST webhook protocol — 5 actions:
 *   check   → order mavjudligini tekshirish
 *   create  → tranzaksiya yaratish (PaymentIntent)
 *   confirm → to'lov tasdiqlash (settle)
 *   reverse → bekor qilish (reverse)
 *   status  → tranzaksiya holatini so'rash
 *
 * Auth: HTTP Basic Auth (username:password from Uzum merchant cabinet)
 * Amount: tiyinlarda (1 UZS = 100 tiyin)
 *
 * Error codes:
 *   10001 = Auth failed
 *   10006 = Invalid service ID
 *   10007 = Order/account not found
 *   10008 = Already paid
 *   10009 = Transaction cancelled / not found
 *   99999 = Internal error
 */

const VALID_ACTIONS = ['check', 'create', 'confirm', 'reverse', 'status'] as const;
type UzumAction = (typeof VALID_ACTIONS)[number];

interface UzumWebhookBody {
  serviceId: number;
  timestamp: number;
  transId?: string;
  amount?: number;
  params?: Record<string, unknown>;
}

export interface UzumResponse {
  serviceId: number;
  timestamp: number;
  status: string;
  transId?: string;
  transTime?: number;
  confirmTime?: number;
  reverseTime?: number;
  amount?: number;
  data?: Record<string, unknown>;
  errorCode?: string;
}

@Injectable()
export class UzumProvider {
  private readonly logger = new Logger(UzumProvider.name);
  readonly name = 'UZUM';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => PaymentConfigService))
    private readonly paymentConfigService: PaymentConfigService,
  ) {}

  private get envServiceId(): string {
    return this.config.get('UZUM_SERVICE_ID', '');
  }

  private get envUsername(): string {
    return this.config.get('UZUM_USERNAME', '');
  }

  private get envPassword(): string {
    return this.config.get('UZUM_PASSWORD', '');
  }

  async getCredentials(tenantId: string): Promise<{
    serviceId: string;
    username: string;
    password: string;
  }> {
    const creds = await this.paymentConfigService.getDecryptedCredentials(tenantId, 'UZUM');
    return {
      serviceId: creds?.serviceId || this.envServiceId,
      username: creds?.username || this.envUsername,
      password: creds?.password || this.envPassword,
    };
  }

  createCheckoutUrl(serviceId: string, orderId: string, amountSom: number, redirectUrl?: string): string {
    const amountTiyin = amountSom * 100;
    const params = new URLSearchParams({
      serviceId,
      order_id: orderId,
      amount: String(amountTiyin),
    });
    if (redirectUrl) params.set('redirectUrl', redirectUrl);
    return `https://www.uzumbank.uz/open-service?${params.toString()}`;
  }

  // ─── Auth ───────────────────────────────────────────────

  async verifyAuthForTenant(tenantId: string, authHeader: string): Promise<boolean> {
    const { username, password } = await this.getCredentials(tenantId);
    return this.verifyBasicAuth(username, password, authHeader);
  }

  verifyAuthLegacy(authHeader: string): boolean {
    return this.verifyBasicAuth(this.envUsername, this.envPassword, authHeader);
  }

  private verifyBasicAuth(username: string, password: string, authHeader: string): boolean {
    if (!username || !password) return false;
    if (!authHeader || !authHeader.startsWith('Basic ')) return false;

    try {
      const decoded = Buffer.from(authHeader.slice(6), 'base64').toString();
      const colonIdx = decoded.indexOf(':');
      if (colonIdx === -1) return false;

      const reqUser = decoded.slice(0, colonIdx);
      const reqPass = decoded.slice(colonIdx + 1);

      const userBuf = Buffer.from(reqUser);
      const expectedUserBuf = Buffer.from(username);
      const passBuf = Buffer.from(reqPass);
      const expectedPassBuf = Buffer.from(password);

      if (userBuf.length !== expectedUserBuf.length || passBuf.length !== expectedPassBuf.length) {
        return false;
      }

      return (
        timingSafeEqual(userBuf, expectedUserBuf) &&
        timingSafeEqual(passBuf, expectedPassBuf)
      );
    } catch {
      return false;
    }
  }

  // ─── Action router ──────────────────────────────────────

  isValidAction(action: string): action is UzumAction {
    return VALID_ACTIONS.includes(action as UzumAction);
  }

  async handleAction(action: UzumAction, body: UzumWebhookBody): Promise<UzumResponse> {
    this.logger.log(`Uzum action: ${action}`, {
      serviceId: body.serviceId,
      transId: body.transId,
    });

    switch (action) {
      case 'check':
        return this.handleCheck(body);
      case 'create':
        return this.handleCreate(body);
      case 'confirm':
        return this.handleConfirm(body);
      case 'reverse':
        return this.handleReverse(body);
      case 'status':
        return this.handleStatus(body);
    }
  }

  // ─── Check: order mavjudligini tekshirish ───────────────

  private async handleCheck(body: UzumWebhookBody): Promise<UzumResponse> {
    const orderId = (body.params as Record<string, string>)?.orderId;
    if (!orderId) return this.errorResponse(body, '10007');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, tenantId: true, total: true, status: true },
    });

    if (!order) return this.errorResponse(body, '10007');
    if (order.status === 'VOIDED' || order.status === 'RETURNED') {
      return this.errorResponse(body, '10009');
    }

    return {
      serviceId: body.serviceId,
      timestamp: Date.now(),
      status: 'OK',
      data: {
        account: { value: orderId },
        amount: Number(order.total) * 100,
      },
    };
  }

  // ─── Create: tranzaksiya yaratish ───────────────────────

  private async handleCreate(body: UzumWebhookBody): Promise<UzumResponse> {
    const { transId, amount } = body;
    const orderId = (body.params as Record<string, string>)?.orderId;

    if (!transId) return this.errorResponse(body, '10007');
    if (!orderId) return this.errorResponse(body, '10007');
    if (!amount || amount <= 0) return this.errorResponse(body, '10007');

    // Idempotency
    const idempotencyKey = `${transId}:create`;
    const existing = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_externalTxId: { provider: 'UZUM', externalTxId: idempotencyKey } },
    });
    if (existing) {
      const payload = existing.payload as Record<string, unknown> | null;
      return {
        serviceId: body.serviceId,
        timestamp: Date.now(),
        status: 'CREATED',
        transId,
        transTime: (payload?.transTime as number) ?? Date.now(),
        amount,
        data: { paymentIntentId: payload?.paymentIntentId },
      };
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, tenantId: true, total: true, status: true },
    });

    if (!order) return this.errorResponse(body, '10007');
    if (order.status === 'VOIDED' || order.status === 'RETURNED') {
      return this.errorResponse(body, '10009');
    }

    // Amount tekshiruv (Uzum tiyinlarda yuboradi, DB da UZS so'm)
    const expectedTiyin = Number(order.total) * 100;
    if (Math.abs(amount - expectedTiyin) > 1) {
      this.logger.warn('Uzum amount mismatch', { orderId, expected: expectedTiyin, received: amount });
      return this.errorResponse(body, '10007');
    }

    // Already paid?
    const settledPayment = await this.prisma.paymentIntent.findFirst({
      where: { orderId, tenantId: order.tenantId, provider: 'UZUM', status: 'SETTLED' },
    });
    if (settledPayment) return this.errorResponse(body, '10008');

    const intent = await this.paymentsService.createPaymentIntent(order.tenantId, {
      orderId,
      method: PaymentMethod.UZUM,
      amount: Number(order.total),
      provider: 'UZUM',
      providerRef: transId,
    });

    const transTime = Date.now();

    await this.prisma.paymentWebhookEvent.create({
      data: {
        provider: 'UZUM',
        externalTxId: idempotencyKey,
        tenantId: order.tenantId,
        action: 'create',
        payload: { transId, orderId, amount, paymentIntentId: intent.id, transTime } as Prisma.InputJsonValue,
      },
    });

    this.logger.log('Uzum transaction created', {
      transId,
      orderId,
      intentId: intent.id,
      tenantId: order.tenantId,
    });

    return {
      serviceId: body.serviceId,
      timestamp: Date.now(),
      status: 'CREATED',
      transId,
      transTime,
      amount,
      data: { paymentIntentId: intent.id },
    };
  }

  // ─── Confirm: to'lov tasdiqlash → settle ────────────────

  private async handleConfirm(body: UzumWebhookBody): Promise<UzumResponse> {
    const { transId } = body;
    if (!transId) return this.errorResponse(body, '10009');

    // Idempotency
    const confirmKey = `${transId}:confirm`;
    const existingConfirm = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_externalTxId: { provider: 'UZUM', externalTxId: confirmKey } },
    });
    if (existingConfirm) {
      const payload = existingConfirm.payload as Record<string, unknown> | null;
      return {
        serviceId: body.serviceId,
        timestamp: Date.now(),
        status: 'CONFIRMED',
        transId,
        confirmTime: (payload?.confirmTime as number) ?? Date.now(),
        transTime: (payload?.transTime as number) ?? 0,
        amount: (payload?.amount as number) ?? 0,
      };
    }

    // Find create event
    const createKey = `${transId}:create`;
    const createEvent = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_externalTxId: { provider: 'UZUM', externalTxId: createKey } },
    });

    if (!createEvent) return this.errorResponse(body, '10009');

    const createPayload = createEvent.payload as Record<string, unknown>;
    const intentId = createPayload.paymentIntentId as string;
    const tenantId = createEvent.tenantId;

    if (!intentId || !tenantId) {
      this.logger.error('Uzum confirm — missing intentId or tenantId', { transId });
      return this.errorResponse(body, '99999');
    }

    try {
      await this.paymentsService.settlePayment(tenantId, intentId);
    } catch (err) {
      this.logger.error('Uzum confirm — settle failed', {
        transId,
        intentId,
        error: (err as Error).message,
      });
      return this.errorResponse(body, '99999');
    }

    const confirmTime = Date.now();

    await this.prisma.paymentWebhookEvent.create({
      data: {
        provider: 'UZUM',
        externalTxId: confirmKey,
        tenantId,
        action: 'confirm',
        payload: {
          transId,
          intentId,
          confirmTime,
          transTime: createPayload.transTime,
          amount: createPayload.amount,
        } as Prisma.InputJsonValue,
      },
    });

    this.logger.log('Uzum transaction confirmed', { transId, intentId, tenantId });

    return {
      serviceId: body.serviceId,
      timestamp: Date.now(),
      status: 'CONFIRMED',
      transId,
      confirmTime,
      transTime: createPayload.transTime as number,
      amount: createPayload.amount as number,
    };
  }

  // ─── Reverse: bekor qilish ─────────────────────────────

  private async handleReverse(body: UzumWebhookBody): Promise<UzumResponse> {
    const { transId } = body;
    if (!transId) return this.errorResponse(body, '10009');

    // Idempotency
    const reverseKey = `${transId}:reverse`;
    const existingReverse = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_externalTxId: { provider: 'UZUM', externalTxId: reverseKey } },
    });
    if (existingReverse) {
      const payload = existingReverse.payload as Record<string, unknown> | null;
      return {
        serviceId: body.serviceId,
        timestamp: Date.now(),
        status: 'REVERSED',
        transId,
        reverseTime: (payload?.reverseTime as number) ?? Date.now(),
        amount: (payload?.amount as number) ?? 0,
      };
    }

    // Find create event to get intentId
    const createKey = `${transId}:create`;
    const createEvent = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_externalTxId: { provider: 'UZUM', externalTxId: createKey } },
    });

    if (!createEvent) return this.errorResponse(body, '10009');

    const createPayload = createEvent.payload as Record<string, unknown>;
    const intentId = createPayload.paymentIntentId as string;
    const tenantId = createEvent.tenantId;

    if (intentId && tenantId) {
      try {
        // Try reverse (settled) first, then fail (created/confirmed)
        await this.paymentsService.reversePayment(tenantId, intentId);
      } catch {
        // If not settled, mark as failed
        try {
          await this.prisma.paymentIntent.updateMany({
            where: { id: intentId, status: { in: ['CREATED', 'CONFIRMED'] } },
            data: { status: 'FAILED' },
          });
        } catch (err) {
          this.logger.error('Uzum reverse — failed to update intent', {
            transId,
            intentId,
            error: (err as Error).message,
          });
        }
      }
    }

    const reverseTime = Date.now();

    await this.prisma.paymentWebhookEvent.create({
      data: {
        provider: 'UZUM',
        externalTxId: reverseKey,
        tenantId,
        action: 'reverse',
        payload: {
          transId,
          intentId,
          reverseTime,
          amount: createPayload.amount,
        } as Prisma.InputJsonValue,
      },
    });

    this.logger.log('Uzum transaction reversed', { transId, intentId, tenantId });

    return {
      serviceId: body.serviceId,
      timestamp: Date.now(),
      status: 'REVERSED',
      transId,
      reverseTime,
      amount: createPayload.amount as number,
    };
  }

  // ─── Status: tranzaksiya holatini qaytarish ─────────────

  private async handleStatus(body: UzumWebhookBody): Promise<UzumResponse> {
    const { transId } = body;
    if (!transId) return this.errorResponse(body, '10009');

    const createEvent = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_externalTxId: { provider: 'UZUM', externalTxId: `${transId}:create` } },
    });
    if (!createEvent) return this.errorResponse(body, '10009');

    const confirmEvent = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_externalTxId: { provider: 'UZUM', externalTxId: `${transId}:confirm` } },
    });

    const reverseEvent = await this.prisma.paymentWebhookEvent.findUnique({
      where: { provider_externalTxId: { provider: 'UZUM', externalTxId: `${transId}:reverse` } },
    });

    const createPayload = createEvent.payload as Record<string, unknown>;
    const confirmPayload = confirmEvent?.payload as Record<string, unknown> | null;
    const reversePayload = reverseEvent?.payload as Record<string, unknown> | null;

    let status = 'CREATED';
    if (reversePayload) status = 'REVERSED';
    else if (confirmPayload) status = 'CONFIRMED';

    return {
      serviceId: body.serviceId,
      timestamp: Date.now(),
      status,
      transId,
      transTime: createPayload.transTime as number,
      confirmTime: (confirmPayload?.confirmTime as number) ?? 0,
      reverseTime: (reversePayload?.reverseTime as number) ?? 0,
      amount: createPayload.amount as number,
    };
  }

  // ─── Tenant resolution ──────────────────────────────────

  async resolveTenant(body: UzumWebhookBody): Promise<string | null> {
    // From params.orderId (check, create)
    const orderId = (body.params as Record<string, string>)?.orderId;
    if (orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { tenantId: true },
      });
      return order?.tenantId ?? null;
    }

    // From transId (confirm, reverse, status) — look up create event
    if (body.transId) {
      const event = await this.prisma.paymentWebhookEvent.findUnique({
        where: { provider_externalTxId: { provider: 'UZUM', externalTxId: `${body.transId}:create` } },
      });
      return event?.tenantId ?? null;
    }

    return null;
  }

  // ─── Error helper ───────────────────────────────────────

  private errorResponse(body: UzumWebhookBody, errorCode: string): UzumResponse {
    return {
      serviceId: body.serviceId,
      timestamp: Date.now(),
      status: 'FAILED',
      errorCode,
    };
  }
}
