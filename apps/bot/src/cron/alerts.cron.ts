// T-128: Cron alertlar per-tenant — har tenant faqat o'z alertlarini oladi
// T-131: Per-user bot settings — har user o'z sozlamalariga ko'ra alert oladi

import * as cron from 'node-cron';
import { Bot } from 'grammy';
import { config } from '../config';
import prisma from '../prisma';
import { logger } from '../logger';
import { BotSettings, DEFAULT_SETTINGS } from '../services/auth.service';
import { getLowStockItems, getExpiringItems, getRecentSuspiciousRefunds, getOverdueDebtSummary } from '../services/alert.service';
import { formatLowStockAlert, formatExpiryAlert, formatRefundAlert, formatDebtSummaryAlert } from '../services/formatter';

// ─── Tenant OWNER larini topish ──────────────────────────────

interface TenantOwner {
  userId: string;
  tenantId: string;
  chatId: string;
  settings: BotSettings;
}

async function getTenantOwners(): Promise<TenantOwner[]> {
  const owners = await prisma.user.findMany({
    where: {
      role: { in: ['OWNER', 'ADMIN'] },
      isActive: true,
      telegramChatId: { not: null },
    },
    select: {
      id: true,
      tenantId: true,
      telegramChatId: true,
      botSettings: true,
    },
  });

  return owners
    .filter((o) => o.telegramChatId)
    .map((o) => ({
      userId:   o.id,
      tenantId: o.tenantId,
      chatId:   o.telegramChatId!,
      settings: (o.botSettings as BotSettings | null) ?? { ...DEFAULT_SETTINGS },
    }));
}

// ─── Xabar yuborish ───────────────────────────────────────────

async function sendToUser(bot: Bot, chatId: string, message: string): Promise<void> {
  try {
    await bot.api.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
  } catch (err) {
    logger.error('[Cron] Failed to send message', { chatId, error: (err as Error).message });
  }
}

// ─── Cron joblar ─────────────────────────────────────────────

export function startCronJobs(bot: Bot): void {

  // ─── 1. Low stock — har soat ────────────────────────────────
  cron.schedule(config.lowStockCheckCron, async () => {
    logger.log('[Cron] Low stock check started');
    try {
      const owners = await getTenantOwners();

      for (const owner of owners) {
        if (!owner.settings.lowStock) continue;

        const items = await getLowStockItems(owner.tenantId);
        if (items.length === 0) continue;

        await sendToUser(bot, owner.chatId, formatLowStockAlert(items));
        logger.log('[Cron] Low stock alert sent', { tenantId: owner.tenantId, items: items.length });
      }
    } catch (err) {
      logger.error('[Cron] Low stock failed', { error: (err as Error).message });
    }
  }, { timezone: 'Asia/Tashkent' });

  // ─── 2. Expiry — har kuni 08:00 ─────────────────────────────
  cron.schedule(config.expiryCheckCron, async () => {
    logger.log('[Cron] Expiry check started');
    try {
      const owners = await getTenantOwners();

      for (const owner of owners) {
        if (!owner.settings.expiry) continue;

        const days = owner.settings.expiryDays;
        const items = await getExpiringItems(days, owner.tenantId);
        if (items.length === 0) continue;

        await sendToUser(bot, owner.chatId, formatExpiryAlert(items));
        logger.log('[Cron] Expiry alert sent', { tenantId: owner.tenantId, items: items.length, days });
      }
    } catch (err) {
      logger.error('[Cron] Expiry failed', { error: (err as Error).message });
    }
  }, { timezone: 'Asia/Tashkent' });

  // ─── 3. Overdue debts — har kuni 09:00 ─────────────────────
  cron.schedule(config.debtCheckCron, async () => {
    logger.log('[Cron] Debt check started');
    try {
      const owners = await getTenantOwners();

      for (const owner of owners) {
        const rows = await getOverdueDebtSummary(owner.tenantId);
        if (rows.length === 0) continue;

        await sendToUser(bot, owner.chatId, formatDebtSummaryAlert(rows));
        logger.log('[Cron] Debt alert sent', { tenantId: owner.tenantId, count: rows.length });
      }
    } catch (err) {
      logger.error('[Cron] Debt check failed', { error: (err as Error).message });
    }
  }, { timezone: 'Asia/Tashkent' });

  // ─── 4. Suspicious refunds — har 15 daqiqa ──────────────────
  cron.schedule('*/15 * * * *', async () => {
    try {
      const owners = await getTenantOwners();

      for (const owner of owners) {
        if (!owner.settings.suspiciousRefund) continue; // User o'chirgan

        const refunds = await getRecentSuspiciousRefunds(owner.tenantId);
        for (const refund of refunds) {
          await sendToUser(bot, owner.chatId, formatRefundAlert(refund));
        }
        if (refunds.length > 0) {
          logger.log('[Cron] Refund alert sent', { tenantId: owner.tenantId, count: refunds.length });
        }
      }
    } catch (err) {
      logger.error('[Cron] Refund check failed', { error: (err as Error).message });
    }
  }, { timezone: 'Asia/Tashkent' });

  // ─── 5. Kunlik savdo hisoboti — har kuni 20:00 ──────────────
  cron.schedule('0 20 * * *', async () => {
    logger.log('[Cron] Daily report started');
    try {
      const owners = await getTenantOwners();
      const { getTodaySummary } = await import('../services/report.service');
      const { formatDailyReport } = await import('../services/formatter');

      for (const owner of owners) {
        if (!owner.settings.dailyReport) continue;

        const detail = await getTodaySummary(owner.tenantId);
        await sendToUser(bot, owner.chatId, formatDailyReport(detail));
        logger.log('[Cron] Daily report sent', { tenantId: owner.tenantId });
      }
    } catch (err) {
      logger.error('[Cron] Daily report failed', { error: (err as Error).message });
    }
  }, { timezone: 'Asia/Tashkent' });

  logger.log('[Bot] Cron jobs registered', {
    lowStock: config.lowStockCheckCron,
    expiry:   config.expiryCheckCron,
    debts:    config.debtCheckCron,
    refunds:  '*/15 * * * *',
    daily:    '0 20 * * *',
  });
}
