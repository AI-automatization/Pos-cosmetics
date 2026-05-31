import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BranchRevenueItem } from '../../api/analytics.api';
import { C, styles, fmtUzs } from './BranchReportsScreen.styles';

// ─── TrendBadge ────────────────────────────────────────
interface TrendBadgeProps {
  readonly trend: number;
}

function TrendBadge({ trend }: TrendBadgeProps) {
  const isPositive = trend >= 0;
  const label = isPositive
    ? `\u25b2 ${trend.toFixed(1)}%`
    : `\u25bc ${Math.abs(trend).toFixed(1)}%`;
  return (
    <View style={[styles.trendBadge, isPositive ? styles.trendBadgeGreen : styles.trendBadgeRed]}>
      <Text style={[styles.trendText, isPositive ? styles.trendTextGreen : styles.trendTextRed]}>
        {label}
      </Text>
    </View>
  );
}

// ─── BranchCard ────────────────────────────────────────
interface BranchCardProps {
  readonly item: BranchRevenueItem;
  readonly trend: number | undefined;
}

const BranchCard = React.memo(function BranchCard({ item, trend }: BranchCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Ionicons name="business-outline" size={18} color={C.teal} />
        </View>
        <Text style={styles.branchName} numberOfLines={1}>{item.branchName}</Text>
        {trend !== undefined && <TrendBadge trend={trend} />}
      </View>

      <Text style={styles.revenueValue}>{fmtUzs(item.revenue)}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="receipt-outline" size={14} color={C.muted} />
          <Text style={styles.footerText}>{item.orders} ta buyurtma</Text>
        </View>
        <Text style={styles.stockValue}>Ombor: {fmtUzs(item.stockValue)}</Text>
      </View>
    </View>
  );
});

export default BranchCard;
