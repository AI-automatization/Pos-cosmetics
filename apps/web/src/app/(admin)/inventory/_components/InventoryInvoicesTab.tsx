'use client';

import { FileText } from 'lucide-react';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn, formatPrice } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

interface InvoiceItem {
  id: string;
  createdAt: string;
  invoiceNumber?: string | null;
  supplier?: { name: string } | null;
  itemsCount: number;
  totalAmount: number;
  status: string;
}

interface InvoicesData {
  items: InvoiceItem[];
  total: number;
}

interface InventoryInvoicesTabProps {
  invoicesData: InvoicesData | undefined;
  isLoading: boolean;
  onViewInvoice: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
};

export function InventoryInvoicesTab({ invoicesData, isLoading, onViewInvoice }: InventoryInvoicesTabProps) {
  const { t } = useTranslation();

  const statusLabels: Record<string, string> = {
    PENDING: t('common.pending'),
    APPROVED: t('common.approved'),
    REJECTED: t('inventory.rejected'),
  };

  if (isLoading) return <LoadingSkeleton variant="table" rows={5} />;

  if (!invoicesData || invoicesData.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <FileText className="h-10 w-10 text-gray-200" />
        <p className="text-sm text-gray-400">{t('inventory.noInvoices')}</p>
      </div>
    );
  }

  const headers = [
    t('inventory.colDate'),
    t('inventory.documentNumber'),
    t('inventory.supplier'),
    t('inventory.colProduct'),
    t('inventory.totalAmount'),
    t('inventory.colStatus'),
    '',
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {invoicesData.items.map((inv) => (
            <tr key={inv.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(inv.createdAt).toLocaleDateString('uz-UZ')}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-700">{inv.invoiceNumber ?? '—'}</td>
              <td className="px-4 py-3 text-gray-900">{inv.supplier?.name ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500">{inv.itemsCount} ta</td>
              <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(inv.totalAmount)}</td>
              <td className="px-4 py-3">
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600')}>
                  {statusLabels[inv.status] ?? inv.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onViewInvoice(inv.id)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {t('common.show')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
