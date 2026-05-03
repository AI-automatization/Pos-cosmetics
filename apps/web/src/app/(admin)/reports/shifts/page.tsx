'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useShiftReports } from '@/hooks/reports/useReports';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

function fmtDateTime(str: string | null): string {
  if (!str) return '—';
  const d = new Date(str);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function getDefaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function ShiftReportsPage() {
  const [range, setRange] = useState(getDefaultRange);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [shiftPage, setShiftPage] = useState(1);
  const PAGE_SIZE = 10;
  const { data, isLoading, isError } = useShiftReports(range);
  const totalPages = Math.ceil((data?.length ?? 0) / PAGE_SIZE);
  const pagedData = data?.slice((shiftPage - 1) * PAGE_SIZE, shiftPage * PAGE_SIZE) ?? [];

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/reports" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Smena hisobotlari</h1>
          <p className="text-sm text-gray-500">Smenalar bo'yicha savdo va naqd tahlili</p>
        </div>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Dan:</label>
          <input
            type="date"
            value={range.from}
            max={range.to}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Gacha:</label>
          <input
            type="date"
            value={range.to}
            min={range.from}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" rows={5} />
      ) : isError ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          Backend API (T-024) hali tayyor emas
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-400">
          Tanlangan sana oralig'ida smena topilmadi
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pagedData.map((shift) => {
            const isOpen = expanded === shift.shiftId;
            const discrepancy = shift.discrepancy ?? 0;

            return (
              <div
                key={shift.shiftId}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                {/* Summary row — clickable to expand */}
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : shift.shiftId)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{shift.cashierName}</p>
                    <p className="text-xs text-gray-400">
                      {fmtDateTime(shift.openedAt)}
                      {shift.closedAt ? ` → ${fmtDateTime(shift.closedAt)}` : ' (ochiq)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatPrice(shift.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-400">{shift.ordersCount} ta savdo</p>
                  </div>
                  <div
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      shift.closedAt
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-green-100 text-green-700',
                    )}
                  >
                    {shift.closedAt ? 'Yopilgan' : 'Ochiq'}
                  </div>
                  <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                </button>

                {/* Expanded details */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Naqd savdo:</span>
                        <span className="font-medium">{formatPrice(shift.cashRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Karta savdo:</span>
                        <span className="font-medium">{formatPrice(shift.cardRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Boshlang'ich naqd:</span>
                        <span className="font-medium">{formatPrice(shift.openingCash)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kutilgan naqd:</span>
                        <span className="font-medium">{formatPrice(shift.expectedCash)}</span>
                      </div>
                      {shift.closingCash !== null && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Haqiqiy naqd:</span>
                            <span className="font-medium">
                              {formatPrice(shift.closingCash)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Farq:</span>
                            <span
                              className={cn(
                                'font-semibold',
                                discrepancy === 0
                                  ? 'text-green-600'
                                  : discrepancy > 0
                                  ? 'text-blue-600'
                                  : 'text-red-600',
                              )}
                            >
                              {discrepancy === 0
                                ? '0 (mos)'
                                : discrepancy > 0
                                ? `+${formatPrice(discrepancy)}`
                                : `−${formatPrice(Math.abs(discrepancy))}`}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2">
            <p className="text-xs text-gray-500">Jami: {data?.length ?? 0} ta smena</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setShiftPage(p => Math.max(1, p - 1))} disabled={shiftPage === 1} className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-40">Oldingi</button>
              <span className="px-2 text-xs text-gray-500">{shiftPage} / {Math.max(1, totalPages)}</span>
              <button type="button" onClick={() => setShiftPage(p => Math.min(totalPages, p + 1))} disabled={shiftPage >= totalPages} className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-40">Keyingi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
