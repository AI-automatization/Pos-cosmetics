// useExpiryData.ts — API hook

import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { DaysFilter, ExpiryItem, ExpiredItem } from './ExpiryTypes';

export function useExpiryData(days: DaysFilter) {
  const expiring = useQuery<ExpiryItem[]>({
    queryKey: ['inventory', 'expiring', days],
    queryFn: () => inventoryApi.getExpiringProducts(days),
    staleTime: 2 * 60 * 1000,
  });

  const expired = useQuery<ExpiredItem[]>({
    queryKey: ['inventory', 'expired'],
    queryFn: () => inventoryApi.getExpiredProducts(),
    staleTime: 2 * 60 * 1000,
  });

  return { expiring, expired };
}
