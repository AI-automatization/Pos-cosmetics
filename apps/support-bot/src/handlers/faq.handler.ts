import { Bot, InlineKeyboard } from 'grammy';
import { getCategories, getFaqByCategory, getFaqById } from '../services/faq.service';

function buildCategoryKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();
  const cats = getCategories();

  for (let i = 0; i < cats.length; i += 2) {
    const first = cats[i]!;
    const second = cats[i + 1];
    if (second) {
      kb.row(
        InlineKeyboard.text(first.label_ru, `faq_cat:${first.id}`),
        InlineKeyboard.text(second.label_ru, `faq_cat:${second.id}`),
      );
    } else {
      kb.row(InlineKeyboard.text(first.label_ru, `faq_cat:${first.id}`));
    }
  }

  return kb;
}

export function registerFaqHandler(bot: Bot) {
  bot.command('faq', async (ctx) => {
    await ctx.reply('📋 Выберите категорию:', {
      reply_markup: buildCategoryKeyboard(),
    });
  });

  bot.callbackQuery(/^faq_cat:(.+)$/, async (ctx) => {
    const catId = ctx.match![1]!;
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

    await ctx.editMessageText('📋 Выберите вопрос:', { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^faq_item:(.+)$/, async (ctx) => {
    const entry = getFaqById(ctx.match![1]!);
    if (!entry) {
      await ctx.answerCallbackQuery({ text: 'Вопрос не найден' });
      return;
    }

    const text = `❓ ${entry.question_ru}\n\n${entry.answer_ru}`;
    const kb = new InlineKeyboard()
      .row(InlineKeyboard.text('◀️ Назад к категории', `faq_cat:${entry.category}`))
      .row(InlineKeyboard.text('🎫 Не помогло — создать тикет', 'create_ticket'));

    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery('faq_back', async (ctx) => {
    await ctx.editMessageText('📋 Выберите категорию:', {
      reply_markup: buildCategoryKeyboard(),
    });
    await ctx.answerCallbackQuery();
  });
}
