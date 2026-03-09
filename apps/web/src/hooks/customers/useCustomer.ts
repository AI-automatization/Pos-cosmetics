'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { customerApi } from '@/api/customer.api';
import { extractErrorMessage } from '@/lib/utils';
import type { CreateCustomerDto, Customer } from '@/types/customer';

/** Phone bo'yicha xaridorni qidiradi. phone >= 9 belgidan keyin ishlaydi */
export function useSearchCustomer(phone: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const enabled = cleanPhone.length >= 9;

  return useQuery({
    queryKey: ['customer', 'phone', cleanPhone],
    queryFn: () => customerApi.searchByPhone(cleanPhone),
    enabled,
    staleTime: 30_000,
    retry: false,
  });
}

/** Yangi xaridor yaratish */
export function useCreateCustomer(onSuccess: (customer: Customer) => void) {
  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => customerApi.create(dto),
    onSuccess: (customer) => {
      toast.success(`${customer.name} xaridor sifatida qo'shildi`);
      onSuccess(customer);
    },
    onError: (err: unknown) => {
      toast.error(extractErrorMessage(err));
    },
  });
}
