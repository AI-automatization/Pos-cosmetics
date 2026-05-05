// useStockOutData.ts — StockOut screen uchun React Query hook

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import api from '../../api/client';
import type { WriteOffPayload, WriteOffResponse, StockLevel } from './StockOutTypes';

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
    productId:    item.productId,
    name:         item.name ?? item.productName ?? '',
    warehouseId:  item.warehouseId ?? '',
    warehouseName: item.warehouseName ?? '',
    totalQty:     item.totalQty ?? item.stock ?? item.quantity ?? 0,
    minStockLevel: item.minStockLevel ?? null,
  };
}

async function writeOff(body: WriteOffPayload): Promise<WriteOffResponse> {
  const { data } = await api.post<WriteOffResponse>('/inventory/write-off', body);
  return data;
}

export function useStockOutData() {
  const qc = useQueryClient();

  const stockLevels = useQuery<StockLevel[]>({
    queryKey: ['stockLevels'],
    queryFn: async () => {
      const raw = await inventoryApi.getStockLevels();
      return raw.map(mapToStockLevel);
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const writeOffMutation = useMutation<WriteOffResponse, Error, WriteOffPayload>({
    mutationFn: writeOff,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['stockLevels'] });
    },
  });

  return { stockLevels, writeOffMutation };
}
