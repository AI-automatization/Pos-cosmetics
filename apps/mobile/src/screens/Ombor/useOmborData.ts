import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api';
import type { LowStockItem } from '../../api/inventory.api';

export function useOmborData() {
  const stockLevels = useQuery<LowStockItem[]>({
    queryKey: ['ombor-stock'],
    queryFn: () => inventoryApi.getStockLevels(),
    staleTime: 30_000,
  });

  return { stockLevels };
}
