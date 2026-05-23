import { useState, useEffect, useCallback } from 'react';
import { offlineQueueService, type QueueStatus } from '../services/OfflineQueueService';
import { useNetworkStatus } from './useNetworkStatus';

export function useOfflineQueue() {
  const { isOnline } = useNetworkStatus();
  const [status, setStatus] = useState<QueueStatus>({ pending: 0, items: [] });
  const [isSyncing, setIsSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const s = await offlineQueueService.getStatus();
    setStatus(s);
  }, []);

  const processQueue = useCallback(async () => {
    setIsSyncing(true);
    try {
      await offlineQueueService.processQueue();
      await refresh();
    } finally {
      setIsSyncing(false);
    }
  }, [refresh]);

  // Auto-process when coming back online
  useEffect(() => {
    if (isOnline && status.pending > 0 && !isSyncing) {
      void processQueue();
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load on mount
  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...status,
    isSyncing,
    refresh,
    processQueue,
  } as const;
}
