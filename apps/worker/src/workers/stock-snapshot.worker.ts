import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobDone, logJobError } from '../logger';

interface StockSnapshotJob {
  tenantId?: string; // undefined = barcha tenantlar
}

export function createStockSnapshotWorker(): Worker {
  const worker = new Worker<StockSnapshotJob>(
    QUEUE_NAMES.STOCK_SNAPSHOT,
    async (job: Job<StockSnapshotJob>) => {
      const start = Date.now();
      logJobStart(QUEUE_NAMES.STOCK_SNAPSHOT, job.id!, job.name, job.data);

      // Bu logika API dagi CronService.materializeStockSnapshots() bilan parallel ishlaydi
      // Worker orqali on-demand snapshot generatsiya mumkin
      const { tenantId } = job.data;
      console.log(`[stock-snapshot] Processing ${tenantId ? `tenant=${tenantId}` : 'all tenants'}`);

      logJobDone(QUEUE_NAMES.STOCK_SNAPSHOT, job.id!, job.name, Date.now() - start);
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 2,
    },
  );

  worker.on('failed', (job, err) => {
    logJobError(QUEUE_NAMES.STOCK_SNAPSHOT, job?.id ?? 'unknown', job?.name ?? '', err);
  });

  return worker;
}
