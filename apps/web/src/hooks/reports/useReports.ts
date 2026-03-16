'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports.api';
import type { DateRangeQuery } from '@/types/reports';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function useDashboard() {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => reportsApi.getDashboard(),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
}

export function useDailyRevenue(params: DateRangeQuery) {
  return useQuery({
    queryKey: ['reports', 'daily-revenue', params],
    queryFn: () => reportsApi.getDailyRevenue(params),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useTopProducts(params: DateRangeQuery & { limit?: number }) {
  return useQuery({
    queryKey: ['reports', 'top-products', params],
    queryFn: () => reportsApi.getTopProducts(params),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useShiftReports(params: DateRangeQuery) {
  return useQuery({
    queryKey: ['reports', 'shifts', params],
    queryFn: () => reportsApi.getShifts(params),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export { today, daysAgo };
