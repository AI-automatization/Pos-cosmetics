'use client';

import { useState } from 'react';
import { Download, FileText, Package, Users, BarChart2, Wallet } from 'lucide-react';
import { reportsApi } from '@/api/reports.api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

type ExportType = 'sales' | 'order-items' | 'products' | 'inventory' | 'customers' | 'debts';

interface ExportItem {
  key: ExportType;
  labelKey: string;
  descKey: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

const EXPORT_ITEMS: ExportItem[] = [
  {
    key: 'sales',
    labelKey: 'reports.sales',
    descKey: 'reports.salesDesc',
    icon: BarChart2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    key: 'order-items',
    labelKey: 'reports.orderItems',
    descKey: 'reports.orderItemsDesc',
    icon: FileText,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    key: 'products',
    labelKey: 'reports.products',
    descKey: 'reports.productsDesc',
    icon: Package,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    key: 'inventory',
    labelKey: 'reports.inventory',
    descKey: 'reports.inventoryDesc',
    icon: Package,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    key: 'customers',
    labelKey: 'reports.customers',
    descKey: 'reports.customersDesc',
    icon: Users,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
  {
    key: 'debts',
    labelKey: 'reports.debts',
    descKey: 'reports.debtsDesc',
    icon: Wallet,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
];

export default function ExportPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<ExportType | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleExport = async (key: ExportType) => {
    setLoading(key);
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    try {
      await reportsApi.exportDownload(key, params);
      toast.success(t('reports.exportSuccess', { type: key }));
    } catch {
      toast.error(t('reports.exportError'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{t('reports.exportTitle')}</h1>
        <p className="mt-0.5 text-sm text-gray-500">{t('reports.exportSubtitle')}</p>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{t('reports.startDate')}</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{t('reports.endDate')}</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <p className="pb-2 text-xs text-gray-400">{t('reports.allDataHint')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORT_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <div className={cn('rounded-xl p-3', item.bg)}>
                <item.icon className={cn('h-5 w-5', item.color)} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t(item.labelKey)}</p>
                <p className="text-xs text-gray-500">{t(item.descKey)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleExport(item.key)}
              disabled={loading === item.key}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition',
                'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60',
              )}
            >
              <Download className="h-4 w-4" />
              {loading === item.key ? t('common.loading') : t('reports.csvDownload')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
