import { api } from './client';

export interface ExchangeRate {
  usdUzs: number;
  date: string;
  source: string;
}

export interface ExchangeRateHistory {
  date: string;
  usdUzs: number;
  source: string;
}

export const exchangeApi = {
  getLatest: async (): Promise<ExchangeRate> => {
    const { data } = await api.get<ExchangeRate>('/exchange-rate/latest');
    return data;
  },

  getHistory: async (days = 30): Promise<ExchangeRateHistory[]> => {
    const { data } = await api.get<ExchangeRateHistory[]>('/exchange-rate/history', {
      params: { days },
    });
    return Array.isArray(data) ? data : [];
  },

  sync: async (): Promise<ExchangeRate> => {
    const { data } = await api.post<ExchangeRate>('/exchange-rate/sync');
    return data;
  },
};
