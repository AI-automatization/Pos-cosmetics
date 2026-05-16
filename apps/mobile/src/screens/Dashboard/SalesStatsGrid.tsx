import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatCard from '../../components/common/StatCard';
import { formatCompact } from '../../utils/currency';

const PRIMARY_LIGHT = '#EFF6FF';

interface SalesStatsGridProps {
  readonly summary: {
    orders: { count: number };
    netRevenue: number;
  } | undefined;
  readonly avgBasket: number;
  readonly nasiyaOverdueCount: number;
  readonly isCashier?: boolean;
}

export default function SalesStatsGrid({
  summary,
  avgBasket,
  nasiyaOverdueCount,
  isCashier = false,
}: SalesStatsGridProps) {
  if (isCashier) {
    return (
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            style={styles.statCard}
            icon={<Ionicons name="receipt-outline" size={20} color="#2563EB" />}
            iconBg={PRIMARY_LIGHT}
            title="Buyurtmalar"
            value={String(summary?.orders.count ?? 0)}
            subtitle="bugun"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.statsGrid}>
      <View style={styles.statsRow}>
        <StatCard
          style={styles.statCard}
          icon={<Ionicons name="receipt-outline" size={20} color="#2563EB" />}
          iconBg={PRIMARY_LIGHT}
          title="Buyurtmalar"
          value={String(summary?.orders.count ?? 0)}
          subtitle="bugun"
        />
        <StatCard
          style={styles.statCard}
          icon={<Ionicons name="trending-up-outline" size={20} color="#16A34A" />}
          iconBg="#F0FDF4"
          title="Daromad"
          value={summary ? formatCompact(summary.netRevenue) : '0'}
          subtitle="bugun"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          style={styles.statCard}
          icon={<Ionicons name="cart-outline" size={20} color="#D97706" />}
          iconBg="#FFFBEB"
          title="O'rtacha chek"
          value={formatCompact(avgBasket)}
          subtitle="so'm"
        />
        <StatCard
          style={styles.statCard}
          icon={<Ionicons name="wallet-outline" size={20} color="#7C3AED" />}
          iconBg="#F5F3FF"
          title="Nasiya"
          value={String(nasiyaOverdueCount)}
          subtitle="muddati o'tgan"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
});
