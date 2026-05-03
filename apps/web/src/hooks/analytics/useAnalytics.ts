'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics.api';

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

function todayIso(): string {
  return isoDate(new Date());
}

export function useAnalyticsSalesTrend(
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  days = 30,
  branchId?: string,
) {
  const from = days <= 1 ? todayIso() : daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'sales-trend', period, days, branchId],
    queryFn: () => analyticsApi.getSalesTrend({ period, from, to, branchId }),
    staleTime: 60_000,
  });
}

export function useAnalyticsTopProducts(
  days = 30,
  sortBy: 'revenue' | 'qty' = 'revenue',
  limit = 10,
  branchId?: string,
) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'top-products', days, sortBy, limit, branchId],
    queryFn: () => analyticsApi.getTopProducts({ from, to, limit, sortBy, branchId }),
    staleTime: 60_000,
  });
}

export function useAnalyticsDeadStock(days = 90, branchId?: string) {
  return useQuery({
    queryKey: ['analytics', 'dead-stock', days, branchId],
    queryFn: () => analyticsApi.getDeadStock({ days, branchId }),
    staleTime: 300_000,
  });
}

export function useAnalyticsMargin(days = 30, branchId?: string) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'margin', days, branchId],
    queryFn: () => analyticsApi.getMargin({ from, to, branchId }),
    staleTime: 60_000,
  });
}

export function useAnalyticsAbc(days = 30, branchId?: string) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'abc', days, branchId],
    queryFn: () => analyticsApi.getAbc({ from, to }),
    staleTime: 60_000,
  });
}

export function useAnalyticsCashierPerf(days = 30, branchId?: string) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'cashier-performance', days, branchId],
    queryFn: () => analyticsApi.getCashierPerformance({ from, to, branchId }),
    staleTime: 60_000,
  });
}

export function useAnalyticsHeatmap(days = 30, branchId?: string) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'heatmap', days, branchId],
    queryFn: () => analyticsApi.getHourlyHeatmap({ from, to, branchId }),
    staleTime: 60_000,
  });
}
