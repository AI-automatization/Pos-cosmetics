import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { ExchangeRateService } from '../currency/exchange-rate.service';

const VOID_THRESHOLD = 3; // 1 soatda 3+ void = shubhali

/**
 * RAOS Scheduled Tasks (T-088)
 *
 * Cron jadval (Asia/Tashkent):
 *   - Soatlik:     Stock snapshot invalidation
 *   - 06:00:       Expiry alert log
 *   - 08:00:       Nasiya reminders
 *   - 00:05:       Kunlik audit cleanup (30+ kunlik)
 *   - Haftalik Dushanba: Dead stock report
 */

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly exchangeRate: ExchangeRateService,
    private readonly emitter: EventEmitter2,
  ) {}

  // ─── SOATLIK: Stock snapshot materialization (T-075) ────────────
  // Barcha tenant/warehouse/product uchun stock snapshot hisoblash
  @Cron('0 * * * *', { name: 'stock-snapshot', timeZone: 'Asia/Tashkent' })
  async materializeStockSnapshots() {
    try {
      // Upsert stock snapshot: movement aggregate → snapshot table
      await this.prisma.$executeRaw`
        INSERT INTO stock_snapshots (id, tenant_id, warehouse_id, product_id, quantity, calculated_at)
        SELECT
          gen_random_uuid(),
          tenant_id,
          warehouse_id,
          product_id,
          SUM(
            CASE
              WHEN type IN ('IN', 'RETURN_IN', 'TRANSFER_IN') THEN quantity
              WHEN type = 'ADJUSTMENT' THEN quantity
              ELSE -quantity
            END
          ) AS quantity,
          NOW()
        FROM stock_movements
        GROUP BY tenant_id, warehouse_id, product_id
        ON CONFLICT (tenant_id, warehouse_id, product_id)
        DO UPDATE SET
          quantity     = EXCLUDED.quantity,
          calculated_at = EXCLUDED.calculated_at
      `;

      // Invalidate cache after snapshot
      await this.cache.invalidatePattern('tenant:*:stock*');
      this.logger.log('[CRON] Stock snapshots materialized + cache invalidated');
    } catch (err) {
      this.logger.error('[CRON] Stock snapshot error', { error: (err as Error).message });
    }
  }

  // ─── 06:00: Muddati yaqin mahsulotlar tekshirish ───────────────
  @Cron('0 6 * * *', { name: 'expiry-check', timeZone: 'Asia/Tashkent' })
  async checkExpiringProducts() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + 30); // 30 kun ichida

      const result = await this.prisma.$queryRaw<{ tenantId: string; count: number }[]>`
        SELECT tenant_id AS "tenantId", COUNT(*) AS count
        FROM stock_movements
        WHERE expiry_date IS NOT NULL
          AND expiry_date <= ${cutoff}
          AND expiry_date >= NOW()
        GROUP BY tenant_id
      `;

      for (const row of result) {
        this.logger.warn(`[CRON] Expiry: tenant=${row.tenantId} has ${row.count} expiring batches in 30 days`);
      }

      this.logger.log(`[CRON] Expiry check done: ${result.length} tenants have expiring products`);
    } catch (err) {
      this.logger.error('[CRON] Expiry check error', { error: (err as Error).message });
    }
  }

  // ─── 08:00: Nasiya reminders ───────────────────────────────────
  @Cron('0 8 * * *', { name: 'debt-reminders', timeZone: 'Asia/Tashkent' })
  async runDebtReminders() {
    try {
      const now = new Date();
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + 3);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // DUE_SOON qarzlar (bugun eslatilmagan)
      const dueSoon = await this.prisma.debtRecord.findMany({
        where: {
          status: { in: ['ACTIVE', 'PARTIAL'] },
          dueDate: { gte: now, lte: threshold },
        },
        include: {
          customer: { select: { id: true, name: true } },
          tenant: { select: { id: true, name: true } },
        },
      });

      let sent = 0;
      for (const debt of dueSoon) {
        const alreadySent = await this.prisma.reminderLog.count({
          where: { debtId: debt.id, type: 'DUE_SOON', sentAt: { gte: todayStart } },
        });
        if (alreadySent === 0) {
          const message = `Hurmatli ${debt.customer.name}, "${debt.tenant.name}" do'konida ${Number(debt.remaining).toLocaleString()} so'm qarzingiz bor. Muddati: ${debt.dueDate?.toLocaleDateString('uz-UZ') ?? '?'}.`;
          await this.prisma.reminderLog.create({
            data: {
              tenantId: debt.tenantId,
              debtId: debt.id,
              customerId: debt.customerId,
              type: 'DUE_SOON',
              channel: 'LOG',
              message,
            },
          });
          sent++;
        }
      }

      this.logger.log(`[CRON] Debt reminders: ${sent} DUE_SOON sent`);
    } catch (err) {
      this.logger.error('[CRON] Debt reminders error', { error: (err as Error).message });
    }
  }

  // ─── 00:05: Overdue qarzlarni OVERDUE statusga o'tkazish ───────
  @Cron('5 0 * * *', { name: 'overdue-update', timeZone: 'Asia/Tashkent' })
  async updateOverdueDebts() {
    try {
      const { count } = await this.prisma.debtRecord.updateMany({
        where: {
          status: { in: ['ACTIVE', 'PARTIAL'] },
          dueDate: { lt: new Date() },
        },
        data: { status: 'OVERDUE' },
      });

      if (count > 0) {
        this.logger.warn(`[CRON] ${count} debts marked OVERDUE`);
      } else {
        this.logger.log('[CRON] Overdue update: no new overdue debts');
      }
    } catch (err) {
      this.logger.error('[CRON] Overdue update error', { error: (err as Error).message });
    }
  }

  // ─── 09:00: CBU Valyuta kursi yangilash (T-082) ─────────────────
  @Cron('0 9 * * *', { name: 'exchange-rate-sync', timeZone: 'Asia/Tashkent' })
  async syncExchangeRate() {
    try {
      const rate = await this.exchangeRate.syncFromCbu();
      this.logger.log(`[CRON] Exchange rate synced: 1 USD = ${rate.usdUzs} UZS`);
    } catch (err) {
      this.logger.error('[CRON] Exchange rate sync error', { error: (err as Error).message });
    }
  }

  // ─── Haftalik Dushanba 07:00: Dead stock report ────────────────
  @Cron('0 7 * * 1', { name: 'dead-stock-report', timeZone: 'Asia/Tashkent' })
  async generateDeadStockReport() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90); // 90 kun sotilmagan

      // So'nggi 90 kunda sotilmagan, omborda qolgan mahsulotlar
      const deadStockProducts = await this.prisma.$queryRaw<
        { tenantId: string; productId: string; productName: string; totalStock: number }[]
      >`
        SELECT
          sm.tenant_id AS "tenantId",
          sm.product_id AS "productId",
          p.name AS "productName",
          SUM(
            CASE
              WHEN sm.type IN ('IN', 'RETURN_IN', 'TRANSFER_IN') THEN sm.quantity
              WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
              ELSE -sm.quantity
            END
          ) AS "totalStock"
        FROM stock_movements sm
        JOIN products p ON p.id = sm.product_id
        WHERE
          sm.product_id NOT IN (
            SELECT DISTINCT product_id FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.created_at >= ${cutoff}
          )
        GROUP BY sm.tenant_id, sm.product_id, p.name
        HAVING SUM(
          CASE
            WHEN sm.type IN ('IN', 'RETURN_IN', 'TRANSFER_IN') THEN sm.quantity
            WHEN sm.type = 'ADJUSTMENT' THEN sm.quantity
            ELSE -sm.quantity
          END
        ) > 0
        LIMIT 100
      `;

      this.logger.log(`[CRON] Dead stock report: ${deadStockProducts.length} products (90+ days unsold)`);
    } catch (err) {
      this.logger.error('[CRON] Dead stock report error', { error: (err as Error).message });
    }
  }

  // ─── T-070: Soatlik fraud detection (void monitoring) ────────────────────
  @Cron('0 * * * *', { name: 'hourly-fraud-check', timeZone: 'Asia/Tashkent' })
  async checkHourlyVoids() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const suspicious = await this.prisma.$queryRaw<
        { tenantId: string; userId: string; firstName: string; lastName: string; voidCount: number }[]
      >`
        SELECT
          o.tenant_id  AS "tenantId",
          u.id         AS "userId",
          u.first_name AS "firstName",
          u.last_name  AS "lastName",
          COUNT(o.id)::int AS "voidCount"
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.status::text = 'VOIDED'
          AND o.created_at >= ${oneHourAgo}
        GROUP BY o.tenant_id, u.id, u.first_name, u.last_name
        HAVING COUNT(o.id) >= ${VOID_THRESHOLD}
      `;

      if (suspicious.length > 0) {
        // Tenant bo'yicha guruhlab event emit qilamiz
        const byTenant = suspicious.reduce<Record<string, typeof suspicious>>((acc, row) => {
          if (!acc[row.tenantId]) acc[row.tenantId] = [];
          acc[row.tenantId].push(row);
          return acc;
        }, {});

        for (const [tenantId, rows] of Object.entries(byTenant)) {
          const flagged = rows.map((r) => `${r.firstName} ${r.lastName}: ${r.voidCount} void/soat`);
          this.emitter.emit('fraud.detected', { tenantId, type: 'HOURLY_VOID', flagged });
          this.logger.warn(`[T-070] Hourly void alert`, { tenantId, flagged });
        }
      }
    } catch (err) {
      this.logger.error('[CRON] Fraud check error', { error: (err as Error).message });
    }
  }
}
