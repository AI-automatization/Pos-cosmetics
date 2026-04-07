'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, User, Package, Hash } from 'lucide-react';
import { useWarehouseInvoice } from '@/hooks/warehouse/useWarehouseInvoices';
import { formatPrice, formatDateTime } from '@/lib/utils';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: invoice, isLoading } = useWarehouseInvoice(id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">Nakladnoy topilmadi</p>
          <Link href="/warehouse/invoices" className="mt-3 inline-block text-sm text-amber-600 hover:text-amber-700">
            Orqaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const totalCost = invoice.items.reduce((s, i) => s + i.totalCost, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/warehouse/invoices"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Nakladnoy {invoice.invoiceNumber ? `#${invoice.invoiceNumber}` : ''}
          </h1>
          <p className="text-sm text-gray-500">Batafsil ma&apos;lumot</p>
        </div>
      </div>

      {/* Invoice meta card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Hash className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Raqam</p>
              <p className="font-semibold text-gray-900">{invoice.invoiceNumber || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
              <Calendar className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Sana</p>
              <p className="font-semibold text-gray-900">{formatDateTime(invoice.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
              <User className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Kontragent</p>
              <p className="font-semibold text-gray-900">{invoice.supplierId || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              <Package className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Jami summa</p>
              <p className="text-lg font-bold text-gray-900">{formatPrice(totalCost)}</p>
            </div>
          </div>
        </div>

        {invoice.note && (
          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Izoh:</span> {invoice.note}
          </div>
        )}
      </div>

      {/* Items table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Tovarlar</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {invoice.items.length}
            </span>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr className="text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Mahsulot</th>
              <th className="px-5 py-3 text-right">Miqdor</th>
              <th className="px-5 py-3 text-right">Narx</th>
              <th className="px-5 py-3 text-left">Partiya</th>
              <th className="px-5 py-3 text-right">Jami</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoice.items.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                <td className="px-5 py-3 font-medium text-gray-900">{item.productId}</td>
                <td className="px-5 py-3 text-right text-gray-700">{item.quantity}</td>
                <td className="px-5 py-3 text-right text-gray-700">{formatPrice(item.purchasePrice)}</td>
                <td className="px-5 py-3 text-gray-500">{item.batchNumber || '—'}</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatPrice(item.totalCost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 bg-gray-50/80">
            <tr>
              <td colSpan={5} className="px-5 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Jami summa:
              </td>
              <td className="px-5 py-3 text-right">
                <span className="text-lg font-bold text-gray-900">{formatPrice(totalCost)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
