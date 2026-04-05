'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Truck, Calendar, Hash, FileText } from 'lucide-react';
import { useWarehouseInvoice } from '@/hooks/warehouse/useWarehouseInvoices';
import { formatPrice } from '@/lib/utils';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: invoice, isLoading } = useWarehouseInvoice(id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center text-gray-400">
        <Package className="mx-auto mb-2 h-10 w-10 text-gray-300" />
        <p>Nakladnoy topilmadi</p>
      </div>
    );
  }

  const totalQty = invoice.items.reduce((s, i) => s + Number(i.quantity), 0);

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nakladnoy {invoice.invoiceNumber ? `#${invoice.invoiceNumber}` : `(${invoice.id.slice(0, 8)})`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(invoice.createdAt).toLocaleString('uz-UZ')}
          </p>
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Package className="h-3.5 w-3.5" />
            Jami pozitsiya
          </div>
          <p className="text-xl font-bold text-gray-900">{invoice.items.length} ta</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Hash className="h-3.5 w-3.5" />
            Jami miqdor
          </div>
          <p className="text-xl font-bold text-gray-900">{totalQty} dona</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Calendar className="h-3.5 w-3.5" />
            Umumiy summa
          </div>
          <p className="text-xl font-bold text-amber-700">{formatPrice(Number(invoice.totalCost))} so'm</p>
        </div>
        {(invoice as any).supplier && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Truck className="h-3.5 w-3.5" />
              Yetkazib beruvchi
            </div>
            <p className="text-sm font-semibold text-gray-900">{(invoice as any).supplier.name}</p>
            {(invoice as any).supplier.phone && (
              <p className="text-xs text-gray-400">{(invoice as any).supplier.phone}</p>
            )}
          </div>
        )}
      </div>

      {/* Note */}
      {invoice.note && (
        <div className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <FileText className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          {invoice.note}
        </div>
      )}

      {/* Items table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Mahsulotlar ro'yxati</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500">
              <th className="px-4 py-3 text-left font-medium">#</th>
              <th className="px-4 py-3 text-left font-medium">Mahsulot</th>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-right font-medium">Miqdor</th>
              <th className="px-4 py-3 text-right font-medium">Kelish narxi</th>
              <th className="px-4 py-3 text-right font-medium">Jami</th>
              <th className="px-4 py-3 text-left font-medium">Partiya</th>
              <th className="px-4 py-3 text-left font-medium">Muddat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoice.items.map((item, idx) => {
              const product = (item as any).product;
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">
                    {product?.name ?? item.productId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2.5 text-gray-400">{product?.sku ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right text-gray-700">
                    {Number(item.quantity)} {product?.unit?.shortName ?? 'dona'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600">
                    {formatPrice(Number(item.purchasePrice))}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                    {formatPrice(Number(item.totalCost))}
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{item.batchNumber ?? '—'}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">
                    {item.expiryDate
                      ? new Date(item.expiryDate).toLocaleDateString('uz-UZ')
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-600 text-right">
                Jami:
              </td>
              <td className="px-4 py-3 text-sm font-bold text-amber-700 text-right">
                {formatPrice(Number(invoice.totalCost))} so'm
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
