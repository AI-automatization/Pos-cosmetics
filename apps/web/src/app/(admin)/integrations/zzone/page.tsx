'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plug,
  RefreshCw,
  Package,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  LogOut,
  Send,
  Eye,
} from 'lucide-react';
import { zzoneApi, type ZzoneOrder, type ZzoneProduct } from '@/api/zzone.api';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useTranslation } from '@/i18n/i18n-context';
import { toast } from 'sonner';

export default function ZZoneIntegrationPage() {
  const { t, fmtPrice } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'status' | 'products' | 'orders'>('status');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // ─── Queries ──────────────────────────────────────────────────────
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['zzone', 'status'],
    queryFn: () => zzoneApi.getStatus(),
    staleTime: 30_000,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['zzone', 'products'],
    queryFn: () => zzoneApi.getProducts(),
    enabled: status?.connected === true && tab === 'products',
    staleTime: 30_000,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['zzone', 'orders'],
    queryFn: () => zzoneApi.getOrders(),
    enabled: status?.connected === true && tab === 'orders',
    staleTime: 15_000,
  });

  // ─── Mutations ────────────────────────────────────────────────────
  const connectMut = useMutation({
    mutationFn: () => zzoneApi.connect(phone, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['zzone'] });
      toast.success(t('zzone.connectSuccess'));
      setPhone('');
      setPassword('');
    },
    onError: () => toast.error(t('zzone.connectError')),
  });

  const disconnectMut = useMutation({
    mutationFn: () => zzoneApi.disconnect(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['zzone'] });
      toast.success(t('zzone.disconnectSuccess'));
    },
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      zzoneApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['zzone', 'orders'] });
      toast.success(t('zzone.statusUpdated'));
    },
    onError: () => toast.error(t('common.error')),
  });

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Plug className="h-5 w-5 text-purple-600" />
            {t('zzone.title')}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{t('zzone.description')}</p>
        </div>
      </div>

      {/* Status Card */}
      {statusLoading ? (
        <LoadingSkeleton variant="card" rows={1} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              {/* Connection status */}
              <div className="flex items-center gap-2">
                {status?.connected ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${status?.connected ? 'text-green-700' : 'text-gray-500'}`}>
                  {status?.connected ? t('zzone.connected') : t('zzone.disconnected')}
                </span>
              </div>

              {/* ZZone health */}
              <div className="flex items-center gap-1.5">
                {status?.zzoneHealthy ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500">
                  {status?.zzoneHealthy ? t('zzone.zzoneHealthy') : t('zzone.zzoneDown')}
                </span>
              </div>
            </div>

            {/* Store info */}
            {status?.connected && status.storeName && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{status.storeName}</span>
              </div>
            )}

            {/* Disconnect button */}
            {status?.connected && (
              <button
                onClick={() => disconnectMut.mutate()}
                disabled={disconnectMut.isPending}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t('zzone.disconnect')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Connect Form (if disconnected) */}
      {!statusLoading && !status?.connected && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">{t('zzone.connect')}</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('zzone.phonePlaceholder')}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('zzone.password')}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
            <button
              onClick={() => connectMut.mutate()}
              disabled={!phone || !password || connectMut.isPending}
              className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-60"
            >
              {connectMut.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plug className="h-4 w-4" />
              )}
              {connectMut.isPending ? t('zzone.connecting') : t('zzone.connect')}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">{t('zzone.syncInfo')}</p>
        </div>
      )}

      {/* Tabs (if connected) */}
      {status?.connected && (
        <>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {(['status', 'products', 'orders'] as const).map((t_) => (
              <button
                key={t_}
                onClick={() => setTab(t_)}
                className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition ${
                  tab === t_
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t_ === 'status' && <Eye className="h-4 w-4" />}
                {t_ === 'products' && <Package className="h-4 w-4" />}
                {t_ === 'orders' && <ShoppingCart className="h-4 w-4" />}
                {t_ === 'status' && t('zzone.status')}
                {t_ === 'products' && t('zzone.products')}
                {t_ === 'orders' && t('zzone.orders')}
              </button>
            ))}
          </div>

          {/* Products Tab */}
          {tab === 'products' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              {productsLoading ? (
                <div className="p-5">
                  <LoadingSkeleton variant="table" rows={4} />
                </div>
              ) : productsData?.products?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500">
                      <tr>
                        <th className="px-4 py-3">{t('common.name')}</th>
                        <th className="px-4 py-3">{t('zzone.category')}</th>
                        <th className="px-4 py-3">{t('zzone.price')}</th>
                        <th className="px-4 py-3">{t('zzone.stock')}</th>
                        <th className="px-4 py-3">{t('common.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {productsData.products.map((p: ZzoneProduct) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                          <td className="px-4 py-3 text-gray-600">{p.category}</td>
                          <td className="px-4 py-3 text-gray-600">{fmtPrice(p.price)}</td>
                          <td className="px-4 py-3">
                            <span className={`font-medium ${p.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-gray-500">{t('zzone.noProducts')}</div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div className="space-y-3">
              {ordersLoading ? (
                <LoadingSkeleton variant="card" rows={3} />
              ) : ordersData?.orders?.length ? (
                ordersData.orders.map((order: ZzoneOrder) => (
                  <div key={order._id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{order.orderNumber}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {t('zzone.clientName')}: {order.client?.name ?? '—'}
                        </div>
                        <div className="mt-0.5 text-sm text-gray-500">
                          {t('zzone.deliveryAddress')}: {order.deliveryAddress?.address ?? '—'}
                        </div>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {fmtPrice(order.totalPrice)} × {order.quantity}
                        </div>
                      </div>

                      {/* Actions */}
                      {order.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatusMut.mutate({ orderId: order._id, status: 'CONFIRMED' })}
                            disabled={updateStatusMut.isPending}
                            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {t('zzone.confirmOrder')}
                          </button>
                          <button
                            onClick={() => updateStatusMut.mutate({ orderId: order._id, status: 'CANCELLED' })}
                            disabled={updateStatusMut.isPending}
                            className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            {t('zzone.cancelOrder')}
                          </button>
                        </div>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateStatusMut.mutate({ orderId: order._id, status: 'READY' })}
                          disabled={updateStatusMut.isPending}
                          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {t('zzone.readyOrder')}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                  {t('zzone.noOrders')}
                </div>
              )}
            </div>
          )}

          {/* Status Tab (store info) */}
          {tab === 'status' && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label={t('zzone.storeName')} value={status.storeName ?? '—'} />
                <InfoRow label={t('zzone.storeId')} value={status.zzoneStoreId ?? '—'} mono />
                <InfoRow label="ZZone User ID" value={status.zzoneUserId ?? '—'} mono />
                <InfoRow
                  label="ZZone Server"
                  value={status.zzoneHealthy ? '✓ Online' : '✗ Offline'}
                  color={status.zzoneHealthy ? 'green' : 'red'}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    READY: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

function InfoRow({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: 'green' | 'red' }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className={`mt-0.5 text-sm ${mono ? 'font-mono' : ''} ${
        color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : 'text-gray-900'
      }`}>
        {value}
      </dd>
    </div>
  );
}
