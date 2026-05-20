import { Bot } from 'grammy';
import { registerLoginHandlers } from './login.handler';
import { registerReportHandlers } from './report.handler';
import { registerStockHandlers } from './stock.handler';
import { registerLoyaltyHandlers } from './loyalty.handler';
import { registerExpiryHandlers } from './expiry.handler';

export function registerCommands(bot: Bot) {
  registerLoginHandlers(bot);
  registerReportHandlers(bot);
  registerStockHandlers(bot);
  registerLoyaltyHandlers(bot);
  registerExpiryHandlers(bot);
}
