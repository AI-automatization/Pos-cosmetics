import { apiClient } from './client';
import type {
  ProviderConfigSummary,
  ActiveProviderInfo,
  UpsertProviderPayload,
  VerifyResult,
  PaymentProviderType,
} from '@/types/payment-config';

export const paymentConfigApi = {
  getAll(): Promise<ProviderConfigSummary[]> {
    return apiClient.get<ProviderConfigSummary[]>('/payment-config').then((r) => r.data);
  },

  getActive(): Promise<ActiveProviderInfo[]> {
    return apiClient.get<ActiveProviderInfo[]>('/payment-config/active').then((r) => r.data);
  },

  upsert(provider: PaymentProviderType, payload: UpsertProviderPayload): Promise<ProviderConfigSummary> {
    return apiClient.post<ProviderConfigSummary>(`/payment-config/${provider}`, payload).then((r) => r.data);
  },

  deactivate(provider: PaymentProviderType): Promise<void> {
    return apiClient.delete(`/payment-config/${provider}`).then(() => undefined);
  },

  verify(provider: PaymentProviderType): Promise<VerifyResult> {
    return apiClient.post<VerifyResult>(`/payment-config/${provider}/verify`).then((r) => r.data);
  },
};
