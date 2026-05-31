import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { chartStyles, CHART_HEIGHT, SCREEN_W, BAR_W, BAR_GAP } from './DailyRevenueScreen.styles';

// ─── Helpers ───────────────────────────────────────────
function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' mlrd';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + ' ming';
  return n.toString();
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

// ─── Types ─────────────────────────────────────────────
export interface RevenueDataItem {
  readonly date: string;
  readonly revenue: number;
  readonly orderCount: number;
}

// ─── Component ─────────────────────────────────────────
interface RevenueBarChartProps {
  readonly data: readonly RevenueDataItem[];
}

export default function RevenueBarChart({ data }: RevenueBarChartProps) {
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);

  const maxBars = Math.floor((SCREEN_W - 64) / (BAR_W + BAR_GAP));
  const visible = data.slice(-maxBars);

  if (visible.length === 0) return null;

  return (
    <View style={chartStyles.wrap}>
      {/* Y-axis labels */}
      <View style={chartStyles.yAxis}>
        {[1, 0.75, 0.5, 0.25, 0].map((pct) => (
          <Text key={pct} style={chartStyles.yLabel}>
            {fmtShort(maxRev * pct)}
          </Text>
        ))}
      </View>

      {/* Bars */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={chartStyles.barsRow}
      >
        {visible.map((item) => {
          const heightPct = item.revenue / maxRev;
          const barH = Math.max(4, Math.round(CHART_HEIGHT * heightPct));
          return (
            <View key={item.date} style={chartStyles.barCol}>
              <View style={chartStyles.barTrack}>
                <View
                  style={[
                    chartStyles.bar,
                    { height: barH },
                  ]}
                />
              </View>
              <Text style={chartStyles.barLabel}>{dayLabel(item.date)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
