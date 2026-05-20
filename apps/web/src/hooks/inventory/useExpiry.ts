'use client';

import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/api/inventory.api';
import type { ExpiryProduct, ExpiredProduct } from '@/api/inventory.api';

export function useExpiringProducts(days: number) {
  return useQuery<ExpiryProduct[]>({
    queryKey: ['inventory', 'expiring', days],
    queryFn: () => inventoryApi.getExpiringProducts(days),
    staleTime: 60_000,
  });
}

export function useExpiredProducts() {
  return useQuery<ExpiredProduct[]>({
    queryKey: ['inventory', 'expired'],
    queryFn: () => inventoryApi.getExpiredProducts(),
    staleTime: 60_000,
  });
}
