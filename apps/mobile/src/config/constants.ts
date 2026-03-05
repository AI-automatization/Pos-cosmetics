export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1';

export const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
} as const;

export const QUERY_STALE_TIMES = {
  DASHBOARD: 60_000,       // 1 daqiqa
  ALERTS: 30_000,          // 30 sekund
  BRANCHES: 300_000,       // 5 daqiqa
  SALES: 60_000,
  INVENTORY: 60_000,
  REALESTATE: 300_000,
} as const;

export const REFETCH_INTERVALS = {
  DASHBOARD: 60_000,
  ALERTS: 30_000,
} as const;
