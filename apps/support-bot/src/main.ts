import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const { createBot } = await import('./bot');
  const { startUptimeCron } = await import('./cron/uptime.cron');
  const { logger } = await import('./logger');

  logger.log('[SupportBot] Starting...', { env: process.env.NODE_ENV ?? 'development' });

  const bot = createBot();

  startUptimeCron(bot);

  process.once('SIGINT', () => {
    logger.log('[SupportBot] Stopping...');
    bot.stop();
    process.exit(0);
  });

  process.once('SIGTERM', () => {
    logger.log('[SupportBot] Stopping...');
    bot.stop();
    process.exit(0);
  });

  logger.log('[SupportBot] Starting polling...');
  bot.start({
    onStart: (info) => {
      logger.log(`[SupportBot] Running as @${info.username}`);
    },
  });
}

bootstrap().catch((err) => {
  console.error('[SupportBot] Fatal error', (err as Error).message);
  process.exit(1);
});
