#!/usr/bin/env tsx
/**
 * scripts/test-notification-worker.ts
 *
 * Notification worker ni test qilish skripti.
 * EMAIL va TELEGRAM job larni queue ga yuboradi va natijani kuzatadi.
 *
 * Ishlatish:
 *   npx tsx scripts/test-notification-worker.ts
 *   npx tsx scripts/test-notification-worker.ts --email --to polat@example.com
 *   npx tsx scripts/test-notification-worker.ts --telegram --chatId 123456789
 *   npx tsx scripts/test-notification-worker.ts --both
 */

import 'dotenv/config';
import { Queue, QueueEvents } from 'bullmq';

// ─── Config ───────────────────────────────────────────────────

function buildRedisConnection() {
  const url = process.env.REDIS_URL;
  if (url) return { url };
  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    password: process.env.REDIS_PASSWORD ?? undefined,
  };
}

const REDIS_CONNECTION = buildRedisConnection();
const QUEUE_NAME = 'notification';

// ─── CLI args ─────────────────────────────────────────────────

const args = process.argv.slice(2);
const runEmail = args.includes('--email') || args.includes('--both');
const runTelegram = args.includes('--telegram') || args.includes('--both');
const runBoth = args.includes('--both');

// --to email@example.com
const toIdx = args.indexOf('--to');
const emailTo = toIdx !== -1 ? args[toIdx + 1] : (process.env.SMTP_USER ?? '');

// --chatId 123456789
const chatIdx = args.indexOf('--chatId');
const telegramChatId = chatIdx !== -1 ? args[chatIdx + 1] : (process.env.BOT_ADMIN_CHAT_IDS?.split(',')[0]?.trim() ?? '');

// Default: agar hech narsa ko'rsatilmasa — ham email, ham telegram sinab ko'r
const doEmail = runEmail || runBoth || (!runEmail && !runTelegram);
const doTelegram = runTelegram || runBoth || (!runEmail && !runTelegram);

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  RAOS — Notification Worker Test');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Redis: ${JSON.stringify(REDIS_CONNECTION)}`);
  console.log('');

  const queue = new Queue(QUEUE_NAME, { connection: REDIS_CONNECTION });
  const events = new QueueEvents(QUEUE_NAME, { connection: REDIS_CONNECTION });

  const results: { type: string; jobId: string; status: string; duration?: number }[] = [];

  try {
    // ─── EMAIL TEST ─────────────────────────────────────────
    if (doEmail) {
      if (!emailTo) {
        console.warn('⚠️  EMAIL test o\'tkazib yuborildi: --to <email> ko\'rsating yoki SMTP_USER env o\'rnating');
      } else {
        console.log(`📧 Email job yuborilmoqda → ${emailTo}`);

        const job = await queue.add('test-email', {
          tenantId: 'test-tenant',
          type: 'EMAIL',
          payload: {
            to: emailTo,
            subject: 'RAOS Notification Worker — Test Email',
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
                <h2 style="color:#7c3aed">✅ RAOS Worker Test</h2>
                <p>Bu <strong>test email</strong> xabari.</p>
                <p>Notification worker muvaffaqiyatli ishlayapti!</p>
                <hr/>
                <p style="color:#9ca3af;font-size:12px">
                  Vaqt: ${new Date().toISOString()}<br/>
                  Queue: ${QUEUE_NAME}
                </p>
              </div>
            `,
            text: `RAOS Worker Test — ${new Date().toISOString()}`,
          },
        });

        console.log(`   Job ID: ${job.id}`);

        const t0 = Date.now();
        const outcome = await Promise.race([
          events.waitUntilFinished(job, { timeout: 30000 }),
          new Promise<never>((_, rej) =>
            setTimeout(() => rej(new Error('30 soniya timeout')), 30000),
          ),
        ]).catch((err: Error) => ({ error: err.message }));

        const duration = Date.now() - t0;
        const finished = await job.getState();

        if ('error' in outcome) {
          console.log(`   ❌ FAIL — ${outcome.error} (${duration}ms)`);
          results.push({ type: 'EMAIL', jobId: job.id!, status: 'timeout/error', duration });
        } else {
          console.log(`   ✅ ${finished.toUpperCase()} (${duration}ms)`);
          results.push({ type: 'EMAIL', jobId: job.id!, status: finished, duration });
        }
      }
    }

    // ─── TELEGRAM TEST ───────────────────────────────────────
    if (doTelegram) {
      if (!telegramChatId) {
        console.warn('⚠️  TELEGRAM test o\'tkazib yuborildi: --chatId <id> ko\'rsating yoki BOT_ADMIN_CHAT_IDS env o\'rnating');
      } else {
        console.log(`📨 Telegram job yuborilmoqda → chatId: ${telegramChatId}`);

        const job = await queue.add('test-telegram', {
          tenantId: 'test-tenant',
          type: 'TELEGRAM',
          payload: {
            chatId: telegramChatId,
            message:
              `✅ <b>RAOS Notification Worker — Test</b>\n\n` +
              `Telegram xabari muvaffaqiyatli yetdi!\n\n` +
              `<i>Vaqt: ${new Date().toISOString()}</i>`,
          },
        });

        console.log(`   Job ID: ${job.id}`);

        const t0 = Date.now();
        const outcome = await Promise.race([
          events.waitUntilFinished(job, { timeout: 30000 }),
          new Promise<never>((_, rej) =>
            setTimeout(() => rej(new Error('30 soniya timeout')), 30000),
          ),
        ]).catch((err: Error) => ({ error: err.message }));

        const duration = Date.now() - t0;
        const finished = await job.getState();

        if ('error' in outcome) {
          console.log(`   ❌ FAIL — ${outcome.error} (${duration}ms)`);
          results.push({ type: 'TELEGRAM', jobId: job.id!, status: 'timeout/error', duration });
        } else {
          console.log(`   ✅ ${finished.toUpperCase()} (${duration}ms)`);
          results.push({ type: 'TELEGRAM', jobId: job.id!, status: finished, duration });
        }
      }
    }

  } finally {
    await events.close();
    await queue.close();
  }

  // ─── Summary ───────────────────────────────────────────────
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  Natija:');
  for (const r of results) {
    const icon = r.status === 'completed' ? '✅' : '❌';
    console.log(`  ${icon} ${r.type.padEnd(10)} ${r.status.padEnd(12)} ${r.duration}ms  [job:${r.jobId}]`);
  }

  if (results.length === 0) {
    console.log('  ⚠️  Hech qanday test o\'tkazilmadi (--to yoki --chatId ko\'rsating)');
  }

  const failed = results.filter((r) => r.status !== 'completed').length;
  console.log('═══════════════════════════════════════════════════');
  console.log(failed === 0 && results.length > 0 ? '  ✅ BARCHA TESTLAR MUVAFFAQIYATLI' : `  ❌ ${failed} ta test muvaffaqiyatsiz`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('❌ Test skripti xatosi:', err);
  process.exit(1);
});
