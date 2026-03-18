import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobDone, logJobError } from '../logger';

interface DataExportJob {
  tenantId: string;
  exportType: 'orders' | 'products' | 'customers' | 'debts';
  format: 'csv' | 'xlsx';
  requestedBy: string;
}

export function createDataExportWorker(): Worker {
  const worker = new Worker<DataExportJob>(
    QUEUE_NAMES.DATA_EXPORT,
    async (job: Job<DataExportJob>) => {
      const start = Date.now();
      logJobStart(QUEUE_NAMES.DATA_EXPORT, job.id!, job.name, job.data);

      const { tenantId, exportType, format, requestedBy } = job.data;
      console.log(`[data-export] ${exportType}.${format} for tenant=${tenantId} by=${requestedBy}`);

      // TODO: generate file → upload to MinIO → notify user via notification queue

      logJobDone(QUEUE_NAMES.DATA_EXPORT, job.id!, job.name, Date.now() - start);
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 3,
    },
  );

  worker.on('failed', (job, err) => {
    logJobError(QUEUE_NAMES.DATA_EXPORT, job?.id ?? 'unknown', job?.name ?? '', err);
  });

  return worker;
}
