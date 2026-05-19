// T-466: Loyalty Telegram Bot handlers
// /ballar <telefon> — mijoz ballari
// /ball_tarix <telefon> — oxirgi 10 tranzaksiya
// /loyalty — statistika (admin uchun)

import { Bot } from 'grammy';
import { getLoyaltyByPhone, getLoyaltyHistory, getLoyaltyStats } from '../services/loyalty.service';
import { logger } from '../logger';
import { getAuthUser } from './login.handler';

function esc(text: string | number): string {
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

function money(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + " so'm";
}

const TYPE_EMOJI: Record<string, string> = {
  EARN: '+',
  REDEEM: '-',
  ADJUSTMENT: '~',
  EXPIRE: 'x',
};

export function registerLoyaltyHandlers(bot: Bot) {

  // ─── /ballar <telefon> — mijoz ballari ───────────────────────

  bot.command('ballar', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    const phone = ctx.message?.text?.split(' ').slice(1).join('').trim();
    if (!phone) {
      await ctx.reply(
        '⭐ *Telefon raqamini kiriting:*\n`/ballar 901234567`\n\nYoki: `/ballar +998901234567`',
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }

    try {
      const info = await getLoyaltyByPhone(user.tenantId, phone);
      if (!info) {
        await ctx.reply('❌ Mijoz topilmadi yoki loyalty dasturi faol emas');
        return;
      }

      const msg = [
        `⭐ *Loyalty — ${esc(info.customerName)}*`,
        '',
        `📱 Telefon: ${esc(info.phone)}`,
        `💎 Ballar: *${esc(info.points)}* ball`,
        `💰 Qiymati: *${esc(money(info.moneyValue))}*`,
        '',
        `_1 ball \\= ${esc(money(info.redeemRate))}_`,
      ].join('\n');

      await ctx.reply(msg, { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot] /ballar error', { error: (err as Error).message });
      await ctx.reply('❌ Xatolik yuz berdi');
    }
  });

  // ─── "ballarim" / "ball" matn orqali ham ishlaydi ─────────────

  bot.hears(/^(ballarim|ball|bonus)\s*(.*)/i, async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    const phone = ctx.match?.[2]?.trim();
    if (!phone) {
      await ctx.reply('⭐ Telefon raqamini yozing:\nMisol: `ballarim 901234567`', { parse_mode: 'MarkdownV2' });
      return;
    }

    try {
      const info = await getLoyaltyByPhone(user.tenantId, phone);
      if (!info) {
        await ctx.reply('❌ Mijoz topilmadi');
        return;
      }

      await ctx.reply(
        `⭐ ${info.customerName}\n💎 ${info.points} ball (${money(info.moneyValue)})`,
      );
    } catch {
      await ctx.reply('❌ Xatolik');
    }
  });

  // ─── /ball_tarix <telefon> — oxirgi 10 tranzaksiya ───────────

  bot.command('ball_tarix', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    const phone = ctx.message?.text?.split(' ').slice(1).join('').trim();
    if (!phone) {
      await ctx.reply(
        '📋 *Ball tarixi:*\n`/ball\\_tarix 901234567`',
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }

    try {
      const result = await getLoyaltyHistory(user.tenantId, phone);
      if (!result) {
        await ctx.reply('❌ Mijoz topilmadi');
        return;
      }

      if (result.transactions.length === 0) {
        await ctx.reply(`📋 ${result.customer} — ball tarixi bo'sh`);
        return;
      }

      const lines = result.transactions.map((tx) => {
        const emoji = TYPE_EMOJI[tx.type] ?? '?';
        const date = tx.createdAt.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
        const sign = tx.points >= 0 ? '+' : '';
        return `${date} | ${emoji}${sign}${tx.points} | ${tx.note ?? tx.type}`;
      });

      const msg = [
        `📋 *Ball tarixi — ${esc(result.customer)}*`,
        '',
        '```',
        'Sana   | Ball  | Sabab',
        '-------+-------+--------',
        ...lines,
        '```',
      ].join('\n');

      await ctx.reply(msg, { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot] /ball_tarix error', { error: (err as Error).message });
      await ctx.reply('❌ Xatolik');
    }
  });

  // ─── /loyalty — statistika (admin) ─────────────────────────────

  bot.command('loyalty', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    try {
      const stats = await getLoyaltyStats(user.tenantId);
      if (!stats) {
        await ctx.reply('❌ Loyalty dasturi faol emas');
        return;
      }

      const msg = [
        '⭐ *Loyalty Statistika*',
        '',
        `👥 Faol mijozlar: *${esc(stats.activeCustomers)}*`,
        `💎 Jami ballar: *${esc(stats.totalPoints)}*`,
        `📈 Bugun berildi: *\\+${esc(stats.todayEarned)}*`,
        `📉 Bugun yechildi: *\\-${esc(stats.todayRedeemed)}*`,
        '',
        `_1 ball \\= ${esc(money(stats.redeemRate))}_`,
      ].join('\n');

      await ctx.reply(msg, { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error('[Bot] /loyalty error', { error: (err as Error).message });
      await ctx.reply('❌ Xatolik');
    }
  });
}
