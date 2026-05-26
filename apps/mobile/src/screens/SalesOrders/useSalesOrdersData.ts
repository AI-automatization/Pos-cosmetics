import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api';
import type { OrderWithMethod } from '../../api/sales.api';

export type Period = 'today' | '7d' | '30d' | 'all';

interface DateRange {
  from: string | undefined;
  to: string | undefined;
}

function periodToDates(period: Period): DateRange {
  if (period === 'all') {
    return { from: undefined, to: undefined };
  }

  const now = new Date();
  const to = now.toISOString();

  if (period === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return { from: start.toISOString(), to };
  }

  const daysBack = period === '7d' ? 7 : 30;
  const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return { from: start.toISOString(), to };
}

export function useSalesOrdersData(period: Period = 'all') {
  const { from, to } = useMemo(() => periodToDates(period), [period]);

  const orders = useQuery({
    queryKey: ['sales', 'orders-admin', period],
    queryFn: async (): Promise<OrderWithMethod[]> => {
      const res = await salesApi.getOrders({ limit: 200, from, to });
      return res.data ?? [];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return { orders };
}
