function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`[SupportBot] Missing required env: ${key}`);
  return val;
}

export const config = {
  botToken: required('SUPPORT_BOT_TOKEN'),

  supportChannelId: process.env.SUPPORT_CHANNEL_ID ?? '',

  escalationChatIds: (process.env.ESCALATION_CHAT_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  databaseUrl: process.env.DATABASE_URL ?? '',

  monitorIntervalMin: Number(process.env.MONITOR_INTERVAL_MIN ?? 3),
  monitorAlertThreshold: Number(process.env.MONITOR_ALERT_THRESHOLD ?? 2),

  endpoints: {
    apiPing: process.env.API_BASE_URL
      ? `${process.env.API_BASE_URL}/health/ping`
      : 'https://api.raos.uz/api/v1/health/ping',
    apiReady: process.env.API_BASE_URL
      ? `${process.env.API_BASE_URL}/health/ready`
      : 'https://api.raos.uz/api/v1/health/ready',
    app: process.env.APP_URL ?? 'https://app.raos.uz',
    landing: process.env.LANDING_URL ?? 'https://raos.uz',
  },

  env: process.env.NODE_ENV ?? 'development',
};
