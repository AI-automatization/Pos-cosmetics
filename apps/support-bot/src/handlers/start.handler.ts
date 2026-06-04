import { Bot } from 'grammy';

export function registerStartHandler(bot: Bot) {
  bot.command('start', async (ctx) => {
    const name = ctx.from?.first_name ?? 'пользователь';
    await ctx.reply(
      `Здравствуйте, ${name}! 👋\n\n` +
      `Я RAOS Support Bot — бот технической поддержки.\n\n` +
      `Я могу помочь вам с:\n` +
      `📋 Частые вопросы и ответы\n` +
      `📊 Проверка статуса системы\n` +
      `🎫 Создание заявки в поддержку\n\n` +
      `Команды:\n` +
      `/faq — Вопросы и ответы\n` +
      `/status — Статус системы\n` +
      `/ticket — Создать заявку\n` +
      `/help — Все команды\n\n` +
      `Или просто напишите свой вопрос — я постараюсь ответить! 💬`,
    );
  });
}
