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

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_STATS: FounderStats = {
  totalTenants: 7,
  activeTenants: 5,
  inactiveTenants: 2,
  totalSalesToday: 143,
  totalRevenueToday: 48_750_000,
  totalOrdersToday: 143,
  totalRevenueMonth: 1_250_000_000,
};

function genRevenuePoints(days: number): RevenuePoint[] {
  const points: RevenuePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    points.push({
      date: d.toISOString().slice(0, 10),
      revenue: Math.round(30_000_000 + Math.random() * 40_000_000),
      orders: Math.round(80 + Math.random() * 100),
    });
  }
  return points;
}

const DEMO_TENANTS: TenantSummary[] = [
  {
    id: 't-1', name: 'Kosmetika Markaz', slug: 'kosmetika',
    status: 'ACTIVE', salesToday: 45, revenueToday: 18_200_000, errorsLast24h: 0,
    lastActivityAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 't-2', name: 'Moda Dunyosi', slug: 'moda',
    status: 'ACTIVE', salesToday: 32, revenueToday: 12_500_000, errorsLast24h: 2,
    lastActivityAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 't-3', name: 'Elektronika Plus', slug: 'elektronika',
    status: 'ACTIVE', salesToday: 28, revenueToday: 10_100_000, errorsLast24h: 0,
    lastActivityAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 't-4', name: 'Oziq-Ovqat Bozor', slug: 'oziq',
    status: 'ACTIVE', salesToday: 22, revenueToday: 5_350_000, errorsLast24h: 5,
    lastActivityAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 't-5', name: 'Dorixona 24', slug: 'dorixona',
    status: 'ACTIVE', salesToday: 16, revenueToday: 2_600_000, errorsLast24h: 1,
    lastActivityAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 't-6', name: 'Sport Dunyo', slug: 'sport',
    status: 'INACTIVE', salesToday: 0, revenueToday: 0, errorsLast24h: 0,
    lastActivityAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 't-7', name: 'Qurilish Materiallari', slug: 'qurilish',
    status: 'INACTIVE', salesToday: 0, revenueToday: 0, errorsLast24h: 12,
    lastActivityAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-02-22T00:00:00Z',
  },
];

const DEMO_TOP_TENANTS: TopTenantBar[] = DEMO_TENANTS
  .filter((t) => t.revenueToday > 0)
  .sort((a, b) => b.revenueToday - a.revenueToday)
  .slice(0, 5)
  .map((t) => ({ name: t.name, revenue: t.revenueToday }));

const DEMO_ERRORS: FounderError[] = [
  {
    id: 'e-1', tenantId: 't-2', tenantName: 'Moda Dunyosi',
    type: 'API', severity: 'ERROR',
    message: 'POST /orders failed: Connection timeout after 30s',
    url: '/api/orders', userId: 'u-12',
    occurredAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'e-2', tenantId: 't-4', tenantName: 'Oziq-Ovqat Bozor',
    type: 'SYNC', severity: 'WARN',
    message: 'Sync queue exceeded 50 items — connection slow',
    occurredAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'e-3', tenantId: 't-5', tenantName: 'Dorixona 24',
    type: 'CLIENT', severity: 'ERROR',
    message: 'Unhandled TypeError: Cannot read properties of undefined (reading \'price\')',
    stack: 'TypeError at CartPanel.tsx:84\n  at POSPage.tsx:42',
    url: '/pos', userId: 'u-8',
    occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e-4', tenantId: 't-7', tenantName: 'Qurilish Materiallari',
    type: 'API', severity: 'CRITICAL',
    message: 'Database connection pool exhausted — all queries failing',
    occurredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e-5', tenantId: 't-4', tenantName: 'Oziq-Ovqat Bozor',
    type: 'API', severity: 'WARN',
    message: 'Slow query detected: GET /products took 4821ms',
    url: '/api/products',
    occurredAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useFounderStats() {
  return useQuery<FounderStats>({
    queryKey: ['founder', 'stats'],
    queryFn: async () => {
      try { return await founderApi.getStats(); } catch { return DEMO_STATS; }
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useFounderRevenue(days = 14) {
  return useQuery<RevenuePoint[]>({
    queryKey: ['founder', 'revenue', days],
    queryFn: async () => {
      try { return await founderApi.getRevenueSeries(days); } catch { return genRevenuePoints(days); }
    },
    staleTime: 60_000,
  });
}

export function useFounderTenants(params?: { search?: string; status?: string }) {
  return useQuery<TenantSummary[]>({
    queryKey: ['founder', 'tenants', params],
    queryFn: async () => {
      try {
        return await founderApi.listTenants(params);
      } catch {
        let result = DEMO_TENANTS;
        if (params?.search) {
          const s = params.search.toLowerCase();
          result = result.filter((t) => t.name.toLowerCase().includes(s) || t.slug.includes(s));
        }
        if (params?.status && params.status !== 'ALL') {
          result = result.filter((t) => t.status === params.status);
        }
        return result;
      }
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useTopTenants() {
  return useQuery<TopTenantBar[]>({
    queryKey: ['founder', 'top-tenants'],
    queryFn: async () => {
      try { return await founderApi.getTopTenants(); } catch { return DEMO_TOP_TENANTS; }
    },
    staleTime: 60_000,
  });
}

export function useFounderErrors(params?: { tenantId?: string; type?: string; severity?: string }) {
  return useQuery<FounderError[]>({
    queryKey: ['founder', 'errors', params],
    queryFn: async () => {
      try {
        return await founderApi.getErrors(params);
      } catch {
        let result = DEMO_ERRORS;
        if (params?.tenantId) result = result.filter((e) => e.tenantId === params.tenantId);
        if (params?.type) result = result.filter((e) => e.type === params.type);
        if (params?.severity) result = result.filter((e) => e.severity === params.severity);
        return result;
      }
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
