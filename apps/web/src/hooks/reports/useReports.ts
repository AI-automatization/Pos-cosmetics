'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports.api';
import type { DashboardData, DateRangeQuery } from '@/types/reports';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const DEMO_DASHBOARD: DashboardData = {
  today: {
    totalRevenue: 1_250_000,
    ordersCount: 18,
    averageOrderValue: 69_444,
    discountAmount: 75_000,
    returnsAmount: 0,
    netRevenue: 1_175_000,
  },
  weeklyRevenue: Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().slice(0, 10),
      revenue: Math.round((800_000 + Math.random() * 900_000) / 1000) * 1000,
      ordersCount: Math.floor(10 + Math.random() * 20),
      discountAmount: Math.round(50_000 + Math.random() * 100_000),
    };
  }),
  topProducts: [
    { productId: 'p-1', productName: 'Nivea Krem 150ml', quantity: 24, revenue: 768_000, ordersCount: 20 },
    { productId: 'p-3', productName: 'Maybelline Pomada', quantity: 18, revenue: 1_170_000, ordersCount: 15 },
    { productId: 'p-9', productName: "L'Oreal Maskara", quantity: 14, revenue: 1_008_000, ordersCount: 12 },
    { productId: 'p-7', productName: 'Max Factor Foundation', quantity: 10, revenue: 950_000, ordersCount: 9 },
    { productId: 'p-4', productName: 'Dove Dezodorant', quantity: 32, revenue: 896_000, ordersCount: 28 },
  ],
  lowStockCount: 2,
};

export function useDashboard() {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      try {
        return await reportsApi.getDashboard();
      } catch {
        return DEMO_DASHBOARD;
      }
    },
    staleTime: 60_000,
    retry: 0,
  });
}

export function useDailyRevenue(params: DateRangeQuery) {
  return useQuery({
    queryKey: ['reports', 'daily-revenue', params],
    queryFn: () => reportsApi.getDailyRevenue(params),
    staleTime: 60_000,
  });
}

export function useTopProducts(params: DateRangeQuery & { limit?: number }) {
  return useQuery({
    queryKey: ['reports', 'top-products', params],
    queryFn: () => reportsApi.getTopProducts(params),
    staleTime: 60_000,
  });
}

export function useShiftReports(params: DateRangeQuery) {
  return useQuery({
    queryKey: ['reports', 'shifts', params],
    queryFn: () => reportsApi.getShifts(params),
    staleTime: 60_000,
  });
}

export { today, daysAgo };
