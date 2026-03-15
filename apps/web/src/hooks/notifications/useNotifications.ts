'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications.api';

const KEY = 'notifications';

export function useUnreadCount() {
  return useQuery({
    queryKey: [KEY, 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: false,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: [KEY, 'all'],
    queryFn: () => notificationsApi.getAll(),
    staleTime: 30_000,
    enabled: false, // only fetch when dropdown opens
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); },
  });
}
