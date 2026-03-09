import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nasiyaApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import type { RecordPaymentDto, Debtor, DebtPayment } from '@/api/nasiya.api';

export function useDebtors(branchId?: string) {
  return useQuery({
    queryKey: ['nasiya', 'debtors', branchId],
    queryFn: safeQueryFn<Debtor[]>(() => nasiyaApi.getDebtors(branchId), []),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useDebtorDetail(id: string) {
  return useQuery({
    queryKey: ['nasiya', 'debtor', id],
    queryFn: safeQueryFn<(Debtor & { payments: DebtPayment[] }) | null>(
      () => nasiyaApi.getDebtorById(id),
      null,
    ),
    staleTime: 30_000,
    enabled: id.length > 0,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RecordPaymentDto) => nasiyaApi.recordPayment(dto),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['nasiya', 'debtor', variables.debtorId] });
      void queryClient.invalidateQueries({ queryKey: ['nasiya', 'debtors'] });
    },
  });
}

export function useSendReminder() {
  return useMutation({
    mutationFn: (debtorId: string) => nasiyaApi.sendReminder(debtorId),
  });
}
