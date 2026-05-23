import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fmtCompact } from './paymentsHistory.helpers';

// ─── StatCard ──────────────────────────────────────────
interface PaymentsStatCardProps {
  readonly label: string;
  readonly sum: number;
  readonly count: number;
  readonly color: string;
  readonly bg: string;
}

export function PaymentsStatCard({
  label,
  sum,
  count,
  color,
  bg,
}: PaymentsStatCardProps) {
  return (
    <View style={[statStyles.statCard, { backgroundColor: bg }]}>
      <Text style={[statStyles.statLabel, { color }]}>{label}</Text>
      <Text
        style={[statStyles.statSum, { color }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {fmtCompact(sum)} so'm
      </Text>
      <Text style={statStyles.statCount}>{count} ta</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statSum: {
    fontSize: 14,
    fontWeight: '700',
  },
  statCount: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});
