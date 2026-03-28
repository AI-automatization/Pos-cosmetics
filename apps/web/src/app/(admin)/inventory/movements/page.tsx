'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PackageOpen, User } from 'lucide-react';
import { useMovementsWithUsers } from '@/hooks/inventory/useInventory';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { SearchInput } from '@/components/common/SearchInput';
import { cn } from '@/lib/utils';
import type { MovementType } from '@/types/inventory';

const TYPE_LABELS: Record<MovementType, { label: string; className: string }> = {
  IN:         { label: 'Kirim',      className: 'bg-green-100 text-green-700' },
  OUT:        { label: 'Chiqim',     className: 'bg-red-100 text-red-700' },
  ADJUSTMENT: { label: 'Tuzatish',   className: 'bg-yellow-100 text-yellow-700' },
  RETURN:     { label: 'Qaytarish',  className: 'bg-blue-100 text-blue-700' },
  TRANSFER:   { label: "Ko'chirish", className: 'bg-purple-100 text-purple-700' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MovementsPage() {
  const [search, setSearch] = useState('');
  const { data: movements, isLoading } = useMovementsWithUsers();

  const filtered = (movements ?? []).filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.productName ?? '').toLowerCase().includes(q) ||
      (m.note ?? '').toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center gap-3">
        <Link href="/inventory" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Harakatlar tarixi</h1>
          <p className="text-sm text-gray-500">
            {movements ? `Jami: ${movements.length} ta harakat` : 'Yuklanmoqda...'}
          </p>
        </div>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Mahsulot nomi, tur yoki izoh..."
        className="max-w-sm"
      />

      {isLoading ? (
        <LoadingSkeleton variant="table" rows={10} />
      ) : !filtered.length ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
          <PackageOpen className="h-12 w-12 opacity-40" />
          <p className="text-sm">
            {search ? "Qidiruv bo'yicha natija topilmadi" : "Harakatlar tarixi yo'q"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Sana</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Tur</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Mahsulot</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Miqdor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Izoh</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Kim kiritgan
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((m) => {
                const isIn = m.type === 'IN' || m.type === 'RETURN';
                const cfg = TYPE_LABELS[m.type] ?? { label: m.type, className: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={m.id} className="transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.className)}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {m.productName ?? '—'}
                    </td>
                    <td className={cn(
                      'px-4 py-3 text-right font-semibold tabular-nums',
                      isIn ? 'text-green-600' : 'text-red-600',
                    )}>
                      {isIn ? '+' : '−'}{m.quantity}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-500">
                      {m.note ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        {m.userName}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
