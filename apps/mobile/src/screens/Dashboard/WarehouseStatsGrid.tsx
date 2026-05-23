import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatCard from '../../components/common/StatCard';
import { useWarehouseDashboard } from '../Ombor/useWarehouseDashboard';

const ICON_SIZE = 20;

const COLORS = {
  totalProducts: '#2563EB',
  totalProductsBg: '#EFF6FF',
  lowStock: '#DC2626',
  lowStockBg: '#FEF2F2',
  expiry: '#D97706',
  expiryBg: '#FFFBEB',
  movements: '#16A34A',
  movementsBg: '#F0FDF4',
} as const;

export default function WarehouseStatsGrid() {
  const { dashboard } = useWarehouseDashboard();
  const stats = dashboard.data?.stats;

  const totalProducts = stats?.totalProducts ?? 0;
  const lowStockCount = stats?.lowStockCount ?? 0;
  const expiryCount = stats?.expiryCount ?? 0;
  const movementsIn = stats?.todayMovementsIn ?? 0;
  const movementsOut = stats?.todayMovementsOut ?? 0;
  const totalMovements = movementsIn + movementsOut;

  return (
    <View style={styles.statsGrid}>
      <View style={styles.statsRow}>
        <StatCard
          style={styles.statCard}
          icon={
            <Ionicons
              name="cube-outline"
              size={ICON_SIZE}
              color={COLORS.totalProducts}
            />
          }
          iconBg={COLORS.totalProductsBg}
          title="Jami mahsulot"
          value={String(totalProducts)}
          subtitle="nomi"
        />
        <StatCard
          style={styles.statCard}
          icon={
            <Ionicons
              name="alert-circle-outline"
              size={ICON_SIZE}
              color={COLORS.lowStock}
            />
          }
          iconBg={COLORS.lowStockBg}
          title="Kam zaxira"
          value={String(lowStockCount)}
          subtitle="ta mahsulot"
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          style={styles.statCard}
          icon={
            <Ionicons
              name="time-outline"
              size={ICON_SIZE}
              color={COLORS.expiry}
            />
          }
          iconBg={COLORS.expiryBg}
          title="Muddati tugayotgan"
          value={String(expiryCount)}
          subtitle="ta partiya"
        />
        <StatCard
          style={styles.statCard}
          icon={
            <Ionicons
              name="swap-horizontal-outline"
              size={ICON_SIZE}
              color={COLORS.movements}
            />
          }
          iconBg={COLORS.movementsBg}
          title="Bugungi harakatlar"
          value={String(totalMovements)}
          subtitle={`${movementsIn}\u2193 ${movementsOut}\u2191`}
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
