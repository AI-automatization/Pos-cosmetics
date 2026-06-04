import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import type { ProductImportRow, ImportSummary, ImportProgress } from '@raos/catalog-import';

// ─── Queue ismlari (worker bilan mos bo'lishi SHART) ──────────────────────
export const QUEUE_NAMES = {
  FISCAL_RECEIPT: 'fiscal-receipt',
  NOTIFICATION: 'notification',
  REPORT_GENERATE: 'report-generate',
  STOCK_SNAPSHOT: 'stock-snapshot',
  DATA_EXPORT: 'data-export',
  SYNC_PROCESS: 'sync-process',
  PRODUCT_IMPORT: 'product-import',
  // AI Orchestration queues
  AI_WORKFLOW: 'ai-workflow',
  AI_AGENT: 'ai-agent',
  AI_HEALING: 'ai-healing',
  AI_MEMORY: 'ai-memory',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ─── Job payload tiplari ───────────────────────────────────────────────────
export interface FiscalReceiptJob {
  tenantId: string;
  orderId: string;
  attempt?: number;
}

export interface NotificationJob {
  tenantId: string;
  type: string;
  recipientId?: string;
  payload: Record<string, unknown>;
}

export interface ReportGenerateJob {
  tenantId: string;
  reportType: 'daily' | 'profit' | 'z-report' | 'employee-activity';
  from: string;
  to: string;
  requestedBy: string;
}

export interface DataExportJob {
  tenantId: string;
  exportType: 'orders' | 'products' | 'customers' | 'debts';
  format: 'csv' | 'xlsx';
  requestedBy: string;
}

export interface SyncProcessJob {
  tenantId: string;
  deviceId: string;
  idempotencyKey: string;
}

export interface ProductImportJob {
  tenantId: string;
  userId: string;
  rows: ProductImportRow[];
}

// ─── AI Orchestration job payloads ────────────────────────────────────────
export interface AiWorkflowJob {
  tenantId: string;
  workflowId: string;
  agentType: string;
  input: Record<string, unknown>;
  attempt?: number;
}

export interface AiAgentJob {
  tenantId: string;
  workflowId: string;
  taskId: string;
  agentType: string;
  input: Record<string, unknown>;
}

export interface AiHealingJob {
  tenantId: string;
  incidentId: string;
  workflowId?: string;
  errorContext: Record<string, unknown>;
}

export interface AiMemoryJob {
  tenantId: string;
  action: 'consolidate' | 'compress' | 'prune';
  scope?: string;
}

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly queues = new Map<QueueName, Queue>();

  constructor(private readonly config: ConfigService) {
    this.initQueues();
  }

  private initQueues() {
    // Railway provides REDIS_URL; fallback to host/port for local dev
    const redisUrl = this.config.get<string>('REDIS_URL');
    const MAX_RETRY_DELAY = 30_000;

    const connection = redisUrl
      ? {
          url: redisUrl,
          maxRetriesPerRequest: null as unknown as number, // BullMQ requires null for workers/queues
          retryStrategy: (times: number) => Math.min(times * 1000, MAX_RETRY_DELAY),
          enableOfflineQueue: false,
        }
      : {
          host: this.config.get<string>('REDIS_HOST', 'localhost'),
          port: this.config.get<number>('REDIS_PORT', 6379),
          password: this.config.get<string>('REDIS_PASSWORD'),
          maxRetriesPerRequest: null as unknown as number,
          retryStrategy: (times: number) => Math.min(times * 1000, MAX_RETRY_DELAY),
          enableOfflineQueue: false,
        };

    // Track last error log time to avoid log flooding
    let lastQueueErrorLog = 0;

    for (const name of Object.values(QUEUE_NAMES)) {
      const queue = new Queue(name, { connection });
      // Handle Redis connection errors gracefully — unhandled 'error' events crash Node.js
      queue.on('error', (err) => {
        const now = Date.now();
        // Log at most once per 30 seconds to prevent log flooding
        if (now - lastQueueErrorLog > 30_000) {
          this.logger.warn(`Queue "${name}" error: ${err.message}`);
          lastQueueErrorLog = now;
        }
      });
      this.queues.set(name, queue);
    }

    this.logger.log(`QueueService initialized: ${Object.values(QUEUE_NAMES).join(', ')}`);
  }

  private getQueue(name: QueueName): Queue {
    const q = this.queues.get(name);
    if (!q) throw new Error(`Queue "${name}" not found`);
    return q;
  }

  // ─── Job qo'shish metodlari ────────────────────────────────────────────

  async addFiscalReceiptJob(data: FiscalReceiptJob) {
    return this.getQueue(QUEUE_NAMES.FISCAL_RECEIPT).add('send-receipt', data, {
      // T-388: Idempotency — same orderId = same job, prevents double fiscal receipts
      jobId: `fiscal:${data.orderId}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }

  async addNotificationJob(data: NotificationJob) {
    return this.getQueue(QUEUE_NAMES.NOTIFICATION).add('send-notification', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 200,
      removeOnFail: 100,
    });
  }

  async addReportJob(data: ReportGenerateJob) {
    return this.getQueue(QUEUE_NAMES.REPORT_GENERATE).add('generate-report', data, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 50,
      removeOnFail: 50,
    });
  }

  async addDataExportJob(data: DataExportJob) {
    return this.getQueue(QUEUE_NAMES.DATA_EXPORT).add('export-data', data, {
      attempts: 2,
      backoff: { type: 'fixed', delay: 3000 },
      removeOnComplete: 50,
      removeOnFail: 50,
    });
  }

  async addSyncProcessJob(data: SyncProcessJob) {
    return this.getQueue(QUEUE_NAMES.SYNC_PROCESS).add('process-sync', data, {
      jobId: data.idempotencyKey, // idempotent — bir marta ishlaydi
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 500,
      removeOnFail: 200,
    });
  }

  async addProductImportJob(data: ProductImportJob) {
    // attempts: 1 — re-running a partial import is the user's explicit choice; upsert makes a manual re-run safe.
    return this.getQueue(QUEUE_NAMES.PRODUCT_IMPORT).add('import-products', data, {
      attempts: 1,
      removeOnComplete: 50,
      removeOnFail: 50,
    });
  }

  async getProductImportJobStatus(jobId: string): Promise<{
    status: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed' | 'not_found';
    progress: ImportProgress | null;
    result: ImportSummary | null;
    failedReason?: string;
  }> {
    const job = await this.getQueue(QUEUE_NAMES.PRODUCT_IMPORT).getJob(jobId);
    if (!job) return { status: 'not_found', progress: null, result: null };
    const state = (await job.getState()) as
      | 'completed' | 'failed' | 'active' | 'waiting' | 'delayed';
    const progress =
      job.progress && typeof job.progress === 'object'
        ? (job.progress as ImportProgress)
        : null;
    return {
      status: state,
      progress,
      result: state === 'completed' ? (job.returnvalue as ImportSummary) : null,
      ...(state === 'failed' ? { failedReason: job.failedReason } : {}),
    };
  }

  // ─── AI Orchestration job methods ─────────────────────────────────────

  async addAiWorkflowJob(data: AiWorkflowJob) {
    return this.getQueue(QUEUE_NAMES.AI_WORKFLOW).add('execute-workflow', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 200,
      removeOnFail: 100,
    });
  }

  async addAiAgentJob(data: AiAgentJob) {
    return this.getQueue(QUEUE_NAMES.AI_AGENT).add('execute-agent', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: 500,
      removeOnFail: 200,
    });
  }

  async addAiHealingJob(data: AiHealingJob) {
    // priority=1 — highest priority (healer runs before all others)
    return this.getQueue(QUEUE_NAMES.AI_HEALING).add('heal-workflow', data, {
      priority: 1,
      attempts: 2,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 100,
    });
  }

  async addAiMemoryJob(data: AiMemoryJob) {
    return this.getQueue(QUEUE_NAMES.AI_MEMORY).add('process-memory', data, {
      attempts: 2,
      backoff: { type: 'fixed', delay: 5000 },
      removeOnComplete: 50,
      removeOnFail: 50,
    });
  }

  // ─── Monitoring ────────────────────────────────────────────────────────

  async getQueueStats() {
    const stats: Record<string, unknown> = {};

    for (const [name, queue] of this.queues.entries()) {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);

      stats[name] = { waiting, active, completed, failed, delayed };
    }

    return stats;
  }

  // ─── Dead Letter Queue (DLQ) management ────────────────────────────────

  /**
   * Barcha queuelar bo'yicha failed joblarni qaytaradi.
   * @param queueName - ixtiyoriy filtr
   * @param limit - default 50
   */
  async getDlqJobs(queueName?: QueueName, limit = 50) {
    const targets = queueName
      ? [[queueName, this.queues.get(queueName)!] as [QueueName, (typeof this.queues extends Map<QueueName, infer V> ? V : never)]]
      : Array.from(this.queues.entries());

    const result: Array<{
      queue: string;
      jobId: string;
      jobName: string;
      data: unknown;
      failedReason: string;
      attemptsMade: number;
      timestamp: number;
    }> = [];

    for (const [name, queue] of targets) {
      if (!queue) continue;
      const failed = await queue.getFailed(0, limit - 1);
      for (const job of failed) {
        result.push({
          queue: name,
          jobId: job.id ?? '',
          jobName: job.name,
          data: job.data,
          failedReason: job.failedReason ?? '',
          attemptsMade: job.attemptsMade,
          timestamp: job.timestamp,
        });
      }
    }

    // Eng yangi birinchi
    result.sort((a, b) => b.timestamp - a.timestamp);
    return result.slice(0, limit);
  }

  /**
   * Failed jobni qayta urinish (retry).
   */
  async retryDlqJob(queueName: QueueName, jobId: string): Promise<boolean> {
    const queue = this.queues.get(queueName);
    if (!queue) return false;

    const job = await queue.getJob(jobId);
    if (!job) return false;

    await job.retry('failed');
    this.logger.log(`DLQ retry: queue=${queueName} jobId=${jobId}`);
    return true;
  }

  /**
   * Failed jobni o'chirish (dismiss).
   */
  async dismissDlqJob(queueName: QueueName, jobId: string): Promise<boolean> {
    const queue = this.queues.get(queueName);
    if (!queue) return false;

    const job = await queue.getJob(jobId);
    if (!job) return false;

    await job.remove();
    this.logger.log(`DLQ dismiss: queue=${queueName} jobId=${jobId}`);
    return true;
  }

  /**
   * Barcha queuelar bo'yicha failed job sonini qaytaradi.
   * 10+ bo'lsa alert yuboriladi.
   */
  async getDlqCount(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const [name, queue] of this.queues.entries()) {
      counts[name] = await queue.getFailedCount();
    }
    return counts;
  }

  async onModuleDestroy() {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
  }
}
