'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { ReturnsHistoryTab } from './_components/ReturnsHistoryTab';
import { OrdersTab } from './_components/OrdersTab';

type MainTab = 'orders' | 'history';

export default function ReturnsPage() {
  const { t } = useTranslation();
  const [mainTab, setMainTab] = useState<MainTab>('history');

  const MAIN_TABS: { key: MainTab; label: string }[] = [
    { key: 'history', label: t('returns.history') },
    { key: 'orders', label: t('nav.orders') },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{t('nav.returns')}</h1>
        <p className="mt-0.5 text-sm text-gray-500">{t('returns.subtitle')}</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMainTab(tab.key)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition',
              mainTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mainTab === 'history' && <ReturnsHistoryTab />}
      {mainTab === 'orders' && <OrdersTab />}
    </div>
  );
}
