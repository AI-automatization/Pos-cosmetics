import { apiClient } from './client';
import type { SmsCampaign, SmsMessage } from '@/types/sms';

export const smsApi = {
  // Campaigns
  listCampaigns() {
    return apiClient.get<SmsCampaign[]>('/sms/campaigns').then((r) => r.data);
  },

  getCampaign(id: string) {
    return apiClient.get<SmsCampaign>(`/sms/campaigns/${id}`).then((r) => r.data);
  },

  getCampaignMessages(id: string) {
    return apiClient.get<SmsMessage[]>(`/sms/campaigns/${id}/messages`).then((r) => r.data);
  },

  createCampaign(data: { name: string; content: string; phones: string[] }) {
    return apiClient.post<SmsCampaign>('/sms/campaigns', data).then((r) => r.data);
  },

  scheduleCampaign(id: string, scheduledAt: string) {
    return apiClient.patch<SmsCampaign>(`/sms/campaigns/${id}/schedule`, { scheduledAt }).then((r) => r.data);
  },

  sendCampaign(id: string) {
    return apiClient.post<SmsCampaign>(`/sms/campaigns/${id}/send`).then((r) => r.data);
  },

  cancelCampaign(id: string) {
    return apiClient.delete<SmsCampaign>(`/sms/campaigns/${id}`).then((r) => r.data);
  },

  // Single SMS
  sendSingle(phone: string, text: string) {
    return apiClient.post<{ success: boolean; messageId?: string }>('/sms/send', { phone, text }).then((r) => r.data);
  },

  // Balance
  getBalance() {
    return apiClient.get<{ balance: number; currency: string }>('/sms/balance').then((r) => r.data);
  },
};
