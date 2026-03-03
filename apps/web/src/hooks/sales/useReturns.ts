'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { returnsApi } from '@/api/returns.api';
import type { Return, CreateReturnDto } from '@/types/returns';

const NOW = new Date().toISOString();
const YESTERDAY = new Date(Date.now() - 86400000).toISOString();

const DEMO_RETURNS: Return[] = [
  {
    id: 'r-1', orderId: 'o-1', orderNumber: 'ORD-0042', cashierName: 'Jasur Karimov',
    reason: 'DEFECTIVE', status: 'APPROVED', totalAmount: 65_000,
    items: [{ productId: 'p-3', productName: 'Maybelline Pomada', quantity: 1, sellPrice: 65_000, lineTotal: 65_000 }],
    adminNote: 'Tekshirildi, qaytarish tasdiqlandi', createdAt: YESTERDAY, resolvedAt: YESTERDAY,
  },
  {
    id: 'r-2', orderId: 'o-2', orderNumber: 'ORD-0051', cashierName: 'Nilufar Xasanova',
    reason: 'WRONG_ITEM', status: 'PENDING', totalAmount: 48_000,
    items: [{ productId: 'p-2', productName: 'Loreal Shampun 400ml', quantity: 1, sellPrice: 48_000, lineTotal: 48_000 }],
    adminNote: null, createdAt: NOW, resolvedAt: null,
  },
  {
    id: 'r-3', orderId: 'o-3', orderNumber: 'ORD-0038', cashierName: 'Jasur Karimov',
    reason: 'CUSTOMER_CHANGE', status: 'REJECTED', totalAmount: 32_000,
    items: [{ productId: 'p-1', productName: 'Nivea Krem 150ml', quantity: 1, sellPrice: 32_000, lineTotal: 32_000 }],
    adminNote: 'Mahsulot ishlatilgan, qaytarish mumkin emas', createdAt: YESTERDAY, resolvedAt: YESTERDAY,
  },
];

const RETURNS_KEY = 'returns';

export function useReturns(params?: { status?: string }) {
  return useQuery({
    queryKey: [RETURNS_KEY, params],
    queryFn: async () => {
      try {
        return await returnsApi.listReturns(params);
      } catch {
        if (params?.status) {
          return DEMO_RETURNS.filter((r) => r.status === params.status);
        }
        return DEMO_RETURNS;
      }
    },
    staleTime: 30_000,
    retry: 0,
  });
}

export function useCreateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReturnDto) => returnsApi.createReturn(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RETURNS_KEY] });
      toast.success('Qaytarish so\'rovi yuborildi!');
    },
    onError: () => toast.error("Xato yuz berdi"),
  });
}

export function useApproveReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: string }) => returnsApi.approveReturn(id, pin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RETURNS_KEY] });
      toast.success('Qaytarish tasdiqlandi!');
    },
    onError: () => toast.error("PIN noto'g'ri yoki xato yuz berdi"),
  });
}

export function useRejectReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => returnsApi.rejectReturn(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RETURNS_KEY] });
      toast.success('Qaytarish rad etildi');
    },
    onError: () => toast.error("Xato yuz berdi"),
  });
}
