import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radii, Shadows } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';

export interface BarDataPoint {
  x: string; // label
  y: number; // value
}

interface BarChartWidgetProps {
  data?: BarDataPoint[];
  mockData?: BarDataPoint[];
  title?: string;
  valueFormatter?: (v: number) => string;
}

const MOCK_DATA: BarDataPoint[] = [
  { x: 'Chilonzor', y: 24_500_000 },
  { x: 'Yunusabad', y: 18_200_000 },
  { x: "Mirzo Ulug'bek", y: 15_800_000 },
  { x: 'Sergeli', y: 11_300_000 },
];

const BAR_COLORS = [Colors.primary, Colors.primaryMid, Colors.info, Colors.purple];

export default function BarChartWidget({
  data,
  mockData,
  title,
  valueFormatter = formatCurrency,
}: BarChartWidgetProps) {
  const fallback = mockData ?? MOCK_DATA;
  const displayData = data && data.length > 0 ? data : fallback;
  const maxVal = Math.max(...displayData.map((d) => d.y), 1);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.bars}>
        {displayData.map((item, i) => {
          const pct = (item.y / maxVal) * 100;
          const color = BAR_COLORS[i % BAR_COLORS.length];
          return (
            <View key={item.x} style={styles.row}>
              <Text style={styles.label} numberOfLines={1}>
                {item.x}
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
              </View>
              <Text style={styles.value}>{valueFormatter(item.y)}</Text>
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
  label: {
    width: 90,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  value: {
    width: 72,
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '700',
    textAlign: 'right',
  },
});
