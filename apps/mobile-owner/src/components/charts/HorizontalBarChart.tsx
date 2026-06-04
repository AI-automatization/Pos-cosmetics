import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, Shadows } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';
import ChartNoData from './ChartNoData';

export interface HorizontalBarItem {
  label: string;
  value: number;
}

interface HorizontalBarChartProps {
  data?: HorizontalBarItem[];
  title?: string;
  valueFormatter?: (v: number) => string;
}

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
  const displayData = data ?? [];
  const maxVal = Math.max(...displayData.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {displayData.length === 0 ? (
        <ChartNoData />
      ) : (
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
      )}
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
