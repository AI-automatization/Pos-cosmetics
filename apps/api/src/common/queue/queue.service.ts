import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

// ─── Queue ismlari (worker bilan mos bo'lishi SHART) ──────────────────────
export const QUEUE_NAMES = {
  FISCAL_RECEIPT: 'fiscal-receipt',
  NOTIFICATION: 'notification',
  REPORT_GENERATE: 'report-generate',
  STOCK_SNAPSHOT: 'stock-snapshot',
  DATA_EXPORT: 'data-export',
  SYNC_PROCESS: 'sync-process',
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
    const connection = redisUrl
      ? { url: redisUrl }
      : {
          host: this.config.get<string>('REDIS_HOST', 'localhost'),
          port: this.config.get<number>('REDIS_PORT', 6379),
          password: this.config.get<string>('REDIS_PASSWORD'),
        };

    for (const name of Object.values(QUEUE_NAMES)) {
      const queue = new Queue(name, { connection });
      // Handle Redis connection errors gracefully — unhandled 'error' events crash Node.js
      queue.on('error', (err) => {
        this.logger.warn(`Queue "${name}" error: ${err.message}`);
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
