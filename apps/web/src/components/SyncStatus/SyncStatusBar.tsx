'use client';

import { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Clock, AlertTriangle, X } from 'lucide-react';
import { useSyncStore } from '@/store/sync.store';
import { cn } from '@/lib/utils';

/** Simulates online/offline detection + ping-based latency tracking */
function useSyncMonitor() {
  const { setState, setLatency, markSynced, setPendingCount } = useSyncStore();

  useEffect(() => {
    // Online/offline listener
    const handleOnline = () => setState('online-synced');
    const handleOffline = () => setState('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Ping-based latency check (every 10s)
    const pingCheck = async () => {
      if (!navigator.onLine) { setState('offline'); return; }
      const start = Date.now();
      try {
        await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' });
        const ms = Date.now() - start;
        setLatency(ms);
        if (ms > 5000) {
          setState('slow');
        } else {
          setState('online-synced');
          setPendingCount(0);
        }
      } catch {
        setState('offline');
      }
    };

    void pingCheck();
    const id = setInterval(() => void pingCheck(), 10_000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(id);
      void markSynced;
    };
  }, [setState, setLatency, markSynced, setPendingCount]);
}

function formatTime(date: Date | null) {
  if (!date) return '—';
  return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_CONFIG = {
  'online-synced': {
    dot: 'bg-emerald-500',
    dotPing: 'bg-emerald-400',
    text: 'Online · Synced',
    textColor: 'text-emerald-400',
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-900',
    icon: Wifi,
    iconColor: 'text-emerald-400',
    ping: true,
  },
  'online-syncing': {
    dot: 'bg-blue-500',
    dotPing: 'bg-blue-400',
    text: 'Syncing',
    textColor: 'text-blue-400',
    bg: 'bg-blue-950/60',
    border: 'border-blue-900',
    icon: RefreshCw,
    iconColor: 'text-blue-400',
    ping: false,
  },
  offline: {
    dot: 'bg-red-500',
    dotPing: 'bg-red-400',
    text: 'Offline',
    textColor: 'text-red-400',
    bg: 'bg-red-950/60',
    border: 'border-red-900',
    icon: WifiOff,
    iconColor: 'text-red-400',
    ping: false,
  },
  slow: {
    dot: 'bg-yellow-500',
    dotPing: 'bg-yellow-400',
    text: 'Sekin ulanish',
    textColor: 'text-yellow-400',
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-900',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    ping: false,
  },
} as const;

export function SyncStatusBar() {
  useSyncMonitor();

  const { state, pendingCount, pendingItems, lastSyncAt, latencyMs } = useSyncStore();
  const [showQueue, setShowQueue] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const cfg = STATUS_CONFIG[state];
  const Icon = cfg.icon;

  // Close popup on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowQueue(false);
      }
    };
    if (showQueue) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showQueue]);

  const label =
    state === 'online-syncing'
      ? `Syncing (${pendingCount} pending)`
      : state === 'offline'
      ? `Offline — ${pendingCount} unsynced`
      : cfg.text;

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setShowQueue((v) => !v)}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-80',
          cfg.bg,
          cfg.border,
        )}
      >
        {/* Animated dot */}
        <span className="relative flex h-2 w-2">
          {cfg.ping && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                cfg.dotPing,
              )}
            />
          )}
          <span className={cn('relative inline-flex h-2 w-2 rounded-full', cfg.dot)} />
        </span>

        <Icon
          className={cn(
            'h-3.5 w-3.5',
            cfg.iconColor,
            state === 'online-syncing' && 'animate-spin',
          )}
        />
        <span className={cfg.textColor}>{label}</span>

        {latencyMs > 0 && state !== 'offline' && (
          <span className="text-gray-600">· {latencyMs}ms</span>
        )}
      </button>

      {/* Dropdown panel */}
      {showQueue && (
        <div className="absolute bottom-full left-0 mb-2 w-72 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <Icon className={cn('h-4 w-4', cfg.iconColor)} />
              <span className="text-sm font-semibold text-gray-200">{cfg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowQueue(false)}
              className="text-gray-600 hover:text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {/* Last sync */}
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span>So'nggi sync: {formatTime(lastSyncAt)}</span>
            </div>

            {/* Pending queue */}
            {pendingCount > 0 ? (
              <>
                <p className="mb-2 text-xs font-medium text-gray-400">
                  Kutayotgan ({pendingCount})
                </p>
                <div className="flex flex-col gap-1.5">
                  {pendingItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-gray-800 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-xs font-mono',
                            item.type === 'order'
                              ? 'bg-blue-900/50 text-blue-400'
                              : item.type === 'payment'
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-gray-700 text-gray-400',
                          )}
                        >
                          {item.type}
                        </span>
                        <span className="text-gray-300">{item.label}</span>
                      </div>
                      <span className="text-gray-600">
                        {new Date(item.createdAt).toLocaleTimeString('uz-UZ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                  {pendingItems.length > 5 && (
                    <p className="text-center text-xs text-gray-600">
                      +{pendingItems.length - 5} ta boshqa
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-gray-800/50 px-3 py-3 text-center text-xs text-gray-500">
                {state === 'offline'
                  ? 'Internet ulanishi yo\'q — savdolar lokal saqlanmoqda'
                  : 'Barcha ma\'lumotlar serverga yuborilgan ✓'}
              </div>
            )}

            {/* Auto-retry */}
            {state !== 'online-synced' && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600">
                <RefreshCw className="h-3 w-3" />
                Har 10 soniyada qayta urinib ko'riladi
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
