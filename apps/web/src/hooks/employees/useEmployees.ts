'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';
import type { User } from '@/types/user';

// GET /employees — barcha xodimlar yoki filial bo'yicha filter
export function useAllEmployees(branchId?: string) {
  return useQuery({
    queryKey: ['employees', 'all', branchId ?? null],
    queryFn: () =>
      apiClient
        .get<User[] | { data: User[] }>('/employees', {
          params: branchId ? { branch_id: branchId } : {},
        })
        .then((r) => (Array.isArray(r.data) ? r.data : (r.data as { data: User[] }).data ?? [])),
    staleTime: 30_000,
  });
}

// PATCH /employees/:id/transfer — xodimni boshqa filialga ko'chirish
export function useTransferEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, branchId }: { employeeId: string; branchId: string }) =>
      apiClient
        .patch<User>(`/employees/${employeeId}/transfer`, { branchId })
        .then((r) => r.data),
    onSuccess: () => {
      toast.success("Xodim muvaffaqiyatli ko'chirildi");
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: () => toast.error("Xodimni ko'chirishda xatolik"),
  });
}
