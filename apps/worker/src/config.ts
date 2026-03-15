
function parseRedisConnection() {
  const url = process.env.REDIS_URL;
  if (url) {
    // redis://default:PASSWORD@host:port
    const match = url.match(/^redis(?:s)?:\/\/(?:[^:]*):([^@]*)@([^:]+):(\d+)/);
    if (match) {
      return {
        host: match[2]!,
        port: parseInt(match[3]!, 10),
        password: match[1] || undefined,
      };
    }
  }
  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    password: process.env.REDIS_PASSWORD ?? undefined,
  };
}

export const REDIS_CONNECTION = parseRedisConnection();

export const QUEUE_NAMES = {
  FISCAL_RECEIPT: 'fiscal-receipt',
  NOTIFICATION: 'notification',
  REPORT_GENERATE: 'report-generate',
  STOCK_SNAPSHOT: 'stock-snapshot',
  DATA_EXPORT: 'data-export',
  SYNC_PROCESS: 'sync-process',
} as const;
