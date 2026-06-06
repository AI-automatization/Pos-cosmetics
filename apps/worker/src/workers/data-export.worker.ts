import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobError } from '../logger';

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
      logJobStart(QUEUE_NAMES.DATA_EXPORT, job.id!, job.name, job.data);

      // TODO: generate file → upload to MinIO → notify user via notification queue
      throw new Error('data-export: not yet implemented');
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
