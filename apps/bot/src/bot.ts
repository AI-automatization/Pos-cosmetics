import { Bot } from 'grammy';
import { config } from './config';
import { registerCommands } from './handlers/commands';

export function createBot(): Bot {
  const bot = new Bot(config.botToken);

  // Global xato handler
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`[Bot] Error on update ${ctx.update.update_id}:`, err.error);
  });

  // Komandalar ro'yxatini Telegram ga yuborish
  bot.api.setMyCommands([
    { command: 'start',    description: 'Botni ishga tushirish' },
    { command: 'report',   description: 'Bugungi savdo hisoboti' },
    { command: 'sales',    description: 'Joriy kun savdo statistikasi' },
    { command: 'stock',    description: 'Barcode bo\'yicha stok tekshirish' },
    { command: 'debt',     description: 'Telefon bo\'yicha mijoz qarzi' },
    { command: 'shift',    description: 'Aktiv smenalar holati' },
    { command: 'lowstock', description: 'Kam qolgan mahsulotlar' },
    { command: 'expiring', description: 'Muddati yaqin mahsulotlar' },
    { command: 'help',     description: 'Yordam' },
  ]).catch((e) => console.error('[Bot] setMyCommands failed:', e.message));

  // Komandalar ro'yxatga qo'shish
  registerCommands(bot);

  // Noma'lum xabarlarga javob
  bot.on('message:text', async (ctx) => {
    await ctx.reply(
      'Buyruqlarni ko\'rish uchun /help ni bosing',
    );
  });

  return bot;
}
