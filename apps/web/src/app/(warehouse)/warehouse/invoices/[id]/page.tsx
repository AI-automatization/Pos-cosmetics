'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, User, Package, Hash, Pencil, Check, X as XIcon } from 'lucide-react';
import { useWarehouseInvoice, useUpdateInvoice } from '@/hooks/warehouse/useWarehouseInvoices';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const { id } = use(params);
  const { data: invoice, isLoading } = useWarehouseInvoice(id);
  const { mutate: updateInvoice, isPending: isSaving } = useUpdateInvoice();
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [editNumber, setEditNumber] = useState('');

  const startEditing = () => {
    setEditNote(invoice?.note ?? '');
    setEditNumber(invoice?.invoiceNumber ?? '');
    setEditing(true);
  };

  const saveEdit = () => {
    updateInvoice(
      { id, invoiceNumber: editNumber, note: editNote },
      { onSuccess: () => setEditing(false) },
    );
  };

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
      <div className="flex h-full overflow-y-auto items-center justify-center p-6">
        <div className="text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">{t('warehouse.invoiceNotFound')}</p>
          <Link href="/warehouse/invoices" className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700">
            {t('common.goBack')}
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
            {t('warehouse.invoiceTitle')} {invoice.invoiceNumber ? `#${invoice.invoiceNumber}` : ''}
          </h1>
          <p className="text-sm text-gray-500">{t('warehouse.invoiceDetail')}</p>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            {t('common.edit')}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <XIcon className="h-4 w-4" />
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {t('common.save')}
            </button>
          </div>
        )}
      </div>

      {/* Invoice meta card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Hash className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('warehouse.invoiceNumber')}</p>
              {editing ? (
                <input
                  type="text"
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-gray-300 px-2 py-1 text-sm font-semibold outline-none focus:border-blue-500"
                />
              ) : (
                <p className="font-semibold text-gray-900">{invoice.invoiceNumber || '—'}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
              <Calendar className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('warehouse.date')}</p>
              <p className="font-semibold text-gray-900">{formatDateTime(invoice.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
              <User className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('warehouse.counterparty')}</p>
              <p className="font-semibold text-gray-900">{invoice.supplier?.name || invoice.supplierId || '—'}</p>
              {invoice.supplier?.company && (
                <p className="text-xs text-gray-400">{invoice.supplier.company}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Package className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('warehouse.totalAmount')}</p>
              <p className="text-lg font-bold text-gray-900">{formatPrice(totalCost)}</p>
            </div>
          </div>
        </div>

        {(invoice.note || editing) && (
          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <span className="font-medium text-gray-700">{t('warehouse.note')}:</span>{' '}
            {editing ? (
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder={t('warehouse.additionalNote')}
                className="ml-1 w-64 rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
              />
            ) : (
              invoice.note
            )}
          </div>
        )}
      </div>

      {/* Items table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">{t('warehouse.goods')}</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {invoice.items.length}
            </span>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr className="text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">{t('warehouse.product')}</th>
              <th className="px-5 py-3 text-right">{t('warehouse.quantity')}</th>
              <th className="px-5 py-3 text-right">{t('warehouse.price')}</th>
              <th className="px-5 py-3 text-left">{t('warehouse.batch')}</th>
              <th className="px-5 py-3 text-right">{t('warehouse.total')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoice.items.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                <td className="px-5 py-3 font-medium text-gray-900">
                  {item.product?.name ?? item.productId}
                  {item.product?.sku && (
                    <span className="ml-1.5 text-xs text-gray-400 font-normal">{item.product.sku}</span>
                  )}
                </td>
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
                {t('warehouse.totalAmount')}:
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
