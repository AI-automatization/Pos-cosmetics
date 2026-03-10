
// Railway REDIS_URL (redis://[:password@]host:port) yoki local HOST/PORT
function buildRedisConnection() {
  const url = process.env.REDIS_URL;
  if (url) {
    return { url };
  }
  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    password: process.env.REDIS_PASSWORD ?? undefined,
  };
}

export const REDIS_CONNECTION = buildRedisConnection();

export const QUEUE_NAMES = {
  FISCAL_RECEIPT: 'fiscal-receipt',
  NOTIFICATION: 'notification',
  REPORT_GENERATE: 'report-generate',
  STOCK_SNAPSHOT: 'stock-snapshot',
  DATA_EXPORT: 'data-export',
  SYNC_PROCESS: 'sync-process',
} as const;
