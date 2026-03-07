import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobDone, logJobError } from '../logger';

interface NotificationJob {
  tenantId: string;
  type: string;
  recipientId?: string;
  payload: Record<string, unknown>;
}

export function createNotificationWorker(): Worker {
  const worker = new Worker<NotificationJob>(
    QUEUE_NAMES.NOTIFICATION,
    async (job: Job<NotificationJob>) => {
      const start = Date.now();
      logJobStart(QUEUE_NAMES.NOTIFICATION, job.id!, job.name, job.data);

      const { tenantId, type, payload } = job.data;

      switch (type) {
        case 'TELEGRAM':
          // TODO: Telegram API call
          console.log(`[notification] Telegram → tenant=${tenantId}`, payload);
          break;
        case 'PUSH':
          // TODO: Firebase FCM push
          console.log(`[notification] Push → tenant=${tenantId}`, payload);
          break;
        default:
          console.log(`[notification] ${type} → tenant=${tenantId}`, payload);
      }

      logJobDone(QUEUE_NAMES.NOTIFICATION, job.id!, job.name, Date.now() - start);
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 10,
    },
  );

  worker.on('failed', (job, err) => {
    logJobError(QUEUE_NAMES.NOTIFICATION, job?.id ?? 'unknown', job?.name ?? '', err);
  });

  return worker;
}
