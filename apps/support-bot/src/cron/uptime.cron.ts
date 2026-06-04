import cron from 'node-cron';
import { Bot } from 'grammy';
import { config } from '../config';
import {
  checkAllEndpoints,
  getNewlyDownEndpoints,
  getNewlyRecoveredEndpoints,
  markAlertSent,
  markAlertCleared,
  getDiagnostic,
} from '../services/monitor.service';
import { logger } from '../logger';

export function startUptimeCron(bot: Bot) {
  const interval = config.monitorIntervalMin;
  const cronExpr = `*/${interval} * * * *`;

  cron.schedule(cronExpr, async () => {
    try {
      await checkAllEndpoints();

      const newlyDown = getNewlyDownEndpoints();
      for (const ep of newlyDown) {
        const diag = getDiagnostic(ep.lastError);
        let msg =
          `🚨 *СЕРВИС УПАЛ*\n\n` +
          `🔴 *${ep.name}*\n` +
          `URL: ${ep.url}\n` +
          `Ошибка: ${ep.lastError}\n` +
          `Подряд сбоев: ${ep.consecutiveFailures}`;

        if (diag) {
          msg += `\n\n${diag}`;
        }

        const escaped = msg.replace(/([_\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

        await sendAlert(bot, escaped);
        markAlertSent(ep);
        logger.error(`[Uptime] Alert sent: ${ep.name} is DOWN`, { url: ep.url, error: ep.lastError });
      }

      const recovered = getNewlyRecoveredEndpoints();
      for (const ep of recovered) {
        const msg =
          `✅ *СЕРВИС ВОССТАНОВЛЕН*\n\n` +
          `🟢 *${ep.name}*\n` +
          `URL: ${ep.url}\n` +
          `Время ответа: ${ep.lastResponseMs}ms`;

        const escaped = msg.replace(/([_\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

        await sendAlert(bot, escaped);
        markAlertCleared(ep);
        logger.log(`[Uptime] Recovery: ${ep.name} is UP`, { url: ep.url, ms: ep.lastResponseMs });
      }
    } catch (err) {
      logger.error('[Uptime] Cron error', { error: (err as Error).message });
    }
  }, { timezone: 'Asia/Tashkent' });

  logger.log(`[Uptime] Cron started: every ${interval} min`);
}

async function sendAlert(bot: Bot, message: string) {
  const targets: string[] = [];

  if (config.supportChannelId) {
    targets.push(config.supportChannelId);
  }
  targets.push(...config.escalationChatIds);

  for (const chatId of targets) {
    try {
      await bot.api.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
    } catch (err) {
      logger.error(`[Uptime] Failed to send alert to ${chatId}`, { error: (err as Error).message });
    }
  }
}
