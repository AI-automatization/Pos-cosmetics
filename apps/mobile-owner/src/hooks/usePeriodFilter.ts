import { useState, useMemo } from 'react';

export type Period = 'today' | 'week' | 'month' | 'year';

function getDateRange(period: Period): { fromDate: string; toDate: string } {
  const now = new Date();
  const toDate = now.toISOString().split('T')[0]!;

  switch (period) {
    case 'today': {
      return { fromDate: toDate, toDate };
    }
    case 'week': {
      const from = new Date(now);
      from.setDate(now.getDate() - now.getDay());
      return { fromDate: from.toISOString().split('T')[0]!, toDate };
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { fromDate: from.toISOString().split('T')[0]!, toDate };
    }
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1);
      return { fromDate: from.toISOString().split('T')[0]!, toDate };
    }
  }
}

export function usePeriodFilter(defaultPeriod: Period = 'month') {
  const [period, setPeriod] = useState<Period>(defaultPeriod);

  const { fromDate, toDate } = useMemo(() => getDateRange(period), [period]);

  return { period, setPeriod, fromDate, toDate };
}
