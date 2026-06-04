import { Bot, InlineKeyboard } from 'grammy';
import {
  checkAllEndpoints,
  formatStatusMessage,
  getEndpointStates,
  getDiagnostic,
} from '../services/monitor.service';

export function registerStatusHandler(bot: Bot) {
  bot.command('status', async (ctx) => {
    await ctx.reply('🔄 Проверяю сервисы\\.\\.\\.');

    await checkAllEndpoints();
    const states = getEndpointStates();
    const hasDown = states.some((s) => s.status === 'down');

    let text = formatStatusMessage();

    if (hasDown) {
      const kb = new InlineKeyboard().row(
        InlineKeyboard.text('🔍 Диагностика', 'diagnose_all'),
      );
      await ctx.reply(text, { parse_mode: 'MarkdownV2', reply_markup: kb });
    } else {
      await ctx.reply(text, { parse_mode: 'MarkdownV2' });
    }
  });

  bot.callbackQuery('diagnose_all', async (ctx) => {
    const states = getEndpointStates();
    const downServices = states.filter((s) => s.status === 'down');

    if (downServices.length === 0) {
      await ctx.answerCallbackQuery({ text: 'Все сервисы работают!' });
      return;
    }

    const parts: string[] = ['🔍 *Диагностика*\n'];
    for (const ep of downServices) {
      const diag = getDiagnostic(ep.lastError);
      parts.push(`🔴 *${ep.name}* — ${ep.lastError}`);
      if (diag) {
        parts.push(diag);
      }
      parts.push('');
    }

    await ctx.editMessageText(parts.join('\n'), { parse_mode: 'MarkdownV2' });
    await ctx.answerCallbackQuery();
  });
}
