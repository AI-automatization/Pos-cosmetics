'use client';

import { useState } from 'react';
import { Keyboard, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

export function HotkeysPanel() {
  const { t } = useTranslation();
  const [showHotkeys, setShowHotkeys] = useState(false);

  const hotkeys = [
    { key: 'F1', label: t('pos.kbSearch') },
    { key: 'F4', label: t('pos.kbReturn') },
    { key: 'F5', label: t('pos.kbCash') },
    { key: 'F6', label: t('pos.kbCard') },
    { key: 'F7', label: t('pos.kbMixed') },
    { key: 'F8', label: t('pos.kbNasiya') },
    { key: 'F10', label: t('pos.kbComplete') },
    { key: 'Esc', label: t('pos.kbCancel') },
    { key: 'Ctrl+T', label: t('pos.newCart') },
  ];

  return (
    <div className="shrink-0 border-t border-gray-100">
      <button
        type="button"
        onClick={() => setShowHotkeys((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition"
      >
        <span className="flex items-center gap-1.5">
          <Keyboard className="h-3.5 w-3.5" />
          {t('pos.hotkeysTitle')}
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', showHotkeys && 'rotate-180')} />
      </button>
      {showHotkeys && (
        <div className="grid grid-cols-3 gap-1 px-3 pb-3">
          {hotkeys.map((hk) => (
            <div key={hk.key} className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5">
              <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[9px] font-bold text-gray-700 whitespace-nowrap leading-none">
                {hk.key}
              </kbd>
              <span className="text-[10px] text-gray-500 truncate leading-none">{hk.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
