'use client';

import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { DOW_LABELS, EmptyState } from './AnalyticsShared';

interface HeatmapCell {
  dow: number;
  hour: number;
  ordersCount: number;
}

interface Props {
  heatmap: HeatmapCell[];
  isLoading: boolean;
}

export function AnalyticsHeatmapTab({ heatmap, isLoading }: Props) {
  const heatmapMax = heatmap.reduce((m, c) => Math.max(m, c.ordersCount), 1);
  const heatmapGrid: Record<string, number> = {};
  heatmap.forEach((c) => { heatmapGrid[`${c.dow}-${c.hour}`] = c.ordersCount; });

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Faollik xaritasi</h2>
      {isLoading ? (
        <LoadingSkeleton variant="line" className="h-56" />
      ) : heatmap.length === 0 ? (
        <EmptyState label="Ma'lumotlar topilmadi" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="mb-1.5 ml-14 flex gap-1">
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="w-8 text-center text-[10px] font-medium text-gray-400">{h}:00</div>
              ))}
            </div>
            {DOW_LABELS.map((dow, di) => (
              <div key={dow} className="mb-1 flex items-center gap-1">
                <div className="w-12 pr-2 text-right text-xs font-medium text-gray-500">{dow}</div>
                {Array.from({ length: 24 }, (_, h) => {
                  const count = heatmapGrid[`${di}-${h}`] ?? 0;
                  const intensity = count / heatmapMax;
                  return (
                    <div
                      key={h}
                      title={`${dow} ${h}:00 — ${count} buyurtma`}
                      className="h-8 w-8 rounded-lg transition-all hover:scale-110 hover:shadow-sm"
                      style={{
                        backgroundColor: count === 0
                          ? '#f8fafc'
                          : `rgba(99, 102, 241, ${0.1 + intensity * 0.85})`,
                      }}
                    />
                  );
                })}
              </div>
            ))}
            <div className="mt-4 ml-14 flex items-center gap-2 text-xs text-gray-400">
              <span>Kam</span>
              <div className="flex gap-0.5">
                {[0.1, 0.25, 0.45, 0.65, 0.85].map((op) => (
                  <div
                    key={op}
                    className="h-5 w-5 rounded-md"
                    style={{ backgroundColor: `rgba(99, 102, 241, ${op})` }}
                  />
                ))}
              </div>
              <span>Ko&apos;p</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
