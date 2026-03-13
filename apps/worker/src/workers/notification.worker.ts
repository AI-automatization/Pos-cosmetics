import { Worker, Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { REDIS_CONNECTION, QUEUE_NAMES } from '../config';
import { logJobStart, logJobDone, logJobError } from '../logger';

// ─── Job payload types ────────────────────────────────────────

interface TelegramPayload {
  chatId: string;
  message: string;
}

interface EmailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

interface NotificationJob {
  tenantId: string;
  type: 'TELEGRAM' | 'EMAIL' | 'PUSH';
  recipientId?: string;
  payload: TelegramPayload | EmailPayload | Record<string, unknown>;
}

// ─── Telegram sender ──────────────────────────────────────────

async function sendTelegram(chatId: string, message: string): Promise<void> {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.warn('[notification:telegram] BOT_TOKEN env yo\'q — xabar yuborilmadi');
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  });

  const data = (await res.json()) as { ok: boolean; description?: string };
  if (!data.ok) {
    throw new Error(`Telegram API xatosi: ${data.description ?? 'unknown'}`);
  }
}

// ─── Email sender ─────────────────────────────────────────────

function buildMailTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
}

// Transporter singleton (yaratilsa qayta ishlatiladi)
let mailer: nodemailer.Transporter | null | undefined;

function getMailer(): nodemailer.Transporter | null {
  if (mailer === undefined) mailer = buildMailTransporter();
  return mailer;
}

async function sendEmail(to: string, subject: string, html?: string, text?: string): Promise<void> {
  const transport = getMailer();
  if (!transport) {
    console.warn('[notification:email] SMTP sozlanmagan — email yuborilmadi');
    return;
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  await transport.sendMail({ from, to, subject, html, text });
}

// ─── Worker ───────────────────────────────────────────────────

export function createNotificationWorker(): Worker {
  const worker = new Worker<NotificationJob>(
    QUEUE_NAMES.NOTIFICATION,
    async (job: Job<NotificationJob>) => {
      const start = Date.now();
      logJobStart(QUEUE_NAMES.NOTIFICATION, job.id!, job.name, job.data);

      const { tenantId, type, payload } = job.data;

      switch (type) {
        case 'TELEGRAM': {
          const p = payload as TelegramPayload;
          if (!p.chatId || !p.message) {
            throw new Error('TELEGRAM job: chatId va message majburiy');
          }
          await sendTelegram(p.chatId, p.message);
          break;
        }

        case 'EMAIL': {
          const p = payload as EmailPayload;
          if (!p.to || !p.subject) {
            throw new Error('EMAIL job: to va subject majburiy');
          }
          await sendEmail(p.to, p.subject, p.html, p.text);
          break;
        }

        case 'PUSH':
          // TODO: Firebase FCM push (keyingi sprint)
          console.log(`[notification] Push → tenant=${tenantId}`, payload);
          break;

        default:
          console.warn(`[notification] Noma'lum type: ${type} → tenant=${tenantId}`);
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
