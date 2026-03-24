// RAOS Worker — BullMQ job processors
// Queues: fiscal-receipt, notification, report-generate, stock-snapshot, data-export, sync-process

import 'dotenv/config';
import { createFiscalWorker } from './workers/fiscal.worker';
import { createNotificationWorker } from './workers/notification.worker';
import { createReportWorker } from './workers/report.worker';
import { createStockSnapshotWorker } from './workers/stock-snapshot.worker';
import { createDataExportWorker } from './workers/data-export.worker';
import { createSyncProcessWorker } from './workers/sync-process.worker';

async function bootstrap() {
  console.log(JSON.stringify({
    level: 'info',
    event: 'worker_start',
    ts: new Date().toISOString(),
    redis: `${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6379}`,
  }));

  const workers = [
    createFiscalWorker(),
    createNotificationWorker(),
    createReportWorker(),
    createStockSnapshotWorker(),
    createDataExportWorker(),
    createSyncProcessWorker(),
  ];

  console.log(JSON.stringify({
    level: 'info',
    event: 'workers_ready',
    count: workers.length,
    queues: [
      'fiscal-receipt',
      'notification',
      'report-generate',
      'stock-snapshot',
      'data-export',
      'sync-process',
    ],
    ts: new Date().toISOString(),
  }));

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(JSON.stringify({ level: 'info', event: 'shutdown', signal, ts: new Date().toISOString() }));
    await Promise.all(workers.map((w) => w.close()));
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error(JSON.stringify({ level: 'error', event: 'bootstrap_error', error: String(err), ts: new Date().toISOString() }));
  process.exit(1);
});
