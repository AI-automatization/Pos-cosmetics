// T-430: Expiry Tracking — /muddat and /muddati_otgan commands
// /muddat — top 10 muddati yaqin mahsulotlar (30 kun ichida)
// /muddati_otgan — muddati o'tgan, hali omborda bor mahsulotlar

import { Bot, Context } from 'grammy';
import { getExpiringForBot, getExpiredForBot } from '../services/expiry.service';
import { logger } from '../logger';
import { getAuthUser } from './login.handler';

function esc(text: string | number): string {
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function daysIcon(daysLeft: number): string {
  if (daysLeft <= 7) return '\uD83D\uDD34';
  if (daysLeft <= 14) return '\uD83D\uDFE0';
  return '\uD83D\uDFE1';
}

export function registerExpiryHandlers(bot: Bot) {

  // ─── /muddat — muddati yaqin mahsulotlar ────────────────────

  async function handleMuddat(ctx: Context): Promise<void> {
    const user = await getAuthUser(ctx);
    if (!user) return;

    await ctx.reply('\u23F3 Tekshirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const items = await getExpiringForBot(user.tenantId, 30);

      if (items.length === 0) {
        await ctx.reply('\u2705 30 kun ichida muddati tugaydigan mahsulot yo\'q');
        return;
      }

      const lines = items.map((item) => {
        const icon = daysIcon(item.daysLeft);
        const date = formatDate(item.expiryDate);
        return (
          `${icon} *${esc(item.productName)}*\n` +
          `   ${esc(date)} \\(${esc(item.daysLeft)} kun\\) | ${esc(item.qty)} dona` +
          (item.batchNumber ? ` | ${esc(item.batchNumber)}` : '') +
          ` | ${esc(item.warehouseName)}`
        );
      });

      const msg = `\uD83D\uDCC5 *MUDDATI YAQIN MAHSULOTLAR* \\(${esc(items.length)} ta\\)\n\n` + lines.join('\n\n');
      await ctx.reply(msg, { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot /muddat]', { error: (err as Error).message });
      await ctx.reply('\u274C Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  }

  bot.command('muddat', handleMuddat);

  // ─── /muddati_otgan — muddati o'tgan, omborda qolgan ────────

  async function handleExpired(ctx: Context): Promise<void> {
    const user = await getAuthUser(ctx);
    if (!user) return;

    await ctx.reply('\u23F3 Tekshirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const items = await getExpiredForBot(user.tenantId);

      if (items.length === 0) {
        await ctx.reply('\u2705 Muddati o\'tgan mahsulot yo\'q — ajoyib\\!', { parse_mode: 'MarkdownV2' });
        return;
      }

      const lines = items.map((item) => {
        const date = formatDate(item.expiryDate);
        const overdue = Math.abs(item.daysLeft);
        return (
          `\uD83D\uDD34 *${esc(item.productName)}*\n` +
          `   ${esc(date)} \\(${esc(overdue)} kun oldin\\) | ${esc(item.qty)} dona` +
          (item.batchNumber ? ` | ${esc(item.batchNumber)}` : '') +
          ` | ${esc(item.warehouseName)}`
        );
      });

      const msg =
        `\u26D4 *MUDDATI O'TGAN MAHSULOTLAR* \\(${esc(items.length)} ta\\)\n\n` +
        lines.join('\n\n') +
        `\n\n_Darhol olib tashlash tavsiya etiladi\\!_`;

      await ctx.reply(msg, { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot /muddati_otgan]', { error: (err as Error).message });
      await ctx.reply('\u274C Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  }

  bot.command('muddati_otgan', handleExpired);
}
