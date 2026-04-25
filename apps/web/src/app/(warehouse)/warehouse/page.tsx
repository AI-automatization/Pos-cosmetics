'use client';

import { useEffect, useRef } from 'react';
import { Package, TrendingDown, AlertTriangle, ArrowUpDown, RefreshCw, Bell, CheckCheck, FileText, PackagePlus, LayoutList, CalendarX, Truck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWarehouseDashboard, useWarehouseAlerts } from '@/hooks/warehouse/useWarehouseInvoices';
import { notificationsApi } from '@/api/notifications.api';
import { cn } from '@/lib/utils';

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch {
    // AudioContext not available (SSR / test env)
  }
}

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
  const queryClient = useQueryClient();

  const { data: restockRequests = [] } = useQuery({
    queryKey: ['restock-requests'],
    queryFn: () => notificationsApi.getRestockRequests(),
    refetchInterval: 30000,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restock-requests'] }),
  });

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restock-requests'] }),
  });

  // T-340: beep when new restock requests arrive (count increases)
  const prevCountRef = useRef(restockRequests.length);
  useEffect(() => {
    if (restockRequests.length > prevCountRef.current) {
      playBeep();
    }
    prevCountRef.current = restockRequests.length;
  }, [restockRequests.length]);

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

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: '/warehouse/invoices',  icon: FileText,    label: 'Nakladnoylar',        color: 'bg-blue-50 text-blue-600',   border: 'hover:border-blue-300' },
          { href: '/warehouse/stock-in',  icon: PackagePlus, label: 'Kirim qilish',        color: 'bg-green-50 text-green-600', border: 'hover:border-green-300' },
          { href: '/warehouse/inventory', icon: LayoutList,  label: 'Inventar',            color: 'bg-amber-50 text-amber-600', border: 'hover:border-amber-300' },
          { href: '/warehouse/low-stock', icon: TrendingDown,label: 'Kam qolgan',          color: 'bg-red-50 text-red-600',     border: 'hover:border-red-300' },
          { href: '/warehouse/expiry',    icon: CalendarX,   label: "Muddati o'tayotgan",  color: 'bg-orange-50 text-orange-600', border: 'hover:border-orange-300' },
          { href: '/warehouse/suppliers', icon: Truck,       label: 'Yetkazib beruvchilar', color: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-300' },
        ].map(({ href, icon: Icon, label, color, border }) => (
          <Link
            key={href}
            href={href}
            className={cn('flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center transition hover:shadow-sm', border)}
          >
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', color)}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-gray-700 leading-tight">{label}</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          </Link>
        ))}
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

      {/* Kassirdan zaproslar */}
      {restockRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-blue-100 bg-blue-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-blue-900">
                Kassirdan zaproslar
                <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  {restockRequests.length}
                </span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={markingAll}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Barchasini o&apos;qildi
            </button>
          </div>
          <ul className="divide-y divide-blue-50">
            {restockRequests.map((req) => (
              <li key={req.id} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{req.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{req.body}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(req.createdAt).toLocaleString('uz-UZ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => markRead(req.id)}
                  className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50"
                >
                  O&apos;qildi
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
