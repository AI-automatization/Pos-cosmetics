// T-128: Cron alertlar per-tenant — har tenant faqat o'z alertlarini oladi
// T-131: Per-user bot settings — har user o'z sozlamalariga ko'ra alert oladi

import * as cron from 'node-cron';
import { Bot } from 'grammy';
import { config } from '../config';
import prisma from '../prisma';
import { BotSettings, DEFAULT_SETTINGS } from '../services/auth.service';
import { getLowStockItems, getExpiringItems, getRecentSuspiciousRefunds } from '../services/alert.service';
import { formatLowStockAlert, formatExpiryAlert, formatRefundAlert } from '../services/formatter';

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
    console.error(`[Cron] Failed to send to chatId=${chatId}:`, (err as Error).message);
  }
}

// ─── Cron joblar ─────────────────────────────────────────────

export function startCronJobs(bot: Bot): void {

  // ─── 1. Low stock — har soat ────────────────────────────────
  cron.schedule(config.lowStockCheckCron, async () => {
    console.log('[Cron] Low stock check started');
    try {
      const owners = await getTenantOwners();

      for (const owner of owners) {
        if (!owner.settings.lowStock) continue; // User o'chirgan

        const items = await getLowStockItems(owner.tenantId);
        if (items.length === 0) continue;

        await sendToUser(bot, owner.chatId, formatLowStockAlert(items));
        console.log(`[Cron] Low stock → tenant=${owner.tenantId} items=${items.length}`);
      }
    } catch (err) {
      console.error('[Cron] Low stock failed:', (err as Error).message);
    }
  }, { timezone: 'Asia/Tashkent' });

  // ─── 2. Expiry — har kuni 08:00 ─────────────────────────────
  cron.schedule(config.expiryCheckCron, async () => {
    console.log('[Cron] Expiry check started');
    try {
      const owners = await getTenantOwners();

      for (const owner of owners) {
        if (!owner.settings.expiry) continue; // User o'chirgan

        const days = owner.settings.expiryDays;
        const items = await getExpiringItems(days, owner.tenantId);
        if (items.length === 0) continue;

        await sendToUser(bot, owner.chatId, formatExpiryAlert(items));
        console.log(`[Cron] Expiry → tenant=${owner.tenantId} items=${items.length} days=${days}`);
      }
    } catch (err) {
      console.error('[Cron] Expiry failed:', (err as Error).message);
    }
  }, { timezone: 'Asia/Tashkent' });

  // ─── 3. Suspicious refunds — har 15 daqiqa ──────────────────
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
          console.log(`[Cron] Refund alert → tenant=${owner.tenantId} count=${refunds.length}`);
        }
      }
    } catch (err) {
      console.error('[Cron] Refund check failed:', (err as Error).message);
    }
  }, { timezone: 'Asia/Tashkent' });

  // ─── 4. Kunlik savdo hisoboti — har kuni 20:00 ──────────────
  cron.schedule('0 20 * * *', async () => {
    console.log('[Cron] Daily report started');
    try {
      const owners = await getTenantOwners();
      const { getTodaySummary } = await import('../services/report.service');
      const { formatDailyReport } = await import('../services/formatter');

      for (const owner of owners) {
        if (!owner.settings.dailyReport) continue; // User o'chirgan

        const detail = await getTodaySummary(owner.tenantId);
        await sendToUser(bot, owner.chatId, formatDailyReport(detail));
        console.log(`[Cron] Daily report → tenant=${owner.tenantId}`);
      }
    } catch (err) {
      console.error('[Cron] Daily report failed:', (err as Error).message);
    }
  }, { timezone: 'Asia/Tashkent' });

  console.log('[Bot] Cron jobs registered:');
  console.log(`  Low stock:  ${config.lowStockCheckCron} (per-tenant)`);
  console.log(`  Expiry:     ${config.expiryCheckCron} (per-tenant)`);
  console.log('  Refunds:    */15 * * * * (per-tenant)');
  console.log('  Daily:      0 20 * * * (per-tenant)');
}
