const PRODUCTION_API_URL = 'https://api.raos.uz/api/v1';
const DEV_API_URL = 'http://localhost:3000/api/v1';

function resolveApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }
  if (__DEV__) {
    return DEV_API_URL;
  }
  return PRODUCTION_API_URL;
}

export const CONFIG = {
  API_URL: resolveApiUrl(),
  REFETCH_INTERVAL_MS: 60_000,
  ALERTS_REFETCH_INTERVAL_MS: 30_000,
  BRANCHES_STALE_TIME_MS: 300_000,
} as const;

export const APP_VERSION = '0.1.0';
