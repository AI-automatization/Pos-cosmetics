'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { smsApi } from '@/api/sms.api';
import { extractErrorMessage } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

const KEY = 'sms-campaigns';

export function useCampaigns() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => smsApi.listCampaigns(),
    staleTime: 30_000,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => smsApi.getCampaign(id),
    enabled: !!id,
  });
}

export function useCampaignMessages(id: string) {
  return useQuery({
    queryKey: [KEY, id, 'messages'],
    queryFn: () => smsApi.getCampaignMessages(id),
    enabled: !!id,
    refetchInterval: 5000,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (data: { name: string; content: string; phones: string[] }) =>
      smsApi.createCampaign(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success(t('campaigns.created'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useSendCampaign() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => smsApi.sendCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success(t('campaigns.sending'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useScheduleCampaign() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      smsApi.scheduleCampaign(id, scheduledAt),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success(t('campaigns.scheduled'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}

export function useCancelCampaign() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => smsApi.cancelCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success(t('campaigns.cancelled'));
    },
    onError: (err: unknown) => toast.error(extractErrorMessage(err)),
  });
}
