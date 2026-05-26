// useStockRequestData.ts — ombor so'rovi uchun data hook

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { inventoryApi, branchesApi } from '../../api';
import { useAuthStore } from '../../store/auth.store';
import type { Branch } from '../../api/branches.api';
import type { StockLevel } from './StockTransferTypes';

export default function useStockRequestData() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // Barcha branchlar
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: branchesApi.getAll,
  });

  // Ombordagi stock levellar
  const stockLevels = useQuery<StockLevel[]>({
    queryKey: ['inventory', 'levels'],
    queryFn: async () => {
      const raw = await inventoryApi.getStockLevels();
      return raw.map((item) => ({
        productId: item.productId,
        name: item.productName,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouseName,
        totalQty: item.quantity,
        minStockLevel: item.minStockLevel,
      }));
    },
  });

  // Katta ombor branchini topish (isWarehouse: true)
  const warehouseBranch = useMemo<Branch | null>(() => {
    const list = branches.data ?? [];
    return list.find((b) => b.isWarehouse) ?? null;
  }, [branches.data]);

  // User ning filiali
  const userBranch = useMemo<Branch | null>(() => {
    if (!user?.branchId) return null;
    const list = branches.data ?? [];
    return list.find((b) => b.id === user.branchId) ?? null;
  }, [branches.data, user?.branchId]);

  // Transfer yaratish mutation
  const createTransfer = useMutation({
    mutationFn: inventoryApi.createTransfer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transfers'] });
      void queryClient.invalidateQueries({ queryKey: ['inventory', 'levels'] });
    },
  });

  return {
    branches,
    stockLevels,
    warehouseBranch,
    userBranch,
    createTransfer,
  };
}
