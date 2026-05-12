'use client';

import { useState, useMemo } from 'react';
import { Download, Play, RotateCcw, Table2, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports.api';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

/* ─── Config ─── */

type Dimension = 'product' | 'category' | 'branch' | 'cashier' | 'date';
type Metric = 'revenue' | 'quantity' | 'orders' | 'margin';


type ExportType = 'sales' | 'order-items' | 'products' | 'inventory' | 'customers' | 'debts';

const DIMENSION_KEYS: { value: Dimension; key: string }[] = [
  { value: 'product', key: 'common.product' },
  { value: 'category', key: 'common.category' },
  { value: 'branch', key: 'common.branch' },
  { value: 'cashier', key: 'reports.cashier' },
  { value: 'date', key: 'common.date' },
];

const METRIC_KEYS: { value: Metric; key: string }[] = [
  { value: 'revenue', key: 'reports.revenue' },
  { value: 'quantity', key: 'reports.quantity' },
  { value: 'orders', key: 'reports.orders' },
  { value: 'margin', key: 'analytics.margin' },
];

const EXPORT_TYPE_KEYS: { value: ExportType; key: string }[] = [
  { value: 'sales', key: 'reports.sales' },
  { value: 'order-items', key: 'reports.orderItems' },
  { value: 'products', key: 'reports.products' },
  { value: 'inventory', key: 'reports.inventory' },
  { value: 'customers', key: 'reports.customers' },
  { value: 'debts', key: 'reports.debts' },
];


function getDefaultDates() {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

/* ─── Page ─── */

export default function ReportBuilderPage() {
  const { t, fmtPrice: tFmtPrice } = useTranslation();
  const defaults = getDefaultDates();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [selectedDimension, setSelectedDimension] = useState<Dimension>('product');
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>(['revenue', 'quantity']);
  const [executed, setExecuted] = useState(false);
  const [exporting, setExporting] = useState<ExportType | null>(null);

  const topProductsQuery = useQuery({
    queryKey: ['report-builder', 'top-products', from, to],
    queryFn: () => reportsApi.getTopProducts({ from, to, limit: 100 }),
    enabled: executed && selectedDimension === 'product',
  });

  const dailyRevenueQuery = useQuery({
    queryKey: ['report-builder', 'daily-revenue', from, to],
    queryFn: () => reportsApi.getDailyRevenue({ from, to }),
    enabled: executed && selectedDimension === 'date',
  });

  const employeeQuery = useQuery({
    queryKey: ['report-builder', 'employee', from, to],
    queryFn: () => reportsApi.getEmployeeActivity({ from, to }),
    enabled: executed && selectedDimension === 'cashier',
  });

  function toggleMetric(m: Metric) {
    setSelectedMetrics((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  }

  function handleRun() {
    setExecuted(true);
  }

  function handleReset() {
    setExecuted(false);
    const d = getDefaultDates();
    setFrom(d.from);
    setTo(d.to);
    setSelectedDimension('product');
    setSelectedMetrics(['revenue', 'quantity']);
  }

  async function handleExport(type: ExportType) {
    setExporting(type);
    try {
      await reportsApi.exportDownload(type, { from, to });
    } finally {
      setExporting(null);
    }
  }

  const isLoading = topProductsQuery.isLoading || dailyRevenueQuery.isLoading || employeeQuery.isLoading;

  // Build table rows based on selected dimension
  const tableData = useMemo(() => {
    if (!executed) return [];

    if (selectedDimension === 'product' && topProductsQuery.data) {
      return topProductsQuery.data.map((p) => ({
        label: p.productName,
        revenue: p.revenue,
        quantity: p.quantity,
        orders: p.ordersCount ?? 0,
        margin: 0,
      }));
    }

    if (selectedDimension === 'date' && dailyRevenueQuery.data) {
      return dailyRevenueQuery.data.map((d) => ({
        label: d.date,
        revenue: d.revenue,
        quantity: d.ordersCount ?? 0,
        orders: d.ordersCount ?? 0,
        margin: 0,
      }));
    }

    if (selectedDimension === 'cashier' && employeeQuery.data) {
      return (employeeQuery.data as Array<Record<string, unknown>>).map((e) => ({
        label: (e.name as string) ?? (e.cashierName as string) ?? '—',
        revenue: (e.revenue as number) ?? 0,
        quantity: (e.quantity as number) ?? 0,
        orders: (e.orders as number) ?? (e.ordersCount as number) ?? 0,
        margin: 0,
      }));
    }

    return [];
  }, [executed, selectedDimension, topProductsQuery.data, dailyRevenueQuery.data, employeeQuery.data]);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('reports.builderTitle')}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{t('reports.builderSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            {t('reports.reset')}
          </button>
          <button
            type="button"
            onClick={handleRun}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Play className="h-4 w-4" />
            {t('reports.run')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Date range */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('reports.startDate')}</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('reports.endDate')}</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Dimension */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('reports.dimension')}</label>
          <div className="flex flex-wrap gap-1">
            {DIMENSION_KEYS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => { setSelectedDimension(d.value); setExecuted(false); }}
                className={cn(
                  'rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                  selectedDimension === d.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {t(d.key)}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('reports.metrics')}</label>
          <div className="flex flex-wrap gap-1">
            {METRIC_KEYS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => toggleMetric(m.value)}
                className={cn(
                  'rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                  selectedMetrics.includes(m.value)
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {t(m.key)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {!executed ? (
        <EmptyState
          icon={BarChart3}
          title={t('reports.runReport')}
          description={t('reports.runReportDesc')}
        />
      ) : isLoading ? (
        <LoadingSkeleton variant="table" rows={8} />
      ) : tableData.length === 0 ? (
        <EmptyState
          icon={Table2}
          title={t('common.noData')}
          description={t('reports.noDataDesc')}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  {t(DIMENSION_KEYS.find((d) => d.value === selectedDimension)?.key ?? 'common.name')}
                </th>
                {selectedMetrics.includes('revenue') && (
                  <th className="px-4 py-3 text-right font-medium text-gray-600">{t('reports.revenue')}</th>
                )}
                {selectedMetrics.includes('quantity') && (
                  <th className="px-4 py-3 text-right font-medium text-gray-600">{t('reports.quantity')}</th>
                )}
                {selectedMetrics.includes('orders') && (
                  <th className="px-4 py-3 text-right font-medium text-gray-600">{t('reports.orders')}</th>
                )}
                {selectedMetrics.includes('margin') && (
                  <th className="px-4 py-3 text-right font-medium text-gray-600">{t('analytics.margin')}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableData.map((row, i) => (
                <tr key={i} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                  {selectedMetrics.includes('revenue') && (
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                      {tFmtPrice(row.revenue)}
                    </td>
                  )}
                  {selectedMetrics.includes('quantity') && (
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">{row.quantity}</td>
                  )}
                  {selectedMetrics.includes('orders') && (
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">{row.orders}</td>
                  )}
                  {selectedMetrics.includes('margin') && (
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {row.margin > 0 ? `${row.margin.toFixed(1)}%` : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50">
              <tr className="font-semibold text-gray-900">
                <td className="px-4 py-3">{t('common.total')}</td>
                {selectedMetrics.includes('revenue') && (
                  <td className="px-4 py-3 text-right tabular-nums">
                    {tFmtPrice(tableData.reduce((s, r) => s + r.revenue, 0))}
                  </td>
                )}
                {selectedMetrics.includes('quantity') && (
                  <td className="px-4 py-3 text-right tabular-nums">
                    {tableData.reduce((s, r) => s + r.quantity, 0)}
                  </td>
                )}
                {selectedMetrics.includes('orders') && (
                  <td className="px-4 py-3 text-right tabular-nums">
                    {tableData.reduce((s, r) => s + r.orders, 0)}
                  </td>
                )}
                {selectedMetrics.includes('margin') && <td className="px-4 py-3 text-right">—</td>}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Export */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">{t('reports.csvExport')}</h2>
        <div className="flex flex-wrap gap-2">
          {EXPORT_TYPE_KEYS.map((et) => (
            <button
              key={et.value}
              type="button"
              onClick={() => handleExport(et.value)}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting === et.value ? t('common.loading') : t(et.key)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
