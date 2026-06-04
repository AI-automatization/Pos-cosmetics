import cron from 'node-cron';
import { Bot } from 'grammy';
import { config } from '../config';
import {
  checkAllEndpoints,
  getNewlyDownEndpoints,
  getNewlyRecoveredEndpoints,
  markAlertSent,
  markAlertCleared,
} from '../services/monitor.service';
import { DIAGNOSTIC_RULES } from '../data/diagnostic-rules';
import { logger } from '../logger';

export function startUptimeCron(bot: Bot) {
  const interval = config.monitorIntervalMin;
  const cronExpr = `*/${interval} * * * *`;

  cron.schedule(cronExpr, async () => {
    try {
      await checkAllEndpoints();

      const newlyDown = getNewlyDownEndpoints();
      for (const ep of newlyDown) {
        const lines = [
          '🚨 СЕРВИС УПАЛ\n',
          `🔴 ${ep.name}`,
          `URL: ${ep.url}`,
          `Ошибка: ${ep.lastError}`,
          `Сбоев подряд: ${ep.consecutiveFailures}`,
          `Время: ${new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tashkent' })}`,
        ];

        const rule = DIAGNOSTIC_RULES.find((r) => ep.lastError.toUpperCase().includes(r.pattern));
        if (rule) {
          lines.push(`\n🔍 Диагноз: ${rule.title_ru}`);
          lines.push(`Причина: ${rule.cause_ru}`);
          lines.push(`\nКак исправить:`);
          for (const step of rule.fix_ru.split('\n')) {
            lines.push(step);
          }
        }

        await sendAlert(bot, lines.join('\n'));
        markAlertSent(ep);
        logger.error(`[Uptime] Alert: ${ep.name} DOWN`, { url: ep.url, error: ep.lastError });
      }

      const recovered = getNewlyRecoveredEndpoints();
      for (const ep of recovered) {
        const msg = [
          '✅ СЕРВИС ВОССТАНОВЛЕН\n',
          `🟢 ${ep.name}`,
          `URL: ${ep.url}`,
          `Время ответа: ${ep.lastResponseMs}ms`,
          `Время: ${new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tashkent' })}`,
        ].join('\n');

        await sendAlert(bot, msg);
        markAlertCleared(ep);
        logger.log(`[Uptime] Recovery: ${ep.name} UP`, { url: ep.url, ms: ep.lastResponseMs });
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
      await bot.api.sendMessage(chatId, message);
    } catch (err) {
      logger.error(`[Uptime] Failed to send alert to ${chatId}`, { error: (err as Error).message });
    }
  }
}
