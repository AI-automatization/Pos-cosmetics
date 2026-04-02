import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';

jest.mock('@/api', () => ({
  analyticsApi: {
    getRevenue: jest.fn().mockResolvedValue([
      { period: 'daily', amount: 5000000, currency: 'UZS', trend: 3.2 },
    ]),
    getBranchComparison: jest.fn().mockResolvedValue([]),
    getInsights: jest.fn().mockResolvedValue([]),
  },
  alertsApi: {
    getActive: jest.fn().mockResolvedValue([]),
  },
  salesApi: {
    getQuickStats: jest.fn().mockResolvedValue({
      ordersCount: 10,
      avgBasket: 250000,
      currency: 'UZS',
      topProducts: [],
    }),
    getActiveShifts: jest.fn().mockResolvedValue([]),
  },
  branchApi: {
    getAll: jest.fn().mockResolvedValue([]),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useDashboard', () => {
  it('returns all expected query fields', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('revenue');
    expect(result.current).toHaveProperty('alerts');
    expect(result.current).toHaveProperty('branches');
    expect(result.current).toHaveProperty('branchComparison');
    expect(result.current).toHaveProperty('quickStats');
    expect(result.current).toHaveProperty('activeShifts');
  });

  it('fetches revenue data successfully', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.revenue.isSuccess).toBe(true));

    expect(result.current.revenue.data).toHaveLength(1);
    expect(result.current.revenue.data?.[0]?.period).toBe('daily');
  });

  it('passes branchId to revenue query', async () => {
    const { analyticsApi } = jest.requireMock('@/api') as {
      analyticsApi: { getRevenue: jest.Mock };
    };

    const { result } = renderHook(() => useDashboard('branch-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.revenue.isSuccess).toBe(true));
    expect(analyticsApi.getRevenue).toHaveBeenCalledWith('branch-123');
  });

  it('starts in loading state', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    expect(result.current.revenue.isLoading).toBe(true);
  });

  it('fetches quickStats successfully', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.quickStats.isSuccess).toBe(true));
    expect(result.current.quickStats.data?.ordersCount).toBe(10);
  });
});
