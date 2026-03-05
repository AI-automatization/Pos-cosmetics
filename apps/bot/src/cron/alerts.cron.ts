import cron from 'node-cron';
import { Bot } from 'grammy';
import { config } from '../config';
import { getLowStockItems, getExpiringItems, getRecentSuspiciousRefunds } from '../services/alert.service';
import { formatLowStockAlert, formatExpiryAlert, formatRefundAlert } from '../services/formatter';

// Admin chatlarga xabar yuborish
async function notifyAdmins(bot: Bot, message: string) {
  if (config.adminChatIds.length === 0) {
    console.warn('[Bot Cron] BOT_ADMIN_CHAT_IDS not set — skipping notification');
    return;
  }
  for (const chatId of config.adminChatIds) {
    try {
      await bot.api.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error(`[Bot Cron] Failed to send to ${chatId}:`, (err as Error).message);
    }
  }
}

export function startCronJobs(bot: Bot) {

  // ─── 1. Low stock check — har soat ─────────────────────────

  cron.schedule(config.lowStockCheckCron, async () => {
    console.log('[Cron] Low stock check started');
    try {
      const items = await getLowStockItems();
      if (items.length > 0) {
        const msg = formatLowStockAlert(items);
        await notifyAdmins(bot, msg);
        console.log(`[Cron] Low stock alert sent: ${items.length} items`);
      } else {
        console.log('[Cron] Low stock check: all OK');
      }
    } catch (err) {
      console.error('[Cron] Low stock check failed:', (err as Error).message);
    }
  }, { timezone: 'Asia/Tashkent' });

  // ─── 2. Expiry check — har kuni 08:00 ──────────────────────

  cron.schedule(config.expiryCheckCron, async () => {
    console.log('[Cron] Expiry check started');
    try {
      const items = await getExpiringItems(config.expiryDaysWarning);
      if (items.length > 0) {
        const msg = formatExpiryAlert(items);
        await notifyAdmins(bot, msg);
        console.log(`[Cron] Expiry alert sent: ${items.length} items`);
      } else {
        console.log('[Cron] Expiry check: all OK');
      }
    } catch (err) {
      console.error('[Cron] Expiry check failed:', (err as Error).message);
    }
  }, { timezone: 'Asia/Tashkent' });

  // ─── 3. Suspicious refund check — har 15 daqiqa ────────────

  cron.schedule('*/15 * * * *', async () => {
    try {
      const refunds = await getRecentSuspiciousRefunds();
      for (const refund of refunds) {
        const msg = formatRefundAlert(refund);
        await notifyAdmins(bot, msg);
      }
      if (refunds.length > 0) {
        console.log(`[Cron] Suspicious refund alert sent: ${refunds.length} refunds`);
      }
    } catch (err) {
      console.error('[Cron] Refund check failed:', (err as Error).message);
    }
  }, { timezone: 'Asia/Tashkent' });

  // ─── 4. Kunlik savdo hisoboti — har kuni 20:00 ─────────────

  cron.schedule('0 20 * * *', async () => {
    console.log('[Cron] Daily report started');
    try {
      const { getAllTenantsSummary } = await import('../services/report.service');
      const summaries = await getAllTenantsSummary();

      if (summaries.length === 0) return;

      const lines = summaries.map(
        (s) => `🏪 *${escMd(s.tenant)}*: ${s.orders} buyurtma — ${formatMoney(s.revenue)} so'm`,
      );

      const msg =
        `📊 *Kunlik hisobot \\| ${new Date().toLocaleDateString('uz-UZ')}*\n\n` +
        lines.join('\n');

      await notifyAdmins(bot, msg);
      console.log('[Cron] Daily report sent');
    } catch (err) {
      console.error('[Cron] Daily report failed:', (err as Error).message);
    }
  }, { timezone: 'Asia/Tashkent' });

  console.log('[Bot] Cron jobs registered:');
  console.log(`  Low stock: ${config.lowStockCheckCron}`);
  console.log(`  Expiry:    ${config.expiryCheckCron}`);
  console.log('  Refunds:   */15 * * * *');
  console.log('  Daily:     0 20 * * *');
}

function escMd(s: string) {
  return s.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n));
}
