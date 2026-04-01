import { Bot } from 'grammy';
import { getTodaySummary } from '../services/report.service';
import { formatDailyReport, money, esc } from '../services/formatter';
import { logger } from '../logger';
import { getAuthUser } from './login.handler';

export function registerReportHandlers(bot: Bot) {

  // ─── /report ────────────────────────────────────────────────

  bot.command('report', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    await ctx.reply('⏳ Hisobot tayyorlanmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const detail = await getTodaySummary(user.tenantId);
      await ctx.reply(formatDailyReport(detail), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot /report]', { error: (err as Error).message });
      await ctx.reply('❌ Xatolik yuz berdi\\. Qayta urinib ko\'ring\\.', { parse_mode: 'MarkdownV2' });
    }
  });

  // ─── /sales ─────────────────────────────────────────────────

  bot.command('sales', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    await ctx.reply('⏳ Yuklanmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const detail = await getTodaySummary(user.tenantId);

      const msg =
        `📈 *Bugungi savdo*\n\n` +
        `🛒 Buyurtmalar: *${esc(detail.orders.count)}* ta\n` +
        `💰 Jami: *${esc(money(detail.orders.revenue))}*\n` +
        `↩️ Qaytarishlar: ${esc(detail.returns.count)} ta \\(${esc(money(detail.returns.total))}\\)\n` +
        `✅ Sof daromad: *${esc(money(detail.netRevenue))}*`;

      await ctx.reply(msg, { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot /sales]', { error: (err as Error).message });
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  });
}
