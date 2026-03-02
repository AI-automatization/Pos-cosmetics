import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobDone, logJobError } from '../logger';

interface SyncProcessJob {
  tenantId: string;
  deviceId: string;
  idempotencyKey: string;
}

export function createSyncProcessWorker(): Worker {
  const worker = new Worker<SyncProcessJob>(
    QUEUE_NAMES.SYNC_PROCESS,
    async (job: Job<SyncProcessJob>) => {
      const start = Date.now();
      logJobStart(QUEUE_NAMES.SYNC_PROCESS, job.id!, job.name, job.data);

      const { tenantId, deviceId, idempotencyKey } = job.data;
      console.log(`[sync-process] tenant=${tenantId} device=${deviceId} key=${idempotencyKey}`);

      // POS sync event processing — API /sync/inbound bilan integratsiya
      // Job ID = idempotencyKey (duplicate safe)

      logJobDone(QUEUE_NAMES.SYNC_PROCESS, job.id!, job.name, Date.now() - start);
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 10,
    },
  );

  worker.on('failed', (job, err) => {
    logJobError(QUEUE_NAMES.SYNC_PROCESS, job?.id ?? 'unknown', job?.name ?? '', err);
  });

  return worker;
}
