import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgingBucket } from '../../api/debts.api';
import { Colors, Radii, Shadows } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';

interface AgingBucketChartProps {
  buckets?: AgingBucket[];
}

const MOCK_BUCKETS: AgingBucket[] = [
  { bucket: '0_30', label: '0–30 kun', amount: 8_500_000, customerCount: 12 },
  { bucket: '31_60', label: '31–60 kun', amount: 4_200_000, customerCount: 7 },
  { bucket: '61_90', label: '61–90 kun', amount: 2_100_000, customerCount: 4 },
  { bucket: '90_plus', label: '90+ kun', amount: 1_300_000, customerCount: 2 },
];

const BUCKET_COLORS: Record<string, string> = {
  '0_30': Colors.success,
  '31_60': Colors.warning,
  '61_90': Colors.orange,
  '90_plus': Colors.danger,
};

export default function AgingBucketChart({ buckets }: AgingBucketChartProps) {
  const displayBuckets = buckets && buckets.length > 0 ? buckets : MOCK_BUCKETS;
  const maxAmount = Math.max(...displayBuckets.map((b) => b.amount), 1);

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {displayBuckets.map((b) => {
          const pct = (b.amount / maxAmount) * 100;
          const color = BUCKET_COLORS[b.bucket] ?? Colors.textSecondary;
          return (
            <View key={b.bucket} style={styles.row}>
              <View style={styles.labelBox}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={styles.label}>{b.label}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
              </View>
              <View style={styles.rightBox}>
                <Text style={[styles.amount, { color }]}>{formatCurrency(b.amount)}</Text>
                <Text style={styles.count}>{b.customerCount} kishi</Text>
              </View>
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
  bars: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 80,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
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
    opacity: 0.85,
  },
  rightBox: {
    width: 80,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 11,
    fontWeight: '700',
  },
  count: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '400',
  },
});
