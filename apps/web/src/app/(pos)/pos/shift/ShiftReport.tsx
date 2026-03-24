import { TrendingUp, Banknote, CreditCard, ShoppingBag, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ShiftReportProps {
  openingCash: number;
  closingCash: number;
  salesCount: number;
  revenue: number;
  cashRevenue: number;
  cardRevenue: number;
}

export function ShiftReport({
  openingCash,
  closingCash,
  salesCount,
  revenue,
  cashRevenue,
  cardRevenue,
}: ShiftReportProps) {
  const expectedCash = openingCash + cashRevenue;
  const discrepancy = closingCash - expectedCash;
  const hasDiscrepancy = Math.abs(discrepancy) > 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Smena hisoboti
      </h3>

      <div className="space-y-2.5">
        {/* Sales count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShoppingBag className="h-4 w-4 text-gray-400" />
            Sotuvlar soni
          </div>
          <span className="font-semibold text-gray-900">{salesCount} ta</span>
        </div>

        {/* Total revenue */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            Jami tushum
          </div>
          <span className="font-bold text-gray-900">{formatPrice(revenue)}</span>
        </div>

        <div className="my-2 border-t border-gray-200" />

        {/* Cash breakdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Banknote className="h-4 w-4 text-green-500" />
            Naqd savdo
          </div>
          <span className="text-sm text-gray-700">{formatPrice(cashRevenue)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CreditCard className="h-4 w-4 text-blue-500" />
            Karta savdo
          </div>
          <span className="text-sm text-gray-700">{formatPrice(cardRevenue)}</span>
        </div>

        <div className="my-2 border-t border-gray-200" />

        {/* Cash reconciliation */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Boshlang'ich kassa</span>
          <span className="text-sm text-gray-700">{formatPrice(openingCash)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Kutilgan kassa</span>
          <span className="text-sm font-medium text-gray-900">{formatPrice(expectedCash)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Haqiqiy kassa</span>
          <span className="text-sm font-medium text-gray-900">{formatPrice(closingCash)}</span>
        </div>

        {/* Discrepancy */}
        {hasDiscrepancy && (
          <div
            className={`flex items-center justify-between rounded-lg p-2 ${
              discrepancy < 0
                ? 'bg-red-50 text-red-700'
                : 'bg-yellow-50 text-yellow-700'
            }`}
          >
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              {discrepancy < 0 ? 'Kamomad' : 'Ortiqcha'}
            </div>
            <span className="text-sm font-bold">
              {discrepancy < 0 ? '-' : '+'}{formatPrice(Math.abs(discrepancy))}
            </span>
          </div>
        )}

        {!hasDiscrepancy && closingCash > 0 && (
          <div className="rounded-lg bg-green-50 p-2 text-center text-sm font-medium text-green-700">
            ✓ Kassa balansi to'g'ri
          </div>
        )}
      </div>
    </div>
  );
}
