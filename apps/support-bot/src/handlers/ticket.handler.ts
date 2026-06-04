import { Bot, InlineKeyboard } from 'grammy';
import { config } from '../config';
import { logger } from '../logger';

interface Ticket {
  id: string;
  chatId: string;
  name: string;
  username: string;
  text: string;
  date: string;
  status: 'Открыта' | 'Закрыта';
}

const allTickets: Ticket[] = [];

function isAdmin(chatId: string): boolean {
  return config.escalationChatIds.includes(chatId);
}

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

    const ticket: Ticket = { id: ticketId, chatId, name, username, text, date: now, status: 'Открыта' };
    allTickets.push(ticket);

    await ctx.reply(
      `✅ Заявка создана!\n\n` +
      `🎫 Номер: ${ticketId}\n` +
      `📝 Описание: ${text}\n` +
      `📅 Дата: ${now}\n` +
      `📊 Статус: Открыта\n\n` +
      `Наша команда рассмотрит вашу заявку в ближайшее время.`,
    );

    const kb = new InlineKeyboard().row(
      InlineKeyboard.text('✅ Закрыть тикет', `close_ticket:${ticketId}`),
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
        await bot.api.sendMessage(target, alertMsg, { reply_markup: kb });
      } catch (err) {
        logger.error(`[Ticket] Failed to notify ${target}`, { error: (err as Error).message });
      }
    }

    logger.log('[Ticket] Created', { ticketId, chatId, text: text.slice(0, 100) });
  });

  bot.command('mytickets', async (ctx) => {
    const chatId = String(ctx.chat.id);

    if (isAdmin(chatId)) {
      const open = allTickets.filter((t) => t.status === 'Открыта');
      const closed = allTickets.filter((t) => t.status === 'Закрыта');

      if (allTickets.length === 0) {
        await ctx.reply('📋 Заявок пока нет.');
        return;
      }

      const lines = [`📋 Все заявки (админ)\n\nОткрытые: ${open.length} | Закрытые: ${closed.length}\n`];

      const recent = allTickets.slice(-10).reverse();
      for (const t of recent) {
        const icon = t.status === 'Открыта' ? '🟡' : '🟢';
        lines.push(`${icon} ${t.id} | ${t.name} (${t.username})`);
        lines.push(`   ${t.text.slice(0, 50)}`);
        lines.push(`   ${t.date} | ${t.status}\n`);
      }

      await ctx.reply(lines.join('\n'));
      return;
    }

    const tickets = allTickets.filter((t) => t.chatId === chatId);

    if (tickets.length === 0) {
      await ctx.reply('📋 У вас пока нет заявок.\n\nСоздать: /ticket <описание проблемы>');
      return;
    }

    const lines = ['📋 Ваши заявки:\n'];
    const recent = tickets.slice(-5).reverse();
    for (let i = 0; i < recent.length; i++) {
      const t = recent[i]!;
      const icon = t.status === 'Открыта' ? '🟡' : '🟢';
      lines.push(`${i + 1}. ${icon} ${t.text.slice(0, 60)}`);
      lines.push(`   Дата: ${t.date} | Статус: ${t.status}\n`);
    }

    await ctx.reply(lines.join('\n'));
  });

  bot.callbackQuery(/^close_ticket:(.+)$/, async (ctx) => {
    const chatId = String(ctx.chat?.id);

    if (!isAdmin(chatId)) {
      await ctx.answerCallbackQuery({ text: 'Только админы могут закрывать тикеты' });
      return;
    }

    const ticketId = ctx.match![1]!;
    const ticket = allTickets.find((t) => t.id === ticketId);

    if (!ticket) {
      await ctx.answerCallbackQuery({ text: 'Тикет не найден' });
      return;
    }

    ticket.status = 'Закрыта';

    await ctx.editMessageText(
      ctx.callbackQuery.message?.text + '\n\n✅ Закрыта',
    );
    await ctx.answerCallbackQuery({ text: `Тикет ${ticketId} закрыт` });

    try {
      await bot.api.sendMessage(
        ticket.chatId,
        `✅ Ваша заявка ${ticket.id} была рассмотрена и закрыта.\n\nЕсли проблема не решена — создайте новую: /ticket`,
      );
    } catch (err) {
      logger.error(`[Ticket] Failed to notify user`, { error: (err as Error).message });
    }

    logger.log('[Ticket] Closed', { ticketId, closedBy: chatId });
  });
}
