import { apiClient } from './client';

// Backend: GET /exchange-rate/latest   → { usdUzs, date, source }
// Backend: GET /exchange-rate/history  → [{ date, usdUzs, source }]
// Backend: POST /exchange-rate/sync    → { usdUzs, date, source }

export interface ExchangeRateLatest {
  usdUzs: number;
  date: string;
  source: string;
}

export interface ExchangeRateHistoryItem {
  date: string;
  usdUzs: number;
  source: string;
}

const FALLBACK: ExchangeRateLatest = {
  usdUzs: 12850,
  date: '2026-03-27',
  source: 'FALLBACK',
};

export const exchangeRateApi = {
  getLatest(): Promise<ExchangeRateLatest> {
    return apiClient
      .get<ExchangeRateLatest>('/exchange-rate/latest')
      .then((r) => r.data)
      .catch(() => FALLBACK);
  },

  getHistory(days = 30): Promise<ExchangeRateHistoryItem[]> {
    return apiClient
      .get<ExchangeRateHistoryItem[]>('/exchange-rate/history', { params: { days } })
      .then((r) => {
        const d = r.data;
        return Array.isArray(d) ? d : [];
      })
      .catch(() => []);
  },

  syncFromCbu(): Promise<ExchangeRateLatest> {
    return apiClient
      .post<ExchangeRateLatest>('/exchange-rate/sync')
      .then((r) => r.data);
  },
};
