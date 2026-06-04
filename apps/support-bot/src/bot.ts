import { Bot } from 'grammy';
import { config } from './config';
import { registerStartHandler } from './handlers/start.handler';
import { registerHelpHandler } from './handlers/help.handler';
import { registerFaqHandler } from './handlers/faq.handler';
import { registerStatusHandler } from './handlers/status.handler';
import { registerTicketHandler } from './handlers/ticket.handler';
import { registerMessageHandler } from './handlers/message.handler';
import { logger } from './logger';

export function createBot(): Bot {
  const bot = new Bot(config.botToken);

  bot.catch((err) => {
    const ctx = err.ctx;
    logger.error(`[Bot] Error on update ${ctx.update.update_id}`, { error: String(err.error) });
  });

  bot.api.setMyCommands([
    { command: 'start', description: 'Запустить бота' },
    { command: 'faq', description: 'Частые вопросы' },
    { command: 'status', description: 'Статус системы' },
    { command: 'ticket', description: 'Создать заявку в поддержку' },
    { command: 'mytickets', description: 'Мои заявки' },
    { command: 'help', description: 'Справка' },
  ]).catch((e) => logger.error('[Bot] setMyCommands failed', { error: (e as Error).message }));

  registerStartHandler(bot);
  registerHelpHandler(bot);
  registerFaqHandler(bot);
  registerStatusHandler(bot);
  registerTicketHandler(bot);
  registerMessageHandler(bot);

  return bot;
}
