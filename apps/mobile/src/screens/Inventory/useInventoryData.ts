import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api';
import { CONFIG } from '../../config';

export function useInventoryData() {
  const lowStock = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => inventoryApi.getLowStock(),
    refetchInterval: CONFIG.ALERTS_REFETCH_INTERVAL_MS,
  });

  return { lowStock };
}
