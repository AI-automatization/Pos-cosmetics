import { Bot } from 'grammy';
import {
  checkAllEndpoints,
  getEndpointStates,
} from '../services/monitor.service';
import { DIAGNOSTIC_RULES } from '../data/diagnostic-rules';

export function registerStatusHandler(bot: Bot) {
  bot.command('status', async (ctx) => {
    await ctx.reply('🔄 Проверяю сервисы...');

    await checkAllEndpoints();
    const states = getEndpointStates();

    const lines = ['📊 Статус сервисов RAOS\n'];

    let allOk = true;
    for (const ep of states) {
      const icon = ep.status === 'up' ? '🟢' : ep.status === 'degraded' ? '🟡' : '🔴';
      if (ep.status !== 'up') allOk = false;

      let line = `${icon} ${ep.name}`;
      if (ep.status === 'up') {
        line += ` — OK (${ep.lastResponseMs}ms)`;
      } else if (ep.status === 'degraded') {
        line += ` — Медленно (${ep.lastResponseMs}ms)`;
      } else {
        line += ` — НЕ РАБОТАЕТ`;
      }
      lines.push(line);

      if (ep.status === 'down' && ep.lastError) {
        lines.push(`   Ошибка: ${ep.lastError}`);
        lines.push(`   URL: ${ep.url}`);
        lines.push(`   Сбоев подряд: ${ep.consecutiveFailures}`);

        const rule = DIAGNOSTIC_RULES.find((r) => ep.lastError.toUpperCase().includes(r.pattern));
        if (rule) {
          lines.push(`\n   🔍 Диагноз: ${rule.title_ru}`);
          lines.push(`   Причина: ${rule.cause_ru}`);
          lines.push(`   Как исправить:`);
          for (const step of rule.fix_ru.split('\n')) {
            lines.push(`   ${step}`);
          }
        }
        lines.push('');
      }
    }

    if (states[0]?.lastCheck) {
      lines.push(`\n🕐 Проверка: ${states[0].lastCheck.toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tashkent' })}`);
    }

    if (allOk) {
      lines.push('\n✅ Все сервисы работают нормально!');
    } else {
      lines.push('\n⚠️ Есть проблемы. Если нужна помощь — /ticket');
    }

    await ctx.reply(lines.join('\n'));
  });

  bot.callbackQuery('diagnose_all', async (ctx) => {
    const states = getEndpointStates();
    const downServices = states.filter((s) => s.status === 'down');

    if (downServices.length === 0) {
      await ctx.answerCallbackQuery({ text: 'Все сервисы работают!' });
      return;
    }

    const parts: string[] = ['🔍 Подробная диагностика\n'];
    for (const ep of downServices) {
      parts.push(`🔴 ${ep.name}`);
      parts.push(`URL: ${ep.url}`);
      parts.push(`Ошибка: ${ep.lastError}`);
      parts.push(`Сбоев подряд: ${ep.consecutiveFailures}`);

      const rule = DIAGNOSTIC_RULES.find((r) => ep.lastError.toUpperCase().includes(r.pattern));
      if (rule) {
        parts.push(`\nДиагноз: ${rule.title_ru}`);
        parts.push(`Причина: ${rule.cause_ru}`);
        parts.push(`Как исправить:`);
        for (const step of rule.fix_ru.split('\n')) {
          parts.push(step);
        }
      } else {
        parts.push('\nДиагноз: Неизвестная ошибка');
        parts.push('Проверьте логи Railway: railway service logs --lines 50');
      }
      parts.push('\n---\n');
    }

    await ctx.editMessageText(parts.join('\n'));
    await ctx.answerCallbackQuery();
  });
}
