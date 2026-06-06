import { Bot } from 'grammy';

export function registerHelpHandler(bot: Bot) {
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `📖 RAOS Support Bot — Команды\n\n` +
      `/faq — Частые вопросы и ответы (FAQ)\n` +
      `/status — Статус всех сервисов\n` +
      `/ticket — Создать заявку в поддержку\n` +
      `/help — Эта справка\n\n` +
      `💬 Напишите любой вопрос — бот постарается ответить.\n` +
      `Если бот не сможет помочь — заявка будет передана команде.`,
    );
  });
}
