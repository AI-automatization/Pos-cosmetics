'use client';

import { Package, TrendingDown, AlertTriangle, ArrowUpDown, RefreshCw } from 'lucide-react';
import { useWarehouseDashboard, useWarehouseAlerts } from '@/hooks/warehouse/useWarehouseInvoices';
import { cn } from '@/lib/utils';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className={cn('p-3 rounded-lg', color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  IN:           { label: 'Kirim',             color: 'text-green-600 bg-green-50' },
  OUT:          { label: 'Chiqim',            color: 'text-red-600 bg-red-50' },
  WRITE_OFF:    { label: 'Spisanie',          color: 'text-orange-600 bg-orange-50' },
  TRANSFER_IN:  { label: 'Transfer (kirim)',  color: 'text-blue-600 bg-blue-50' },
  TRANSFER_OUT: { label: 'Transfer (chiqim)', color: 'text-purple-600 bg-purple-50' },
  ADJUSTMENT:   { label: 'Tuzatish',          color: 'text-gray-600 bg-gray-100' },
};

export default function WarehouseDashboardPage() {
  const { data, isLoading, refetch } = useWarehouseDashboard();
  const { data: alerts } = useWarehouseAlerts();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ombor dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Zaxira holati va bugungi harakatlar</p>
        </div>
        <button
          onClick={() => void refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Yangilash
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Package}       label="Jami mahsulotlar"     value={stats?.totalProducts ?? 0} color="bg-amber-500" />
        <StatCard icon={TrendingDown}  label="Kam zaxira"            value={stats?.lowStockCount ?? 0} color="bg-red-500" />
        <StatCard icon={AlertTriangle} label="Muddati yaqin"         value={stats?.expiryCount ?? 0}  color="bg-orange-500" />
        <StatCard icon={ArrowUpDown}   label="Bugungi harakatlar"    value={(stats?.todayMovementsIn ?? 0) + (stats?.todayMovementsOut ?? 0)} color="bg-blue-500" />
      </div>

      {/* Alert banner */}
      {(alerts?.expired ?? 0) > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span><strong>{alerts!.expired}</strong> ta mahsulotning muddati o'tib ketgan!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-gray-900">Kam zaxira mahsulotlar</h2>
          </div>
          {(data?.lowStockItems.length ?? 0) === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">Hamma yaxshi ✓</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data!.lowStockItems.map((item) => (
                <li key={item.productId} className="px-4 py-2.5 flex items-center justify-between text-sm">
                  <span className="text-gray-800 truncate">{item.name}</span>
                  <span className={cn('font-semibold ml-2 shrink-0', item.totalQty <= 0 ? 'text-red-600' : 'text-orange-500')}>
                    {item.totalQty <= 0 ? 'Tugagan' : `${item.totalQty} dona`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent movements */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-900">Bugungi harakatlar</h2>
          </div>
          {(data?.recentMovements.length ?? 0) === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">Bugun harakatlar yo'q</p>
          ) : (
            <ul className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {data!.recentMovements.map((m) => {
                const meta = TYPE_LABELS[m.type] ?? { label: m.type, color: 'text-gray-600 bg-gray-100' };
                return (
                  <li key={m.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium shrink-0', meta.color)}>
                        {meta.label}
                      </span>
                      <span className="text-gray-700 truncate">{m.product?.name ?? '—'}</span>
                    </div>
                    <span className="font-medium text-gray-900 ml-2 shrink-0">{Number(m.quantity)} dona</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Expiring products */}
      {(data?.expiryItems.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-orange-100 flex items-center gap-2 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-semibold text-orange-800">30 kun ichida muddati o'tuvchi mahsulotlar</h2>
          </div>
          <ul className="divide-y divide-orange-50">
            {data!.expiryItems.map((item) => (
              <li key={item.productId} className="px-4 py-2.5 flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.product?.name ?? item.productId}</span>
                <span className="text-orange-600 font-medium">
                  {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('uz-UZ') : '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
