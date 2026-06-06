import { useState, useEffect, useCallback } from 'react';
import { offlineQueueService, type QueueStatus } from '../services/OfflineQueueService';
import { useNetworkStatus } from './useNetworkStatus';

export function useOfflineQueue() {
  const { isOnline } = useNetworkStatus();
  const [status, setStatus] = useState<QueueStatus>({ pending: 0, items: [] });
  const [failedCount, setFailedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const s = await offlineQueueService.getStatus();
    setStatus(s);
    const failed = await offlineQueueService.getFailed();
    setFailedCount(failed.length);
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
    if (!isOnline) return;

    let cancelled = false;

    const syncOnReconnect = async () => {
      try {
        // Fetch fresh status directly (avoid stale closure on status.pending)
        const freshStatus = await offlineQueueService.getStatus();
        if (cancelled) return;

        // Only process if there are pending items and not already syncing
        if (freshStatus.pending > 0 && !isSyncing) {
          await processQueue();
        }
      } catch {
        // Silently ignore errors during auto-sync — manual refresh available
      }
    };

    void syncOnReconnect();

    return () => {
      cancelled = true;
    };
  }, [isOnline, isSyncing, processQueue]);

  // Load on mount
  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...status,
    failedCount,
    isSyncing,
    refresh,
    processQueue,
  } as const;
}
