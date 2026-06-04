import { Bot, InlineKeyboard } from 'grammy';
import { getCategories, getFaqByCategory, getFaqById, formatFaqAnswer } from '../services/faq.service';

export function registerFaqHandler(bot: Bot) {
  bot.command('faq', async (ctx) => {
    const kb = new InlineKeyboard();
    const cats = getCategories();

    for (let i = 0; i < cats.length; i += 2) {
      const row: { text: string; callback_data: string }[] = [];
      row.push({ text: `${cats[i].label_ru}`, callback_data: `faq_cat:${cats[i].id}` });
      if (cats[i + 1]) {
        row.push({ text: `${cats[i + 1].label_ru}`, callback_data: `faq_cat:${cats[i + 1].id}` });
      }
      kb.row(...row.map((r) => InlineKeyboard.text(r.text, r.callback_data)));
    }

    await ctx.reply('📋 *Выберите категорию:*', {
      parse_mode: 'MarkdownV2',
      reply_markup: kb,
    });
  });

  bot.callbackQuery(/^faq_cat:(.+)$/, async (ctx) => {
    const catId = ctx.match[1];
    const entries = getFaqByCategory(catId);

    if (entries.length === 0) {
      await ctx.answerCallbackQuery({ text: 'В этой категории пока нет вопросов' });
      return;
    }

    const kb = new InlineKeyboard();
    for (const entry of entries) {
      kb.row(InlineKeyboard.text(entry.question_ru, `faq_item:${entry.id}`));
    }
    kb.row(InlineKeyboard.text('◀️ Назад', 'faq_back'));

    await ctx.editMessageText('📋 *Выберите вопрос:*', {
      parse_mode: 'MarkdownV2',
      reply_markup: kb,
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^faq_item:(.+)$/, async (ctx) => {
    const entry = getFaqById(ctx.match[1]);
    if (!entry) {
      await ctx.answerCallbackQuery({ text: 'Вопрос не найден' });
      return;
    }

    const text = formatFaqAnswer(entry, 'ru');
    const kb = new InlineKeyboard()
      .row(InlineKeyboard.text('◀️ Назад к категории', `faq_cat:${entry.category}`))
      .row(InlineKeyboard.text('🎫 Это не помогло — создать тикет', 'create_ticket'));

    await ctx.editMessageText(text, {
      parse_mode: 'MarkdownV2',
      reply_markup: kb,
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('faq_back', async (ctx) => {
    const kb = new InlineKeyboard();
    const cats = getCategories();

    for (let i = 0; i < cats.length; i += 2) {
      const row: { text: string; callback_data: string }[] = [];
      row.push({ text: cats[i].label_ru, callback_data: `faq_cat:${cats[i].id}` });
      if (cats[i + 1]) {
        row.push({ text: cats[i + 1].label_ru, callback_data: `faq_cat:${cats[i + 1].id}` });
      }
      kb.row(...row.map((r) => InlineKeyboard.text(r.text, r.callback_data)));
    }

    await ctx.editMessageText('📋 *Выберите категорию:*', {
      parse_mode: 'MarkdownV2',
      reply_markup: kb,
    });
    await ctx.answerCallbackQuery();
  });
}
