'use client';

import { Info } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { ProfitSummary } from '@/types/reports';

interface RowProps {
  label: string;
  value: number;
  tooltip: string;
  color: string;
  prefix?: string;
}

function Row({ label, value, tooltip, color, prefix = '' }: RowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span title={tooltip} className="cursor-help text-gray-300 hover:text-gray-400">
          <Info className="h-3 w-3" />
        </span>
      </div>
      <span className={`text-sm font-medium ${color}`}>
        {prefix}
        {formatPrice(Math.abs(value))}
      </span>
    </div>
  );
}

interface ProfitBreakdownProps {
  profit: ProfitSummary;
}

export function ProfitBreakdown({ profit }: ProfitBreakdownProps) {
  const margin = parseFloat(profit.grossMarginPct);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Foyda tahlili (bugun)</h2>
      <div className="flex flex-col gap-2">
        <Row
          label="Tushum"
          value={profit.revenue}
          tooltip="Barcha buyurtmalar jami summasi (chegirmadan oldin)"
          color="text-gray-900"
        />
        <Row
          label="Tannarx (COGS)"
          value={-profit.cogs}
          tooltip="Sotilgan mahsulotlarning kelish narxi summasi"
          color="text-red-600"
          prefix="−"
        />
        <Row
          label="Qaytarishlar"
          value={-profit.returns}
          tooltip="Tasdiqlangan qaytarishlar summasi"
          color="text-orange-600"
          prefix="−"
        />
        <div className="my-1 border-t border-dashed border-gray-200" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Yalpi foyda</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold ${profit.grossProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}
            >
              {formatPrice(Math.abs(profit.grossProfit))}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                margin >= 20
                  ? 'bg-green-50 text-green-700'
                  : margin >= 10
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-600'
              }`}
            >
              {profit.grossMarginPct}%
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          * Sof foyda uchun xarajatlarni ham hisobga olish kerak
        </p>
      </div>
    </div>
  );
}
