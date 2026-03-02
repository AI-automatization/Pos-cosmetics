import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobDone, logJobError } from '../logger';

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
      const start = Date.now();
      logJobStart(QUEUE_NAMES.REPORT_GENERATE, job.id!, job.name, job.data);

      const { tenantId, reportType, from, to, requestedBy } = job.data;
      console.log(`[report] ${reportType} for tenant=${tenantId} from=${from} to=${to} by=${requestedBy}`);

      // TODO: generate report → store result → notify via notification queue

      logJobDone(QUEUE_NAMES.REPORT_GENERATE, job.id!, job.name, Date.now() - start);
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
