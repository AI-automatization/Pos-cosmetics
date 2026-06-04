import { Bot } from 'grammy';
import { config } from '../config';
import { logger } from '../logger';

const userTickets = new Map<string, { text: string; date: string; status: string }[]>();

export function registerTicketHandler(bot: Bot) {
  bot.command('ticket', async (ctx) => {
    const chatId = String(ctx.chat.id);
    const text = ctx.message?.text?.replace(/^\/ticket\s*/, '').trim();

    if (!text) {
      await ctx.reply(
        '🎫 Создание заявки в поддержку\n\n' +
        'Отправьте команду с описанием проблемы:\n' +
        '/ticket <описание проблемы>\n\n' +
        'Примеры:\n' +
        '• /ticket Не могу войти в систему\n' +
        '• /ticket Принтер не печатает чеки\n' +
        '• /ticket Товары не синхронизируются\n\n' +
        'Для просмотра ваших заявок: /mytickets',
      );
      return;
    }

    const name = ctx.from?.first_name ?? 'Пользователь';
    const username = ctx.from?.username ? `@${ctx.from.username}` : 'нет username';
    const ticketId = `T-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });

    if (!userTickets.has(chatId)) {
      userTickets.set(chatId, []);
    }
    userTickets.get(chatId)!.push({ text, date: now, status: 'Открыта' });

    await ctx.reply(
      `✅ Заявка создана!\n\n` +
      `🎫 Номер: ${ticketId}\n` +
      `📝 Описание: ${text}\n` +
      `📅 Дата: ${now}\n` +
      `📊 Статус: Открыта\n\n` +
      `Наша команда рассмотрит вашу заявку в ближайшее время.`,
    );

    const alertMsg = [
      `🎫 НОВАЯ ЗАЯВКА\n`,
      `Номер: ${ticketId}`,
      `От: ${name} (${username})`,
      `Chat ID: ${chatId}`,
      `Дата: ${now}`,
      `\nОписание:\n${text}`,
    ].join('\n');

    const targets = [...config.escalationChatIds];
    if (config.supportChannelId) {
      targets.push(config.supportChannelId);
    }

    for (const target of targets) {
      try {
        await bot.api.sendMessage(target, alertMsg);
      } catch (err) {
        logger.error(`[Ticket] Failed to notify ${target}`, { error: (err as Error).message });
      }
    }

    logger.log('[Ticket] Created', { ticketId, chatId, text: text.slice(0, 100) });
  });

  bot.command('mytickets', async (ctx) => {
    const chatId = String(ctx.chat.id);
    const tickets = userTickets.get(chatId);

    if (!tickets || tickets.length === 0) {
      await ctx.reply('📋 У вас пока нет заявок.\n\nСоздать: /ticket <описание проблемы>');
      return;
    }

    const lines = ['📋 Ваши заявки:\n'];
    for (let i = tickets.length - 1; i >= Math.max(0, tickets.length - 5); i--) {
      const t = tickets[i]!;
      lines.push(`${tickets.length - i}. ${t.status === 'Открыта' ? '🟡' : '🟢'} ${t.text.slice(0, 60)}`);
      lines.push(`   Дата: ${t.date} | Статус: ${t.status}\n`);
    }

    await ctx.reply(lines.join('\n'));
  });
}
