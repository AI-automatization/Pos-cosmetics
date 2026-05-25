import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BranchReport } from '../../api/analytics.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors, Radii } from '../../config/theme';
import { RANK_COLORS, DEFAULT_RANK } from './branch-report.utils';

interface BranchCardProps {
  readonly item: BranchReport;
  readonly rank: number;
  readonly maxRevenue: number;
  readonly totalRevenue: number;
}

const BranchCard = React.memo(function BranchCard({
  item,
  rank,
  maxRevenue,
  totalRevenue,
}: BranchCardProps) {
  const rankColors = RANK_COLORS[rank] ?? DEFAULT_RANK;
  const barWidth = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
  const revenueShare = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
  const isPositive = item.growth >= 0;

  return (
    <View style={styles.card}>
      {/* Header: rank + name + growth */}
      <View style={styles.cardHeader}>
        <View style={[styles.rankBadge, { backgroundColor: rankColors.bg }]}>
          <Text style={[styles.rankText, { color: rankColors.text }]}>#{rank}</Text>
        </View>
        <Text style={styles.branchName} numberOfLines={1}>{item.branchName}</Text>
        <View style={[styles.growthBadge, isPositive ? styles.growthPos : styles.growthNeg]}>
          <Text style={[styles.growthText, isPositive ? styles.growthTextPos : styles.growthTextNeg]}>
            {isPositive ? '\u25B2' : '\u25BC'} {Math.abs(item.growth).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Revenue with bar */}
      <View style={styles.revenueSection}>
        <Text style={styles.revenueValue}>{formatCurrency(item.revenue)}</Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${barWidth}%` }]} />
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Buyurtmalar</Text>
          <Text style={styles.statValue}>{item.orders} ta</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>O'rtacha</Text>
          <Text style={styles.statValue}>{formatCurrency(item.avgOrderValue)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Ulush</Text>
          <Text style={styles.statValue}>{revenueShare.toFixed(1)}%</Text>
        </View>
      </View>
    </View>
  );
});

export default BranchCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 13, fontWeight: '800' },
  branchName: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  growthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xl,
  },
  growthPos: { backgroundColor: Colors.successLight },
  growthNeg: { backgroundColor: Colors.dangerLight },
  growthText: { fontSize: 12, fontWeight: '700' },
  growthTextPos: { color: Colors.success },
  growthTextNeg: { color: Colors.danger },
  revenueSection: { paddingHorizontal: 14, paddingBottom: 10, gap: 6 },
  revenueValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  barBg: {
    height: 6,
    backgroundColor: Colors.bgSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSubtle,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
});
