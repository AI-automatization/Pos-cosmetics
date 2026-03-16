// T-131: /settings — Inline keyboard orqali bildirishnomalarni sozlash

import { Bot, InlineKeyboard } from 'grammy';
import { getUserByChatId, BotSettings, isBotAllowed } from '../services/auth.service';
import { getBotSettings, updateBotSettings } from '../services/settings.service';

// ─── Inline keyboard yasash ───────────────────────────────────

function buildKeyboard(s: BotSettings): InlineKeyboard {
  const on  = (v: boolean) => (v ? '✅' : '❌');
  const day = (d: number, cur: number) => (cur === d ? `• ${d} kun ●` : `${d} kun`);

  return new InlineKeyboard()
    .text(`${on(s.lowStock)} Kam qoldiq`,       'stg:toggle:lowStock')
    .text(`${on(s.expiry)} Muddati yaqin`,       'stg:toggle:expiry').row()
    .text(`${on(s.dailyReport)} Kunlik hisobot`, 'stg:toggle:dailyReport')
    .text(`${on(s.suspiciousRefund)} Katta qaytarish`, 'stg:toggle:suspiciousRefund').row()
    .text('— Muddati ogohlantirish —',           'stg:noop').row()
    .text(day(30, s.expiryDays), 'stg:expDays:30')
    .text(day(60, s.expiryDays), 'stg:expDays:60')
    .text(day(90, s.expiryDays), 'stg:expDays:90');
}

function buildText(s: BotSettings, name: string): string {
  const on = (v: boolean) => (v ? '✅' : '❌');
  return (
    `🔔 *${name} — Bildirishnomalar sozlamalari*\n\n` +
    `${on(s.lowStock)} Kam qoldiq alertlari\n` +
    `${on(s.expiry)} Muddati yaqin alertlari\n` +
    `${on(s.dailyReport)} Kunlik savdo hisoboti \\(20:00\\)\n` +
    `${on(s.suspiciousRefund)} Katta qaytarish alertlari\n\n` +
    `⏰ Muddati ogohlantirish: *${s.expiryDays} kun oldin*`
  );
}

// ─── Handlerlarni ro'yxatga olish ────────────────────────────

export function registerSettingsHandler(bot: Bot): void {

  // /settings command
  bot.command('settings', async (ctx) => {
    const chatId = String(ctx.chat?.id);
    const user = await getUserByChatId(chatId);

    if (!user || !isBotAllowed(user.role)) {
      await ctx.reply(
        '❌ Sizda bot huquqi yo\'q\\.\nAvval `/start <token>` orqali bog\'laning\\.',
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }

    const s = user.settings;
    const name = `${user.firstName} ${user.lastName}`;

    await ctx.reply(buildText(s, name), {
      parse_mode: 'MarkdownV2',
      reply_markup: buildKeyboard(s),
    });
  });

  // Callback: toggle
  bot.callbackQuery(/^stg:toggle:(.+)$/, async (ctx) => {
    const chatId = String(ctx.chat?.id);
    const user = await getUserByChatId(chatId);
    if (!user) { await ctx.answerCallbackQuery('❌ Foydalanuvchi topilmadi'); return; }

    const field = ctx.match[1] as keyof Pick<BotSettings, 'lowStock' | 'expiry' | 'dailyReport' | 'suspiciousRefund'>;
    const validFields = ['lowStock', 'expiry', 'dailyReport', 'suspiciousRefund'];
    if (!validFields.includes(field)) { await ctx.answerCallbackQuery(); return; }

    const current = await getBotSettings(user.id);
    const updated = await updateBotSettings(user.id, { [field]: !current[field] });

    const name = `${user.firstName} ${user.lastName}`;
    await ctx.editMessageText(buildText(updated, name), {
      parse_mode: 'MarkdownV2',
      reply_markup: buildKeyboard(updated),
    });
    await ctx.answerCallbackQuery('✅ Saqlandi');
  });

  // Callback: expiryDays
  bot.callbackQuery(/^stg:expDays:(\d+)$/, async (ctx) => {
    const chatId = String(ctx.chat?.id);
    const user = await getUserByChatId(chatId);
    if (!user) { await ctx.answerCallbackQuery('❌ Foydalanuvchi topilmadi'); return; }

    const days = Number(ctx.match[1]) as 30 | 60 | 90;
    if (![30, 60, 90].includes(days)) { await ctx.answerCallbackQuery(); return; }

    const updated = await updateBotSettings(user.id, { expiryDays: days });

    const name = `${user.firstName} ${user.lastName}`;
    await ctx.editMessageText(buildText(updated, name), {
      parse_mode: 'MarkdownV2',
      reply_markup: buildKeyboard(updated),
    });
    await ctx.answerCallbackQuery(`✅ ${days} kun`);
  });

  // Callback: noop (label tugmasi — hech narsa qilmaydi)
  bot.callbackQuery('stg:noop', async (ctx) => {
    await ctx.answerCallbackQuery();
  });
}
