// useStockTransferData.ts — StockTransfer screen uchun React Query hook

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import { branchesApi } from '../../api/branches.api';
import type { StockLevel } from './StockTransferTypes';
import type { CreateTransferBody, CreateTransferResponse } from '../../api/inventory.api';

function mapToStockLevel(item: {
  productId: string;
  productName?: string;
  name?: string;
  warehouseId?: string;
  warehouseName?: string;
  totalQty?: number;
  stock?: number;
  quantity?: number;
  minStockLevel?: number | null;
}): StockLevel {
  return {
    productId:     item.productId,
    name:          item.name ?? item.productName ?? '',
    warehouseId:   item.warehouseId ?? '',
    warehouseName: item.warehouseName ?? '',
    totalQty:      item.totalQty ?? item.stock ?? item.quantity ?? 0,
    minStockLevel: item.minStockLevel ?? null,
  };
}

export function useStockTransferData() {
  const qc = useQueryClient();

  const stockLevels = useQuery<StockLevel[]>({
    queryKey: ['stockLevels'],
    queryFn: async () => {
      const raw = await inventoryApi.getStockLevels();
      return raw.map(mapToStockLevel);
    },
    staleTime:       30_000,
    refetchInterval: 60_000,
  });

  const branches = useQuery({
    queryKey: ['branches'],
    queryFn:  () => branchesApi.getAll(),
    staleTime: 60_000,
  });

  const createTransfer = useMutation<CreateTransferResponse, Error, CreateTransferBody>({
    mutationFn: inventoryApi.createTransfer,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stockLevels'] });
    },
  });

  return { stockLevels, branches, createTransfer };
}
