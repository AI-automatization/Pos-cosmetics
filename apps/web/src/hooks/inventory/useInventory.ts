'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi } from '@/api/inventory.api';
import type { StockQuery, StockInDto, StockOutDto } from '@/types/inventory';

export function useStock(params: StockQuery = {}) {
  return useQuery({
    queryKey: ['inventory', 'stock', params],
    queryFn: () => inventoryApi.getStock(params),
    staleTime: 30_000,
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => inventoryApi.getLowStock(),
    staleTime: 30_000,
  });
}

export function useStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: StockInDto) => inventoryApi.stockIn(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Kirim muvaffaqiyatli saqlandi');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Xato yuz berdi');
    },
  });
}

export function useStockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: StockOutDto) => inventoryApi.stockOut(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Chiqim muvaffaqiyatli saqlandi');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Xato yuz berdi');
    },
  });
}
