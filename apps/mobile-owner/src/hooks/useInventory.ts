import { useQuery } from '@tanstack/react-query';
import { inventoryApi, InventoryStatus } from '../api/inventory.api';
import { useBranchStore } from '../store/branch.store';
import { QUERY_KEYS } from '../config/queryKeys';

export type InventoryTabStatus = 'all' | InventoryStatus;

export function useInventory(status: InventoryTabStatus = 'all') {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const stock = useQuery({
    queryKey: QUERY_KEYS.inventory.stock(selectedBranchId, status),
    queryFn: () =>
      inventoryApi.getStock({
        branchId: selectedBranchId,
        status: status === 'all' ? 'all' : status,
      }),
  });

  return { stock };
}
