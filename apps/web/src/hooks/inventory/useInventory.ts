'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi } from '@/api/inventory.api';
import type { StockLevel, StockQuery, StockInDto, StockOutDto } from '@/types/inventory';

const DEMO_STOCK: StockLevel[] = [
  { productId: 'p-1', productName: 'Nivea Krem 150ml', barcode: '4005808147366', sku: 'NIV-001', unit: 'dona', currentStock: 45, minStock: 5, status: 'OK', costPrice: 20_000, categoryName: 'Kremlar' },
  { productId: 'p-2', productName: 'Loreal Shampun 400ml', barcode: '3600520455388', sku: 'LOR-002', unit: 'dona', currentStock: 30, minStock: 5, status: 'OK', costPrice: 30_000, categoryName: 'Soch mahsulotlari' },
  { productId: 'p-3', productName: 'Maybelline Pomada', barcode: '3600531061258', sku: 'MAY-003', unit: 'dona', currentStock: 20, minStock: 3, status: 'OK', costPrice: 40_000, categoryName: 'Makiyaj' },
  { productId: 'p-4', productName: 'Dove Dezodorant', barcode: '8717163593127', sku: 'DOV-004', unit: 'dona', currentStock: 60, minStock: 10, status: 'OK', costPrice: 16_000, categoryName: 'Gigiyena' },
  { productId: 'p-5', productName: 'Garnier Toner', barcode: '3600541358164', sku: 'GAR-005', unit: 'dona', currentStock: 15, minStock: 5, status: 'OK', costPrice: 33_000, categoryName: 'Kremlar' },
  { productId: 'p-6', productName: 'Pantene Pro-V 600ml', barcode: '8001841556000', sku: 'PAN-006', unit: 'dona', currentStock: 25, minStock: 5, status: 'OK', costPrice: 25_000, categoryName: 'Soch mahsulotlari' },
  { productId: 'p-7', productName: 'Max Factor Foundation', barcode: '3614229007886', sku: 'MAX-007', unit: 'dona', currentStock: 8, minStock: 3, status: 'OK', costPrice: 60_000, categoryName: 'Makiyaj' },
  { productId: 'p-8', productName: 'Colgate Tish pastasi', barcode: '8718951230088', sku: 'COL-008', unit: 'dona', currentStock: 80, minStock: 15, status: 'OK', costPrice: 10_000, categoryName: 'Gigiyena' },
  { productId: 'p-9', productName: "L'Oreal Maskara", barcode: '3600523155934', sku: 'LOR-009', unit: 'dona', currentStock: 12, minStock: 3, status: 'OK', costPrice: 45_000, categoryName: 'Makiyaj' },
  { productId: 'p-10', productName: 'Rexona Dezodorant', barcode: '8710447290118', sku: 'REX-010', unit: 'dona', currentStock: 50, minStock: 10, status: 'OK', costPrice: 14_000, categoryName: 'Gigiyena' },
  { productId: 'p-11', productName: 'Neutrogena Yuz kremi', barcode: '0070501001347', sku: 'NEU-011', unit: 'dona', currentStock: 3, minStock: 5, status: 'LOW', costPrice: 75_000, categoryName: 'Kremlar' },
  { productId: 'p-12', productName: 'Head & Shoulders 400ml', barcode: '8001841518565', sku: 'HES-012', unit: 'dona', currentStock: 0, minStock: 5, status: 'OUT', costPrice: 22_000, categoryName: 'Soch mahsulotlari' },
];

export function useStock(params: StockQuery = {}) {
  return useQuery({
    queryKey: ['inventory', 'stock', params],
    queryFn: async () => {
      try {
        return await inventoryApi.getStock(params);
      } catch {
        let result = DEMO_STOCK;
        if (params.search) {
          const s = params.search.toLowerCase();
          result = result.filter(
            (item) =>
              item.productName.toLowerCase().includes(s) ||
              item.sku.toLowerCase().includes(s) ||
              (item.barcode ?? '').includes(s),
          );
        }
        if (params.lowStockOnly) {
          result = result.filter((item) => item.status !== 'OK');
        }
        return result;
      }
    },
    staleTime: 30_000,
    retry: 0,
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      try {
        return await inventoryApi.getLowStock();
      } catch {
        return DEMO_STOCK.filter((item) => item.status !== 'OK');
      }
    },
    staleTime: 30_000,
    retry: 0,
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
