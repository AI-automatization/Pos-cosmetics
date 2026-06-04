import { Bot } from 'grammy';
import { config } from './config';
import { registerStartHandler } from './handlers/start.handler';
import { registerHelpHandler } from './handlers/help.handler';
import { registerFaqHandler } from './handlers/faq.handler';
import { registerStatusHandler } from './handlers/status.handler';
import { registerMessageHandler } from './handlers/message.handler';
import { logger } from './logger';

export function createBot(): Bot {
  const bot = new Bot(config.botToken);

  bot.catch((err) => {
    const ctx = err.ctx;
    logger.error(`[Bot] Error on update ${ctx.update.update_id}`, { error: String(err.error) });
  });

  bot.api.setMyCommands([
    { command: 'start', description: 'Botni ishga tushirish' },
    { command: 'faq', description: "Tez-tez so'raladigan savollar" },
    { command: 'status', description: 'Tizim holati' },
    { command: 'ticket', description: 'Texnik yordam so\'rash' },
    { command: 'help', description: 'Yordam' },
  ]).catch((e) => logger.error('[Bot] setMyCommands failed', { error: (e as Error).message }));

  registerStartHandler(bot);
  registerHelpHandler(bot);
  registerFaqHandler(bot);
  registerStatusHandler(bot);
  registerMessageHandler(bot);

  return bot;
}
