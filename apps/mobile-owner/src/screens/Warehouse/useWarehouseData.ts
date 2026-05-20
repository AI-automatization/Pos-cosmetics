import { useQuery } from '@tanstack/react-query';
import { inventoryApi, InventoryItem } from '../../api/inventory.api';
import { useBranchStore } from '../../store/branch.store';
import { DASHBOARD_REFETCH_INTERVAL } from '../../config/constants';

export type WarehouseTab = 'all' | 'low' | 'expiring';

export function useWarehouseData(tab: WarehouseTab) {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const stock = useQuery<InventoryItem[]>({
    queryKey: ['warehouse', tab, selectedBranchId],
    queryFn: async () => {
      if (tab === 'low') {
        return inventoryApi.getLowStock(selectedBranchId);
      }
      if (tab === 'expiring') {
        return inventoryApi.getExpiring(selectedBranchId, 30);
      }
      const page = await inventoryApi.getStock({
        branchId: selectedBranchId,
        status: 'all',
        limit: 100,
      });
      return page.items;
    },
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });

  return { stock };
}
