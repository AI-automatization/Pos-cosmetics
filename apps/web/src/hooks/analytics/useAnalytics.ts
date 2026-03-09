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

export function useAnalyticsSalesTrend(period: 'daily' | 'weekly' | 'monthly' = 'daily', days = 30) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'sales-trend', period, days],
    queryFn: () => analyticsApi.getSalesTrend({ period, from, to }),
    staleTime: 60_000,
  });
}

export function useAnalyticsTopProducts(days = 30, sortBy: 'revenue' | 'qty' = 'revenue', limit = 10) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'top-products', days, sortBy, limit],
    queryFn: () => analyticsApi.getTopProducts({ from, to, limit, sortBy }),
    staleTime: 60_000,
  });
}

export function useAnalyticsDeadStock(days = 90) {
  return useQuery({
    queryKey: ['analytics', 'dead-stock', days],
    queryFn: () => analyticsApi.getDeadStock({ days }),
    staleTime: 300_000,
  });
}

export function useAnalyticsMargin(days = 30) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'margin', days],
    queryFn: () => analyticsApi.getMargin({ from, to }),
    staleTime: 60_000,
  });
}

export function useAnalyticsAbc(days = 30) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'abc', days],
    queryFn: () => analyticsApi.getAbc({ from, to }),
    staleTime: 60_000,
  });
}

export function useAnalyticsCashierPerf(days = 30) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'cashier-performance', days],
    queryFn: () => analyticsApi.getCashierPerformance({ from, to }),
    staleTime: 60_000,
  });
}

export function useAnalyticsHeatmap(days = 30) {
  const from = daysAgoIso(days);
  const to = todayIso();
  return useQuery({
    queryKey: ['analytics', 'heatmap', days],
    queryFn: () => analyticsApi.getHourlyHeatmap({ from, to }),
    staleTime: 60_000,
  });
}
