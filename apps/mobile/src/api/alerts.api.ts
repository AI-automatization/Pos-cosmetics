import { api } from './client';

export type AlertType =
  | 'LOW_STOCK'
  | 'LARGE_SALE'
  | 'RENTAL_PAYMENT_DUE'
  | 'SUSPICIOUS_ACTIVITY'
  | 'AI_INSIGHT'
  | 'SHIFT_OPENED'
  | 'SHIFT_CLOSED'
  | 'SYSTEM_ALERT';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isRead: boolean;
  branchId?: string;
  branchName?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export const alertsApi = {
  getActive: async (branchId?: string): Promise<Alert[]> => {
    const { data } = await api.get<Alert[]>('/notifications/alerts', {
      params: { branchId, status: 'active' },
    });
    return data;
  },

  getAll: async (page = 1, limit = 20): Promise<Alert[]> => {
    const { data } = await api.get<Alert[]>('/notifications/alerts', {
      params: { page, limit },
    });
    return data;
  },

  markAsRead: async (alertId: string): Promise<void> => {
    await api.patch(`/notifications/alerts/${alertId}/read`);
  },
};
