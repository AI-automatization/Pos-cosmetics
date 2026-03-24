'use client';

import { useState, useMemo } from 'react';
import { Download, Play, RotateCcw, Table2, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports.api';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

/* ─── Config ─── */

type Dimension = 'product' | 'category' | 'branch' | 'cashier' | 'date';
type Metric = 'revenue' | 'quantity' | 'orders' | 'margin';

interface DimensionOption {
  value: Dimension;
  label: string;
}

interface MetricOption {
  value: Metric;
  label: string;
}

const DIMENSIONS: DimensionOption[] = [
  { value: 'product', label: 'Mahsulot' },
  { value: 'category', label: 'Kategoriya' },
  { value: 'branch', label: 'Filial' },
  { value: 'cashier', label: 'Kassir' },
  { value: 'date', label: 'Sana' },
];

const METRICS: MetricOption[] = [
  { value: 'revenue', label: 'Daromad' },
  { value: 'quantity', label: 'Soni' },
  { value: 'orders', label: 'Buyurtmalar' },
  { value: 'margin', label: 'Marja' },
];

const EXPORT_TYPES = [
  { value: 'sales', label: 'Sotuvlar' },
  { value: 'order-items', label: 'Buyurtma qatorlari' },
  { value: 'products', label: 'Mahsulotlar' },
  { value: 'inventory', label: 'Inventar' },
  { value: 'customers', label: 'Mijozlar' },
  { value: 'debts', label: 'Qarzlar' },
] as const;

type ExportType = (typeof EXPORT_TYPES)[number]['value'];

function fmtPrice(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + " so'm";
}

function getDefaultDates() {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

/* ─── Page ─── */

export default function ReportBuilderPage() {
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
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Hisobot yaratish</h1>
          <p className="mt-0.5 text-sm text-gray-500">O&apos;lcham va metrikalarni tanlang</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            Tozalash
          </button>
          <button
            type="button"
            onClick={handleRun}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Play className="h-4 w-4" />
            Ishga tushirish
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Date range */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">Boshlanish</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">Tugash</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Dimension */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">O&apos;lcham</label>
          <div className="flex flex-wrap gap-1">
            {DIMENSIONS.map((d) => (
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
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">Metrikalar</label>
          <div className="flex flex-wrap gap-1">
            {METRICS.map((m) => (
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
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {!executed ? (
        <EmptyState
          icon={BarChart3}
          title="Hisobotni ishga tushiring"
          description="O'lcham va metrikalarni tanlab, 'Ishga tushirish' tugmasini bosing"
        />
      ) : isLoading ? (
        <LoadingSkeleton variant="table" rows={8} />
      ) : tableData.length === 0 ? (
        <EmptyState
          icon={Table2}
          title="Ma'lumot topilmadi"
          description="Tanlangan davr uchun natijalar yo'q. Sanalarni o'zgartiring."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  {DIMENSIONS.find((d) => d.value === selectedDimension)?.label}
                </th>
                {selectedMetrics.includes('revenue') && (
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Daromad</th>
                )}
                {selectedMetrics.includes('quantity') && (
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Soni</th>
                )}
                {selectedMetrics.includes('orders') && (
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Buyurtmalar</th>
                )}
                {selectedMetrics.includes('margin') && (
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Marja</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableData.map((row, i) => (
                <tr key={i} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                  {selectedMetrics.includes('revenue') && (
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                      {fmtPrice(row.revenue)}
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
                <td className="px-4 py-3">Jami</td>
                {selectedMetrics.includes('revenue') && (
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmtPrice(tableData.reduce((s, r) => s + r.revenue, 0))}
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
        <h2 className="mb-3 text-sm font-semibold text-gray-900">CSV eksport</h2>
        <div className="flex flex-wrap gap-2">
          {EXPORT_TYPES.map((et) => (
            <button
              key={et.value}
              type="button"
              onClick={() => handleExport(et.value)}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting === et.value ? 'Yuklanmoqda...' : et.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
