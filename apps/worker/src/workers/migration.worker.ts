import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';

/**
 * Migration worker — delegates to the API's /migration/start/sync endpoint.
 * The actual migration logic lives in apps/api/src/migration/ to avoid
 * cross-app import issues in the monorepo.
 *
 * For now, large migrations run synchronously via the API (timeout 5min).
 * This worker is a placeholder for future async processing.
 */

interface MigrationJob {
  tenantId: string;
  provider: string;
  credentials: Record<string, string>;
}

function logJobStart(queue: string, jobId: string, jobName: string) {
  console.log(JSON.stringify({ level: 'info', event: 'job_start', queue, jobId, jobName, ts: new Date().toISOString() }));
}

function logJobDone(queue: string, jobId: string, jobName: string, durationMs: number) {
  console.log(JSON.stringify({ level: 'info', event: 'job_done', queue, jobId, jobName, durationMs, ts: new Date().toISOString() }));
}

function logJobError(queue: string, jobId: string, err: Error) {
  console.log(JSON.stringify({ level: 'error', event: 'job_error', queue, jobId, error: err.message, ts: new Date().toISOString() }));
}

export function createMigrationWorker(): Worker {
  const apiBase = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';

  const worker = new Worker<MigrationJob>(
    QUEUE_NAMES.MIGRATION,
    async (job: Job<MigrationJob>) => {
      const start = Date.now();
      logJobStart(QUEUE_NAMES.MIGRATION, job.id!, job.name);

      const { tenantId, provider, credentials } = job.data;

      // Call the API's sync migration endpoint internally
      const res = await fetch(`${apiBase}/migration/start/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Worker': 'true',
          'X-Tenant-Id': tenantId,
        },
        body: JSON.stringify({ provider, credentials }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Migration API returned ${res.status}: ${text}`);
      }

      const result = (await res.json()) as { data: unknown };
      const durationMs = Date.now() - start;
      logJobDone(QUEUE_NAMES.MIGRATION, job.id!, job.name, durationMs);

      return result.data;
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 1,
    },
  );

  worker.on('failed', (job, err) => {
    logJobError(QUEUE_NAMES.MIGRATION, job?.id ?? 'unknown', err as Error);
  });

  return worker;
}
