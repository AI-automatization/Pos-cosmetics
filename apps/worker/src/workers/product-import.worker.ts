import { Worker, Job } from 'bullmq';
import { processImportRows } from '@raos/catalog-import';
import type { ProductImportRow, ImportSummary } from '@raos/catalog-import';
import { PrismaClient } from '@prisma/client';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import prisma from '../prisma';
import { logJobStart, logJobDone, logJobError } from '../logger';

interface ProductImportJob {
  tenantId: string;
  userId: string;
  rows: ProductImportRow[];
}

const IMPORT_CONCURRENCY = 2; // keep low to avoid starving the pool during a large import

// Exported for unit testing — the pure job body, free of Redis/BullMQ wiring.
export async function runProductImportJob(
  db: PrismaClient,
  job: Job<ProductImportJob>,
): Promise<ImportSummary> {
  const { tenantId, rows } = job.data;
  return processImportRows(db, tenantId, rows, (p) => job.updateProgress(p));
}

export function createProductImportWorker(): Worker {
  const worker = new Worker<ProductImportJob>(
    QUEUE_NAMES.PRODUCT_IMPORT,
    async (job: Job<ProductImportJob>) => {
      const start = Date.now();
      logJobStart(QUEUE_NAMES.PRODUCT_IMPORT, job.id!, job.name, {
        tenantId: job.data.tenantId,
        rows: job.data.rows.length,
      });
      const summary = await runProductImportJob(prisma, job);
      logJobDone(QUEUE_NAMES.PRODUCT_IMPORT, job.id!, job.name, Date.now() - start);
      return summary;
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: IMPORT_CONCURRENCY,
    },
  );

  worker.on('failed', (job, err) => {
    logJobError(QUEUE_NAMES.PRODUCT_IMPORT, job?.id ?? 'unknown', job?.name ?? '', err);
  });

  return worker;
}
