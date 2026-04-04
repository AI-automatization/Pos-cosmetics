import { Bot } from 'grammy';
import { registerLoginHandlers } from './login.handler';
import { registerReportHandlers } from './report.handler';
import { registerStockHandlers } from './stock.handler';

export function registerCommands(bot: Bot) {
  registerLoginHandlers(bot);
  registerReportHandlers(bot);
  registerStockHandlers(bot);
}
