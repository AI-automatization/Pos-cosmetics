export interface SmsSendResult {
  success: boolean;
  providerMessageId?: string;
  costInTiyin?: number;
  errorMessage?: string;
}

export interface SmsBalanceResult {
  balance: number;
  currency: string;
}

export interface SmsDeliveryResult {
  providerMessageId: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  deliveredAt?: Date;
}

export interface SmsGateway {
  readonly name: string;
  send(phone: string, text: string): Promise<SmsSendResult>;
  sendBulk(messages: Array<{ phone: string; text: string }>): Promise<SmsSendResult[]>;
  getBalance(): Promise<SmsBalanceResult>;
  getDeliveryStatus(providerMessageId: string): Promise<SmsDeliveryResult>;
}

export const SMS_GATEWAY = 'SMS_GATEWAY';
