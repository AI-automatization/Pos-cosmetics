import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentIntentStatus } from '@prisma/client';

/**
 * Payment Reconciliation — kunlik cron (02:00 Tashkent)
 *
 * 1. Stale intents: CREATED/CONFIRMED > 24 soat → FAILED
 * 2. Payme: expired transactions (state = -1) bo'lgan intentlarni FAILED qilish
 * 3. Discrepancy detection: provider da settled lekin bizda CONFIRMED (yoki aksincha)
 * 4. Summary log
 */

const STALE_HOURS = 24;

@Injectable()
export class PaymentReconciliationService {
  private readonly logger = new Logger(PaymentReconciliationService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 2 * * *', { name: 'payment-reconciliation', timeZone: 'Asia/Tashkent' })
  async reconcile() {
    this.logger.log('[RECONCILIATION] Starting daily payment reconciliation');

    const staleCount = await this.expireStaleIntents();
    const paymeCount = await this.reconcilePayme();
    const clickUzumCount = await this.reconcileClickUzum();

    this.logger.log('[RECONCILIATION] Complete', {
      staleExpired: staleCount,
      paymeReconciled: paymeCount,
      clickUzumReconciled: clickUzumCount,
    });
  }

  /** Mark CREATED/CONFIRMED intents older than 24h as FAILED */
  private async expireStaleIntents(): Promise<number> {
    const cutoff = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000);

    const { count } = await this.prisma.paymentIntent.updateMany({
      where: {
        status: { in: [PaymentIntentStatus.CREATED, PaymentIntentStatus.CONFIRMED] },
        createdAt: { lt: cutoff },
      },
      data: { status: PaymentIntentStatus.FAILED },
    });

    if (count > 0) {
      this.logger.warn(`[RECONCILIATION] ${count} stale payment intents marked FAILED (>${STALE_HOURS}h)`);
    }

    return count;
  }

  /** Reconcile Payme: sync expired/cancelled transactions */
  private async reconcilePayme(): Promise<number> {
    // Find Payme transactions that are cancelled (state < 0)
    // but their PaymentIntent is still CREATED/CONFIRMED
    const orphaned = await this.prisma.paymeTransaction.findMany({
      where: {
        state: { lt: 0 },
        paymentIntentId: { not: null },
      },
      select: { paymentIntentId: true, state: true, paymeId: true, tenantId: true },
    });

    let reconciled = 0;

    for (const tx of orphaned) {
      if (!tx.paymentIntentId) continue;

      const intent = await this.prisma.paymentIntent.findFirst({
        where: {
          id: tx.paymentIntentId,
          status: { in: [PaymentIntentStatus.CREATED, PaymentIntentStatus.CONFIRMED] },
        },
      });

      if (intent) {
        await this.prisma.paymentIntent.update({
          where: { id: intent.id },
          data: { status: PaymentIntentStatus.FAILED },
        });

        this.logger.warn('[RECONCILIATION] Payme: intent synced to FAILED', {
          intentId: intent.id,
          paymeId: tx.paymeId,
          paymeState: tx.state,
          tenantId: tx.tenantId,
        });
        reconciled++;
      }
    }

    // Detect: Payme state=2 (completed) but intent not SETTLED
    const completedNotSettled = await this.prisma.paymeTransaction.findMany({
      where: {
        state: 2,
        paymentIntentId: { not: null },
      },
      select: { paymentIntentId: true, paymeId: true, tenantId: true },
    });

    for (const tx of completedNotSettled) {
      if (!tx.paymentIntentId) continue;

      const intent = await this.prisma.paymentIntent.findFirst({
        where: {
          id: tx.paymentIntentId,
          status: { not: PaymentIntentStatus.SETTLED },
        },
      });

      if (intent && intent.status !== PaymentIntentStatus.REVERSED) {
        this.logger.error('[RECONCILIATION] DISCREPANCY: Payme completed but intent not settled', {
          intentId: intent.id,
          intentStatus: intent.status,
          paymeId: tx.paymeId,
          tenantId: tx.tenantId,
        });
      }
    }

    return reconciled;
  }

  /** Reconcile Click/Uzum: check for confirm events without settled intents */
  private async reconcileClickUzum(): Promise<number> {
    // Find confirm webhook events where the PaymentIntent is not SETTLED
    const confirmEvents = await this.prisma.paymentWebhookEvent.findMany({
      where: {
        action: 'confirm',
        provider: { in: ['CLICK', 'UZUM'] },
        processedAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      },
      select: { provider: true, externalTxId: true, tenantId: true, payload: true },
    });

    let discrepancies = 0;

    for (const event of confirmEvents) {
      const payload = event.payload as Record<string, unknown> | null;
      const intentId = (payload?.paymentIntentId ?? payload?.intentId) as string | undefined;
      if (!intentId) continue;

      const intent = await this.prisma.paymentIntent.findFirst({
        where: { id: intentId },
        select: { id: true, status: true },
      });

      if (intent && intent.status !== PaymentIntentStatus.SETTLED && intent.status !== PaymentIntentStatus.REVERSED) {
        this.logger.error(`[RECONCILIATION] DISCREPANCY: ${event.provider} confirmed but intent not settled`, {
          intentId,
          intentStatus: intent.status,
          provider: event.provider,
          tenantId: event.tenantId,
        });
        discrepancies++;
      }
    }

    return discrepancies;
  }
}
