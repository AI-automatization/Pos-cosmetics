// useStockMovementData.ts

import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { StockMovementsResponse, StockMovement, MovementType } from './StockMovementTypes';

async function fetchStockMovements(page: number): Promise<StockMovementsResponse> {
  const raw = await inventoryApi.getStockMovements({ page, limit: 50 });
  const items: StockMovement[] = raw.items.map((item) => ({
    ...item,
    type: item.type as MovementType,
  }));
  return { items, total: raw.total, page: raw.page, limit: raw.limit };
}

export function useStockMovementData(page: number = 1) {
  const movements = useQuery<StockMovementsResponse>({
    queryKey: ['inventory', 'movements', page],
    queryFn: () => fetchStockMovements(page),
    staleTime: 60 * 1000,
  });

  return { movements };
}
