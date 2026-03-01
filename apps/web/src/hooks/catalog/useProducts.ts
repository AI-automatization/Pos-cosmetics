'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi } from '@/api/catalog.api';
import { extractErrorMessage } from '@/lib/utils';
import type { Product, ProductsQuery, CreateProductDto, UpdateProductDto } from '@/types/catalog';

export const PRODUCTS_KEY = 'products';

const NOW = new Date().toISOString();
const DEMO_PRODUCTS: Product[] = [
  { id: 'p-1', name: 'Nivea Krem 150ml', sku: 'NIV-001', barcode: '4005808147366', categoryId: 'c-1', category: { id: 'c-1', name: 'Kremlar' }, sellPrice: 32_000, costPrice: 20_000, currentStock: 45, minStock: 5, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-2', name: 'Loreal Shampun 400ml', sku: 'LOR-002', barcode: '3600520455388', categoryId: 'c-2', category: { id: 'c-2', name: 'Soch mahsulotlari' }, sellPrice: 48_000, costPrice: 30_000, currentStock: 30, minStock: 5, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-3', name: 'Maybelline Pomada', sku: 'MAY-003', barcode: '3600531061258', categoryId: 'c-3', category: { id: 'c-3', name: 'Makiyaj' }, sellPrice: 65_000, costPrice: 40_000, currentStock: 20, minStock: 3, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-4', name: 'Dove Dezodorant', sku: 'DOV-004', barcode: '8717163593127', categoryId: 'c-4', category: { id: 'c-4', name: 'Gigiyena' }, sellPrice: 28_000, costPrice: 16_000, currentStock: 60, minStock: 10, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-5', name: 'Garnier Toner', sku: 'GAR-005', barcode: '3600541358164', categoryId: 'c-1', category: { id: 'c-1', name: 'Kremlar' }, sellPrice: 55_000, costPrice: 33_000, currentStock: 15, minStock: 5, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-6', name: 'Pantene Pro-V 600ml', sku: 'PAN-006', barcode: '8001841556000', categoryId: 'c-2', category: { id: 'c-2', name: 'Soch mahsulotlari' }, sellPrice: 42_000, costPrice: 25_000, currentStock: 25, minStock: 5, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-7', name: 'Max Factor Foundation', sku: 'MAX-007', barcode: '3614229007886', categoryId: 'c-3', category: { id: 'c-3', name: 'Makiyaj' }, sellPrice: 95_000, costPrice: 60_000, currentStock: 8, minStock: 3, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-8', name: 'Colgate Tish pastasi', sku: 'COL-008', barcode: '8718951230088', categoryId: 'c-4', category: { id: 'c-4', name: 'Gigiyena' }, sellPrice: 18_000, costPrice: 10_000, currentStock: 80, minStock: 15, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-9', name: "L'Oreal Maskara", sku: 'LOR-009', barcode: '3600523155934', categoryId: 'c-3', category: { id: 'c-3', name: 'Makiyaj' }, sellPrice: 72_000, costPrice: 45_000, currentStock: 12, minStock: 3, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-10', name: 'Rexona Dezodorant', sku: 'REX-010', barcode: '8710447290118', categoryId: 'c-4', category: { id: 'c-4', name: 'Gigiyena' }, sellPrice: 24_000, costPrice: 14_000, currentStock: 50, minStock: 10, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-11', name: 'Neutrogena Yuz kremi', sku: 'NEU-011', barcode: '0070501001347', categoryId: 'c-1', category: { id: 'c-1', name: 'Kremlar' }, sellPrice: 120_000, costPrice: 75_000, currentStock: 3, minStock: 5, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
  { id: 'p-12', name: 'Head & Shoulders 400ml', sku: 'HES-012', barcode: '8001841518565', categoryId: 'c-2', category: { id: 'c-2', name: 'Soch mahsulotlari' }, sellPrice: 38_000, costPrice: 22_000, currentStock: 0, minStock: 5, unit: 'dona', isActive: true, image: null, tenantId: 'demo', createdAt: NOW, updatedAt: NOW },
];

export function useProducts(filters: ProductsQuery = {}) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, filters],
    queryFn: async () => {
      try {
        return await catalogApi.getProducts(filters);
      } catch {
        // Demo mode — backend tayyor bo'lgunicha
        let result = DEMO_PRODUCTS;
        if (filters.search) {
          const s = filters.search.toLowerCase();
          result = result.filter(
            (p) =>
              p.name.toLowerCase().includes(s) ||
              p.sku.toLowerCase().includes(s) ||
              (p.barcode ?? '').includes(s),
          );
        }
        if (filters.categoryId) {
          result = result.filter((p) => p.categoryId === filters.categoryId);
        }
        return {
          items: result,
          meta: { total: result.length, page: 1, limit: 100, totalPages: 1 },
        };
      }
    },
    staleTime: 30_000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProductDto) => catalogApi.createProduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Mahsulot muvaffaqiyatli qo\'shildi!');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      catalogApi.updateProduct(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Mahsulot yangilandi!');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      toast.success('Mahsulot o\'chirildi!');
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}
