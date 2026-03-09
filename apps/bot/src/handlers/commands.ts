import { Bot, Context } from 'grammy';
import { config } from '../config';
import { getTodaySummary, getAllTenantsSummary } from '../services/report.service';
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
import {
  getStockByBarcode,
  getDebtByPhone,
  getActiveShifts,
} from '../services/stock.service';

export function registerCommands(bot: Bot) {

  // ─── /start ─────────────────────────────────────────────────

  bot.command('start', async (ctx) => {
    // Deep link: /start <token> — Telegram hisobini bog'lash
    const payload = ctx.match?.trim();
    if (payload && payload.length > 0) {
      await handleLinkToken(ctx, payload);
      return;
    }

    await ctx.reply(
      '👋 Salom\\! Men *RAOS* savdo tizimi botiman\\.\n\n' +
      '*Buyruqlar:*\n' +
      '📊 /report — Bugungi savdo hisoboti\n' +
      '📈 /sales — Joriy kun savdo statistikasi\n' +
      '📦 /stock <barcode> — Mahsulot stok tekshirish\n' +
      '💳 /debt <telefon> — Mijoz qarzi\n' +
      '🔄 /shift — Aktiv smenalar\n' +
      '⚠️ /lowstock — Kam qolgan mahsulotlar\n' +
      '🗓 /expiring — Muddati yaqin mahsulotlar\n' +
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
      '`/expiring` — 30 kun ichida muddati tugaydigan mahsulotlar\n\n' +
      '_Alertlar avtomatik keladi: kam qoldiq, muddati yaqin, katta qaytarish_',
      { parse_mode: 'MarkdownV2' },
    );
  });

  // ─── /report ────────────────────────────────────────────────

  bot.command('report', async (ctx) => {
    await ctx.reply('⏳ Hisobot tayyorlanmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const summaries = await getAllTenantsSummary();

      if (summaries.length === 0) {
        await ctx.reply('📭 Hozircha hech qanday savdo yo\'q');
        return;
      }

      if (summaries.length === 1) {
        const tenantId = await getTenantIdByName(summaries[0]!.tenant);
        if (tenantId) {
          const detail = await getTodaySummary(tenantId);
          await ctx.reply(formatDailyReport(detail), { parse_mode: 'MarkdownV2' });
          return;
        }
      }

      const lines = summaries.map(
        (s, i) =>
          `${i + 1}\\. *${esc(s.tenant)}*: ${s.orders} buyurtma — ${money(s.revenue)}`,
      );
      await ctx.reply(
        `📊 *Bugungi hisobot*\n\n${lines.join('\n')}`,
        { parse_mode: 'MarkdownV2' },
      );
    } catch (err) {
      console.error('[Bot /report]', err);
      await ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
    }
  });

  // ─── /sales — joriy kun statistikasi ──────────────────────

  bot.command('sales', async (ctx) => {
    await ctx.reply('⏳ Yuklanmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const summaries = await getAllTenantsSummary();
      if (summaries.length === 0) {
        await ctx.reply('📭 Bugun hali savdo yo\'q');
        return;
      }

      const total = summaries.reduce((s, t) => ({ orders: s.orders + t.orders, revenue: s.revenue + t.revenue }), { orders: 0, revenue: 0 });
      const lines = summaries
        .filter((s) => s.orders > 0)
        .map((s) => `  🏪 *${esc(s.tenant)}*: ${s.orders} ta — ${esc(money(s.revenue))}`);

      const msg =
        `📈 *Bugungi savdo*\n\n` +
        lines.join('\n') +
        `\n\n💰 *Jami: ${esc(money(total.revenue))}* \\(${esc(total.orders)} buyurtma\\)`;

      await ctx.reply(msg, { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('[Bot /sales]', err);
      await ctx.reply('❌ Xatolik yuz berdi.');
    }
  });

  // ─── /stock <barcode> ─────────────────────────────────────

  bot.command('stock', async (ctx) => {
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
      const info = await getStockByBarcode(barcode);

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
      await ctx.reply('❌ Xatolik yuz berdi.');
    }
  });

  // ─── /debt <phone> ────────────────────────────────────────

  bot.command('debt', async (ctx) => {
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
      const info = await getDebtByPhone(phone);

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
      await ctx.reply('❌ Xatolik yuz berdi.');
    }
  });

  // ─── /shift — aktiv smenalar ──────────────────────────────

  bot.command('shift', async (ctx) => {
    await ctx.reply('⏳ Yuklanmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const shifts = await getActiveShifts();
      await ctx.reply(formatShiftList(shifts), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('[Bot /shift]', err);
      await ctx.reply('❌ Xatolik yuz berdi.');
    }
  });

  // ─── /lowstock ──────────────────────────────────────────────

  bot.command('lowstock', async (ctx) => {
    await ctx.reply('⏳ Tekshirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const items = await getLowStockItems();
      await ctx.reply(formatLowStockAlert(items), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('[Bot /lowstock]', err);
      await ctx.reply('❌ Xatolik yuz berdi.');
    }
  });

  // ─── /expiring ──────────────────────────────────────────────

  bot.command('expiring', async (ctx) => {
    await ctx.reply('⏳ Tekshirilmoqda\\.\\.\\.', { parse_mode: 'MarkdownV2' });

    try {
      const items = await getExpiringItems(30);
      await ctx.reply(formatExpiryAlert(items), { parse_mode: 'MarkdownV2' });
    } catch (err) {
      console.error('[Bot /expiring]', err);
      await ctx.reply('❌ Xatolik yuz berdi.');
    }
  });
}

// ─── Helpers ─────────────────────────────────────────────────

async function getTenantIdByName(name: string): Promise<string | null> {
  const { default: prisma } = await import('../prisma');
  const t = await prisma.tenant.findFirst({ where: { name }, select: { id: true } });
  return t?.id ?? null;
}

/**
 * Deep link token orqali Telegram hisobini bog'lash.
 * /start <token> qabul qilinganda chaqiriladi.
 */
async function handleLinkToken(ctx: Context, token: string): Promise<void> {
  const chatId = String(ctx.chat?.id);
  if (!chatId) {
    await ctx.reply('Xatolik: chat ID topilmadi.');
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
        `✅ ${who} RAOS ga muvaffaqiyatli bog'landi!\n\n` +
        `Endi siz Telegram orqali bildirishnomalar olasiz.`,
      );
    } else {
      await ctx.reply(
        `❌ Token yaroqsiz yoki muddati o'tgan.\n\n` +
        `Yangi link olish uchun RAOS tizimiga kiring.`,
      );
    }
  } catch {
    await ctx.reply('❌ Server bilan bog\'lanishda xatolik yuz berdi.');
  }
}
