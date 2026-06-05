import { Bot, InlineKeyboard } from 'grammy';
import { matchFaq } from '../services/faq.service';
import { askAI, isAIAvailable } from '../services/ai.service';
import { logger } from '../logger';

export function registerMessageHandler(bot: Bot) {
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return;

    const chatId = String(ctx.chat.id);

    const match = matchFaq(text);
    if (match && match.score >= 0.5) {
      const entry = match.entry;
      const answer = `❓ ${entry.question_ru}\n\n${entry.answer_ru}`;
      const kb = new InlineKeyboard()
        .row(InlineKeyboard.text('✅ Спасибо, помогло!', 'faq_helpful'))
        .row(InlineKeyboard.text('🎫 Не помогло — создать тикет', 'create_ticket'));

      await ctx.reply(answer, { reply_markup: kb });
      logger.log('[FAQ] Matched', { query: text, faqId: entry.id, score: match.score });
      return;
    }

    if (isAIAvailable()) {
      await ctx.reply('🤖 Думаю...');

      const aiAnswer = await askAI(chatId, text);
      if (aiAnswer) {
        const kb = new InlineKeyboard()
          .row(InlineKeyboard.text('✅ Спасибо, помогло!', 'faq_helpful'))
          .row(InlineKeyboard.text('🎫 Не помогло — связаться с человеком', 'create_ticket'));

        await ctx.reply(`🤖 ${aiAnswer}`, { reply_markup: kb });
        return;
      }
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
      '🎫 Для создания заявки отправьте команду:\n\n' +
      '/ticket <описание проблемы>\n\n' +
      'Например: /ticket Не могу войти в систему после смены пароля',
    );
  });
}
