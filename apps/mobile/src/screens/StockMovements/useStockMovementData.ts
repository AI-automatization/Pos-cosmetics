// useStockMovementData.ts — infinite scroll pagination

import { useInfiniteQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { StockMovementsResponse, StockMovement, MovementType } from './StockMovementTypes';

const PAGE_LIMIT = 50;

async function fetchPage(page: number): Promise<StockMovementsResponse> {
  const raw = await inventoryApi.getStockMovements({ page, limit: PAGE_LIMIT });
  const items: StockMovement[] = raw.items.map((item) => ({
    ...item,
    type: item.type as MovementType,
  }));
  return { items, total: raw.total, page: raw.page, limit: raw.limit };
}

export function useStockMovementData() {
  const movements = useInfiniteQuery<StockMovementsResponse>({
    queryKey: ['inventory', 'movements'],
    queryFn: ({ pageParam }) => fetchPage(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    staleTime: 60_000,
  });

  return { movements };
}
