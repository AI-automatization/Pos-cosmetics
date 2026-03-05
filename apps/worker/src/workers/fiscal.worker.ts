import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobDone, logJobError } from '../logger';
import prisma from '../prisma';

interface FiscalReceiptJob {
  tenantId: string;
  orderId: string;
  attempt?: number;
}

// ─── REGOS Stub: Phase 2 da real API bilan almashtiriladi ────────────────────
async function sendFiscalReceipt(
  tenantId: string,
  orderId: string,
): Promise<{ fiscalId: string; fiscalQr: string }> {
  // Phase 1: simulatsiya
  // Phase 2: real REGOS/OFD API call
  const fiscalId = `RAOS-${orderId.slice(0, 8).toUpperCase()}-${Date.now()}`;
  const fiscalQr = `https://ofd.soliq.uz/check?id=${fiscalId}&t=${Date.now()}`;

  // Simulate fiscal API network latency
  await new Promise((resolve) => setTimeout(resolve, 50));

  console.log(JSON.stringify({
    level: 'info',
    event: 'fiscal_sent',
    tenantId,
    orderId,
    fiscalId,
    ts: new Date().toISOString(),
  }));

  return { fiscalId, fiscalQr };
}

export function createFiscalWorker(): Worker {
  const worker = new Worker<FiscalReceiptJob>(
    QUEUE_NAMES.FISCAL_RECEIPT,
    async (job: Job<FiscalReceiptJob>) => {
      const start = Date.now();
      logJobStart(QUEUE_NAMES.FISCAL_RECEIPT, job.id!, job.name, job.data);

      const { tenantId, orderId } = job.data;

      // Order mavjudligini tekshirish
      const order = await prisma.order.findFirst({
        where: { id: orderId, tenantId },
        select: { id: true, fiscalStatus: true },
      });

      if (!order) {
        // Order yo'q — job ni skip qilish (DLQ ga tushmasin)
        console.log(JSON.stringify({
          level: 'warn',
          event: 'fiscal_order_not_found',
          orderId,
          tenantId,
          ts: new Date().toISOString(),
        }));
        return;
      }

      if (order.fiscalStatus === 'SENT') {
        // Allaqachon yuborilgan — idempotent skip
        logJobDone(QUEUE_NAMES.FISCAL_RECEIPT, job.id!, job.name, Date.now() - start);
        return;
      }

      // REGOS API ga yuborish
      const { fiscalId, fiscalQr } = await sendFiscalReceipt(tenantId, orderId);

      // DB ni yangilash
      await prisma.order.update({
        where: { id: orderId },
        data: {
          fiscalStatus: 'SENT',
          fiscalId,
          fiscalQr,
        },
      });

      logJobDone(QUEUE_NAMES.FISCAL_RECEIPT, job.id!, job.name, Date.now() - start);
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    logJobError(QUEUE_NAMES.FISCAL_RECEIPT, job?.id ?? 'unknown', job?.name ?? '', err);

    // BullMQ 3 urinishdan keyin failed deb belgilaydi
    // Tax controller orqali manual retry mumkin: POST /tax/fiscal/:orderId/retry
    if (job?.data?.orderId) {
      prisma.order.update({
        where: { id: job.data.orderId },
        data: { fiscalStatus: 'FAILED' },
      }).catch(() => {/* DB xato ham bo'lsa log da ko'rinadi */});
    }
  });

  return worker;
}
