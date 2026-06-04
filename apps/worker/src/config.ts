const MAX_RETRY_DELAY = 30_000;

function parseRedisConnection() {
  const url = process.env.REDIS_URL;
  const base = {
    maxRetriesPerRequest: null as unknown as number,
    retryStrategy: (times: number) => Math.min(times * 1000, MAX_RETRY_DELAY),
    enableOfflineQueue: false,
  };

  if (url) {
    // redis://default:PASSWORD@host:port
    const match = url.match(/^redis(?:s)?:\/\/(?:[^:]*):([^@]*)@([^:]+):(\d+)/);
    if (match) {
      return {
        ...base,
        host: match[2]!,
        port: parseInt(match[3]!, 10),
        password: match[1] || undefined,
      };
    }
  }
  return {
    ...base,
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
  PRODUCT_IMPORT: 'product-import',
} as const;
