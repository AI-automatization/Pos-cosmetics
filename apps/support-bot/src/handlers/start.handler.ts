import { Bot } from 'grammy';

export function registerStartHandler(bot: Bot) {
  bot.command('start', async (ctx) => {
    const name = ctx.from?.first_name ?? 'foydalanuvchi';
    await ctx.reply(
      `Assalomu alaykum, ${name}!\n\n` +
      `Men RAOS Support Bot — texnik yordam botiman.\n\n` +
      `Men sizga yordam bera olaman:\n` +
      `📋 Tez-tez so'raladigan savollar\n` +
      `📊 Tizim holati tekshirish\n` +
      `🎫 Texnik yordam so'rash\n\n` +
      `Buyruqlar:\n` +
      `/faq — Savollar va javoblar\n` +
      `/status — Tizim holati\n` +
      `/ticket — Yordam so'rash\n` +
      `/help — Barcha buyruqlar\n\n` +
      `Yoki shunchaki savolingizni yozing — men javob berishga harakat qilaman! 💬`,
    );
  });
}
