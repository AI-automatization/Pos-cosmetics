'use client';

import { useState } from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';

interface ExpiryItem {
  id: string;
  productName: string;
  sku: string;
  barcode: string | null;
  categoryName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  daysLeft: number;
}


function makeExpiry(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const DEMO_EXPIRY: ExpiryItem[] = [
  { id: 'ex-1', productName: 'Nivea Krem 150ml', sku: 'NIV-001', barcode: '4005808147366', categoryName: 'Kremlar', batchNumber: 'BATCH-2024-001', expiryDate: makeExpiry(-5), quantity: 3, unit: 'dona', daysLeft: -5 },
  { id: 'ex-2', productName: 'Maybelline Pomada', sku: 'MAY-003', barcode: '3600531061258', categoryName: 'Makiyaj', batchNumber: 'BATCH-2024-012', expiryDate: makeExpiry(12), quantity: 5, unit: 'dona', daysLeft: 12 },
  { id: 'ex-3', productName: 'Garnier Toner', sku: 'GAR-005', barcode: '3600541358164', categoryName: 'Kremlar', batchNumber: 'BATCH-2025-003', expiryDate: makeExpiry(25), quantity: 8, unit: 'dona', daysLeft: 25 },
  { id: 'ex-4', productName: "L'Oreal Maskara", sku: 'LOR-009', barcode: '3600523155934', categoryName: 'Makiyaj', batchNumber: 'BATCH-2025-007', expiryDate: makeExpiry(45), quantity: 4, unit: 'dona', daysLeft: 45 },
  { id: 'ex-5', productName: 'Neutrogena Yuz kremi', sku: 'NEU-011', barcode: '0070501001347', categoryName: 'Kremlar', batchNumber: 'BATCH-2025-011', expiryDate: makeExpiry(72), quantity: 3, unit: 'dona', daysLeft: 72 },
  { id: 'ex-6', productName: 'Dove Dezodorant', sku: 'DOV-004', barcode: '8717163593127', categoryName: 'Gigiyena', batchNumber: 'BATCH-2025-015', expiryDate: makeExpiry(89), quantity: 12, unit: 'dona', daysLeft: 89 },
];

function ExpiryBadge({ daysLeft }: { daysLeft: number }) {
  if (daysLeft < 0) return <span className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-bold text-red-800">Muddati o'tgan ({Math.abs(daysLeft)} kun)</span>;
  if (daysLeft <= 30) return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{daysLeft} kun</span>;
  if (daysLeft <= 60) return <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">{daysLeft} kun</span>;
  return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{daysLeft} kun</span>;
}

type TabKey = 'expiring' | 'expired';

export default function ExpiryPage() {
  const [tab, setTab] = useState<TabKey>('expiring');
  const [daysFilter, setDaysFilter] = useState(90);

  const expired = DEMO_EXPIRY.filter((i) => i.daysLeft < 0);
  const expiring = DEMO_EXPIRY.filter((i) => i.daysLeft >= 0 && i.daysLeft <= daysFilter);

  const items = tab === 'expired' ? expired : expiring;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Yaroqlilik muddati</h1>
        <p className="mt-0.5 text-sm text-gray-500">Kosmetika mahsulotlari muddati nazorati</p>
      </div>

      {/* Alert banners */}
      {expired.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">
            <strong>{expired.length} ta mahsulot</strong> muddati o'tgan — darhol olib tashlang!
          </p>
        </div>
      )}
      {expiring.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <Calendar className="h-5 w-5 shrink-0 text-yellow-600" />
          <p className="text-sm text-yellow-700">
            <strong>{expiring.filter((i) => i.daysLeft <= 30).length} ta mahsulot</strong> 30 kun ichida muddati tugaydi
          </p>
        </div>
      )}

      {/* Tabs + filter */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {([['expiring', "Muddati yaqin"], ['expired', "Muddati o'tgan"]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {label}
              {key === 'expired' && expired.length > 0 && (
                <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">{expired.length}</span>
              )}
            </button>
          ))}
        </div>
        {tab === 'expiring' && (
          <SearchableDropdown
            options={[
              { value: '30', label: '30 kun ichida' },
              { value: '60', label: '60 kun ichida' },
              { value: '90', label: '90 kun ichida' },
            ]}
            value={String(daysFilter)}
            onChange={(val) => setDaysFilter(Number(val) || 90)}
            searchable={false}
            clearable={false}
            className="min-w-[160px]"
          />
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Mahsulot', 'Kategoriya', 'Partiya', 'Muddati', 'Qolgan', 'Holat'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-200" />
                  {tab === 'expired' ? "Muddati o'tgan mahsulot yo'q" : "Bu muddat oralig'ida mahsulot yo'q"}
                </td>
              </tr>
            ) : items.map((item) => (
              <tr key={item.id} className={cn('hover:bg-gray-50', item.daysLeft < 0 && 'bg-red-50/30')}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-400">{item.sku}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{item.categoryName}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.batchNumber}</td>
                <td className="px-4 py-3 text-gray-700">{item.expiryDate}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{item.quantity} {item.unit}</td>
                <td className="px-4 py-3"><ExpiryBadge daysLeft={item.daysLeft} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
