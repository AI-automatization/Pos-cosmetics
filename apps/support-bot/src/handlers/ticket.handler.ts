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
  messages: { from: 'user' | 'admin'; text: string; date: string; adminName?: string }[];
}

const allTickets: Ticket[] = [];
const replyMode = new Map<string, string>();

function isAdmin(chatId: string): boolean {
  return config.escalationChatIds.includes(chatId);
}

function findTicket(id: string): Ticket | undefined {
  return allTickets.find((t) => t.id === id);
}

function getTime(): string {
  return new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
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
    const now = getTime();

    const ticket: Ticket = {
      id: ticketId, chatId, name, username, text, date: now, status: 'Открыта',
      messages: [{ from: 'user', text, date: now }],
    };
    allTickets.push(ticket);

    await ctx.reply(
      `✅ Заявка создана!\n\n` +
      `🎫 Номер: ${ticketId}\n` +
      `📝 Описание: ${text}\n` +
      `📅 Дата: ${now}\n` +
      `📊 Статус: Открыта\n\n` +
      `Наша команда рассмотрит вашу заявку в ближайшее время.`,
    );

    const kb = new InlineKeyboard()
      .row(InlineKeyboard.text('💬 Ответить клиенту', `reply_ticket:${ticketId}`))
      .row(InlineKeyboard.text('✅ Закрыть тикет', `close_ticket:${ticketId}`));

    const alertMsg = [
      `🎫 НОВАЯ ЗАЯВКА\n`,
      `Номер: ${ticketId}`,
      `От: ${name} (${username})`,
      `Chat ID: ${chatId}`,
      `Дата: ${now}`,
      `\nОписание:\n${text}`,
      `\n💬 Нажмите "Ответить клиенту" чтобы ответить`,
    ].join('\n');

    const targets = [...config.escalationChatIds];
    if (config.supportChannelId) targets.push(config.supportChannelId);

    for (const target of targets) {
      try {
        await bot.api.sendMessage(target, alertMsg, { reply_markup: kb });
      } catch (err) {
        logger.error(`[Ticket] Failed to notify ${target}`, { error: (err as Error).message });
      }
    }

    logger.log('[Ticket] Created', { ticketId, chatId, text: text.slice(0, 100) });
  });

  bot.command('reply', async (ctx) => {
    const chatId = String(ctx.chat.id);
    if (!isAdmin(chatId)) return;

    const parts = ctx.message?.text?.replace(/^\/reply\s*/, '').trim().split(' ');
    if (!parts || parts.length < 2) {
      await ctx.reply('Формат: /reply T-XXXXX Текст ответа');
      return;
    }

    const ticketId = parts[0]!;
    const replyText = parts.slice(1).join(' ');
    const ticket = findTicket(ticketId);

    if (!ticket) {
      await ctx.reply(`Тикет ${ticketId} не найден`);
      return;
    }

    const adminName = ctx.from?.first_name ?? 'Поддержка';
    const now = getTime();
    ticket.messages.push({ from: 'admin', text: replyText, date: now, adminName });

    try {
      await bot.api.sendMessage(
        ticket.chatId,
        `💬 Ответ по заявке ${ticket.id}:\n\n${replyText}\n\n— ${adminName}, служба поддержки RAOS`,
      );
      await ctx.reply(`✅ Ответ отправлен клиенту ${ticket.name}`);
    } catch (err) {
      await ctx.reply(`❌ Не удалось отправить: ${(err as Error).message}`);
    }
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
        lines.push(`   ${t.date} | ${t.status}`);
        lines.push(`   Ответить: /reply ${t.id} <текст>\n`);
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
      lines.push(`   Дата: ${t.date} | Статус: ${t.status}`);
      if (t.messages.length > 1) {
        const lastReply = t.messages.filter((m) => m.from === 'admin').pop();
        if (lastReply) {
          lines.push(`   💬 Последний ответ: ${lastReply.text.slice(0, 40)}...`);
        }
      }
      lines.push('');
    }

    await ctx.reply(lines.join('\n'));
  });

  bot.callbackQuery(/^reply_ticket:(.+)$/, async (ctx) => {
    const chatId = String(ctx.chat?.id);
    if (!isAdmin(chatId)) {
      await ctx.answerCallbackQuery({ text: 'Только для админов' });
      return;
    }

    const ticketId = ctx.match![1]!;
    const ticket = findTicket(ticketId);
    if (!ticket) {
      await ctx.answerCallbackQuery({ text: 'Тикет не найден' });
      return;
    }

    replyMode.set(chatId, ticketId);

    await ctx.answerCallbackQuery();
    await bot.api.sendMessage(chatId,
      `💬 Режим ответа на тикет ${ticketId}\n\n` +
      `Клиент: ${ticket.name} (${ticket.username})\n` +
      `Вопрос: ${ticket.text}\n\n` +
      `Напишите ваш ответ следующим сообщением.\n` +
      `Для отмены: /cancel`,
    );
  });

  bot.command('cancel', async (ctx) => {
    const chatId = String(ctx.chat.id);
    if (replyMode.has(chatId)) {
      replyMode.delete(chatId);
      await ctx.reply('❌ Режим ответа отменён.');
    }
  });

  bot.on('message:text', async (ctx, next) => {
    const chatId = String(ctx.chat.id);
    const ticketId = replyMode.get(chatId);

    if (!ticketId || !isAdmin(chatId)) {
      return next();
    }

    const ticket = findTicket(ticketId);
    if (!ticket) {
      replyMode.delete(chatId);
      return next();
    }

    const text = ctx.message.text;
    if (text.startsWith('/')) {
      replyMode.delete(chatId);
      return next();
    }

    const adminName = ctx.from?.first_name ?? 'Поддержка';
    const now = getTime();
    ticket.messages.push({ from: 'admin', text, date: now, adminName });
    replyMode.delete(chatId);

    try {
      await bot.api.sendMessage(
        ticket.chatId,
        `💬 Ответ по заявке ${ticket.id}:\n\n${text}\n\n— ${adminName}, служба поддержки RAOS`,
      );
      await ctx.reply(`✅ Ответ отправлен клиенту ${ticket.name} (${ticket.username})`);
    } catch (err) {
      await ctx.reply(`❌ Не удалось отправить: ${(err as Error).message}`);
    }
  });

  bot.callbackQuery(/^close_ticket:(.+)$/, async (ctx) => {
    const chatId = String(ctx.chat?.id);

    if (!isAdmin(chatId)) {
      await ctx.answerCallbackQuery({ text: 'Только админы могут закрывать тикеты' });
      return;
    }

    const ticketId = ctx.match![1]!;
    const ticket = findTicket(ticketId);

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
