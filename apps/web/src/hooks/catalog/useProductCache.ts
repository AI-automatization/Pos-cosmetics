'use client';

import { useEffect, useState, useCallback } from 'react';
import { saveProducts, getCachedProducts, getLastSyncTime, isCacheFresh } from '@/lib/productCache';
import { catalogApi } from '@/api/catalog.api';
import type { Product } from '@/types/catalog';

interface CacheState {
  products: Product[];
  lastSync: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  isFresh: boolean;
}

/**
 * T-065: Product catalog cache hook
 * - Online: fetches from API → saves to IndexedDB → returns fresh data
 * - Offline: returns cached data from IndexedDB
 * - Background refresh: when online and cache is stale (> 60 min)
 */
export function useProductCache() {
  const [state, setState] = useState<CacheState>({
    products: [],
    lastSync: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    isFresh: false,
  });

  const sync = useCallback(async (force = false) => {
    if (!navigator.onLine) return;

    const fresh = await isCacheFresh(60);
    if (fresh && !force) return;

    setState((s) => ({ ...s, isSyncing: true }));
    try {
      const lastSync = await getLastSyncTime();
      // Incremental sync: fetch only products updated after lastSync
      const params = lastSync
        ? { updatedAfter: lastSync, limit: 500 }
        : { limit: 500 };

      const response = await catalogApi.getProducts(params as Parameters<typeof catalogApi.getProducts>[0]);
      const fresh = response.items;

      if (fresh.length > 0) {
        await saveProducts(fresh);
      }

      const cached = await getCachedProducts();
      const syncTime = await getLastSyncTime();
      setState((s) => ({
        ...s,
        products: cached,
        lastSync: syncTime,
        isSyncing: false,
        isFresh: true,
      }));
    } catch {
      // API failed — use cached data
      const cached = await getCachedProducts();
      const syncTime = await getLastSyncTime();
      setState((s) => ({
        ...s,
        products: cached,
        lastSync: syncTime,
        isSyncing: false,
        isFresh: false,
      }));
    }
  }, []);

  // Load cache on mount
  useEffect(() => {
    (async () => {
      const cached = await getCachedProducts();
      const syncTime = await getLastSyncTime();
      const fresh = await isCacheFresh(60);
      setState((s) => ({ ...s, products: cached, lastSync: syncTime, isFresh: fresh }));

      // Background sync
      sync();
    })();
  }, []); // intentional: run once on mount

  // Online/offline detection
  useEffect(() => {
    const onOnline = () => {
      setState((s) => ({ ...s, isOnline: true }));
      sync(); // Re-sync when back online
    };
    const onOffline = () => setState((s) => ({ ...s, isOnline: false }));

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [sync]);

  return {
    ...state,
    forceSync: () => sync(true),
  };
}
