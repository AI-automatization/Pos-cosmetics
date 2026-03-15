'use client';

import { Clock, ShoppingBag, User, ArrowLeft, LogOut, Archive } from 'lucide-react';
import Link from 'next/link';
import { usePOSStore } from '@/store/pos.store';
import { useEffect, useState } from 'react';
import { SyncStatusBar } from '@/components/SyncStatus/SyncStatusBar';
import { openCashDrawer, isCashDrawerEnabled } from '@/lib/cashDrawer';
import { toast } from 'sonner';

function useShiftClock(openedAt: Date | string | null) {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!openedAt) return;
    const openedDate = openedAt instanceof Date ? openedAt : new Date(openedAt);
    if (isNaN(openedDate.getTime())) return;
    const tick = () => {
      const diff = Math.floor((Date.now() - openedDate.getTime()) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [openedAt]);

  return elapsed;
}

interface ShiftBarProps {
  onCloseShift: () => void;
}

export function ShiftBar({ onCloseShift }: ShiftBarProps) {
  const { cashierName, shiftOpenedAt, salesCount, shiftId } = usePOSStore();
  // Zustand persist deserializes Date → string; convert back to Date
  const shiftOpenedAtDate = shiftOpenedAt
    ? shiftOpenedAt instanceof Date
      ? shiftOpenedAt
      : new Date(shiftOpenedAt as unknown as string)
    : null;
  const elapsed = useShiftClock(shiftOpenedAtDate);

  return (
    <div className="flex h-11 shrink-0 items-center justify-between bg-gray-900 px-4 text-sm text-gray-300">
      <div className="flex items-center gap-4">
        <Link
          href="/catalog/products"
          className="flex items-center gap-1.5 text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs">Admin</span>
        </Link>

        <div className="h-4 w-px bg-gray-700" />

        <div className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-white">{cashierName}</span>
        </div>

        {shiftId && (
          <>
            <div className="h-4 w-px bg-gray-700" />
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-mono text-xs">{elapsed}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Sync status */}
        <SyncStatusBar />

        <div className="h-4 w-px bg-gray-700" />

        <div className="flex items-center gap-1.5">
          <ShoppingBag className="h-4 w-4 text-gray-500" />
          <span>
            Bugungi sotuv:{' '}
            <span className="font-semibold text-white">{salesCount}</span>
          </span>
        </div>

        {!shiftId && (
          <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
            Smena ochilmagan
          </span>
        )}

        {shiftId && isCashDrawerEnabled() && (
          <button
            type="button"
            onClick={async () => {
              await openCashDrawer();
              toast.success('Kassa qutisi ochildi');
            }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1 text-xs font-medium text-gray-400 transition hover:border-gray-500 hover:bg-gray-800 hover:text-gray-200"
            title="Kassani ochish"
          >
            <Archive className="h-3.5 w-3.5" />
            Kassa
          </button>
        )}

        {shiftId && (
          <button
            type="button"
            onClick={onCloseShift}
            className="flex items-center gap-1.5 rounded-lg border border-red-800 px-3 py-1 text-xs font-medium text-red-400 transition hover:border-red-600 hover:bg-red-900/30 hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Smenani yopish
          </button>
        )}
      </div>
    </div>
  );
}
