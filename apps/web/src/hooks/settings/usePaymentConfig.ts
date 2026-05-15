import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentConfigApi } from '@/api/payment-config.api';
import type { PaymentProviderType, UpsertProviderPayload } from '@/types/payment-config';

const PAYMENT_CONFIG_KEY = 'payment-config';

export function usePaymentConfigs() {
  return useQuery({
    queryKey: [PAYMENT_CONFIG_KEY],
    queryFn: () => paymentConfigApi.getAll(),
    staleTime: 60_000,
  });
}

export function useActiveProviders() {
  return useQuery({
    queryKey: [PAYMENT_CONFIG_KEY, 'active'],
    queryFn: () => paymentConfigApi.getActive(),
    staleTime: 120_000,
  });
}

export function useUpsertProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, payload }: { provider: PaymentProviderType; payload: UpsertProviderPayload }) =>
      paymentConfigApi.upsert(provider, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAYMENT_CONFIG_KEY] });
      toast.success("To'lov provayderi saqlandi");
    },
    onError: () => {
      toast.error("Saqlashda xatolik yuz berdi");
    },
  });
}

export function useDeactivateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: PaymentProviderType) => paymentConfigApi.deactivate(provider),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAYMENT_CONFIG_KEY] });
      toast.success("Provayder o'chirildi");
    },
    onError: () => {
      toast.error("O'chirishda xatolik");
    },
  });
}

export function useVerifyProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: PaymentProviderType) => paymentConfigApi.verify(provider),
    onSuccess: (data) => {
      if (data.success) {
        qc.invalidateQueries({ queryKey: [PAYMENT_CONFIG_KEY] });
        toast.success('Muvaffaqiyatli tekshirildi!');
      } else {
        toast.error(data.error || 'Tekshiruv muvaffaqiyatsiz');
      }
    },
    onError: () => {
      toast.error('Tekshirishda xatolik');
    },
  });
}
