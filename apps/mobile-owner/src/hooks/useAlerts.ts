import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { alertsApi } from '../api/alerts.api';
import { useBranchStore } from '../store/branch.store';
import { useAlertsStore } from '../store/alerts.store';
import { QUERY_KEYS } from '../config/queryKeys';
import { ALERTS_REFETCH_INTERVAL } from '../config/constants';

export type AlertStatusFilter = 'all' | 'unread' | 'read';
export type AlertPriorityFilter = 'all' | 'high' | 'medium' | 'low';

export function useAlerts(
  statusFilter: AlertStatusFilter = 'all',
  priorityFilter: AlertPriorityFilter = 'all',
) {
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const setUnreadCount = useAlertsStore((s) => s.setUnreadCount);
  const queryClient = useQueryClient();

  const alerts = useQuery({
    queryKey: QUERY_KEYS.alerts.list(selectedBranchId),
    queryFn: () =>
      alertsApi.getAlerts({
        branchId: selectedBranchId,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      }),
  });

  const unreadCount = useQuery({
    queryKey: QUERY_KEYS.alerts.unreadCount(selectedBranchId),
    queryFn: () => alertsApi.getUnreadCount(selectedBranchId),
    refetchInterval: ALERTS_REFETCH_INTERVAL,
  });

  useEffect(() => {
    if (unreadCount.data !== undefined) {
      setUnreadCount(unreadCount.data);
    }
  }, [unreadCount.data, setUnreadCount]);

  const markAsRead = useMutation({
    mutationFn: (id: string) => alertsApi.markAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts.list(selectedBranchId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts.unreadCount(selectedBranchId) });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => alertsApi.markAllAsRead({ branchId: selectedBranchId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts.list(selectedBranchId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts.unreadCount(selectedBranchId) });
    },
  });

  return { alerts, unreadCount, markAsRead, markAllAsRead };
}
