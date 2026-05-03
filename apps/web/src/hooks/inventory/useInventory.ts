'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi } from '@/api/inventory.api';
import { catalogApi } from '@/api/catalog.api';
import { usersApi } from '@/api/users.api';
import { extractErrorMessage } from '@/lib/utils';
import type { StockQuery, StockInDto, StockOutDto, StockLevel, StockStatus, StockMovement, TransferStatus, CreateTransferDto } from '@/types/inventory';
import type { Product } from '@/types/catalog';
import type { User } from '@/types/user';

async function fetchEnrichedStock(params: StockQuery): Promise<StockLevel[]> {
  const [rawLevels, productsPage] = await Promise.all([
    inventoryApi.getStock(params),
    catalogApi.getProducts({ limit: 1000 }),
  ]);

  const products: Product[] = productsPage.items ?? [];

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Aggregate per-warehouse rows into one row per product (sum stock across warehouses)
  const aggregated = new Map<string, { totalStock: number; productId: string }>();
  for (const raw of rawLevels as Array<{ productId: string; warehouseId?: string; stock?: number; currentStock?: number }>) {
    const existing = aggregated.get(raw.productId);
    const stock = raw.currentStock ?? raw.stock ?? 0;
    if (existing) {
      existing.totalStock += stock;
    } else {
      aggregated.set(raw.productId, { productId: raw.productId, totalStock: stock });
    }
  }

  return Array.from(aggregated.values()).map(({ productId, totalStock }) => {
    const p = productMap.get(productId);
    const minStock = Number(p?.minStockLevel ?? 0);
    const status: StockStatus = totalStock <= 0 ? 'OUT' : totalStock <= minStock ? 'LOW' : 'OK';
    return {
      productId,
      productName: p?.name ?? productId,
      barcode: p?.barcode ?? null,
      sku: p?.sku ?? '',
      unit: p ? (typeof p.unit === 'object' ? (p.unit as { name: string })?.name ?? '' : String(p.unit ?? '')) : '',
      currentStock: totalStock,
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
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
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
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useOpenTester() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { productId: string; warehouseId: string; quantity: number; costPrice: number; note?: string }) =>
      inventoryApi.openTester(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['testers'] });
      toast.success('Tester muvaffaqiyatli ochildi');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useTesters(params: { from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: ['testers', params],
    queryFn: () => inventoryApi.getTesters(params),
    staleTime: 60_000,
  });
}

export function useMovements(productId?: string) {
  return useQuery({
    queryKey: ['inventory', 'movements', productId ?? null],
    queryFn: () => inventoryApi.getMovements(productId),
    staleTime: 30_000,
  });
}

export function useMovementsWithUsers(productId?: string) {
  return useQuery({
    queryKey: ['inventory', 'movements-with-users', productId ?? null],
    queryFn: async (): Promise<(StockMovement & { userName: string })[]> => {
      const [movements, users] = await Promise.all([
        inventoryApi.getMovements(productId),
        usersApi.listUsers().catch(() => [] as User[]),
      ]);
      const userMap = new Map(
        users.map((u) => [
          u.id,
          [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.id,
        ]),
      );
      return movements
        .map((m) => ({
          ...m,
          productName: m.product?.name ?? m.productName ?? '—',
          userName: (m.user
            ? [m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || m.user.name || ''
            : userMap.get(m.userId ?? '') ?? '') || '—',
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    staleTime: 30_000,
  });
}

// ─── Transfers ───

const TRANSFERS_KEY = 'transfers';

export function useTransfers(params?: { status?: TransferStatus; branchId?: string }) {
  return useQuery({
    queryKey: [TRANSFERS_KEY, params?.status, params?.branchId],
    queryFn: () => inventoryApi.listTransfers(params),
    staleTime: 30_000,
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTransferDto) => inventoryApi.createTransfer(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TRANSFERS_KEY] });
      toast.success("Ko'chirish so'rovi yaratildi");
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useTransferAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'ship' | 'receive' | 'cancel' }) => {
      const map = {
        approve: inventoryApi.approveTransfer,
        ship: inventoryApi.shipTransfer,
        receive: inventoryApi.receiveTransfer,
        cancel: inventoryApi.cancelTransfer,
      };
      return map[action](id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TRANSFERS_KEY] });
      toast.success("Transfer holati yangilandi");
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export function useInvoices(params: { page?: number; limit?: number; from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => inventoryApi.listInvoices(params),
    staleTime: 30_000,
  });
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => inventoryApi.getInvoice(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useApproveInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.approveInvoice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice'] });
      toast.success('Nakладная tasdiqlandi');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
