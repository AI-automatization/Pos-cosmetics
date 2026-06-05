export type SmsCampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'COMPLETED' | 'CANCELLED';
export type SmsMessageStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'UNSUBSCRIBED';

export interface SmsCampaign {
  id: string;
  tenantId: string;
  name: string;
  content: string;
  status: SmsCampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  completedAt: string | null;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalCost: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmsMessage {
  id: string;
  tenantId: string;
  campaignId: string | null;
  phone: string;
  content: string;
  status: SmsMessageStatus;
  providerMessageId: string | null;
  costInTiyin: number;
  errorMessage: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}
