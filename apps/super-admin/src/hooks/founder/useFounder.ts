'use client';

import { useQuery } from '@tanstack/react-query';
import { founderApi } from '@/api/founder.api';
import type {
  FounderError,
  FounderStats,
  RevenuePoint,
  TenantSummary,
  TopTenantBar,
} from '@/types/founder';

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useFounderStats() {
  return useQuery<FounderStats>({
    queryKey: ['founder', 'stats'],
    queryFn: () => founderApi.getStats(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useFounderRevenue(days = 14) {
  return useQuery<RevenuePoint[]>({
    queryKey: ['founder', 'revenue', days],
    queryFn: () => founderApi.getRevenueSeries(days),
    staleTime: 60_000,
  });
}

export function useFounderTenants(params?: { search?: string; status?: string }) {
  return useQuery<TenantSummary[]>({
    queryKey: ['founder', 'tenants', params],
    queryFn: () => founderApi.listTenants(params),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useTopTenants() {
  return useQuery<TopTenantBar[]>({
    queryKey: ['founder', 'top-tenants'],
    queryFn: () => founderApi.getTopTenants(),
    staleTime: 60_000,
  });
}

export function useFounderErrors(params?: { tenantId?: string; type?: string; severity?: string }) {
  return useQuery<FounderError[]>({
    queryKey: ['founder', 'errors', params],
    queryFn: () => founderApi.getErrors(params),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
