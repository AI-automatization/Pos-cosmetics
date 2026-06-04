import { Bot } from 'grammy';

export function registerHelpHandler(bot: Bot) {
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `📖 *RAOS Support Bot — Buyruqlar*\n\n` +
      `/faq — Savollar va javoblar \\(FAQ\\)\n` +
      `/status — Barcha xizmatlar holati\n` +
      `/ticket — Texnik yordamga murojaat\n` +
      `/help — Shu yordam\n\n` +
      `💬 Istalgan savolingizni yozing — bot javob berishga harakat qiladi\\.\n` +
      `Agar bot javob bera olmasa — murojaat jamoaga uzatiladi\\.`,
      { parse_mode: 'MarkdownV2' },
    );
  });
}
