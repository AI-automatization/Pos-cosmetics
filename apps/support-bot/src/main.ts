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

  const startWithRetry = async (attempt = 1): Promise<void> => {
    try {
      await bot.start({
        onStart: (info) => {
          logger.log(`[SupportBot] Running as @${info.username}`);
        },
      });
    } catch (err) {
      const msg = (err as Error).message ?? '';
      if (msg.includes('409') || msg.includes('Conflict')) {
        const delay = Math.min(attempt * 5, 30);
        logger.warn(`[SupportBot] Polling conflict, retrying in ${delay}s (attempt ${attempt})`);
        await new Promise((r) => setTimeout(r, delay * 1000));
        return startWithRetry(attempt + 1);
      }
      throw err;
    }
  };

  await startWithRetry();
}

bootstrap().catch((err) => {
  console.error('[SupportBot] Fatal error', (err as Error).message);
  process.exit(1);
});
