import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentConfigApi } from '@/api/payment-config.api';
import { useTranslation } from '@/i18n/i18n-context';
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
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ provider, payload }: { provider: PaymentProviderType; payload: UpsertProviderPayload }) =>
      paymentConfigApi.upsert(provider, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAYMENT_CONFIG_KEY] });
      toast.success(t('toast.paymentProviderSaved'));
    },
    onError: () => {
      toast.error(t('toast.paymentProviderSaveError'));
    },
  });
}

export function useDeactivateProvider() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (provider: PaymentProviderType) => paymentConfigApi.deactivate(provider),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAYMENT_CONFIG_KEY] });
      toast.success(t('toast.paymentProviderDeleted'));
    },
    onError: () => {
      toast.error(t('toast.paymentProviderDeleteError'));
    },
  });
}

export function useVerifyProvider() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (provider: PaymentProviderType) => paymentConfigApi.verify(provider),
    onSuccess: (data) => {
      if (data.success) {
        qc.invalidateQueries({ queryKey: [PAYMENT_CONFIG_KEY] });
        toast.success(t('toast.verifySuccess'));
      } else {
        toast.error(data.error || t('toast.verifyFailed'));
      }
    },
    onError: () => {
      toast.error(t('toast.verifyError'));
    },
  });
}
