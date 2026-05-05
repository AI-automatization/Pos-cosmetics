import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api';
import { CONFIG } from '../../config';

const STATUS_SORT_ORDER: Record<string, number> = {
  out_of_stock: 0,
  low:          1,
  expiring:     2,
  expired:      3,
  normal:       4,
};

export function useInventoryData() {
  const allStock = useQuery({
    queryKey: ['inventory', 'all-items'],
    queryFn: async () => {
      const response = await inventoryApi.getInventoryItems({ limit: 100 });
      const sorted = [...response.items].sort((a, b) => {
        const orderA = STATUS_SORT_ORDER[a.status] ?? 99;
        const orderB = STATUS_SORT_ORDER[b.status] ?? 99;
        return orderA - orderB;
      });
      return sorted;
    },
    refetchInterval: CONFIG.ALERTS_REFETCH_INTERVAL_MS,
  });

  return { allStock };
}
