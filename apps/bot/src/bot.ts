import { Bot } from 'grammy';
import { config } from './config';
import { registerCommands } from './handlers/commands';
import { registerSettingsHandler } from './handlers/settings.handler';

export function createBot(): Bot {
  const bot = new Bot(config.botToken);

  // Global xato handler
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`[Bot] Error on update ${ctx.update.update_id}:`, err.error);
  });

  // Komandalar ro'yxatini Telegram ga yuborish
  bot.api.setMyCommands([
    { command: 'start',    description: 'Botni ishga tushirish / Hisobni bog\'lash' },
    { command: 'report',   description: 'Bugungi savdo hisoboti' },
    { command: 'sales',    description: 'Joriy kun savdo statistikasi' },
    { command: 'stock',    description: 'Barcode bo\'yicha stok tekshirish' },
    { command: 'debt',     description: 'Telefon bo\'yicha mijoz qarzi' },
    { command: 'shift',    description: 'Aktiv smenalar holati' },
    { command: 'lowstock', description: 'Kam qolgan mahsulotlar' },
    { command: 'expiring', description: 'Muddati yaqin mahsulotlar' },
    { command: 'settings', description: 'Bildirishnoma sozlamalari' },
    { command: 'help',     description: 'Yordam' },
  ]).catch((e) => console.error('[Bot] setMyCommands failed:', e.message));

  // Komandalar
  registerCommands(bot);

  // Settings (inline keyboard + callbacks) — T-131
  registerSettingsHandler(bot);

  return bot;
}
