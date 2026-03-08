'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { returnsApi } from '@/api/returns.api';
import type { CreateReturnDto } from '@/types/returns';

const RETURNS_KEY = 'returns';

export function useReturns(params?: { status?: string }) {
  const status = params?.status;
  return useQuery({
    queryKey: [RETURNS_KEY, status],
    queryFn: () => returnsApi.listReturns(params),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
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
