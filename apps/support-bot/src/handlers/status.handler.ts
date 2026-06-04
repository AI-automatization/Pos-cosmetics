import { Bot, InlineKeyboard } from 'grammy';
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
    for (const ep of states) {
      const icon = ep.status === 'up' ? '🟢' : ep.status === 'degraded' ? '🟡' : '🔴';
      const ms = ep.lastResponseMs ? ` (${ep.lastResponseMs}ms)` : '';
      const err = ep.lastError ? ` — ${ep.lastError}` : '';
      lines.push(`${icon} ${ep.name}${ms}${err}`);
    }

    if (states[0]?.lastCheck) {
      lines.push(`\nПоследняя проверка: ${states[0].lastCheck.toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tashkent' })}`);
    }

    const hasDown = states.some((s) => s.status === 'down');
    if (hasDown) {
      const kb = new InlineKeyboard().row(
        InlineKeyboard.text('🔍 Диагностика', 'diagnose_all'),
      );
      await ctx.reply(lines.join('\n'), { reply_markup: kb });
    } else {
      await ctx.reply(lines.join('\n'));
    }
  });

  bot.callbackQuery('diagnose_all', async (ctx) => {
    const states = getEndpointStates();
    const downServices = states.filter((s) => s.status === 'down');

    if (downServices.length === 0) {
      await ctx.answerCallbackQuery({ text: 'Все сервисы работают!' });
      return;
    }

    const parts: string[] = ['🔍 Диагностика\n'];
    for (const ep of downServices) {
      parts.push(`🔴 ${ep.name} — ${ep.lastError}`);
      const rule = DIAGNOSTIC_RULES.find((r) => ep.lastError.toUpperCase().includes(r.pattern));
      if (rule) {
        parts.push(`Причина: ${rule.cause_ru}`);
        parts.push(`Как исправить:\n${rule.fix_ru}`);
      }
      parts.push('');
    }

    await ctx.editMessageText(parts.join('\n'));
    await ctx.answerCallbackQuery();
  });
}
