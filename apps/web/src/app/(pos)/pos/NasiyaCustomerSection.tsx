'use client';

import { UserCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { Customer } from '@/types/customer';

interface NasiyaCustomerSectionProps {
  selectedCustomer: Customer | null;
  total: number;
  onSelectCustomer: () => void;
}

export function NasiyaCustomerSection({ selectedCustomer, total, onSelectCustomer }: NasiyaCustomerSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="shrink-0 border-b border-gray-100 p-3">
      {selectedCustomer ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedCustomer.name}</p>
                <p className="text-xs text-gray-500">+{selectedCustomer.phone}</p>
              </div>
            </div>
            <button type="button" onClick={onSelectCustomer} className="text-xs text-blue-600 hover:underline">
              {t('pos.changeCustomer')}
            </button>
          </div>
          <div className="flex gap-2 text-xs">
            <div className="flex-1 rounded-lg bg-white/80 px-2 py-1.5">
              <p className="text-gray-500">{t('pos.currentDebt')}</p>
              <p className={cn('font-bold', selectedCustomer.debtBalance > 0 ? 'text-red-600' : 'text-green-600')}>
                {formatPrice(selectedCustomer.debtBalance)}
              </p>
            </div>
            <div className="flex-1 rounded-lg bg-white/80 px-2 py-1.5">
              <p className="text-gray-500">{t('pos.newDebt')}</p>
              <p className="font-bold text-orange-700">{formatPrice(total)}</p>
            </div>
          </div>
          {selectedCustomer.hasOverdue && (
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-yellow-100 px-2 py-1.5 text-xs text-yellow-700">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{t('pos.overdueDebt')}: {formatPrice(selectedCustomer.overdueAmount)}</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelectCustomer}
          className="flex w-full items-center justify-between rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 px-4 py-3 transition hover:border-orange-400 hover:bg-orange-100"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
            <UserCircle className="h-5 w-5" />
            {t('pos.selectCustomer')}
          </div>
          <ChevronRight className="h-4 w-4 text-orange-400" />
        </button>
      )}
    </div>
  );
}
