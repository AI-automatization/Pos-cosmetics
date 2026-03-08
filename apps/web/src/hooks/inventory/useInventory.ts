'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi } from '@/api/inventory.api';
import { catalogApi } from '@/api/catalog.api';
import type { StockQuery, StockInDto, StockOutDto, StockLevel, StockStatus } from '@/types/inventory';
import type { Product } from '@/types/catalog';

async function fetchEnrichedStock(params: StockQuery): Promise<StockLevel[]> {
  const [rawLevels, productsPage] = await Promise.all([
    inventoryApi.getStock(params),
    catalogApi.getProducts({ limit: 1000 }),
  ]);

  const products: Product[] = productsPage.items ?? [];

  const productMap = new Map(products.map((p) => [p.id, p]));

  return (rawLevels as Array<{ productId: string; warehouseId?: string; stock?: number; currentStock?: number }>).map((raw) => {
    const p = productMap.get(raw.productId);
    const currentStock = raw.currentStock ?? raw.stock ?? 0;
    const minStock = Number(p?.minStockLevel ?? p?.minStock ?? 0);
    const status: StockStatus = currentStock <= 0 ? 'OUT' : currentStock <= minStock ? 'LOW' : 'OK';
    return {
      productId: raw.productId,
      productName: p?.name ?? raw.productId,
      barcode: p?.barcode ?? null,
      sku: p?.sku ?? '',
      unit: typeof p?.unit === 'object' ? (p.unit as { name: string })?.name ?? '' : (p?.unit as string) ?? '',
      currentStock,
      minStock,
      status,
      costPrice: Number(p?.costPrice ?? 0),
      categoryName: p?.category?.name ?? '',
    };
  });
}

export function useStock(params: StockQuery = {}) {
  return useQuery({
    queryKey: ['inventory', 'stock', params],
    queryFn: () => fetchEnrichedStock(params),
    staleTime: 30_000,
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      const enriched = await fetchEnrichedStock({});
      return enriched.filter((s) => s.status === 'LOW' || s.status === 'OUT');
    },
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
