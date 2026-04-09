// ─── RAOS Telegram Bot — grammY ──────────────────────────────
// Ishga tushirish tartibi:
//   1. .env fayldan config yuklash
//   2. Prisma ulanishi tekshirish
//   3. Bot yaratish + komandalar ro'yxatga olish
//   4. Cron joblar ishga tushirish
//   5. Bot polling boshlash

import 'dotenv/config';
import prisma from './prisma';
import { createBot } from './bot';
import { startCronJobs } from './cron/alerts.cron';
import { logger } from './logger';

async function bootstrap() {
  logger.log('[RAOS Bot] Starting...', { env: process.env.NODE_ENV ?? 'development' });

  // DB ulanishini tekshir
  try {
    await prisma.$connect();
    logger.log('[RAOS Bot] Database connected ✓');
  } catch (err) {
    logger.error('[RAOS Bot] Database connection failed', { error: (err as Error).message });
    process.exit(1);
  }

  // Bot yaratish
  const bot = createBot();

  // Cron joblar
  startCronJobs(bot);

  // Graceful shutdown
  process.once('SIGINT', async () => {
    logger.log('[RAOS Bot] Stopping...');
    await prisma.$disconnect();
    bot.stop();
    process.exit(0);
  });

  process.once('SIGTERM', async () => {
    logger.log('[RAOS Bot] Stopping...');
    await prisma.$disconnect();
    bot.stop();
    process.exit(0);
  });

  // Bot polling boshlash
  logger.log('[RAOS Bot] Starting polling...');
  bot.start({
    onStart: (info) => {
      logger.log(`[RAOS Bot] Running as @${info.username} ✓`);
      logger.log('[RAOS Bot] Ready to receive commands');
    },
  });
}

bootstrap().catch((err) => {
  logger.error('[RAOS Bot] Fatal error', { error: (err as Error).message });
  process.exit(1);
});
