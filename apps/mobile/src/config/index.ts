export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3003/api/v1',
  REFETCH_INTERVAL_MS: 60_000,
  ALERTS_REFETCH_INTERVAL_MS: 30_000,
  BRANCHES_STALE_TIME_MS: 300_000,
} as const;
