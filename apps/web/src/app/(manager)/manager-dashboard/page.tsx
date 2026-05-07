'use client';

import { BriefcaseBusiness } from 'lucide-react';
import { useTranslation } from '@/i18n/i18n-context';

export default function ManagerDashboardPage() {
  const { t } = useTranslation();

  const cards = [
    { labelKey: 'manager.todaySales', value: '—', descKey: 'common.noDataYet' },
    { labelKey: 'manager.lowStock', value: '—', descKey: 'common.noDataYet' },
    { labelKey: 'manager.openDebts', value: '—', descKey: 'common.noDataYet' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <BriefcaseBusiness className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('manager.dashboard')}</h1>
          <p className="text-sm text-gray-500">{t('manager.welcome')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.labelKey} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{t(card.labelKey)}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-xs text-gray-400">{t(card.descKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
