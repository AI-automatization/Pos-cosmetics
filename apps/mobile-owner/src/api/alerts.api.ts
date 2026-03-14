import { apiClient } from './client';
import { ENDPOINTS } from '../config/endpoints';
import { PaginatedResponse } from './inventory.api';
import { NotificationType } from '../notifications/types';

export interface Alert {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly description: string;
  readonly branchId: string;
  readonly branchName: string;
  readonly entityId: string;
  readonly isRead: boolean;
  readonly priority: 'low' | 'medium' | 'high';
  readonly createdAt: string;
}

export interface AlertsParams {
  branchId?: string | null;
  type?: NotificationType;
  priority?: 'low' | 'medium' | 'high';
  status?: 'unread' | 'read' | 'all';
  page?: number;
  limit?: number;
}

export interface MarkAllReadParams {
  branchId?: string | null;
  type?: NotificationType;
}

export const alertsApi = {
  async getAlerts(params: AlertsParams): Promise<PaginatedResponse<Alert>> {
    const { data } = await apiClient.get<PaginatedResponse<Alert>>(ENDPOINTS.ALERTS, {
      params: {
        branch_id: params.branchId ?? undefined,
        type: params.type,
        priority: params.priority,
        status: params.status ?? 'all',
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return data;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`${ENDPOINTS.ALERTS}/${id}/read`);
  },

  async markAllAsRead(params: MarkAllReadParams): Promise<void> {
    await apiClient.patch(ENDPOINTS.ALERTS_READ_ALL, undefined, {
      params: {
        branch_id: params.branchId ?? undefined,
        type: params.type,
      },
    });
  },

  async getUnreadCount(branchId?: string | null): Promise<number> {
    const { data } = await apiClient.get<{ count: number }>(ENDPOINTS.ALERTS_UNREAD_COUNT, {
      params: { branch_id: branchId ?? undefined },
    });
    return data.count;
  },
};
