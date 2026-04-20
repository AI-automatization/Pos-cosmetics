import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobDone, logJobError } from '../logger';
import prisma from '../prisma';

interface FiscalReceiptJob {
  tenantId: string;
  orderId: string;
  attempt?: number;
}

interface RegosReceiptPayload {
  orderId: string;
  orderNumber: number;
  total: number;
  taxAmount: number;
  taxRate: number;
  items: Array<{ name: string; qty: number; price: number; total: number; vatRate: number }>;
  cashier: string;
  branch: string;
  inn: string;
  time: string;
}

const REGOS_API_URL = process.env['REGOS_API_URL'];
const REGOS_API_KEY = process.env['REGOS_API_KEY'];

function isRegoConfigured(): boolean {
  return Boolean(REGOS_API_URL && REGOS_API_KEY);
}

async function sendToRegos(
  tenantId: string,
  payload: RegosReceiptPayload,
): Promise<{ fiscalId: string; fiscalQr: string }> {
  const response = await fetch(`${REGOS_API_URL}/receipts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${REGOS_API_KEY}`,
      'X-Tenant-Id': tenantId,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'unknown');
    throw new Error(`REGOS API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as { id: string; qr: string };
  return { fiscalId: data.id, fiscalQr: data.qr };
}

function stubReceipt(orderId: string): { fiscalId: string; fiscalQr: string } {
  const fiscalId = `STUB-${orderId.slice(0, 8).toUpperCase()}-${Date.now()}`;
  return {
    fiscalId,
    fiscalQr: `https://ofd.soliq.uz/check?id=${fiscalId}&t=${Date.now()}`,
  };
}

export function createFiscalWorker(): Worker {
  const worker = new Worker<FiscalReceiptJob>(
    QUEUE_NAMES.FISCAL_RECEIPT,
    async (job: Job<FiscalReceiptJob>) => {
      const start = Date.now();
      logJobStart(QUEUE_NAMES.FISCAL_RECEIPT, job.id!, job.name, job.data);

      const { tenantId, orderId } = job.data;

      const order = await prisma.order.findFirst({
        where: { id: orderId, tenantId },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          taxAmount: true,
          fiscalStatus: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true } },
          branch: { select: { name: true } },
          tenant: { select: { inn: true } },
          items: {
            select: {
              productName: true,
              quantity: true,
              unitPrice: true,
              total: true,
            },
          },
        },
      });

      if (!order) {
        logJobDone(QUEUE_NAMES.FISCAL_RECEIPT, job.id!, job.name, Date.now() - start);
        return;
      }

      if (order.fiscalStatus === 'SENT') {
        logJobDone(QUEUE_NAMES.FISCAL_RECEIPT, job.id!, job.name, Date.now() - start);
        return;
      }

      let fiscalId: string;
      let fiscalQr: string;

      if (isRegoConfigured()) {
        const payload: RegosReceiptPayload = {
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: Number(order.total),
          taxAmount: Number(order.taxAmount),
          taxRate: 0.12,
          items: order.items.map((item) => ({
            name: item.productName,
            qty: item.quantity,
            price: Number(item.unitPrice),
            total: Number(item.total),
            vatRate: 0.12,
          })),
          cashier: `${order.user.firstName} ${order.user.lastName}`.trim(),
          branch: order.branch?.name ?? '',
          inn: order.tenant.inn ?? '',
          time: order.createdAt.toISOString(),
        };

        const result = await sendToRegos(tenantId, payload);
        fiscalId = result.fiscalId;
        fiscalQr = result.fiscalQr;
      } else {
        const result = stubReceipt(orderId);
        fiscalId = result.fiscalId;
        fiscalQr = result.fiscalQr;
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { fiscalStatus: 'SENT', fiscalId, fiscalQr },
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

    if (job?.data?.orderId) {
      prisma.order.update({
        where: { id: job.data.orderId },
        data: { fiscalStatus: 'FAILED' },
      }).catch(() => {/* noop — main error already logged */});
    }
  });

  return worker;
}
