import 'dotenv/config';
import { Bot } from 'grammy';
import { config } from './config';
import { registerHandlers, setBotUsername, setShutdownFn } from './telegram.handler';
import { startHttpServer, setSendFunction } from './http.server';

const bot = new Bot(config.botToken);

bot.catch((err) => {
  console.error('[TezCode] Error:', err.error);
});

bot.api.setMyCommands([
  { command: 'start', description: 'AI Assistant status' },
  { command: 'help', description: 'All commands' },
  { command: 'stop', description: 'Stop the bot' },
  { command: 'compact', description: 'Compress context' },
  { command: 'model', description: 'Switch model' },
  { command: 'clear', description: 'New session' },
  { command: 'new', description: 'Full reset' },
  { command: 'dir', description: 'Working directory' },
  { command: 'obsidian', description: 'Toggle vault' },
  { command: 'status', description: 'Stats' },
]).catch((e) => console.error('setMyCommands failed:', e));

registerHandlers(bot);
setShutdownFn(() => bot.stop());

setSendFunction(async (chatId: string, text: string) => {
  await bot.api.sendMessage(Number(chatId), text);
});

startHttpServer(config.httpPort);

console.log('🤖 TezCode Bot starting...');
console.log(`   Owner: @${config.ownerUsername}`);
console.log(`   Model: ${config.model}`);
console.log(`   CWD:   ${config.cwd}`);

bot.start({
  onStart: async () => {
    const me = await bot.api.getMe();
    setBotUsername(me.username ?? 'ibrat_claude_bot');
    console.log(`✅ @${me.username} is running!`);
  },
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    bot.stop();
    process.exit(0);
  });
}
