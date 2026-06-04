import { Bot, InlineKeyboard } from 'grammy';
import { matchFaq, formatFaqAnswer } from '../services/faq.service';
import { logger } from '../logger';

export function registerMessageHandler(bot: Bot) {
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text;

    if (text.startsWith('/')) return;

    const match = matchFaq(text);

    if (match && match.score >= 0.4) {
      const answer = formatFaqAnswer(match.entry, 'ru');
      const kb = new InlineKeyboard()
        .row(InlineKeyboard.text('✅ Спасибо, помогло!', 'faq_helpful'))
        .row(InlineKeyboard.text('🎫 Не помогло — создать тикет', 'create_ticket'));

      await ctx.reply(answer, { parse_mode: 'MarkdownV2', reply_markup: kb });
      logger.log('[FAQ] Matched', { query: text, faqId: match.entry.id, score: match.score });
      return;
    }

    await ctx.reply(
      '🤔 Я пока не нашёл ответ на ваш вопрос.\n\n' +
      'Вы можете:\n' +
      '📋 /faq — посмотреть частые вопросы\n' +
      '🎫 /ticket — создать заявку в поддержку\n' +
      '📊 /status — проверить статус системы',
    );
  });

  bot.callbackQuery('faq_helpful', async (ctx) => {
    await ctx.editMessageReplyMarkup({ reply_markup: undefined });
    await ctx.answerCallbackQuery({ text: 'Рады помочь! 😊' });
  });

  bot.callbackQuery('create_ticket', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      '🎫 Для создания тикета отправьте команду:\n\n' +
      '/ticket <описание проблемы>\n\n' +
      'Например: /ticket Не могу войти в систему после смены пароля',
    );
  });
}
