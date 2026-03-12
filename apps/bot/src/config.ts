// ─── Bot Configuration ────────────────────────────────────────
// Barcha env o'zgaruvchilar shu yerdan olinadi

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`[Bot] Missing required env: ${key}`);
  return val;
}

export const config = {
  // Telegram
  botToken: required('BOT_TOKEN'),

  // Admin Telegram chat ID (alerts shu chatga ketadi)
  // Bir nechta admin uchun vergul bilan: "-100123456,-100654321"
  adminChatIds: (process.env.BOT_ADMIN_CHAT_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  // API base URL — Telegram link verification uchun
  apiUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:3003/api/v1',

  // Database (API bilan bir xil DB)
  databaseUrl: required('DATABASE_URL'),

  // SMTP (OTP kod yuborish uchun)
  smtp: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? 'RAOS <noreply@raos.uz>',
  },

  // Thresholds
  refundAlertThreshold: Number(process.env.REFUND_ALERT_THRESHOLD ?? 500_000), // so'm
  lowStockCheckCron: process.env.LOW_STOCK_CRON ?? '0 * * * *',       // har soat
  expiryCheckCron: process.env.EXPIRY_CHECK_CRON ?? '0 8 * * *',      // har kuni 08:00
  expiryDaysWarning: Number(process.env.EXPIRY_DAYS_WARNING ?? 30),

  env: process.env.NODE_ENV ?? 'development',
};
