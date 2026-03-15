import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, Shadows } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';

export interface HorizontalBarItem {
  label: string;
  value: number;
}

interface HorizontalBarChartProps {
  data?: HorizontalBarItem[];
  title?: string;
  valueFormatter?: (v: number) => string;
}

const MOCK_DATA: HorizontalBarItem[] = [
  { label: 'CHANEL No.5', value: 8_450_000 },
  { label: 'Dior Sauvage', value: 6_200_000 },
  { label: 'Creed Aventus', value: 5_100_000 },
  { label: 'Viktor&Rolf', value: 3_900_000 },
  { label: 'YSL Libre', value: 3_200_000 },
];

const BAR_COLORS = [
  Colors.primary,
  Colors.info,
  Colors.purple,
  Colors.warning,
  Colors.orange,
];

export default function HorizontalBarChart({
  data,
  title,
  valueFormatter = formatCurrency,
}: HorizontalBarChartProps) {
  const displayData = data && data.length > 0 ? data : MOCK_DATA;
  const maxVal = Math.max(...displayData.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.bars}>
        {displayData.map((item, i) => {
          const pct = (item.value / maxVal) * 100;
          const color = BAR_COLORS[i % BAR_COLORS.length];
          return (
            <View key={item.label} style={styles.row}>
              <View style={styles.rankBadge}>
                <Text style={[styles.rank, { color }]}>{i + 1}</Text>
              </View>
              <View style={styles.middle}>
                <Text style={styles.label} numberOfLines={1}>
                  {item.label}
                </Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
              </View>
              <Text style={styles.value}>{valueFormatter(item.value)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.card,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  bars: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankBadge: {
    width: 18,
    alignItems: 'center',
  },
  rank: {
    fontSize: 13,
    fontWeight: '700',
  },
  middle: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  barTrack: {
    height: 6,
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  value: {
    width: 76,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
});
