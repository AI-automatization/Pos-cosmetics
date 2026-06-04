import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobError } from '../logger';

interface ReportGenerateJob {
  tenantId: string;
  reportType: 'daily' | 'profit' | 'z-report' | 'employee-activity';
  from: string;
  to: string;
  requestedBy: string;
}

export function createReportWorker(): Worker {
  const worker = new Worker<ReportGenerateJob>(
    QUEUE_NAMES.REPORT_GENERATE,
    async (job: Job<ReportGenerateJob>) => {
      logJobStart(QUEUE_NAMES.REPORT_GENERATE, job.id!, job.name, job.data);

      // TODO: generate report → store result → notify via notification queue
      throw new Error('report-generate: not yet implemented');
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 3,
    },
  );

  worker.on('failed', (job, err) => {
    logJobError(QUEUE_NAMES.REPORT_GENERATE, job?.id ?? 'unknown', job?.name ?? '', err);
  });

  return worker;
}
