import { Bot, Context } from 'grammy';
import { getLowStockItems, getExpiringItems } from '../services/alert.service';
import {
  formatLowStockAlert,
  formatExpiryAlert,
  formatStockInfo,
  formatDebtInfo,
  formatShiftList,
  esc,
} from '../services/formatter';
import { getStockByBarcode, getDebtByPhone, getActiveShifts } from '../services/stock.service';
import { logger } from '../logger';
import { getAuthUser } from './login.handler';

export function registerStockHandlers(bot: Bot) {

  // ─── /stock <barcode> ─────────────────────────────────────

  bot.command('stock', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    const barcode = ctx.message?.text?.split(' ').slice(1).join('').trim();
    if (!barcode) {
      await ctx.reply(
        '📦 *Barcode kiriting:*\n`/stock 8901234567890`',
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }

    await ctx.reply('⏳ Qidirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const info = await getStockByBarcode(barcode, user.tenantId);
      if (!info) {
        await ctx.reply(`❌ Barcode topilmadi: \`${esc(barcode)}\``, { parse_mode: 'MarkdownV2' });
        return;
      }
      await ctx.reply(formatStockInfo(info), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot /stock]', { error: (err as Error).message });
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  });

  // ─── /debt <phone> ────────────────────────────────────────

  bot.command('debt', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    const phone = ctx.message?.text?.split(' ').slice(1).join('').trim();
    if (!phone) {
      await ctx.reply(
        '💳 *Telefon raqamini kiriting:*\n`/debt +998901234567`',
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }

    await ctx.reply('⏳ Qidirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const info = await getDebtByPhone(phone, user.tenantId);
      if (!info) {
        await ctx.reply(
          `✅ *${esc(phone)}* raqamli mijoz topilmadi yoki qarzi yo'q`,
          { parse_mode: 'MarkdownV2' },
        );
        return;
      }
      if (info.totalDebt === 0) {
        await ctx.reply(`✅ *${esc(info.customerName)}* ning qarzi yo'q`, { parse_mode: 'MarkdownV2' });
        return;
      }
      await ctx.reply(formatDebtInfo(info), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot /debt]', { error: (err as Error).message });
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  });

  // ─── /shift + /shifts (alias) ───────────────────────────────

  async function handleShifts(ctx: Context): Promise<void> {
    const user = await getAuthUser(ctx);
    if (!user) return;

    await ctx.reply('⏳ Yuklanmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const shifts = await getActiveShifts(user.tenantId);
      await ctx.reply(formatShiftList(shifts), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot /shifts]', { error: (err as Error).message });
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  }

  bot.command('shift',  handleShifts);
  bot.command('shifts', handleShifts);

  // ─── /lowstock ──────────────────────────────────────────────

  bot.command('lowstock', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    await ctx.reply('⏳ Tekshirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const items = await getLowStockItems(user.tenantId);
      await ctx.reply(formatLowStockAlert(items), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot /lowstock]', { error: (err as Error).message });
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  });

  // ─── /expiry + /expiring (alias) ────────────────────────────

  async function handleExpiry(ctx: Context): Promise<void> {
    const user = await getAuthUser(ctx);
    if (!user) return;

    const days = user.settings.expiryDays;
    await ctx.reply('⏳ Tekshirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const items = await getExpiringItems(days, user.tenantId);
      await ctx.reply(formatExpiryAlert(items), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot /expiry]', { error: (err as Error).message });
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  }

  bot.command('expiry',   handleExpiry);
  bot.command('expiring', handleExpiry);
}
