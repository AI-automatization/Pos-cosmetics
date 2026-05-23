import React from 'react';
import { View, Text } from 'react-native';
import { C, RANK_COLORS, BAR_MAX_W, styles } from './TopProductsScreen.styles';

// ─── Helpers ───────────────────────────────────────────
export function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' mlrd';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + ' ming';
  return n.toString();
}

export function fmtInt(n: number): string {
  const abs = Math.abs(Number(n));
  return (Number(n) < 0 ? '-' : '') + Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Period config ─────────────────────────────────────
export type PeriodKey = '7d' | '30d' | '90d' | '1y';

export const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: '7d',  label: '7 kun',  days: 6   },
  { key: '30d', label: '30 kun', days: 29  },
  { key: '90d', label: '90 kun', days: 89  },
  { key: '1y',  label: '1 yil',  days: 364 },
];

export function getPeriodDates(days: number): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0]!;
  const from = new Date(now);
  from.setDate(now.getDate() - days);
  return { from: from.toISOString().split('T')[0]!, to };
}

// ─── ProductRowItem ────────────────────────────────────
interface ProductRowItemProps {
  readonly rank: number;
  readonly productName: string;
  readonly totalQty: number;
  readonly totalRevenue: number;
}

export function ProductRowItem({ rank, productName, totalQty, totalRevenue }: ProductRowItemProps) {
  const rankStyle = RANK_COLORS[rank - 1] ?? { bg: '#EFF6FF', color: C.primary };

  return (
    <View style={styles.listItem}>
      {/* Rank */}
      <View style={[styles.rankCircle, { backgroundColor: rankStyle.bg }]}>
        <Text style={[styles.rankText, { color: rankStyle.color }]}>#{rank}</Text>
      </View>

      {/* Initials avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(productName)}</Text>
      </View>

      {/* Name */}
      <View style={styles.itemBody}>
        <Text style={styles.itemName} numberOfLines={1}>{productName}</Text>
        <Text style={styles.itemQty}>{fmtInt(totalQty)} dona sotildi</Text>
      </View>

      {/* Revenue */}
      <Text style={styles.itemRevenue}>{fmtShort(totalRevenue)}</Text>
    </View>
  );
}

// ─── HorizontalBarChart ────────────────────────────────
interface HorizontalBarChartProps {
  readonly data: { productName: string; totalRevenue: number; totalQty: number }[];
}

export function HorizontalBarChart({ data }: HorizontalBarChartProps) {
  const maxRev = Math.max(...data.map((d) => d.totalRevenue), 1);
  const top10 = data.slice(0, 10);

  return (
    <View style={styles.hChartWrap}>
      {top10.map((item, i) => {
        const barW = Math.max(4, Math.round(BAR_MAX_W * (item.totalRevenue / maxRev)));
        const rankStyle = RANK_COLORS[i] ?? { bg: '#EFF6FF', color: C.primary };
        return (
          <View key={item.productName} style={styles.hBarRow}>
            {/* Rank + name */}
            <View style={styles.hBarLabel}>
              <View style={[styles.hRankDot, { backgroundColor: rankStyle.bg }]}>
                <Text style={[styles.hRankText, { color: rankStyle.color }]}>{i + 1}</Text>
              </View>
              <Text style={styles.hBarName} numberOfLines={1}>{item.productName}</Text>
            </View>

            {/* Bar + value */}
            <View style={styles.hBarTrack}>
              <View style={[styles.hBar, { width: barW }]} />
              <Text style={styles.hBarValue}>{fmtShort(item.totalRevenue)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
