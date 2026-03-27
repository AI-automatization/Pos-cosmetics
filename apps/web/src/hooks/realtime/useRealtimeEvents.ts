'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';

// Backend: apps/api/src/realtime/realtime.gateway.ts
// Namespace: /realtime
// Auth: handshake.auth.token (JWT)
const WS_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const WS_NAMESPACE = '/realtime';

// Backend RT_EVENTS konstantlari bilan mos
export const RT_EVENTS = {
  SALE_COMPLETED: 'sale:completed',
  SHIFT_CHANGED: 'shift:changed',
  SYNC_STATUS: 'sync:status',
  ERROR_NEW: 'error:new',
} as const;

export type RTEventKey = keyof typeof RT_EVENTS;
export type RTEventValue = (typeof RT_EVENTS)[RTEventKey];

// ─── Event payload tiplari ──────────────────────────────────────────────────

export interface SaleCompletedPayload {
  tenantId: string;
  orderId: string;
  total: number;
}

export interface ShiftChangedPayload {
  tenantId: string;
  shiftId: string;
  status: string;
  userId: string;
}

export interface SyncStatusPayload {
  tenantId: string;
  deviceId: string;
  status: string;
}

// ─── Hook return type ───────────────────────────────────────────────────────

export interface UseRealtimeEventsReturn {
  /** WebSocket ulanishi aktiv yoki yo'q */
  connected: boolean;
  /** Oxirgi kelgan sale:completed event */
  lastSale: SaleCompletedPayload | null;
  /** Oxirgi kelgan shift:changed event */
  lastShift: ShiftChangedPayload | null;
  /** Yangi savdo soni (reset qilguncha) */
  newSaleCount: number;
  /** Yangi savdo badgeni tozalash */
  clearNewSaleCount: () => void;
}

// ─── useRealtimeEvents hook ─────────────────────────────────────────────────

/**
 * Socket.io orqali backend real-time eventlarni tinglaydi.
 * /realtime namespace, JWT token orqali autentifikatsiya.
 */
export function useRealtimeEvents(): UseRealtimeEventsReturn {
  const [connected, setConnected] = useState(false);
  const [lastSale, setLastSale] = useState<SaleCompletedPayload | null>(null);
  const [lastShift, setLastShift] = useState<ShiftChangedPayload | null>(null);
  const [newSaleCount, setNewSaleCount] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const clearNewSaleCount = useCallback(() => {
    setNewSaleCount(0);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

    if (!token) return;

    function connect() {
      if (!mountedRef.current) return;

      const socket = io(`${WS_URL}${WS_NAMESPACE}`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: false, // Manual reconnect — token yangilanishi uchun
        timeout: 10_000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        if (!mountedRef.current) return;
        setConnected(true);
      });

      socket.on('disconnect', () => {
        if (!mountedRef.current) return;
        setConnected(false);

        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, 5_000);
      });

      socket.on('connect_error', () => {
        if (!mountedRef.current) return;
        setConnected(false);

        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, 10_000);
      });

      socket.on(RT_EVENTS.SALE_COMPLETED, (payload: SaleCompletedPayload) => {
        if (!mountedRef.current) return;
        setLastSale(payload);
        setNewSaleCount((prev) => prev + 1);
      });

      socket.on(RT_EVENTS.SHIFT_CHANGED, (payload: ShiftChangedPayload) => {
        if (!mountedRef.current) return;
        setLastShift(payload);
      });

      socket.on(RT_EVENTS.SYNC_STATUS, (payload: SyncStatusPayload) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.debug('[RT] sync:status', payload);
        }
      });
    }

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Faqat mount/unmount da ishlaydi

  return {
    connected,
    lastSale,
    lastShift,
    newSaleCount,
    clearNewSaleCount,
  };
}
