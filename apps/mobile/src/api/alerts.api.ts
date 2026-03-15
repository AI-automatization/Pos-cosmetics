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

// Backend notification type mapping
type BackendNotificationType =
  | 'SALE_COMPLETED'
  | 'SHIFT_CHANGED'
  | 'ERROR_ALERT'
  | 'LOW_STOCK'
  | 'EXPIRY_WARNING'
  | 'LARGE_REFUND'
  | 'NASIYA_OVERDUE'
  | 'SYSTEM';

interface NotificationRaw {
  id: string;
  type: BackendNotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

interface PaginatedNotifications {
  items: NotificationRaw[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

function mapTypeToAlert(type: BackendNotificationType): AlertType {
  const mapping: Record<BackendNotificationType, AlertType> = {
    LOW_STOCK: 'LOW_STOCK',
    LARGE_REFUND: 'LARGE_SALE',
    SALE_COMPLETED: 'LARGE_SALE',
    SHIFT_CHANGED: 'SHIFT_OPENED',
    ERROR_ALERT: 'SYSTEM_ALERT',
    EXPIRY_WARNING: 'SYSTEM_ALERT',
    NASIYA_OVERDUE: 'SYSTEM_ALERT',
    SYSTEM: 'SYSTEM_ALERT',
  };
  return mapping[type] ?? 'SYSTEM_ALERT';
}

function mapPriorityByType(type: BackendNotificationType): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (type === 'ERROR_ALERT' || type === 'LARGE_REFUND' || type === 'NASIYA_OVERDUE') return 'HIGH';
  if (type === 'LOW_STOCK' || type === 'EXPIRY_WARNING') return 'MEDIUM';
  return 'LOW';
}

function mapNotificationRaw(raw: NotificationRaw): Alert {
  return {
    id: raw.id,
    type: mapTypeToAlert(raw.type),
    title: raw.title,
    message: raw.body,
    priority: mapPriorityByType(raw.type),
    isRead: raw.isRead,
    branchId: raw.data?.branchId as string | undefined,
    branchName: raw.data?.branchName as string | undefined,
    createdAt: raw.createdAt,
    metadata: raw.data ?? undefined,
  };
}

export const alertsApi = {
  // GET /notifications?unreadOnly=true — active (unread) alerts for dashboard
  getActive: async (_branchId?: string): Promise<Alert[]> => {
    const { data } = await api.get<PaginatedNotifications>('/notifications', {
      params: { unreadOnly: true, limit: 20 },
    });
    return (data.items ?? []).map(mapNotificationRaw);
  },

  // GET /notifications — all notifications
  getAll: async (page = 1, limit = 20): Promise<Alert[]> => {
    const { data } = await api.get<PaginatedNotifications>('/notifications', {
      params: { page, limit },
    });
    return (data.items ?? []).map(mapNotificationRaw);
  },

  // PATCH /notifications/:id/read
  markAsRead: async (alertId: string): Promise<void> => {
    await api.patch(`/notifications/${alertId}/read`);
  },
};
