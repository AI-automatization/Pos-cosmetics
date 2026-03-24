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

async function bootstrap() {
  console.log('[RAOS Bot] Starting...');
  console.log(`[RAOS Bot] Environment: ${process.env.NODE_ENV ?? 'development'}`);

  // DB ulanishini tekshir
  try {
    await prisma.$connect();
    console.log('[RAOS Bot] Database connected ✓');
  } catch (err) {
    console.error('[RAOS Bot] Database connection failed:', (err as Error).message);
    process.exit(1);
  }

  // Bot yaratish
  const bot = createBot();

  // Cron joblar
  startCronJobs(bot);

  // Graceful shutdown
  process.once('SIGINT', async () => {
    console.log('[RAOS Bot] Stopping...');
    await prisma.$disconnect();
    bot.stop();
    process.exit(0);
  });

  process.once('SIGTERM', async () => {
    console.log('[RAOS Bot] Stopping...');
    await prisma.$disconnect();
    bot.stop();
    process.exit(0);
  });

  // Bot polling boshlash
  console.log('[RAOS Bot] Starting polling...');
  bot.start({
    onStart: (info) => {
      console.log(`[RAOS Bot] Running as @${info.username} ✓`);
      console.log('[RAOS Bot] Ready to receive commands');
    },
  });
}

bootstrap().catch((err) => {
  console.error('[RAOS Bot] Fatal error:', err);
  process.exit(1);
});
