import { apiClient } from './client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  meta?: Record<string, unknown> | null;
}

export const notificationsApi = {
  getUnreadCount() {
    return apiClient
      .get<{ count: number }>('/notifications/unread-count')
      .then((r) => r.data.count ?? 0)
      .catch(() => 0);
  },
  getAll() {
    return apiClient
      .get<Notification[] | { items: Notification[] }>('/notifications')
      .then((r) => (Array.isArray(r.data) ? r.data : (r.data as { items: Notification[] }).items ?? []));
  },
  markRead(id: string) {
    return apiClient.patch<void>(`/notifications/${id}/read`).then((r) => r.data);
  },
  markAllRead() {
    return apiClient.patch<void>('/notifications/read-all').then((r) => r.data);
  },
  getRestockRequests() {
    return apiClient
      .get<Notification[] | { items: Notification[] }>('/notifications', {
        params: { unreadOnly: 'true', limit: 50 },
      })
      .then((r) => {
        const items = Array.isArray(r.data) ? r.data : (r.data as { items: Notification[] }).items ?? [];
        return items.filter((n) => n.type === 'LOW_STOCK');
      });
  },
};
