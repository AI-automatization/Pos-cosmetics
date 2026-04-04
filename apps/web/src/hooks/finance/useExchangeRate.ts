'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { exchangeRateApi } from '@/api/exchangeRate.api';

const RATE_KEY = 'exchange-rate';

// Bugungi USD/UZS kurs (cache 10 daqiqa)
export function useExchangeRate() {
  return useQuery({
    queryKey: [RATE_KEY, 'latest'],
    queryFn: () => exchangeRateApi.getLatest(),
    staleTime: 10 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// N kunlik kurs tarixi
export function useExchangeRateHistory(days: number) {
  return useQuery({
    queryKey: [RATE_KEY, 'history', days],
    queryFn: () => exchangeRateApi.getHistory(days),
    staleTime: 10 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// CBU dan qo'lda yangilash (OWNER/ADMIN)
export function useSyncExchangeRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => exchangeRateApi.syncFromCbu(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RATE_KEY] });
      toast.success("Kurs CBU dan yangilandi");
    },
    onError: () => toast.error("CBU dan kurs olishda xatolik"),
  });
}
