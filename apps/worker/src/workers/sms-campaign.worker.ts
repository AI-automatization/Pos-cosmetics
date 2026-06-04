import { Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobDone } from '../logger';
import prisma from '../prisma';

interface SmsCampaignJob {
  tenantId: string;
  campaignId: string;
}

const DELAY_MS = 600; // ~100 SMS/min rate limit

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendViaPlatform(phone: string, text: string): Promise<{
  success: boolean;
  providerMessageId?: string;
  costInTiyin?: number;
  errorMessage?: string;
}> {
  const login = process.env.PLAYMOBILE_LOGIN;
  const password = process.env.PLAYMOBILE_PASSWORD;
  const originator = process.env.PLAYMOBILE_ORIGINATOR ?? 'RAOS';

  if (!login || !password) {
    return { success: false, errorMessage: 'SMS provider not configured' };
  }

  try {
    const msgId = `raos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const res = await fetch('https://send.smsxabar.uz/broker-api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`,
      },
      body: JSON.stringify({
        messages: [{
          recipient: phone,
          'message-id': msgId,
          sms: { originator, content: { text } },
        }],
      }),
    });

    if (!res.ok) return { success: false, errorMessage: `HTTP ${res.status}` };
    return { success: true, providerMessageId: msgId, costInTiyin: 10000 };
  } catch (err) {
    return { success: false, errorMessage: err instanceof Error ? err.message : String(err) };
  }
}

async function processSmsCampaign(job: Job<SmsCampaignJob>) {
  const { tenantId, campaignId } = job.data;
  const start = Date.now();
  logJobStart(QUEUE_NAMES.SMS_CAMPAIGN, job.id!, job.name, { campaignId });

  // Mark SENDING
  await prisma.smsCampaign.update({
    where: { id: campaignId },
    data: { status: 'SENDING', sentAt: new Date() },
  });

  let sent = 0;
  let failed = 0;
  const PAGE_SIZE = 100;

  while (true) {
    const messages = await prisma.smsMessage.findMany({
      where: { campaignId, status: 'PENDING' },
      take: PAGE_SIZE,
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length === 0) break;

    for (const msg of messages) {
      // Unsubscribe check
      const unsub = await prisma.smsUnsubscribe.findUnique({
        where: { tenantId_phone: { tenantId, phone: msg.phone } },
      });

      if (unsub) {
        await prisma.smsMessage.update({
          where: { id: msg.id },
          data: { status: 'UNSUBSCRIBED' },
        });
        failed++;
        continue;
      }

      const result = await sendViaPlatform(msg.phone, msg.content);

      await prisma.smsMessage.update({
        where: { id: msg.id },
        data: {
          status: result.success ? 'SENT' : 'FAILED',
          providerMessageId: result.providerMessageId,
          costInTiyin: result.costInTiyin ?? 0,
          errorMessage: result.errorMessage,
          sentAt: result.success ? new Date() : undefined,
        },
      });

      if (result.success) sent++;
      else failed++;

      await sleep(DELAY_MS);
    }
  }

  // Aggregate cost and complete
  const costAgg = await prisma.smsMessage.aggregate({
    where: { campaignId },
    _sum: { costInTiyin: true },
  });

  await prisma.smsCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      totalSent: sent,
      totalFailed: failed,
      totalCost: costAgg._sum.costInTiyin ?? 0,
    },
  });

  logJobDone(QUEUE_NAMES.SMS_CAMPAIGN, job.id!, job.name, Date.now() - start);
}

export function createSmsCampaignWorker(): Worker {
  return new Worker(QUEUE_NAMES.SMS_CAMPAIGN, processSmsCampaign, {
    connection: REDIS_CONNECTION,
    concurrency: 1, // one campaign at a time
  });
}
