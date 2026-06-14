'use client';

import { Clock, ShoppingBag, User, ArrowLeft, LogOut, Archive, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { usePOSStore } from '@/store/pos.store';
import { useEffect, useState, useRef } from 'react';
import { SyncStatusBar } from '@/components/SyncStatus/SyncStatusBar';
import { openCashDrawer, isCashDrawerEnabled } from '@/lib/cashDrawer';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/i18n-context';
import { LOCALES, type Locale } from '@/i18n';

function useShiftClock(openedAt: Date | string | null) {
  const [elapsed, setElapsed] = useState('00:00:00');

  // Convert to a stable timestamp number to avoid infinite re-renders:
  // new Date(string) creates a new object reference every render, making
  // [openedAt] dep always "changed". Using a primitive number is stable.
  const openedAtMs = openedAt
    ? (openedAt instanceof Date ? openedAt : new Date(openedAt as string)).getTime()
    : null;

  useEffect(() => {
    if (openedAtMs === null || isNaN(openedAtMs)) return;
    const tick = () => {
      const diff = Math.floor((Date.now() - openedAtMs) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [openedAtMs]);

  return elapsed;
}

interface ShiftBarProps {
  onCloseShift: () => void;
  onOpenReturn?: () => void;
}

function POSLanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-lg border border-gray-700 px-2 py-1 text-xs font-medium text-gray-300 transition hover:border-gray-500 hover:bg-gray-800 hover:text-white"
      >
        <span>{current.flag}</span>
        <span className="uppercase">{current.value}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
          {LOCALES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => { setLocale(l.value as Locale); setOpen(false); }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm transition ${
                locale === l.value ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ShiftBar({ onCloseShift, onOpenReturn }: ShiftBarProps) {
  const { cashierName, shiftOpenedAt, salesCount, shiftId } = usePOSStore();
  const elapsed = useShiftClock(shiftOpenedAt);
  const { t } = useTranslation();

  return (
    <div className="flex h-11 shrink-0 items-center justify-between bg-gray-900 px-2 sm:px-4 text-xs sm:text-sm text-gray-300">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Link
          href="/catalog/products"
          className="flex shrink-0 items-center gap-1.5 text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">{t('pos.adminBack')}</span>
        </Link>

        <div className="hidden sm:block h-4 w-px bg-gray-700" />

        <div className="flex items-center gap-1.5 min-w-0">
          <User className="h-4 w-4 shrink-0 text-gray-500" />
          <span className="font-medium text-white truncate max-w-[80px] sm:max-w-[140px]">{cashierName}</span>
        </div>

        {shiftId && (
          <>
            <div className="hidden sm:block h-4 w-px bg-gray-700" />
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0 text-gray-500" />
              <span className="font-mono text-xs">{elapsed}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Sync status */}
        <SyncStatusBar />

        <div className="hidden md:block">
          <POSLanguageSwitcher />
        </div>

        <div className="hidden sm:block h-4 w-px bg-gray-700" />

        <div className="flex items-center gap-1.5">
          <ShoppingBag className="h-4 w-4 shrink-0 text-gray-500" />
          <span className="hidden sm:inline">
            {t('pos.todaySales')}:{' '}
          </span>
          <span className="font-semibold text-white">{salesCount}</span>
        </div>

        {!shiftId && (
          <span className="hidden sm:inline rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
            {t('pos.shiftNotOpen')}
          </span>
        )}

        {shiftId && onOpenReturn && (
          <button
            type="button"
            onClick={onOpenReturn}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-orange-800 px-2 sm:px-3 py-1 text-xs font-medium text-orange-400 transition hover:border-orange-600 hover:bg-orange-900/30 hover:text-orange-300"
            title={`${t('pos.return')} (F4)`}
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{t('pos.return')}</span>
            <kbd className="hidden md:inline rounded bg-gray-700 px-1 py-0.5 font-mono text-[10px] text-gray-400">F4</kbd>
          </button>
        )}

        {shiftId && isCashDrawerEnabled() && (
          <button
            type="button"
            onClick={async () => {
              const sent = await openCashDrawer();
              if (sent) {
                toast.success(t('pos.cashDrawerOpened'));
              } else {
                toast.warning(t('pos.cashDrawerFailed') || 'Kassa qutisiga ulanib bo\'lmadi');
              }
            }}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-gray-700 px-2 sm:px-3 py-1 text-xs font-medium text-gray-400 transition hover:border-gray-500 hover:bg-gray-800 hover:text-gray-200"
            title={t('pos.cashDrawer')}
          >
            <Archive className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t('pos.cashDrawer')}</span>
          </button>
        )}

        {shiftId && (
          <button
            type="button"
            onClick={onCloseShift}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-red-800 px-2 sm:px-3 py-1 text-xs font-medium text-red-400 transition hover:border-red-600 hover:bg-red-900/30 hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{t('pos.closeShift')}</span>
          </button>
        )}

      </div>
    </div>
  );
}
