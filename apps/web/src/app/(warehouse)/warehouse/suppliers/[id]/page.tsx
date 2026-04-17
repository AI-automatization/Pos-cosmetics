'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Truck, Phone, Building2, MapPin, CheckCircle2, XCircle,
  Pencil, Power, Package, ExternalLink,
} from 'lucide-react';
import { useSupplier, useUpdateSupplier } from '@/hooks/catalog/useSuppliers';
import { SupplierModal } from '@/components/catalog/SupplierModal';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: supplier, isLoading } = useSupplier(id);
  const { mutate: updateSupplier, isPending: isUpdating } = useUpdateSupplier();
  const [showEdit, setShowEdit] = useState(false);

  function toggleActive() {
    if (!supplier) return;
    updateSupplier({ id: supplier.id, dto: { isActive: !supplier.isActive } });
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Truck className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">Yetkazib beruvchi topilmadi</p>
          <Link href="/warehouse/suppliers" className="mt-3 inline-block text-sm text-amber-600 hover:text-amber-700">
            Orqaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const linkedProducts = supplier.productSuppliers ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/warehouse/suppliers"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{supplier.name}</h1>
            <span
              className={cn(
                'shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                supplier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
              )}
            >
              {supplier.isActive ? <><CheckCircle2 className="h-3 w-3" /> Faol</> : <><XCircle className="h-3 w-3" /> Faol emas</>}
            </span>
          </div>
          {supplier.company && (
            <p className="text-sm text-gray-500 mt-0.5">{supplier.company}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Pencil className="h-4 w-4" />
            Tahrirlash
          </button>
          <button
            type="button"
            onClick={toggleActive}
            disabled={isUpdating}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-60',
              supplier.isActive
                ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                : 'border border-green-200 bg-green-50 text-green-600 hover:bg-green-100',
            )}
          >
            <Power className="h-4 w-4" />
            {supplier.isActive ? 'Faolsizlashtirish' : 'Faollashtirish'}
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Kontakt ma&apos;lumotlari</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {supplier.company && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Building2 className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Kompaniya</p>
                <p className="font-medium text-gray-900">{supplier.company}</p>
              </div>
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <Phone className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Telefon</p>
                <a href={`tel:${supplier.phone}`} className="font-medium text-gray-900 hover:text-amber-600 transition">
                  {supplier.phone}
                </a>
              </div>
            </div>
          )}
          {supplier.address && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                <MapPin className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Manzil</p>
                <p className="font-medium text-gray-900">{supplier.address}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
              <Truck className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Qo&apos;shilgan sana</p>
              <p className="font-medium text-gray-900">
                {new Date(supplier.createdAt).toLocaleDateString('uz-UZ')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', supplier.isActive ? 'bg-green-50' : 'bg-gray-50')}>
              {supplier.isActive
                ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                : <XCircle className="h-4 w-4 text-gray-400" />}
            </div>
            <div>
              <p className="text-xs text-gray-400">Holat</p>
              <p className={cn('font-medium', supplier.isActive ? 'text-green-700' : 'text-gray-500')}>
                {supplier.isActive ? 'Faol' : 'Faol emas'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked products */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Bog&apos;liq mahsulotlar</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {linkedProducts.length}
            </span>
          </div>
          <Link
            href="/warehouse/inventory"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Inventar
          </Link>
        </div>

        {linkedProducts.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p>Bog&apos;liq mahsulot yo&apos;q</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Mahsulot nomi</th>
                <th className="px-5 py-3 text-left">SKU</th>
                <th className="px-5 py-3 text-right">Sotuv narxi</th>
                <th className="px-5 py-3 text-center">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {linkedProducts.map((lp, idx) => (
                <tr key={lp.product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{lp.product.name}</td>
                  <td className="px-5 py-3 text-gray-400">{lp.product.sku ?? '—'}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{formatPrice(lp.product.sellPrice)}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                        lp.product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400',
                      )}
                    >
                      {lp.product.isActive ? 'Faol' : 'Faol emas'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showEdit && (
        <SupplierModal supplier={supplier} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}
