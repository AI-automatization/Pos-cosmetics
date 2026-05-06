'use client';

import { X, CheckCircle, Loader2, Package } from 'lucide-react';
import { useInvoice, useApproveInvoice } from '@/hooks/inventory/useInventory';
import { formatPrice, cn } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Kutilmoqda',
  APPROVED: 'Tasdiqlangan',
  REJECTED: 'Rad etilgan',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

interface InvoiceDetailDrawerProps {
  invoiceId: string | null;
  onClose: () => void;
}

export function InvoiceDetailDrawer({ invoiceId, onClose }: InvoiceDetailDrawerProps) {
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const { mutate: approve, isPending: isApproving } = useApproveInvoice();

  if (!invoiceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Nakładная #{invoice?.invoiceNumber ?? '…'}
            </h2>
            {invoice && (
              <p className="text-xs text-gray-400">
                {new Date(invoice.createdAt).toLocaleDateString('uz-UZ', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          )}

          {invoice && (
            <>
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Yetkazib beruvchi</p>
                  <p className="text-sm font-medium text-gray-900">{invoice.supplier?.name ?? '—'}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Holat</p>
                  <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-medium', STATUS_COLOR[invoice.status] ?? '')}>
                    {STATUS_LABEL[invoice.status] ?? invoice.status}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Yaratgan</p>
                  <p className="text-sm font-medium text-gray-900">
                    {invoice.createdBy ? `${invoice.createdBy.firstName} ${invoice.createdBy.lastName}` : '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Jami summa</p>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(invoice.totalAmount)}</p>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="rounded-xl border border-gray-100 bg-amber-50 p-3">
                  <p className="text-xs text-amber-700">{invoice.notes}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Mahsulotlar ({invoice.items.length} ta)
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Mahsulot', 'Miqdor', 'Narx', 'Jami'].map((h) => (
                          <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/80">
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            {item.batchNumber && (
                              <p className="text-[10px] text-gray-400">Partiya: {item.batchNumber}</p>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">{item.quantity}</td>
                          <td className="px-3 py-2.5 text-gray-600">{formatPrice(item.costPrice)}</td>
                          <td className="px-3 py-2.5 font-medium text-gray-900">
                            {formatPrice(item.quantity * item.costPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {invoice?.status === 'PENDING' && (
          <div className="border-t border-gray-200 px-5 py-4">
            <button
              type="button"
              onClick={() => approve(invoice.id)}
              disabled={isApproving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Tasdiqlash
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
