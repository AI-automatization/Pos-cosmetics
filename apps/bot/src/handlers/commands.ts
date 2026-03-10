// T-125: Auth middleware — getUserByChatId
// T-126: Tenant izolyatsiya
// T-127: Role-based access

import { Bot, Context } from 'grammy';
import { config } from '../config';
import { getUserByChatId, isBotAllowed } from '../services/auth.service';
import { getTodaySummary } from '../services/report.service';
import { getLowStockItems, getExpiringItems } from '../services/alert.service';
import {
  formatDailyReport,
  formatLowStockAlert,
  formatExpiryAlert,
  formatStockInfo,
  formatDebtInfo,
  formatShiftList,
  money,
  esc,
} from '../services/formatter';
import { getStockByBarcode, getDebtByPhone, getActiveShifts } from '../services/stock.service';

// ─── Auth helper ─────────────────────────────────────────────

const NO_ACCESS_MSG =
  '❌ Botdan foydalanish uchun avval hisobingizni bog\'lang\\.\n\n' +
  'RAOS tizimiga kirng va Telegram bot link oling\\.';

const NO_ROLE_MSG =
  '❌ Sizning rolingizda bot huquqi yo\'q\\.\n' +
  'CASHIER roli bot ishlatishi mumkin emas\\.';

async function getAuthUser(ctx: Context) {
  const chatId = String(ctx.chat?.id);
  const user = await getUserByChatId(chatId);

  if (!user) {
    await ctx.reply(NO_ACCESS_MSG, { parse_mode: 'MarkdownV2' });
    return null;
  }

  if (!isBotAllowed(user.role)) {
    await ctx.reply(NO_ROLE_MSG, { parse_mode: 'MarkdownV2' });
    return null;
  }

  return user;
}

// ─── Komandalar ───────────────────────────────────────────────

export function registerCommands(bot: Bot) {

  // ─── /start ─────────────────────────────────────────────────

  bot.command('start', async (ctx) => {
    const payload = ctx.match?.trim();
    if (payload && payload.length > 0) {
      await handleLinkToken(ctx, payload);
      return;
    }

    await ctx.reply(
      '👋 Salom\\! Men *RAOS* savdo tizimi botiman\\.\n\n' +
      'Botdan foydalanish uchun RAOS tizimiga kiring va\n' +
      'Telegram hisobingizni bog\'lang\\.\n\n' +
      '*Bog\'langandan keyin buyruqlar:*\n' +
      '📊 /report — Bugungi savdo hisoboti\n' +
      '📈 /sales — Joriy kun savdo statistikasi\n' +
      '📦 /stock <barcode> — Mahsulot stok tekshirish\n' +
      '💳 /debt <telefon> — Mijoz qarzi\n' +
      '🔄 /shift — Aktiv smenalar\n' +
      '⚠️ /lowstock — Kam qolgan mahsulotlar\n' +
      '🗓 /expiring — Muddati yaqin mahsulotlar\n' +
      '🔔 /settings — Bildirishnoma sozlamalari\n' +
      '❓ /help — Yordam',
      { parse_mode: 'MarkdownV2' },
    );
  });

  // ─── /help ──────────────────────────────────────────────────

  bot.command('help', async (ctx) => {
    await ctx.reply(
      '*RAOS Bot — Buyruqlar:*\n\n' +
      '`/report` — bugungi savdo, top mahsulotlar, to\'lov usullari\n' +
      '`/sales` — joriy kun savdo statistikasi\n' +
      '`/stock 8901234567890` — barcode bo\'yicha stok\n' +
      '`/debt +998901234567` — telefon bo\'yicha qarz\n' +
      '`/shift` — barcha aktiv smenalar holati\n' +
      '`/lowstock` — min level dan past mahsulotlar\n' +
      '`/expiring` — 30 kun ichida muddati tugaydigan mahsulotlar\n' +
      '`/settings` — bildirishnoma sozlamalari\n\n' +
      '_Alertlar avtomatik keladi: kam qoldiq, muddati yaqin, katta qaytarish_',
      { parse_mode: 'MarkdownV2' },
    );
  });

  // ─── /report ────────────────────────────────────────────────

  bot.command('report', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    await ctx.reply('⏳ Hisobot tayyorlanmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const detail = await getTodaySummary(user.tenantId);
      await ctx.reply(formatDailyReport(detail), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('[Bot /report]', err);
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
      console.error('[Bot /sales]', err);
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  });

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
        await ctx.reply(
          `❌ Barcode topilmadi: \`${esc(barcode)}\``,
          { parse_mode: 'MarkdownV2' },
        );
        return;
      }

      await ctx.reply(formatStockInfo(info), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('[Bot /stock]', err);
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
        await ctx.reply(
          `✅ *${esc(info.customerName)}* ning qarzi yo'q`,
          { parse_mode: 'MarkdownV2' },
        );
        return;
      }

      await ctx.reply(formatDebtInfo(info), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('[Bot /debt]', err);
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  });

  // ─── /shift ─────────────────────────────────────────────────

  bot.command('shift', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    await ctx.reply('⏳ Yuklanmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const shifts = await getActiveShifts(user.tenantId);
      await ctx.reply(formatShiftList(shifts), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('[Bot /shift]', err);
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  });

  // ─── /lowstock ──────────────────────────────────────────────

  bot.command('lowstock', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    await ctx.reply('⏳ Tekshirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const items = await getLowStockItems(user.tenantId);
      await ctx.reply(formatLowStockAlert(items), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('[Bot /lowstock]', err);
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  });

  // ─── /expiring ──────────────────────────────────────────────

  bot.command('expiring', async (ctx) => {
    const user = await getAuthUser(ctx);
    if (!user) return;

    // User sozlamalaridan expiryDays olish
    const days = user.settings.expiryDays;

    await ctx.reply('⏳ Tekshirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const items = await getExpiringItems(days, user.tenantId);
      await ctx.reply(formatExpiryAlert(items), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('[Bot /expiring]', err);
      await ctx.reply('❌ Xatolik yuz berdi\\.', { parse_mode: 'MarkdownV2' });
    }
  });

  // ─── Noma'lum xabarlar ──────────────────────────────────────

  bot.on('message:text', async (ctx) => {
    await ctx.reply('Buyruqlarni ko\'rish uchun /help ni bosing');
  });
}

// ─── Deep link token orqali Telegram hisobini bog'lash ────────

async function handleLinkToken(ctx: Context, token: string): Promise<void> {
  const chatId = String(ctx.chat?.id);
  if (!chatId) {
    await ctx.reply('Xatolik: chat ID topilmadi\\.');
    return;
  }

  try {
    const res = await fetch(`${config.apiUrl}/notifications/telegram/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, chatId }),
    });

    const data = (await res.json()) as { success: boolean; type?: string };

    if (data.success) {
      const who = data.type === 'user' ? 'Hisobingiz' : 'Profilingiz';
      await ctx.reply(
        `✅ ${who} RAOS ga muvaffaqiyatli bog'landi\\!\n\n` +
        `Endi siz Telegram orqali bildirishnomalar olasiz\\.\n\n` +
        `Sozlamalar uchun /settings buyrug'ini ishlating\\.`,
      );
    } else {
      await ctx.reply(
        `❌ Token yaroqsiz yoki muddati o'tgan\\.\n\n` +
        `Yangi link olish uchun RAOS tizimiga kiring\\.`,
      );
    }
  } catch {
    await ctx.reply('❌ Server bilan bog\'lanishda xatolik yuz berdi\\.');
  }
}
